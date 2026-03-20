import { Shirt } from 'lucide-react'
import { useAccess } from '@/hooks/use-access'
import { RestrictedAccess } from '@/components/RestrictedAccess'
import { ModuleCalendar } from '@/components/dashboard/ModuleCalendar'

export default function Laundry() {
  const { hasAccess } = useAccess()
  if (!hasAccess(['Lavanderia_Limpeza', 'Direcao_Admin'])) {
    return <RestrictedAccess requiredRoles={['Lavanderia_Limpeza', 'Direcao_Admin']} />
  }
  return (
    <div className="space-y-6 animate-fade-in pb-8">
      <h1 className="text-2xl font-bold flex items-center gap-2 text-slate-800">
        <Shirt className="w-6 h-6 text-primary" /> Lavanderia e Enxoval
      </h1>
      <ModuleCalendar sector="laundry" title="Escalas e Rotinas da Lavanderia" />
    </div>
  )
}
