import { UserCog } from 'lucide-react'
import { useAccess } from '@/hooks/use-access'
import { RestrictedAccess } from '@/components/RestrictedAccess'
import { ModuleCalendar } from '@/components/dashboard/ModuleCalendar'

export default function HRIntelligence() {
  const { hasAccess } = useAccess()
  if (!hasAccess(['Administrativo_Financeiro', 'Direcao_Admin'])) {
    return <RestrictedAccess requiredRoles={['Administrativo_Financeiro', 'Direcao_Admin']} />
  }
  return (
    <div className="space-y-6 animate-fade-in pb-8">
      <h1 className="text-2xl font-bold flex items-center gap-2 text-slate-800">
        <UserCog className="w-6 h-6 text-primary" /> RH Intelligence
      </h1>
      <ModuleCalendar sector="hr" title="Calendário Institucional e Treinamentos" />
    </div>
  )
}
