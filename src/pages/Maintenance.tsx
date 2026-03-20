import { Wrench } from 'lucide-react'
import { useAccess } from '@/hooks/use-access'
import { RestrictedAccess } from '@/components/RestrictedAccess'
import { ModuleCalendar } from '@/components/dashboard/ModuleCalendar'

export default function Maintenance() {
  const { hasAccess } = useAccess()
  if (!hasAccess(['Manutencao_Oficina', 'Direcao_Admin'])) {
    return <RestrictedAccess requiredRoles={['Manutencao_Oficina', 'Direcao_Admin']} />
  }
  return (
    <div className="space-y-6 animate-fade-in pb-8">
      <h1 className="text-2xl font-bold flex items-center gap-2 text-slate-800">
        <Wrench className="w-6 h-6 text-primary" /> Manutenção & Engenharia
      </h1>
      <ModuleCalendar sector="maintenance" title="Calendário e Escalas de Manutenção" />
    </div>
  )
}
