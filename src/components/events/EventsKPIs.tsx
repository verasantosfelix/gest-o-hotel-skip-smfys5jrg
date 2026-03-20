import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts'
import { getEvents, HotelEvent } from '@/services/events'
import { useRealtime } from '@/hooks/use-realtime'

export function EventsKPIs() {
  const [events, setEvents] = useState<HotelEvent[]>([])

  const loadData = async () => {
    try {
      setEvents(await getEvents())
    } catch (e) {
      console.error(e)
    }
  }

  useEffect(() => {
    loadData()
  }, [])
  useRealtime('events', loadData)

  const chartData = [
    { name: 'Corporativo', count: events.filter((e) => e.type === 'corporate').length },
    { name: 'Conferência', count: events.filter((e) => e.type === 'conference').length },
    { name: 'Casamento', count: events.filter((e) => e.type === 'wedding').length },
    { name: 'Social', count: events.filter((e) => e.type === 'social').length },
  ]

  const totalRevenue = events.reduce((acc, curr) => acc + (curr.total_budget || 0), 0)
  const completed = events.filter((e) => e.status === 'finished').length

  const chartConfig = {
    count: { label: 'Eventos', color: 'hsl(var(--primary))' },
  }

  return (
    <div className="grid gap-6 md:grid-cols-2">
      <Card className="border-slate-200 shadow-sm">
        <CardHeader className="bg-slate-50 border-b pb-4">
          <CardTitle className="text-lg text-slate-800">Eventos por Categoria</CardTitle>
        </CardHeader>
        <CardContent className="pt-6">
          <ChartContainer config={chartConfig} className="h-[300px]">
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="name" tickLine={false} axisLine={false} />
              <YAxis tickLine={false} axisLine={false} />
              <ChartTooltip content={<ChartTooltipContent />} />
              <Bar dataKey="count" fill="var(--color-count)" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ChartContainer>
        </CardContent>
      </Card>

      <Card className="border-slate-200 shadow-sm">
        <CardHeader className="bg-slate-50 border-b pb-4">
          <CardTitle className="text-lg text-slate-800">Performance Financeira</CardTitle>
        </CardHeader>
        <CardContent className="p-6 flex flex-col justify-center h-full space-y-8">
          <div className="text-center">
            <p className="text-sm font-bold uppercase tracking-wider text-slate-500 mb-2">
              Receita Potencial Acumulada
            </p>
            <h2 className="text-5xl font-black text-emerald-600">
              R$ {totalRevenue.toLocaleString('pt-BR')}
            </h2>
          </div>
          <div className="grid grid-cols-2 gap-4 text-center border-t pt-8">
            <div>
              <p className="text-sm text-slate-500 mb-1">Total de Eventos</p>
              <p className="text-3xl font-bold text-slate-800">{events.length}</p>
            </div>
            <div>
              <p className="text-sm text-slate-500 mb-1">Eventos Concluídos</p>
              <p className="text-3xl font-bold text-slate-800">{completed}</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
