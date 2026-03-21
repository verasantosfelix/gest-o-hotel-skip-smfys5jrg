import { useState, useEffect } from 'react'
import { CalendarDays, TrendingUp, Users, Heart } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { useAccess } from '@/hooks/use-access'
import { RestrictedAccess } from '@/components/RestrictedAccess'
import { getSpaAppointments } from '@/services/spa'
import { formatCurrency } from '@/lib/utils'
import useAuthStore from '@/stores/useAuthStore'

export default function SpaAgendaMonthly() {
  const { hasAccess } = useAccess()
  const { userRole } = useAuthStore()
  const isFrontDesk = userRole === 'Front_Desk'

  const [stats, setStats] = useState({ revenue: 0, count: 0, completionRate: 0 })

  useEffect(() => {
    const loadData = async () => {
      try {
        const appts = await getSpaAppointments()
        const completed = appts.filter((a) => a.status === 'completed')
        const revenue = completed.reduce((sum, a) => sum + (a.expand?.service_id?.price || 0), 0)
        setStats({
          revenue,
          count: completed.length,
          completionRate: appts.length > 0 ? (completed.length / appts.length) * 100 : 0,
        })
      } catch (e) {
        console.error(e)
      }
    }
    loadData()
  }, [])

  if (
    !hasAccess(
      ['Spa_Wellness', 'Rececao_FrontOffice', 'Direcao_Admin', 'Front_Desk'],
      'Agenda Mensal',
    )
  ) {
    return (
      <RestrictedAccess requiredRoles={['Spa_Wellness', 'Rececao_FrontOffice', 'Direcao_Admin']} />
    )
  }

  return (
    <div className="space-y-6 animate-fade-in pb-8">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-3 bg-rose-100 rounded-lg shadow-sm border border-rose-200">
          <CalendarDays className="w-6 h-6 text-rose-700" />
        </div>
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">Visão Mensal & KPIs</h1>
          <p className="text-sm text-slate-500">
            Planejamento a longo prazo e métricas de desempenho
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {!isFrontDesk && (
          <Card>
            <CardContent className="p-6 flex items-center gap-4">
              <div className="bg-emerald-100 p-3 rounded-full">
                <TrendingUp className="w-6 h-6 text-emerald-700" />
              </div>
              <div>
                <p className="text-sm font-medium text-slate-500">Receita SPA</p>
                <h3 className="text-2xl font-bold text-slate-900">
                  {formatCurrency(stats.revenue)}
                </h3>
              </div>
            </CardContent>
          </Card>
        )}
        <Card>
          <CardContent className="p-6 flex items-center gap-4">
            <div className="bg-blue-100 p-3 rounded-full">
              <Heart className="w-6 h-6 text-blue-700" />
            </div>
            <div>
              <p className="text-sm font-medium text-slate-500">Sessões Realizadas</p>
              <h3 className="text-2xl font-bold text-slate-900">{stats.count}</h3>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6 flex items-center gap-4">
            <div className="bg-purple-100 p-3 rounded-full">
              <Users className="w-6 h-6 text-purple-700" />
            </div>
            <div>
              <p className="text-sm font-medium text-slate-500">Taxa de Conclusão</p>
              <h3 className="text-2xl font-bold text-slate-900">
                {stats.completionRate.toFixed(1)}%
              </h3>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="min-h-[500px] flex items-center justify-center border-dashed border-2 bg-slate-50">
        <div className="text-center text-slate-400">
          <CalendarDays className="w-12 h-12 mx-auto mb-2 opacity-50" />
          <p>Visualização de Calendário Mensal em desenvolvimento.</p>
        </div>
      </Card>
    </div>
  )
}
