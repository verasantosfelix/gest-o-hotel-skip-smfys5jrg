import { Server } from 'lucide-react'
import { useAccess } from '@/hooks/use-access'
import { RestrictedAccess } from '@/components/RestrictedAccess'
import { ModuleCalendar } from '@/components/dashboard/ModuleCalendar'

export default function ITAdmin() {
  const { hasAccess } = useAccess()
  if (!hasAccess(['Tecnologia_TI', 'Direcao_Admin'])) {
    return <RestrictedAccess requiredRoles={['Tecnologia_TI', 'Direcao_Admin']} />
  }
  return (
    <div className="space-y-6 animate-fade-in pb-8">
      <h1 className="text-2xl font-bold flex items-center gap-2 text-slate-800">
        <Server className="w-6 h-6 text-primary" /> Infraestrutura TI
      </h1>
      <ModuleCalendar sector="it" title="Agendamentos de Downtime e Tarefas de TI" />
    </div>
  )
}
