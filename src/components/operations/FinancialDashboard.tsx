import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import useReservationStore from '@/stores/useReservationStore'
import { BadgeDollarSign } from 'lucide-react'

export function FinancialDashboard() {
  const { consumptions } = useReservationStore()

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

  return (
    <div className="grid gap-4 md:grid-cols-4 animate-fade-in-up">
      <Card className="border-slate-200 shadow-sm col-span-1 md:col-span-4 lg:col-span-1">
        <CardHeader className="pb-2 flex flex-row items-center justify-between space-y-0">
          <CardTitle className="text-sm font-medium text-slate-600">Receita de Consumo</CardTitle>
          <BadgeDollarSign className="h-4 w-4 text-emerald-600" />
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold text-emerald-600">R$ {totalRev.toFixed(2)}</div>
          <p className="text-xs text-slate-500 mt-1">Acumulado do período atual</p>
        </CardContent>
      </Card>

      <Card className="border-slate-200 shadow-sm col-span-1 md:col-span-4 lg:col-span-3">
        <CardHeader className="pb-4">
          <CardTitle className="text-slate-800">Desempenho por Categoria</CardTitle>
          <CardDescription>
            Distribuição de receita analítica baseada nos lançamentos
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="font-medium text-slate-700">Restaurante</span>
              <span className="text-slate-500 font-mono">
                R$ {revRestaurante.toFixed(2)} (
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
                R$ {revMinibar.toFixed(2)} ({((revMinibar / totalRev) * 100 || 0).toFixed(0)}%)
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
                R$ {revServicos.toFixed(2)} ({((revServicos / totalRev) * 100 || 0).toFixed(0)}%)
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
  )
}
