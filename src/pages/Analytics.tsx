import { BarChart as BarChartIcon } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart'
import { BarChart, Bar, LineChart, Line, XAxis, YAxis } from 'recharts'
import { useAccess } from '@/hooks/use-access'
import { RestrictedAccess } from '@/components/RestrictedAccess'

const chartConfig = { occupancy: { label: 'Occupancy', color: 'hsl(var(--primary))' } }
const occupancyData = [{ month: 'Jan', occupancy: 65 }]

export default function Analytics() {
  const { hasAccess } = useAccess()

  if (!hasAccess(['Administrativo_Financeiro', 'Direcao_Admin'], 'Analytics')) {
    return <RestrictedAccess requiredRoles={['Administrativo_Financeiro', 'Direcao_Admin']} />
  }

  return (
    <div className="space-y-6 animate-fade-in pb-8">
      <h1 className="text-2xl font-bold flex items-center gap-2">
        <BarChartIcon /> Analytics
      </h1>
      <Card>
        <CardHeader>
          <CardTitle>Ocupação</CardTitle>
        </CardHeader>
        <CardContent>
          <ChartContainer config={chartConfig} className="h-[300px]">
            <LineChart data={occupancyData}>
              <XAxis dataKey="month" />
              <YAxis />
              <Line dataKey="occupancy" />
            </LineChart>
          </ChartContainer>
        </CardContent>
      </Card>
    </div>
  )
}
