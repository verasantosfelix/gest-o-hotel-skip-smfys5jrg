import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { Button } from '@/components/ui/button'
import { toast } from '@/components/ui/use-toast'
import useReservationStore from '@/stores/useReservationStore'
import useAuditStore from '@/stores/useAuditStore'
import { BadgeDollarSign, FileDown } from 'lucide-react'
import { formatCurrency } from '@/lib/utils'

export function FinancialDashboard() {
  const { consumptions } = useReservationStore()
  const { addLog } = useAuditStore()

  const revMinibar = consumptions
    .filter((c) => c.categoria === 'Minibar')
    .reduce((a, b) => a + b.valor, 0)
  const revRestaurante = consumptions
    .filter((c) => c.categoria === 'Restaurante')
    .reduce((a, b) => a + b.valor, 0)
  const revServicos = consumptions
    .filter((c) => c.categoria === 'Serviços Extras')
    .reduce((a, b) => a + b.valor, 0)
  const totalRev = revMinibar + revRestaurante + revServicos

  const handleExport = () => {
    addLog('FINANCIAL_EXPORT', 'Exported analytical dashboard data to downloadable format.')
    toast({
      title: 'Exportação Concluída',
      description: 'O relatório financeiro foi gerado e o download iniciado.',
    })

    const content = `RELATÓRIO FINANCEIRO (SIMULADO)\n--------------------------\nReceita de Consumo: ${formatCurrency(totalRev, 'AOA')}\n\nPor Categoria:\n- Restaurante: ${formatCurrency(revRestaurante, 'AOA')}\n- Minibar: ${formatCurrency(revMinibar, 'AOA')}\n- Serviços Extras: ${formatCurrency(revServicos, 'AOA')}\n\nData de Geração: ${new Date().toLocaleString()}`

    const blob = new Blob([content], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'relatorio_financeiro.txt'
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div className="space-y-4 animate-fade-in-up">
      <div className="flex justify-end">
        <Button
          onClick={handleExport}
          variant="outline"
          className="flex items-center gap-2 border-slate-300 text-slate-700 hover:bg-slate-100"
        >
          <FileDown className="w-4 h-4" />
          Exportar Relatório (PDF/Excel)
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <Card className="border-slate-200 shadow-sm col-span-1 md:col-span-4 lg:col-span-1">
          <CardHeader className="pb-2 flex flex-row items-center justify-between space-y-0">
            <CardTitle className="text-sm font-medium text-slate-600">Receita de Consumo</CardTitle>
            <BadgeDollarSign className="h-4 w-4 text-emerald-600" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-emerald-600">
              {formatCurrency(totalRev, 'AOA')}
            </div>
            <p className="text-xs text-slate-500 mt-1">Acumulado do período atual</p>
          </CardContent>
        </Card>

        <Card className="border-slate-200 shadow-sm col-span-1 md:col-span-4 lg:col-span-3">
          <CardHeader className="pb-4">
            <CardTitle className="text-slate-800">Desempenho por Categoria</CardTitle>
            <CardDescription>
              Distribuição de receita analítica baseada nos lançamentos validados e pendentes
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="font-medium text-slate-700">Restaurante</span>
                <span className="text-slate-500 font-mono">
                  {formatCurrency(revRestaurante, 'AOA')} (
                  {((revRestaurante / totalRev) * 100 || 0).toFixed(0)}%)
                </span>
              </div>
              <Progress
                value={(revRestaurante / totalRev) * 100 || 0}
                className="h-2 bg-slate-100 [&>div]:bg-emerald-500"
              />
            </div>

            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="font-medium text-slate-700">Minibar</span>
                <span className="text-slate-500 font-mono">
                  {formatCurrency(revMinibar, 'AOA')} (
                  {((revMinibar / totalRev) * 100 || 0).toFixed(0)}%)
                </span>
              </div>
              <Progress
                value={(revMinibar / totalRev) * 100 || 0}
                className="h-2 bg-slate-100 [&>div]:bg-blue-500"
              />
            </div>

            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="font-medium text-slate-700">Serviços Extras</span>
                <span className="text-slate-500 font-mono">
                  {formatCurrency(revServicos, 'AOA')} (
                  {((revServicos / totalRev) * 100 || 0).toFixed(0)}%)
                </span>
              </div>
              <Progress
                value={(revServicos / totalRev) * 100 || 0}
                className="h-2 bg-slate-100 [&>div]:bg-purple-500"
              />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
