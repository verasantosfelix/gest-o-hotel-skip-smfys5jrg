import { useState, useEffect } from 'react'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts'
import { getSpaAppointments, getSpaRooms, SpaAppointment } from '@/services/spa'
import { useRealtime } from '@/hooks/use-realtime'
import { formatCurrency } from '@/lib/utils'

export function SpaKPIs() {
  const [appts, setAppts] = useState<SpaAppointment[]>([])
  const [roomsTotal, setRoomsTotal] = useState(0)

  const loadData = async () => {
    const [a, r] = await Promise.all([getSpaAppointments(), getSpaRooms()])
    setAppts(a)
    setRoomsTotal(r.length)
  }

  useEffect(() => {
    loadData()
  }, [])
  useRealtime('spa_appointments', loadData)

  const completed = appts.filter((a) => a.status === 'completed')
  const cancelled = appts.filter((a) => a.status === 'cancelled')
  const revenue = completed.reduce((sum, a) => sum + (a.expand?.service_id?.price || 0), 0)
  const ticketMedio = completed.length > 0 ? revenue / completed.length : 0
  const noShowRate = appts.length > 0 ? (cancelled.length / appts.length) * 100 : 0

  // For chart: group revenue by service category
  const revByCategory: Record<string, number> = {}
  completed.forEach((a) => {
    const cat = a.expand?.service_id?.category || 'Outros'
    revByCategory[cat] = (revByCategory[cat] || 0) + (a.expand?.service_id?.price || 0)
  })

  const chartData = Object.entries(revByCategory).map(([name, valor]) => ({ name, valor }))
  const chartConfig = { valor: { label: 'Receita', color: 'hsl(var(--primary))' } }

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <p className="text-sm font-medium text-slate-500">Ticket Médio</p>
            <h3 className="text-2xl font-bold text-slate-900 mt-1">
              {formatCurrency(ticketMedio, 'AOA')}
            </h3>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-sm font-medium text-slate-500">Receita Total</p>
            <h3 className="text-2xl font-bold text-emerald-600 mt-1">
              {formatCurrency(revenue, 'AOA')}
            </h3>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-sm font-medium text-slate-500">Atendimentos</p>
            <h3 className="text-2xl font-bold text-slate-900 mt-1">{completed.length}</h3>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-sm font-medium text-slate-500">Taxa Cancelamento</p>
            <h3 className="text-2xl font-bold text-rose-600 mt-1">{noShowRate.toFixed(1)}%</h3>
          </CardContent>
        </Card>
      </div>

      <Card className="max-w-2xl">
        <CardHeader>
          <CardTitle className="text-base">Receita por Categoria</CardTitle>
        </CardHeader>
        <CardContent>
          {chartData.length > 0 ? (
            <ChartContainer config={chartConfig} className="h-[250px] w-full">
              <BarChart data={chartData} margin={{ top: 10, right: 0, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="name" tickLine={false} axisLine={false} />
                <YAxis hide />
                <ChartTooltip
                  content={
                    <ChartTooltipContent formatter={(v: number) => formatCurrency(v, 'AOA')} />
                  }
                />
                <Bar dataKey="valor" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ChartContainer>
          ) : (
            <div className="h-[250px] flex items-center justify-center text-slate-400">
              Dados insuficientes
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
