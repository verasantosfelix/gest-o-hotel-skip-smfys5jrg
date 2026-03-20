import { useState, useEffect } from 'react'
import { Navigate } from 'react-router-dom'
import { LineChart, Filter, ShoppingCart, Globe } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Checkbox } from '@/components/ui/checkbox'
import { toast } from '@/components/ui/use-toast'
import useAuthStore from '@/stores/useAuthStore'
import { getLeads, updateLeadStage, getOtaConnections } from '@/services/sales'
import { formatCurrency } from '@/lib/utils'

export default function SalesCRM() {
  const { userRole } = useAuthStore()
  const [leads, setLeads] = useState<any[]>([])
  const [otas, setOtas] = useState<any[]>([])

  const loadData = async () => {
    try {
      setLeads(await getLeads())
      setOtas(await getOtaConnections())
    } catch (e) {}
  }

  useEffect(() => {
    loadData()
  }, [])

  if (userRole !== 'Admin' && userRole !== 'Administrativa') return <Navigate to="/" replace />

  const moveLead = async (id: string, stage: string) => {
    await updateLeadStage(id, stage)
    loadData()
  }

  const renderKanbanCol = (title: string, stageName: string) => (
    <div className="flex-1 min-w-[250px] bg-slate-100 rounded-lg p-3">
      <h3 className="font-bold text-slate-700 mb-3 text-sm uppercase">{title}</h3>
      <div className="space-y-2">
        {leads
          .filter((l) => l.stage === stageName)
          .map((l) => (
            <Card key={l.id} className="shadow-sm cursor-pointer hover:shadow-md transition-shadow">
              <CardContent className="p-3 space-y-2">
                <div className="font-bold text-slate-900 text-sm">{l.name}</div>
                <div className="flex justify-between items-center text-xs">
                  <span className="text-slate-500">{l.contact}</span>
                  <span className="bg-emerald-100 text-emerald-800 px-2 rounded-full font-bold">
                    Score: {l.score}
                  </span>
                </div>
                {stageName !== 'Fechado' && (
                  <div className="flex gap-1 pt-2">
                    <Button
                      size="sm"
                      variant="outline"
                      className="h-6 text-[10px] w-full"
                      onClick={() => moveLead(l.id, stageName === 'Lead' ? 'Proposta' : 'Fechado')}
                    >
                      Avançar
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
      </div>
    </div>
  )

  return (
    <div className="space-y-6 animate-fade-in pb-8">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900 flex items-center gap-2">
          <LineChart className="w-6 h-6 text-primary" /> Vendas & Distribuição
        </h1>
        <p className="text-muted-foreground text-sm">
          CRM Avançado, Booking Engine e sincronização OTA.
        </p>
      </div>

      <Tabs defaultValue="crm" className="w-full">
        <TabsList className="mb-4 bg-slate-100 flex flex-wrap h-auto p-1">
          <TabsTrigger value="crm">Funil CRM</TabsTrigger>
          <TabsTrigger value="booking">Booking Engine</TabsTrigger>
          <TabsTrigger value="otas">Channel Manager</TabsTrigger>
        </TabsList>

        <TabsContent value="crm">
          <div className="flex gap-4 overflow-x-auto pb-4">
            {renderKanbanCol('Entrada (Leads)', 'Lead')}
            {renderKanbanCol('Em Negociação', 'Proposta')}
            {renderKanbanCol('Negócio Fechado', 'Fechado')}
          </div>
        </TabsContent>

        <TabsContent value="booking" className="grid gap-6 md:grid-cols-2">
          <Card className="shadow-sm border-slate-200">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ShoppingCart className="w-5 h-5" /> Simulador de Reserva Direta
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="p-4 border rounded bg-slate-50">
                <h4 className="font-bold mb-2">
                  Quarto Standard: {formatCurrency(45000, 'AOA')} / diária
                </h4>
                <div className="space-y-2 mt-4 pt-4 border-t">
                  <p className="text-sm font-semibold text-slate-700">Upsell Sugerido (Trigger)</p>
                  <div className="flex items-center space-x-2">
                    <Checkbox id="upgrade" />
                    <label htmlFor="upgrade" className="text-sm font-medium leading-none">
                      Upgrade para Suíte Master (+ {formatCurrency(15000, 'AOA')})
                    </label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox id="spa" />
                    <label htmlFor="spa" className="text-sm font-medium leading-none">
                      Adicionar Pacote Spa (+ {formatCurrency(8000, 'AOA')})
                    </label>
                  </div>
                </div>
              </div>
              <Button
                className="w-full bg-emerald-600 hover:bg-emerald-700"
                onClick={() =>
                  toast({
                    title: 'Reserva Simulada',
                    description: 'Multi-currency checkout acionado.',
                  })
                }
              >
                Checkout e Pagamento
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="otas" className="grid gap-6 md:grid-cols-2">
          <Card className="shadow-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Globe className="w-5 h-5" /> Status de Sincronização OTA
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {otas.map((o) => (
                <div
                  key={o.id}
                  className="p-3 border rounded flex justify-between items-center bg-slate-50"
                >
                  <span className="font-bold text-slate-800">{o.channel_name}</span>
                  <div className="text-right">
                    <span
                      className={`text-xs px-2 py-1 rounded font-bold ${o.sync_status === 'Online' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'}`}
                    >
                      {o.sync_status}
                    </span>
                    <p className="text-[10px] text-slate-500 mt-1">Sincronizado: {o.last_sync}</p>
                  </div>
                </div>
              ))}
              <div className="mt-4 p-3 bg-rose-50 text-rose-800 rounded text-sm font-medium border border-rose-200">
                <Filter className="w-4 h-4 inline mr-1" /> Alerta de Paridade: Airbnb apresenta
                preço 5% menor que tarifa base.
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
