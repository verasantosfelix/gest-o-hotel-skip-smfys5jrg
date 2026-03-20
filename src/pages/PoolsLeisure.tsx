import { Umbrella } from 'lucide-react'
import { useAccess } from '@/hooks/use-access'
import { RestrictedAccess } from '@/components/RestrictedAccess'
import { ModuleCalendar } from '@/components/dashboard/ModuleCalendar'

export default function PoolsLeisure() {
  const { hasAccess } = useAccess()
  if (!hasAccess(['Spa_Wellness', 'Rececao_FrontOffice', 'Direcao_Admin'])) {
    return (
      <RestrictedAccess requiredRoles={['Spa_Wellness', 'Rececao_FrontOffice', 'Direcao_Admin']} />
    )
  }
  return (
    <div className="space-y-6 animate-fade-in pb-8">
      <h1 className="text-2xl font-bold flex items-center gap-2 text-slate-800">
        <Umbrella className="w-6 h-6 text-primary" /> Piscinas e Lazer
      </h1>
      <ModuleCalendar sector="leisure" title="Agenda de Atividades e Limpezas de Área de Lazer" />
    </div>
  )
}
