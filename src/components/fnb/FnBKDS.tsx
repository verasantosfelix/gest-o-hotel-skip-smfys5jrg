import { useState, useEffect } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { getFBOrderItems, updateFBOrderItem, updateFBOrder, FBOrderItem } from '@/services/fnb'
import { useRealtime } from '@/hooks/use-realtime'
import { ChefHat, Clock } from 'lucide-react'

export function FnBKDS() {
  const [items, setItems] = useState<FBOrderItem[]>([])

  const loadData = async () => {
    try {
      const all = await getFBOrderItems("status != 'finished'")
      setItems(all)
    } catch (e) {
      console.error(e)
    }
  }

  useEffect(() => {
    loadData()
  }, [])
  useRealtime('fb_order_items', loadData)

  const handleStart = async (it: FBOrderItem) => {
    try {
      await updateFBOrderItem(it.id, { status: 'cooking' })
      if (it.expand?.order_id?.status === 'pending') {
        await updateFBOrder(it.order_id, { status: 'preparing' })
      }
      loadData()
    } catch (e) {}
  }

  const handleFinish = async (it: FBOrderItem) => {
    try {
      await updateFBOrderItem(it.id, { status: 'finished' })
      const orderItems = await getFBOrderItems(`order_id = '${it.order_id}'`)
      const allFinished = orderItems.every((o) => (o.id === it.id ? true : o.status === 'finished'))
      if (allFinished) {
        await updateFBOrder(it.order_id, { status: 'ready' })
      }
      loadData()
    } catch (e) {}
  }

  return (
    <div className="space-y-6 animate-fade-in-up">
      <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
        <ChefHat className="w-5 h-5 text-orange-600" /> Cozinha (KDS View)
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 items-start">
        {items.map((it) => {
          const order = it.expand?.order_id
          const isRoom = order?.type === 'room_service'
          const loc = isRoom
            ? `Quarto ${order?.expand?.room_id?.room_number || '?'}`
            : `Mesa ${order?.expand?.table_id?.table_number || '?'}`
          const elapsed = Math.floor((Date.now() - new Date(it.created).getTime()) / 60000)
          const isUrgent = elapsed > 15
          const isWarning = elapsed > 8

          return (
            <Card
              key={it.id}
              className={`border-t-4 shadow-sm ${isUrgent ? 'border-t-rose-500' : isWarning ? 'border-t-orange-400' : 'border-t-emerald-400'}`}
            >
              <CardContent className="p-4 flex flex-col h-full justify-between">
                <div>
                  <div className="flex justify-between items-start mb-3">
                    <Badge
                      variant={isRoom ? 'default' : 'secondary'}
                      className={isRoom ? 'bg-purple-600' : ''}
                    >
                      {loc}
                    </Badge>
                    <span
                      className={`text-xs font-mono flex items-center gap-1 font-bold ${isUrgent ? 'text-rose-600' : 'text-slate-500'}`}
                    >
                      <Clock className="w-3 h-3" /> {elapsed} min
                    </span>
                  </div>
                  <p className="font-black text-xl text-slate-800 leading-tight mb-4">
                    {it.quantity}x {it.expand?.product_id?.name}
                  </p>
                </div>
                <div className="pt-3 border-t border-slate-100">
                  {it.status === 'pending' && (
                    <Button
                      size="lg"
                      onClick={() => handleStart(it)}
                      className="w-full bg-slate-900 text-white font-bold"
                    >
                      Iniciar Preparo
                    </Button>
                  )}
                  {it.status === 'cooking' && (
                    <Button
                      size="lg"
                      onClick={() => handleFinish(it)}
                      className="w-full bg-orange-600 hover:bg-orange-700 text-white font-bold"
                    >
                      Marcar como Pronto
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          )
        })}
        {items.length === 0 && (
          <div className="col-span-full py-20 text-center text-slate-400 flex flex-col items-center bg-slate-50/50 rounded-lg border border-dashed border-slate-200">
            <ChefHat className="w-16 h-16 mb-4 opacity-50" />
            <p className="text-lg font-medium">Cozinha Livre</p>
            <p className="text-sm">Nenhum pedido pendente de preparação.</p>
          </div>
        )}
      </div>
    </div>
  )
}
