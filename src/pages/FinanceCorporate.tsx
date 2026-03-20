import { useState, useEffect } from 'react'
import { Landmark } from 'lucide-react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { useAccess } from '@/hooks/use-access'
import { RestrictedAccess } from '@/components/RestrictedAccess'
import { useRealtime } from '@/hooks/use-realtime'

import {
  getFinancialDocs,
  getBudgetEntries,
  getFinancialContracts,
  getFinancialAuditLogs,
  FinancialDoc,
  BudgetEntry,
  FinancialContract,
  FinancialAuditLog,
} from '@/services/financial'

import { FinanceDashboard } from '@/components/finance/FinanceDashboard'
import { ARWorkflow } from '@/components/finance/ARWorkflow'
import { APWorkflow } from '@/components/finance/APWorkflow'
import { NightAuditWizard } from '@/components/finance/NightAuditWizard'
import { ContractsManager } from '@/components/finance/ContractsManager'

export default function FinanceCorporate() {
  const { hasAccess } = useAccess()
  const [docs, setDocs] = useState<FinancialDoc[]>([])
  const [contracts, setContracts] = useState<FinancialContract[]>([])
  const [auditLogs, setAuditLogs] = useState<FinancialAuditLog[]>([])

  const loadData = async () => {
    try {
      setDocs(await getFinancialDocs())
    } catch (e) {}
    try {
      setContracts(await getFinancialContracts())
    } catch (e) {}
    try {
      setAuditLogs(await getFinancialAuditLogs())
    } catch (e) {}
  }

  useEffect(() => {
    loadData()
  }, [])

  useRealtime('financial_docs', loadData)
  useRealtime('financial_contracts', loadData)
  useRealtime('financial_audit_logs', loadData)

  if (!hasAccess(['Administrativo_Financeiro', 'Direcao_Admin'])) {
    return <RestrictedAccess requiredRoles={['Administrativo_Financeiro', 'Direcao_Admin']} />
  }

  return (
    <div className="space-y-6 animate-fade-in pb-8">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-3 bg-emerald-100 rounded-lg shadow-sm border border-emerald-200">
          <Landmark className="w-6 h-6 text-emerald-700" />
        </div>
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">Financeiro B2B</h1>
          <p className="text-sm text-slate-500">Dashboard Operacional e Controle Administrativo</p>
        </div>
      </div>

      <Tabs defaultValue="dashboard" className="w-full">
        <TabsList className="mb-6 h-auto bg-slate-100 flex flex-wrap justify-start border border-slate-200 shadow-sm p-1 rounded-md">
          <TabsTrigger value="dashboard" className="px-4 py-2 font-medium">
            Dashboard & KPIs
          </TabsTrigger>
          <TabsTrigger value="ar" className="px-4 py-2 font-medium">
            Contas a Receber (A/R)
          </TabsTrigger>
          <TabsTrigger value="ap" className="px-4 py-2 font-medium">
            Contas a Pagar (A/P)
          </TabsTrigger>
          <TabsTrigger value="audit" className="px-4 py-2 font-medium">
            Auditoria e Fechamento
          </TabsTrigger>
          <TabsTrigger value="contracts" className="px-4 py-2 font-medium">
            Contratos
          </TabsTrigger>
        </TabsList>

        <TabsContent value="dashboard" className="mt-0 outline-none">
          <FinanceDashboard docs={docs} auditLogs={auditLogs} />
        </TabsContent>

        <TabsContent value="ar" className="mt-0 outline-none">
          <ARWorkflow docs={docs} />
        </TabsContent>

        <TabsContent value="ap" className="mt-0 outline-none">
          <APWorkflow docs={docs} />
        </TabsContent>

        <TabsContent value="audit" className="mt-0 outline-none">
          <NightAuditWizard />
        </TabsContent>

        <TabsContent value="contracts" className="mt-0 outline-none">
          <ContractsManager contracts={contracts} />
        </TabsContent>
      </Tabs>
    </div>
  )
}
