import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts'
import { Activity, TrendingUp, DollarSign } from 'lucide-react'

export function FnBKPIs() {
  const data = [
    { name: 'Seg', ticket: 12500, time: 12 },
    { name: 'Ter', ticket: 14000, time: 10 },
    { name: 'Qua', ticket: 13200, time: 15 },
    { name: 'Qui', ticket: 18500, time: 18 },
    { name: 'Sex', ticket: 21000, time: 22 },
    { name: 'Sab', ticket: 24500, time: 25 },
    { name: 'Dom', ticket: 22000, time: 20 },
  ]
  return (
    <div className="space-y-6 animate-fade-in-up">
      <h3 className="font-bold text-lg text-slate-800 flex items-center gap-2">
        <Activity className="w-5 h-5 text-primary" /> Inteligência & Analytics F&B
      </h3>
      <div className="grid lg:grid-cols-2 gap-6">
        <Card className="border-slate-200 shadow-sm">
          <CardHeader className="border-b bg-slate-50 pb-4">
            <CardTitle className="text-base flex items-center gap-2">
              <DollarSign className="w-4 h-4 text-emerald-600" /> Ticket Médio Semanal
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-6">
            <ChartContainer
              config={{ ticket: { label: 'Valor Médio (AOA)', color: 'hsl(var(--primary))' } }}
              className="h-[250px] w-full"
            >
              <BarChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="name" tickLine={false} axisLine={false} />
                <YAxis hide />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Bar dataKey="ticket" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ChartContainer>
          </CardContent>
        </Card>

        <Card className="border-slate-200 shadow-sm">
          <CardHeader className="border-b bg-slate-50 pb-4">
            <CardTitle className="text-base flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-orange-500" /> Tempo Médio de Espera (min)
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-6">
            <ChartContainer
              config={{ time: { label: 'Tempo (min)', color: '#f97316' } }}
              className="h-[250px] w-full"
            >
              <BarChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="name" tickLine={false} axisLine={false} />
                <YAxis hide />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Bar dataKey="time" fill="#f97316" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ChartContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
