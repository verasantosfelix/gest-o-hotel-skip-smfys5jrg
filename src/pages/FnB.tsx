import { useState } from 'react'
import { Navigate } from 'react-router-dom'
import { Utensils, ChefHat, ConciergeBell, ArrowRight } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Label } from '@/components/ui/label'
import { toast } from '@/components/ui/use-toast'
import useAuthStore from '@/stores/useAuthStore'

export default function FnB() {
  const { userRole } = useAuthStore()
  const [kdsOrders, setKdsOrders] = useState([
    { id: '101', desc: '1x Salmão Grelhado', status: 'Preparo' },
  ])

  if (
    userRole !== 'Admin' &&
    userRole !== 'Administrativa' &&
    userRole !== 'Restaurante' &&
    userRole !== 'Bar'
  ) {
    return <Navigate to="/" replace />
  }

  const sendToKds = () => {
    setKdsOrders([
      ...kdsOrders,
      { id: Math.random().toString().slice(2, 5), desc: '2x Hambúrguer', status: 'Pendente' },
    ])
    toast({ title: 'Enviado ao KDS', description: 'O pedido foi roteado para a cozinha.' })
  }

  return (
    <div className="space-y-6 animate-fade-in pb-8">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900 flex items-center gap-2">
          <Utensils className="w-6 h-6 text-primary" />
          Alimentos & Bebidas (F&B)
        </h1>
        <p className="text-muted-foreground text-sm">
          Gestão de restaurante, room service e roteamento de cozinha.
        </p>
      </div>

      <Tabs defaultValue="mesas" className="w-full">
        <TabsList className="mb-4 bg-slate-100 p-1">
          <TabsTrigger value="mesas">Gestão de Mesas</TabsTrigger>
          <TabsTrigger value="pedidos">Room Service / Pedidos</TabsTrigger>
          <TabsTrigger value="kds">KDS (Cozinha)</TabsTrigger>
        </TabsList>

        <TabsContent value="mesas">
          <Card className="max-w-xl shadow-sm">
            <CardHeader>
              <CardTitle>Reserva de Mesa</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Número de Pessoas (Pax)</Label>
                  <Input type="number" min="1" defaultValue="2" />
                </div>
                <div className="space-y-2">
                  <Label>Horário Agendado</Label>
                  <Input type="time" />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Nome do Hóspede / Cliente</Label>
                <Input placeholder="Ex: Carlos Silva" />
              </div>
              <Button>Confirmar Reserva</Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="pedidos">
          <Card className="max-w-xl shadow-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ConciergeBell className="w-5 h-5" /> Lançar Pedido Interno
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Descrição do Consumo</Label>
                <Input placeholder="Ex: 2x Hambúrguer" />
              </div>
              <div className="space-y-2">
                <Label>Valor Total (R$)</Label>
                <Input type="number" placeholder="85.00" />
              </div>
              <div className="space-y-2">
                <Label>Destino (Mesa/Quarto)</Label>
                <Input placeholder="Ex: Quarto 304" />
              </div>
              <Button onClick={sendToKds} className="w-full gap-2 bg-slate-900 text-white">
                Enviar ao KDS <ArrowRight className="w-4 h-4" />
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="kds">
          <div className="grid gap-4 md:grid-cols-3">
            <Card className="border-slate-800 border-2 bg-slate-900 text-slate-100 col-span-3">
              <CardHeader className="border-b border-slate-700 pb-4">
                <CardTitle className="text-emerald-400 flex items-center gap-2">
                  <ChefHat className="w-6 h-6" /> Painel de Cozinha (KDS)
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                  {kdsOrders.map((order) => (
                    <div
                      key={order.id}
                      className="bg-slate-800 p-5 rounded-lg border border-slate-700 shadow-md"
                    >
                      <div className="flex justify-between items-center mb-3">
                        <span className="font-mono text-xl text-white">#{order.id}</span>
                        <span className="text-xs bg-amber-500/20 text-amber-300 px-2 py-1 rounded font-medium tracking-wide uppercase">
                          {order.status}
                        </span>
                      </div>
                      <p className="text-lg font-bold text-slate-200">{order.desc}</p>
                      <Button
                        variant="outline"
                        size="sm"
                        className="w-full mt-5 border-slate-600 hover:bg-slate-700 text-slate-300 hover:text-white"
                      >
                        Concluir Prato
                      </Button>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
