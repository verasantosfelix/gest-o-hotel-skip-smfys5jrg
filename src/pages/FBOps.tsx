import { useState, useEffect } from 'react'
import { CheckCircle, XCircle, Clock, UtensilsCrossed } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { useAccess } from '@/hooks/use-access'
import { RestrictedAccess } from '@/components/RestrictedAccess'
import {
  getFBOrders,
  updateFBOrder,
  FBOrder,
  getFBOrderItems,
  updateFBOrderItem,
} from '@/services/fnb'
import { useRealtime } from '@/hooks/use-realtime'
import { toast } from '@/components/ui/use-toast'
import { formatCurrency } from '@/lib/utils'

export default function FBOps() {
  const { hasAccess } = useAccess()
  const [orders, setOrders] = useState<FBOrder[]>([])
  const [itemsMap, setItemsMap] = useState<Record<string, any[]>>({})

  const loadData = async () => {
    try {
      const allOrders = await getFBOrders(
        "status='pending' || status='preparing' || status='ready'",
      )
      setOrders(allOrders)

      const newMap: Record<string, any[]> = {}
      for (const o of allOrders) {
        const items = await getFBOrderItems(`order_id='${o.id}'`)
        newMap[o.id] = items
      }
      setItemsMap(newMap)
    } catch (e) {
      console.error(e)
    }
  }

  useEffect(() => {
    loadData()
  }, [])
  useRealtime('fb_orders', loadData)
  useRealtime('fb_order_items', loadData)

  const handleUpdateStatus = async (orderId: string, newStatus: string) => {
    try {
      await updateFBOrder(orderId, { status: newStatus as any })

      if (newStatus === 'cancelled') {
        // Also cancel items
        const items = itemsMap[orderId] || []
        for (const it of items) {
          await updateFBOrderItem(it.id, { status: 'pending' }) // could add cancelled to item status, but keeping simple
        }
      } else if (newStatus === 'preparing') {
        const items = itemsMap[orderId] || []
        for (const it of items) {
          if (it.status === 'pending') await updateFBOrderItem(it.id, { status: 'cooking' })
        }
      }

      toast({ title: `Status atualizado para ${newStatus}` })
    } catch (e) {
      toast({ title: 'Erro ao atualizar', variant: 'destructive' })
    }
  }

  if (!hasAccess(['Restaurante_Bar', 'Direcao_Admin', 'Gerente_Area'])) {
    return <RestrictedAccess requiredRoles={['Restaurante_Bar', 'Direcao_Admin', 'Gerente_Area']} />
  }

  const pending = orders.filter((o) => o.status === 'pending')
  const preparing = orders.filter((o) => o.status === 'preparing')
  const ready = orders.filter((o) => o.status === 'ready')

  const OrderCard = ({ o }: { o: FBOrder }) => {
    const items = itemsMap[o.id] || []
    return (
      <Card className="animate-fade-in-up border-slate-200 shadow-sm">
        <CardHeader className="p-4 pb-2 bg-slate-50 border-b flex flex-row items-center justify-between">
          <div>
            <CardTitle className="text-base font-bold flex items-center gap-2">
              <UtensilsCrossed className="w-4 h-4 text-orange-600" />
              {o.type === 'room_service'
                ? 'Room Service'
                : `Mesa ${o.expand?.table_id?.table_number || 'N/A'}`}
            </CardTitle>
            {o.type === 'room_service' && o.expand?.room_id && (
              <p className="text-xs font-semibold text-slate-600 mt-1">
                Quarto {o.expand.room_id.room_number}
              </p>
            )}
          </div>
          <Badge
            variant={
              o.status === 'pending'
                ? 'destructive'
                : o.status === 'preparing'
                  ? 'default'
                  : 'secondary'
            }
            className="uppercase text-[10px]"
          >
            {o.status}
          </Badge>
        </CardHeader>
        <CardContent className="p-4 space-y-3">
          <div className="space-y-1">
            {items.map((it) => (
              <div key={it.id} className="text-sm flex justify-between">
                <span>
                  <span className="font-bold">{it.quantity}x</span> {it.expand?.product_id?.name}
                </span>
                <span className="text-slate-500">{formatCurrency(it.price_at_time)}</span>
              </div>
            ))}
            {items.length === 0 && <p className="text-xs text-slate-400">Carregando itens...</p>}
          </div>

          <div className="flex gap-2 pt-3 border-t">
            {o.status === 'pending' && (
              <>
                <Button
                  size="sm"
                  variant="outline"
                  className="flex-1 text-rose-600 hover:text-rose-700 hover:bg-rose-50"
                  onClick={() => handleUpdateStatus(o.id, 'cancelled')}
                >
                  <XCircle className="w-4 h-4 mr-1" /> Rejeitar
                </Button>
                <Button
                  size="sm"
                  className="flex-1 bg-orange-600 hover:bg-orange-700"
                  onClick={() => handleUpdateStatus(o.id, 'preparing')}
                >
                  <CheckCircle className="w-4 h-4 mr-1" /> Aceitar (Preparo)
                </Button>
              </>
            )}
            {o.status === 'preparing' && (
              <Button
                size="sm"
                className="w-full bg-emerald-600 hover:bg-emerald-700"
                onClick={() => handleUpdateStatus(o.id, 'ready')}
              >
                <CheckCircle className="w-4 h-4 mr-1" /> Marcar como Pronto
              </Button>
            )}
            {o.status === 'ready' && (
              <Button
                size="sm"
                className="w-full bg-indigo-600 hover:bg-indigo-700"
                onClick={() => handleUpdateStatus(o.id, 'delivered')}
              >
                <CheckCircle className="w-4 h-4 mr-1" /> Entregue / Finalizado
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6 pb-8">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold flex items-center gap-2 text-slate-800">
          <Clock className="w-6 h-6 text-orange-600" /> F&B Operations Kanban
        </h1>
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        <div className="space-y-4">
          <div className="bg-rose-100 text-rose-800 px-4 py-2 rounded-lg font-bold flex justify-between items-center">
            <span>Pendentes (Aprovação)</span>
            <Badge className="bg-rose-200 text-rose-900">{pending.length}</Badge>
          </div>
          {pending.map((o) => (
            <OrderCard key={o.id} o={o} />
          ))}
          {pending.length === 0 && (
            <p className="text-center text-slate-400 py-8 border-2 border-dashed rounded-lg">
              Sem pedidos pendentes
            </p>
          )}
        </div>

        <div className="space-y-4">
          <div className="bg-orange-100 text-orange-800 px-4 py-2 rounded-lg font-bold flex justify-between items-center">
            <span>Em Preparação (Cozinha)</span>
            <Badge className="bg-orange-200 text-orange-900">{preparing.length}</Badge>
          </div>
          {preparing.map((o) => (
            <OrderCard key={o.id} o={o} />
          ))}
          {preparing.length === 0 && (
            <p className="text-center text-slate-400 py-8 border-2 border-dashed rounded-lg">
              Nenhum pedido na cozinha
            </p>
          )}
        </div>

        <div className="space-y-4">
          <div className="bg-emerald-100 text-emerald-800 px-4 py-2 rounded-lg font-bold flex justify-between items-center">
            <span>Prontos para Entrega</span>
            <Badge className="bg-emerald-200 text-emerald-900">{ready.length}</Badge>
          </div>
          {ready.map((o) => (
            <OrderCard key={o.id} o={o} />
          ))}
          {ready.length === 0 && (
            <p className="text-center text-slate-400 py-8 border-2 border-dashed rounded-lg">
              Nenhum pedido aguardando entrega
            </p>
          )}
        </div>
      </div>
    </div>
  )
}
