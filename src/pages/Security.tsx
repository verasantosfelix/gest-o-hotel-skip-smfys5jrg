import { useState } from 'react'
import {
  ShieldAlert,
  Activity,
  Siren,
  Users,
  CheckSquare,
  ClipboardCheck,
  BarChart,
} from 'lucide-react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { useAccess } from '@/hooks/use-access'
import { RestrictedAccess } from '@/components/RestrictedAccess'

import { SecurityDashboard } from '@/components/security/SecurityDashboard'
import { IncidentManagement } from '@/components/security/IncidentManagement'
import { EmergencyProtocols } from '@/components/security/EmergencyProtocols'
import { AccessControl } from '@/components/security/AccessControl'
import { ComplianceAudits } from '@/components/security/ComplianceAudits'
import { SecurityRoutines } from '@/components/security/SecurityRoutines'
import { SecurityKPIs } from '@/components/security/SecurityKPIs'

export default function Security() {
  const { hasAccess } = useAccess()
  const [activeTab, setActiveTab] = useState('dashboard')

  if (!hasAccess(['Tecnologia_TI', 'Manutencao_Oficina', 'Direcao_Admin'], 'Segurança')) {
    return (
      <RestrictedAccess requiredRoles={['Tecnologia_TI', 'Manutencao_Oficina', 'Direcao_Admin']} />
    )
  }

  return (
    <div className="space-y-6 animate-fade-in pb-8">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-3 bg-slate-900 rounded-lg shadow-sm">
          <ShieldAlert className="w-6 h-6 text-rose-500" />
        </div>
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            Segurança & Compliance
          </h1>
          <p className="text-sm text-slate-500">Monitoramento Operacional e Gestão de Riscos</p>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="mb-6 h-auto bg-slate-100 flex flex-wrap justify-start border border-slate-200 shadow-sm p-1 rounded-md">
          <TabsTrigger value="dashboard" className="px-4 py-2 font-medium gap-2">
            <Activity className="w-4 h-4" /> Dashboard
          </TabsTrigger>
          <TabsTrigger value="incidents" className="px-4 py-2 font-medium gap-2">
            <Siren className="w-4 h-4" /> Ocorrências
          </TabsTrigger>
          <TabsTrigger value="protocols" className="px-4 py-2 font-medium gap-2">
            <ShieldAlert className="w-4 h-4" /> Protocolos
          </TabsTrigger>
          <TabsTrigger value="access" className="px-4 py-2 font-medium gap-2">
            <Users className="w-4 h-4" /> Acessos Físicos
          </TabsTrigger>
          <TabsTrigger value="routines" className="px-4 py-2 font-medium gap-2">
            <CheckSquare className="w-4 h-4" /> Rotinas
          </TabsTrigger>
          <TabsTrigger value="compliance" className="px-4 py-2 font-medium gap-2">
            <ClipboardCheck className="w-4 h-4" /> Auditorias
          </TabsTrigger>
          <TabsTrigger value="kpis" className="px-4 py-2 font-medium gap-2">
            <BarChart className="w-4 h-4" /> Analytics
          </TabsTrigger>
        </TabsList>

        <TabsContent value="dashboard" className="mt-0 outline-none">
          <SecurityDashboard onChangeTab={setActiveTab} />
        </TabsContent>
        <TabsContent value="incidents" className="mt-0 outline-none">
          <IncidentManagement />
        </TabsContent>
        <TabsContent value="protocols" className="mt-0 outline-none">
          <EmergencyProtocols />
        </TabsContent>
        <TabsContent value="access" className="mt-0 outline-none">
          <AccessControl />
        </TabsContent>
        <TabsContent value="routines" className="mt-0 outline-none">
          <SecurityRoutines />
        </TabsContent>
        <TabsContent value="compliance" className="mt-0 outline-none">
          <ComplianceAudits />
        </TabsContent>
        <TabsContent value="kpis" className="mt-0 outline-none">
          <SecurityKPIs />
        </TabsContent>
      </Tabs>
    </div>
  )
}
