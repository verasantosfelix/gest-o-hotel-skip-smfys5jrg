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
import useApprovalStore from '@/stores/useApprovalStore'
import { useIsMobile } from '@/hooks/use-mobile'

export default function FnB() {
  const { userRole, userName } = useAuthStore()
  const { addRequest } = useApprovalStore()
  const isMobile = useIsMobile()
  const [kdsOrders, setKdsOrders] = useState([
    { id: '101', desc: '1x Salmão Grelhado', status: 'Preparo' },
  ])

  const [desc, setDesc] = useState('')
  const [val, setVal] = useState('')
  const [discount, setDiscount] = useState('')

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
      {
        id: Math.random().toString().slice(2, 5),
        desc: desc || '1x Novo Pedido',
        status: 'Pendente',
      },
    ])
    toast({ title: 'Enviado ao KDS', description: 'O pedido foi roteado para a cozinha.' })
    setDesc('')
    setVal('')
    setDiscount('')
  }

  const handleLaunchOrder = () => {
    const valAmount = parseFloat(val || '0')
    const descAmount = parseFloat(discount || '0')

    if (!desc || valAmount <= 0) {
      toast({
        title: 'Atenção',
        description: 'Preencha a descrição e o valor.',
        variant: 'destructive',
      })
      return
    }

    if (descAmount > 0) {
      addRequest({
        type: 'F&B',
        description: desc,
        originalAmount: valAmount,
        discountPercent: descAmount,
        discountAmount: valAmount * (descAmount / 100),
        finalAmount: valAmount - valAmount * (descAmount / 100),
        requesterName: userName,
        requesterRole: userRole,
      })
      toast({
        title: 'Aprovação Necessária',
        description: `O desconto de ${descAmount}% foi enviado para aprovação da gerência.`,
      })
    } else {
      sendToKds()
    }
  }

  // "Staff On-the-Go" Interface for F&B
  if ((userRole === 'Restaurante' || userRole === 'Bar') && isMobile) {
    return (
      <div className="space-y-4 bg-slate-50 min-h-[calc(100vh-64px)] pb-24 -m-4 md:-m-6 p-4">
        <h1 className="text-xl font-bold text-slate-900 px-1 pt-2">F&B On-the-go</h1>
        <Tabs defaultValue="pedidos" className="w-full">
          <TabsList className="w-full mb-4">
            <TabsTrigger value="pedidos" className="flex-1 h-14 text-sm font-bold min-h-[44px]">
              Order Status
            </TabsTrigger>
            <TabsTrigger value="mesas" className="flex-1 h-14 text-sm font-bold min-h-[44px]">
              Table Quick-Select
            </TabsTrigger>
          </TabsList>
          <TabsContent value="pedidos" className="space-y-4">
            {kdsOrders.map((order) => (
              <Card key={order.id} className="shadow-sm border-slate-200">
                <CardContent className="p-5 flex flex-col gap-3">
                  <div className="flex justify-between items-center">
                    <span className="font-mono font-bold text-xl text-slate-900">#{order.id}</span>
                    <Badge className="bg-amber-100 text-amber-800 hover:bg-amber-200 px-3 py-1">
                      {order.status}
                    </Badge>
                  </div>
                  <p className="text-slate-700 font-medium text-lg">{order.desc}</p>
                  <Button
                    variant="outline"
                    className="h-14 w-full mt-3 min-h-[44px] text-base font-bold border-slate-300 shadow-sm"
                  >
                    Concluir Entrega
                  </Button>
                </CardContent>
              </Card>
            ))}
            <Button
              className="w-full h-16 text-lg font-bold bg-slate-900 text-white min-h-[44px] shadow-sm"
              onClick={sendToKds}
            >
              Lançar Novo Pedido (Balcão)
            </Button>
          </TabsContent>
          <TabsContent value="mesas" className="grid grid-cols-3 gap-3">
            {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map((m) => (
              <Button
                key={m}
                variant="outline"
                className="h-24 text-2xl font-black bg-white border-slate-200 flex flex-col items-center justify-center min-h-[44px] shadow-sm hover:border-slate-400"
              >
                <span className="text-xs font-semibold text-slate-400 uppercase tracking-widest mb-1">
                  Mesa
                </span>
                {m}
              </Button>
            ))}
          </TabsContent>
        </Tabs>
      </div>
    )
  }

  // Desktop Interface
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

      <Tabs defaultValue="pedidos" className="w-full">
        <TabsList className="mb-4 bg-slate-100 p-1">
          <TabsTrigger value="pedidos">Lançamentos / Room Service</TabsTrigger>
          <TabsTrigger value="kds">Painel KDS (Cozinha)</TabsTrigger>
        </TabsList>

        <TabsContent value="pedidos">
          <Card className="max-w-xl shadow-sm border-slate-200">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ConciergeBell className="w-5 h-5" /> Lançar Pedido Interno
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Descrição do Consumo</Label>
                <Input
                  placeholder="Ex: 2x Hambúrguer"
                  value={desc}
                  onChange={(e) => setDesc(e.target.value)}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Valor Total (R$)</Label>
                  <Input
                    type="number"
                    placeholder="85.00"
                    value={val}
                    onChange={(e) => setVal(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Desconto (%)</Label>
                  <Input
                    type="number"
                    placeholder="0"
                    value={discount}
                    onChange={(e) => setDiscount(e.target.value)}
                  />
                  <p className="text-xs text-amber-600 font-medium mt-1">
                    Valores &gt; 0% requerem aprovação
                  </p>
                </div>
              </div>
              <div className="space-y-2">
                <Label>Destino (Mesa/Quarto)</Label>
                <Input placeholder="Ex: Quarto 304" />
              </div>
              <Button
                onClick={handleLaunchOrder}
                className="w-full gap-2 bg-slate-900 text-white min-h-[44px]"
              >
                Lançar Pedido <ArrowRight className="w-4 h-4" />
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
