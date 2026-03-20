import { Navigate } from 'react-router-dom'
import {
  BedDouble,
  Clock,
  ShieldCheck,
  DoorOpen,
  TerminalSquare,
  PackageSearch,
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import useHotelStore from '@/stores/useHotelStore'
import useInventoryStore from '@/stores/useInventoryStore'
import useAuthStore from '@/stores/useAuthStore'
import { CheckIn } from '@/components/operations/CheckIn'
import { CheckOut } from '@/components/operations/CheckOut'
import { Consumption } from '@/components/operations/Consumption'
import { FinancialDashboard } from '@/components/operations/FinancialDashboard'
import { InventoryManagement } from '@/components/operations/InventoryManagement'

export default function Index() {
  const { userRole } = useAuthStore()
  const { selectedHotel } = useHotelStore()
  const { items } = useInventoryStore()

  if (userRole !== 'Admin') {
    return <Navigate to="/busca-hospedes" replace />
  }

  const lowStockCount = items.filter((i) => i.quantity < i.threshold).length

  const kpis = [
    {
      title: 'Taxa de Ocupação',
      value: '82%',
      desc: '14 quartos disp.',
      icon: BedDouble,
      color: 'text-slate-700',
    },
    {
      title: 'Check-ins Hoje',
      value: '12',
      desc: '4 pendentes',
      icon: ShieldCheck,
      color: 'text-emerald-600',
    },
    {
      title: 'Check-outs Hoje',
      value: '8',
      desc: 'Todos finalizados',
      icon: DoorOpen,
      color: 'text-rose-600',
    },
    {
      title: 'Alertas de Estoque',
      value: lowStockCount.toString(),
      desc: 'Itens abaixo da cota',
      icon: PackageSearch,
      color: lowStockCount > 0 ? 'text-amber-500' : 'text-emerald-600',
    },
  ]

  const feed = [
    { time: '10:42', msg: 'Quarto 304 alterado para "Limpo" por Maria Silva.', type: 'info' },
    {
      time: '10:30',
      msg: 'Check-in rápido concluído: Reserva #8492 (João Pedro).',
      type: 'success',
    },
    { time: '09:15', msg: 'Aviso: Overbooking detectado na data 15/05.', type: 'warning' },
  ]

  if (lowStockCount > 0) {
    feed.unshift({
      time: 'Agora',
      msg: `Atenção: ${lowStockCount} item(s) com estoque baixo necessitam de reposição imediata.`,
      type: 'warning',
    })
  }

  return (
    <div className="space-y-6 animate-fade-in-up pb-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-display font-bold tracking-tight text-slate-900">
            Command Center
          </h1>
          <p className="text-slate-500">Operação atual: {selectedHotel.name}</p>
        </div>
      </div>

      <Tabs defaultValue="dashboard" className="w-full">
        <TabsList className="bg-slate-100 p-1 mb-4 inline-flex flex-wrap h-auto">
          <TabsTrigger
            value="dashboard"
            className="data-[state=active]:bg-white data-[state=active]:text-slate-900 data-[state=active]:shadow-sm"
          >
            Dashboard Central
          </TabsTrigger>
          <TabsTrigger
            value="financeiro"
            className="data-[state=active]:bg-white data-[state=active]:text-slate-900 data-[state=active]:shadow-sm"
          >
            Painel Financeiro
          </TabsTrigger>
          <TabsTrigger
            value="checkin"
            className="data-[state=active]:bg-white data-[state=active]:text-slate-900 data-[state=active]:shadow-sm"
          >
            Check-in
          </TabsTrigger>
          <TabsTrigger
            value="consumo"
            className="data-[state=active]:bg-white data-[state=active]:text-slate-900 data-[state=active]:shadow-sm"
          >
            Consumo
          </TabsTrigger>
          <TabsTrigger
            value="checkout"
            className="data-[state=active]:bg-white data-[state=active]:text-slate-900 data-[state=active]:shadow-sm"
          >
            Check-out
          </TabsTrigger>
          <TabsTrigger
            value="estoque"
            className="data-[state=active]:bg-white data-[state=active]:text-slate-900 data-[state=active]:shadow-sm"
          >
            Estoque
          </TabsTrigger>
        </TabsList>

        <TabsContent value="dashboard" className="space-y-6 outline-none">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {kpis.map((kpi, i) => (
              <Card key={i} className={`stagger-${i + 1} border-slate-200 shadow-sm`}>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-slate-600">{kpi.title}</CardTitle>
                  <kpi.icon className={`h-5 w-5 ${kpi.color}`} />
                </CardHeader>
                <CardContent>
                  <div
                    className={`text-2xl font-bold ${kpi.title === 'Alertas de Estoque' && parseInt(kpi.value) > 0 ? 'text-amber-500' : 'text-slate-900'}`}
                  >
                    {kpi.value}
                  </div>
                  <p className="text-xs text-slate-500">{kpi.desc}</p>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <Card className="stagger-3 border-slate-200 shadow-sm">
              <CardHeader>
                <CardTitle className="text-slate-800">Log de Operações</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {feed.map((item, i) => (
                  <div
                    key={i}
                    className="flex items-start gap-3 border-b border-slate-100 pb-3 last:border-0 last:pb-0"
                  >
                    <span className="text-xs font-mono text-slate-400 pt-0.5">{item.time}</span>
                    <div className="flex-1">
                      <p className="text-sm text-slate-700">{item.msg}</p>
                    </div>
                    {item.type === 'warning' && (
                      <Badge variant="destructive" className="bg-amber-500 hover:bg-amber-600">
                        Atenção
                      </Badge>
                    )}
                    {item.type === 'success' && (
                      <Badge className="bg-emerald-500 hover:bg-emerald-600">OK</Badge>
                    )}
                  </div>
                ))}
                <Button
                  variant="ghost"
                  className="w-full text-xs text-slate-600 hover:bg-slate-100"
                >
                  Ver histórico completo
                </Button>
              </CardContent>
            </Card>

            <Card className="stagger-4 border-slate-300 bg-slate-50 shadow-sm">
              <CardHeader>
                <CardTitle className="text-sm font-mono flex items-center gap-2 text-slate-800">
                  <TerminalSquare className="w-4 h-4 text-emerald-600" />
                  Terminal Central (Concierge)
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="bg-[#0f172a] text-slate-300 p-4 rounded-md font-mono text-sm overflow-x-auto shadow-inner">
                  <pre className="text-emerald-400 whitespace-pre-wrap leading-relaxed">
                    {`<OUTPUT>
  <resumo>Operação nominal. 82% de ocupação. 3 pendências de limpeza.</resumo>
  <dados>
    <check-ins>12 concluidos, 4 pendentes</check-ins>
    <check-outs>8 finalizados</check-outs>
  </dados>
  <alertas>
    <estoque>${lowStockCount} itens requerem reposição</estoque>
  </alertas>
  <proximos-passos>Finalizar check-ins pendentes antes das 14h.</proximos-passos>
</OUTPUT>`}
                  </pre>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="financeiro" className="outline-none focus:outline-none">
          <FinancialDashboard />
        </TabsContent>

        <TabsContent value="checkin" className="outline-none focus:outline-none">
          <CheckIn />
        </TabsContent>

        <TabsContent value="consumo" className="outline-none focus:outline-none">
          <Consumption />
        </TabsContent>

        <TabsContent value="checkout" className="outline-none focus:outline-none">
          <CheckOut />
        </TabsContent>

        <TabsContent value="estoque" className="outline-none focus:outline-none">
          <InventoryManagement />
        </TabsContent>
      </Tabs>
    </div>
  )
}
