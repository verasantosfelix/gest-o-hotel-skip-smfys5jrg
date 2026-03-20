import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  getFBProducts,
  FBProduct,
  createFBOrder,
  createFBOrderItem,
  getFBOrders,
  FBOrder,
  updateFBOrder,
} from '@/services/fnb'
import { getReservations, PBReservation, createConsumption } from '@/services/reservations'
import { toast } from '@/components/ui/use-toast'
import { formatCurrency } from '@/lib/utils'
import { useRealtime } from '@/hooks/use-realtime'
import { BellRing, CheckCircle2 } from 'lucide-react'

export function FnBRoomService() {
  const [products, setProducts] = useState<FBProduct[]>([])
  const [reservations, setReservations] = useState<PBReservation[]>([])
  const [selRes, setSelRes] = useState('')
  const [selProd, setSelProd] = useState('')
  const [orders, setOrders] = useState<FBOrder[]>([])

  const loadData = async () => {
    try {
      setProducts(await getFBProducts())
      const res = await getReservations()
      setReservations(res.filter((r) => r.status === 'in_house' && r.room_id))
      setOrders(
        await getFBOrders(`type = 'room_service' && status != 'closed' && status != 'cancelled'`),
      )
    } catch (e) {
      console.error(e)
    }
  }

  useEffect(() => {
    loadData()
  }, [])
  useRealtime('fb_orders', loadData)

  const handleCreate = async () => {
    if (!selRes || !selProd) return
    const prod = products.find((p) => p.id === selProd)
    const res = reservations.find((r) => r.id === selRes)
    if (!prod || !res) return
    try {
      const fee = prod.price * 0.1
      const o = await createFBOrder({
        type: 'room_service',
        status: 'pending',
        reservation_id: res.id,
        room_id: res.room_id,
        total_amount: prod.price + fee,
        service_fee: fee,
      })
      await createFBOrderItem({
        order_id: o.id,
        product_id: prod.id,
        quantity: 1,
        price_at_time: prod.price,
        status: 'pending',
      })
      toast({ title: 'Pedido enviado à cozinha com sucesso' })
      setSelProd('')
      setSelRes('')
      loadData()
    } catch (e) {}
  }

  const handleDeliver = async (o: FBOrder) => {
    try {
      await createConsumption({
        reservation_id: o.reservation_id,
        type: 'room_service',
        amount: o.total_amount,
        description: `Room Service Pedido #${o.id.slice(-4)}`,
      })
      await updateFBOrder(o.id, { status: 'closed' })
      toast({ title: 'Pedido Entregue e Consumo Postado' })
      loadData()
    } catch (e) {}
  }

  return (
    <div className="grid lg:grid-cols-12 gap-6 animate-fade-in-up">
      <div className="lg:col-span-5">
        <Card className="border-slate-200 shadow-sm sticky top-4">
          <CardHeader className="bg-slate-50 border-b pb-4">
            <CardTitle className="text-lg flex items-center gap-2">
              <BellRing className="w-5 h-5 text-purple-600" /> Lançamento Direto
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6 space-y-5">
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                Hóspede e Quarto
              </label>
              <Select value={selRes} onValueChange={setSelRes}>
                <SelectTrigger className="h-12">
                  <SelectValue placeholder="Selecione Hóspede (In-House)..." />
                </SelectTrigger>
                <SelectContent>
                  {reservations.map((r) => (
                    <SelectItem key={r.id} value={r.id}>
                      Quarto {r.expand?.room_id?.room_number} - {r.guest_name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                Selecione o Item
              </label>
              <Select value={selProd} onValueChange={setSelProd}>
                <SelectTrigger className="h-12">
                  <SelectValue placeholder="Produto do Menu..." />
                </SelectTrigger>
                <SelectContent>
                  {products.map((p) => (
                    <SelectItem key={p.id} value={p.id}>
                      {p.name} ({formatCurrency(p.price)})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="pt-2">
              <Button
                onClick={handleCreate}
                className="w-full h-12 text-base font-bold bg-purple-600 hover:bg-purple-700"
              >
                Registrar & Enviar para Cozinha
              </Button>
              <p className="text-xs text-slate-400 text-center mt-3">
                Taxa de serviço de 10% será aplicada automaticamente.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="lg:col-span-7 space-y-4">
        <h3 className="font-bold text-lg text-slate-800 flex items-center gap-2">
          Fila de Entregas e Pedidos Ativos
        </h3>
        {orders.map((o) => {
          const isReady = o.status === 'ready'
          return (
            <Card
              key={o.id}
              className={`border-l-4 shadow-sm transition-all ${isReady ? 'border-l-emerald-500' : 'border-l-slate-300'}`}
            >
              <CardContent className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <Badge className="bg-purple-100 text-purple-800 hover:bg-purple-200">
                      Quarto {o.expand?.room_id?.room_number}
                    </Badge>
                    <span className="text-xs text-slate-500 font-mono">
                      Reserva: {o.expand?.reservation_id?.guest_name}
                    </span>
                  </div>
                  <p className="text-sm font-medium text-slate-700 mt-2">
                    Status Produção:{' '}
                    <strong className={isReady ? 'text-emerald-600' : 'text-orange-500'}>
                      {o.status.toUpperCase()}
                    </strong>
                  </p>
                  <p className="text-lg font-black text-slate-900 mt-1">
                    {formatCurrency(o.total_amount)}
                  </p>
                </div>
                <Button
                  size="lg"
                  disabled={!isReady}
                  onClick={() => handleDeliver(o)}
                  className={`w-full sm:w-auto font-bold ${isReady ? 'bg-emerald-600 hover:bg-emerald-700 text-white' : ''}`}
                >
                  {isReady ? (
                    <>
                      <CheckCircle2 className="w-4 h-4 mr-2" /> Entregar & Lançar
                    </>
                  ) : (
                    'Aguardando Cozinha'
                  )}
                </Button>
              </CardContent>
            </Card>
          )
        })}
        {orders.length === 0 && (
          <div className="bg-white border border-slate-200 p-8 text-center rounded-lg shadow-sm text-slate-500">
            Nenhum pedido de room service em andamento no momento.
          </div>
        )}
      </div>
    </div>
  )
}
