import { MoonStar } from 'lucide-react'
import { useAccess } from '@/hooks/use-access'
import { RestrictedAccess } from '@/components/RestrictedAccess'
import { NightAuditWizard } from '@/components/finance/NightAuditWizard'

export default function NightAudit() {
  const { hasAccess } = useAccess()
  if (!hasAccess(['Administrativo_Financeiro', 'Rececao_FrontOffice', 'Direcao_Admin'])) {
    return (
      <RestrictedAccess
        requiredRoles={['Administrativo_Financeiro', 'Rececao_FrontOffice', 'Direcao_Admin']}
      />
    )
  }
  return (
    <div className="space-y-6 animate-fade-in pb-8">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-3 bg-indigo-100 rounded-lg shadow-sm border border-indigo-200">
          <MoonStar className="w-6 h-6 text-indigo-700" />
        </div>
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            Auditoria Noturna e Fechamento
          </h1>
          <p className="text-sm text-slate-500">Conciliação diária e preparação fiscal</p>
        </div>
      </div>
      <NightAuditWizard />
    </div>
  )
}
