import { Navigate } from 'react-router-dom'
import { BarChart as BarChartIcon } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartLegend,
  ChartLegendContent,
} from '@/components/ui/chart'
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
} from 'recharts'
import useAuthStore from '@/stores/useAuthStore'

const occupancyData = [
  { month: 'Jan', occupancy: 65, revenue: 120000 },
  { month: 'Fev', occupancy: 70, revenue: 135000 },
  { month: 'Mar', occupancy: 85, revenue: 180000 },
  { month: 'Abr', occupancy: 82, revenue: 170000 },
  { month: 'Mai', occupancy: 90, revenue: 210000 },
]

const sourceData = [
  { name: 'Acomodações', value: 450000, fill: 'hsl(var(--primary))' },
  { name: 'F&B', value: 120000, fill: 'hsl(var(--primary) / 0.7)' },
  { name: 'Eventos', value: 80000, fill: 'hsl(var(--primary) / 0.4)' },
]

const staffData = [
  { name: 'Ana (Gov)', taskCount: 145 },
  { name: 'João (F&B)', taskCount: 210 },
  { name: 'Maria (Rec)', taskCount: 95 },
  { name: 'Carlos (Gov)', taskCount: 130 },
]

const chartConfig = {
  occupancy: { label: 'Ocupação (%)', color: 'hsl(var(--primary))' },
  revenue: { label: 'Receita (R$)', color: 'hsl(var(--primary) / 0.5)' },
  taskCount: { label: 'Tarefas Entregues', color: 'hsl(var(--primary))' },
}

export default function Analytics() {
  const { userRole, allowReports } = useAuthStore()

  if (userRole !== 'Admin' && !(userRole === 'Administrativa' && allowReports)) {
    return <Navigate to="/" replace />
  }

  return (
    <div className="space-y-6 animate-fade-in pb-8">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900 flex items-center gap-2">
          <BarChartIcon className="w-6 h-6 text-primary" />
          Business Intelligence
        </h1>
        <p className="text-muted-foreground text-sm">
          Visão consolidada de performance, receitas e eficiência da equipe.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card className="shadow-sm border-slate-200">
          <CardHeader>
            <CardTitle className="text-lg">Ocupação vs Receita Total</CardTitle>
            <CardDescription>Evolução mensal da operação hoteleira</CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer config={chartConfig} className="h-[300px] w-full">
              <LineChart data={occupancyData} margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="month" tickLine={false} axisLine={false} />
                <YAxis yAxisId="left" tickLine={false} axisLine={false} />
                <YAxis yAxisId="right" orientation="right" tickLine={false} axisLine={false} />
                <ChartTooltip content={<ChartTooltipContent />} />
                <ChartLegend content={<ChartLegendContent />} />
                <Line
                  yAxisId="left"
                  type="monotone"
                  dataKey="occupancy"
                  name="occupancy"
                  stroke="var(--color-occupancy)"
                  strokeWidth={2}
                />
                <Line
                  yAxisId="right"
                  type="monotone"
                  dataKey="revenue"
                  name="revenue"
                  stroke="var(--color-revenue)"
                  strokeWidth={2}
                />
              </LineChart>
            </ChartContainer>
          </CardContent>
        </Card>

        <Card className="shadow-sm border-slate-200">
          <CardHeader>
            <CardTitle className="text-lg">Receita por Origem</CardTitle>
            <CardDescription>Distribuição de faturamento global</CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer config={chartConfig} className="h-[300px] w-full">
              <PieChart>
                <Pie
                  data={sourceData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {sourceData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.fill} />
                  ))}
                </Pie>
                <ChartTooltip content={<ChartTooltipContent />} />
                <ChartLegend content={<ChartLegendContent />} />
              </PieChart>
            </ChartContainer>
          </CardContent>
        </Card>

        <Card className="shadow-sm border-slate-200 md:col-span-2">
          <CardHeader>
            <CardTitle className="text-lg">Performance da Equipe</CardTitle>
            <CardDescription>
              Volume de tarefas operacionais concluídas no mês atual
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer config={chartConfig} className="h-[300px] w-full">
              <BarChart data={staffData} margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="name" tickLine={false} axisLine={false} />
                <YAxis tickLine={false} axisLine={false} />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Bar
                  dataKey="taskCount"
                  name="taskCount"
                  fill="var(--color-taskCount)"
                  radius={[4, 4, 0, 0]}
                  barSize={40}
                />
              </BarChart>
            </ChartContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
