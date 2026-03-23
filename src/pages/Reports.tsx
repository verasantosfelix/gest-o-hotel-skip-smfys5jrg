import { useState } from 'react'
import {
  FileText,
  Download,
  TrendingUp,
  Users,
  DollarSign,
  Calendar as CalendarIcon,
  FileSpreadsheet,
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuLabel,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu'
import { useAccess } from '@/hooks/use-access'
import { RestrictedAccess } from '@/components/RestrictedAccess'
import { formatCurrency } from '@/lib/utils'
import { toast } from '@/components/ui/use-toast'
import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts'
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart'

const mockPerformanceData = [
  { day: 'Seg', revpar: 120, occupancy: 85, revenue: 4500 },
  { day: 'Ter', revpar: 110, occupancy: 80, revenue: 4100 },
  { day: 'Qua', revpar: 130, occupancy: 90, revenue: 5200 },
  { day: 'Qui', revpar: 145, occupancy: 95, revenue: 6100 },
  { day: 'Sex', revpar: 160, occupancy: 98, revenue: 7500 },
  { day: 'Sáb', revpar: 180, occupancy: 100, revenue: 8900 },
  { day: 'Dom', revpar: 150, occupancy: 92, revenue: 6300 },
]

export default function Reports() {
  const { hasAccess } = useAccess()
  const [isExporting, setIsExporting] = useState(false)

  if (!hasAccess(['Administrativo_Financeiro', 'Direcao_Admin'], 'Relatórios')) {
    return <RestrictedAccess requiredRoles={['Administrativo_Financeiro', 'Direcao_Admin']} />
  }

  const handleExportCSV = () => {
    setIsExporting(true)
    setTimeout(() => {
      const headers = ['Data', 'RevPAR (AOA)', 'Ocupação (%)', 'Receita Total (AOA)']
      const rows = mockPerformanceData.map(
        (d) => `${d.day},${d.revpar},${d.occupancy},${d.revenue}`,
      )
      const csvContent = 'data:text/csv;charset=utf-8,' + headers.join(',') + '\n' + rows.join('\n')

      const encodedUri = encodeURI(csvContent)
      const link = document.createElement('a')
      link.setAttribute('href', encodedUri)
      link.setAttribute('download', `performance_kpi_${new Date().toISOString().slice(0, 10)}.csv`)
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)

      toast({ title: 'Exportação concluída', description: 'Arquivo CSV baixado com sucesso.' })
      setIsExporting(false)
    }, 800)
  }

  const handleExportPDF = () => {
    setIsExporting(true)
    setTimeout(() => {
      // Mock PDF export action
      toast({
        title: 'Exportação PDF concluída',
        description: 'O relatório formatado foi gerado e salvo em seus downloads.',
      })
      setIsExporting(false)
    }, 1500)
  }

  return (
    <div className="space-y-6 animate-fade-in pb-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h1 className="text-2xl font-bold flex items-center gap-2 text-slate-900">
          <FileText className="w-6 h-6 text-primary" /> Relatórios de Performance & KPIs
        </h1>
        <div className="flex gap-2">
          <Button variant="outline" className="gap-2 text-slate-600">
            <CalendarIcon className="w-4 h-4" /> Últimos 7 dias
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                disabled={isExporting}
                className="gap-2 bg-slate-900 hover:bg-slate-800 text-white"
              >
                <Download className="w-4 h-4" /> {isExporting ? 'Exportando...' : 'Exportar'}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              <DropdownMenuLabel>Formato de Arquivo</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleExportCSV} className="cursor-pointer">
                <FileSpreadsheet className="w-4 h-4 mr-2 text-emerald-600" /> Exportar para CSV
              </DropdownMenuItem>
              <DropdownMenuItem onClick={handleExportPDF} className="cursor-pointer">
                <FileText className="w-4 h-4 mr-2 text-rose-600" /> Exportar para PDF
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card className="border-slate-200 shadow-sm">
          <CardContent className="p-5 flex items-center gap-4">
            <div className="bg-emerald-100 p-3 rounded-full">
              <TrendingUp className="w-6 h-6 text-emerald-700" />
            </div>
            <div>
              <p className="text-sm font-medium text-slate-500 uppercase tracking-wider">
                RevPAR Médio
              </p>
              <h3 className="text-2xl font-bold text-slate-900">{formatCurrency(142, 'USD')}</h3>
            </div>
          </CardContent>
        </Card>
        <Card className="border-slate-200 shadow-sm">
          <CardContent className="p-5 flex items-center gap-4">
            <div className="bg-blue-100 p-3 rounded-full">
              <Users className="w-6 h-6 text-blue-700" />
            </div>
            <div>
              <p className="text-sm font-medium text-slate-500 uppercase tracking-wider">
                Taxa Ocupação
              </p>
              <h3 className="text-2xl font-bold text-slate-900">91.4%</h3>
            </div>
          </CardContent>
        </Card>
        <Card className="border-slate-200 shadow-sm">
          <CardContent className="p-5 flex items-center gap-4">
            <div className="bg-amber-100 p-3 rounded-full">
              <DollarSign className="w-6 h-6 text-amber-700" />
            </div>
            <div>
              <p className="text-sm font-medium text-slate-500 uppercase tracking-wider">
                Receita Total
              </p>
              <h3 className="text-2xl font-bold text-slate-900">{formatCurrency(42600, 'USD')}</h3>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Evolução de Receita Diária</CardTitle>
          <CardDescription>
            Visão consolidada de receitas e performance de vendas no período selecionado.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-[350px] w-full mt-4">
            <ChartContainer
              config={{
                revenue: { label: 'Receita', color: 'hsl(var(--primary))' },
              }}
            >
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={mockPerformanceData}
                  margin={{ top: 20, right: 0, left: 0, bottom: 0 }}
                >
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                  <XAxis
                    dataKey="day"
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: '#64748b' }}
                    dy={10}
                  />
                  <YAxis
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: '#64748b' }}
                    tickFormatter={(val) => `$${val}`}
                  />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Bar
                    dataKey="revenue"
                    fill="var(--color-revenue)"
                    radius={[4, 4, 0, 0]}
                    maxBarSize={50}
                  />
                </BarChart>
              </ResponsiveContainer>
            </ChartContainer>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
