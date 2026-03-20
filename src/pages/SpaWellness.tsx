import { Heart } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { useAccess } from '@/hooks/use-access'
import { RestrictedAccess } from '@/components/RestrictedAccess'
import { ModuleCalendar } from '@/components/dashboard/ModuleCalendar'

export default function SpaWellness() {
  const { hasAccess } = useAccess()

  if (!hasAccess(['Spa_Wellness', 'Direcao_Admin'])) {
    return <RestrictedAccess requiredRoles={['Spa_Wellness', 'Direcao_Admin']} />
  }

  return (
    <div className="space-y-6 animate-fade-in pb-8">
      <h1 className="text-2xl font-bold flex items-center gap-2 text-slate-800">
        <Heart className="text-rose-500 w-7 h-7" />
        Spa & Wellness
      </h1>

      <p className="text-slate-500 max-w-2xl">
        Acompanhe e gerencie as operações do Spa, manutenções de equipamentos, bloqueios de agenda e
        treinamentos da equipe de bem-estar.
      </p>

      <ModuleCalendar sector="spa" title="Calendário Operacional do Spa" />

      <Card className="border-slate-200">
        <CardContent className="pt-6">
          <h2 className="text-lg font-semibold text-slate-800 mb-2">Métricas e Gestão Geral</h2>
          <p className="text-sm text-slate-500">
            Nesta área, no futuro, serão disponibilizados relatórios de ocupação das salas de
            massagem, estoque de óleos essenciais e toalhas, além do controle de produtividade dos
            terapeutas.
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
