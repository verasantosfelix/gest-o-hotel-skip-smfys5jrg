import { useState, useEffect } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  getFBOrders,
  createFBOrder,
  updateFBTable,
  getFBOrderItems,
  FBOrderItem,
  FBOrder,
  getFBProducts,
  FBProduct,
  createFBOrderItem,
  updateFBOrder,
  FBTable,
} from '@/services/fnb'
import { getReservations, createConsumption, PBReservation } from '@/services/reservations'
import { toast } from '@/components/ui/use-toast'
import { formatCurrency } from '@/lib/utils'

export function FnBTableDialog({ table, onClose }: { table: FBTable; onClose: () => void }) {
  const [order, setOrder] = useState<FBOrder | null>(null)
  const [items, setItems] = useState<FBOrderItem[]>([])
  const [products, setProducts] = useState<FBProduct[]>([])
  const [reservations, setReservations] = useState<PBReservation[]>([])
  const [selProduct, setSelProduct] = useState('')
  const [selRes, setSelRes] = useState('')

  const loadOrder = async () => {
    try {
      const orders = await getFBOrders(
        `table_id='${table.id}' && status!='closed' && status!='cancelled'`,
      )
      if (orders.length > 0) {
        setOrder(orders[0])
        const it = await getFBOrderItems(`order_id='${orders[0].id}'`)
        setItems(it)
      } else {
        setOrder(null)
        setItems([])
      }
    } catch (e) {}
  }

  const loadData = async () => {
    loadOrder()
    try {
      setProducts(await getFBProducts())
      const res = await getReservations()
      setReservations(res.filter((r) => r.status === 'in_house'))
    } catch (e) {}
  }
  useEffect(() => {
    loadData()
  }, [table])

  const handleOpen = async () => {
    try {
      const o = await createFBOrder({
        type: 'table',
        status: 'pending',
        table_id: table.id,
        total_amount: 0,
        service_fee: 0,
      })
      await updateFBTable(table.id, { status: 'occupied' })
      setOrder(o)
      toast({ title: 'Mesa aberta' })
    } catch (e) {
      toast({ title: 'Erro ao abrir mesa', variant: 'destructive' })
    }
  }

  const handleAddItem = async () => {
    if (!order || !selProduct) return
    const prod = products.find((p) => p.id === selProduct)
    if (!prod) return
    try {
      await createFBOrderItem({
        order_id: order.id,
        product_id: prod.id,
        quantity: 1,
        price_at_time: prod.price,
        status: 'pending',
      })
      await updateFBOrder(order.id, { total_amount: order.total_amount + prod.price })
      loadOrder()
      setSelProduct('')
      toast({ title: 'Item adicionado' })
    } catch (e) {}
  }

  const handleClosePay = async () => {
    if (!order) return
    try {
      await updateFBOrder(order.id, { status: 'closed' })
      await updateFBTable(table.id, { status: 'free' })
      toast({ title: 'Conta fechada via POS Externo' })
      onClose()
    } catch (e) {}
  }

  const handlePostRoom = async () => {
    if (!order || !selRes)
      return toast({ title: 'Selecione a reserva para lançar no quarto', variant: 'destructive' })
    try {
      await createConsumption({
        reservation_id: selRes,
        type: 'restaurante',
        amount: order.total_amount,
        description: `Consumo Mesa ${table.table_number}`,
      })
      await updateFBOrder(order.id, { status: 'closed', reservation_id: selRes })
      await updateFBTable(table.id, { status: 'free' })
      toast({ title: 'Lançado no quarto com sucesso' })
      onClose()
    } catch (e) {}
  }

  return (
    <Dialog open={true} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="max-w-xl">
        <DialogHeader>
          <DialogTitle className="text-2xl">Mesa {table.table_number}</DialogTitle>
        </DialogHeader>
        {!order ? (
          <div className="py-12 flex flex-col items-center justify-center space-y-4">
            <p className="text-slate-500">A mesa está atualmente livre.</p>
            <Button onClick={handleOpen} size="lg" className="px-8">
              Abrir Mesa & Iniciar Serviço
            </Button>
          </div>
        ) : (
          <div className="space-y-6">
            <div className="flex gap-2">
              <Select value={selProduct} onValueChange={setSelProduct}>
                <SelectTrigger className="flex-1">
                  <SelectValue placeholder="Selecione um produto..." />
                </SelectTrigger>
                <SelectContent>
                  {products.map((p) => (
                    <SelectItem key={p.id} value={p.id}>
                      {p.name} ({formatCurrency(p.price)})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Button onClick={handleAddItem}>Lançar Item</Button>
            </div>

            <div className="max-h-56 overflow-y-auto border border-slate-200 rounded-md p-2 space-y-1 bg-slate-50">
              {items.map((it) => (
                <div
                  key={it.id}
                  className="flex justify-between items-center text-sm py-2 px-2 bg-white rounded shadow-sm border border-slate-100"
                >
                  <div>
                    <p className="font-semibold text-slate-800">
                      {it.quantity}x {it.expand?.product_id?.name}
                    </p>
                    <p className="text-xs text-slate-400">Status Cozinha: {it.status}</p>
                  </div>
                  <span className="font-mono font-medium">{formatCurrency(it.price_at_time)}</span>
                </div>
              ))}
              {items.length === 0 && (
                <p className="text-sm text-slate-500 text-center py-4">
                  Nenhum item lançado ainda.
                </p>
              )}
            </div>

            <div className="flex justify-between items-center bg-slate-900 text-white p-4 rounded-md">
              <span className="font-medium text-slate-300">Total a Pagar</span>
              <span className="text-2xl font-black">{formatCurrency(order.total_amount)}</span>
            </div>

            <div className="grid sm:grid-cols-2 gap-4 border-t pt-4">
              <Button
                variant="outline"
                className="w-full h-auto py-3 whitespace-normal"
                onClick={handleClosePay}
              >
                Pagar com Cartão / Dinheiro
                <br />
                <span className="text-xs font-normal opacity-70">(Não integra PMS)</span>
              </Button>
              <div className="flex flex-col gap-2 p-3 bg-slate-50 border rounded-md">
                <Select value={selRes} onValueChange={setSelRes}>
                  <SelectTrigger className="bg-white">
                    <SelectValue placeholder="Selecione Hóspede (PMS)" />
                  </SelectTrigger>
                  <SelectContent>
                    {reservations.map((r) => (
                      <SelectItem key={r.id} value={r.id}>
                        {r.expand?.room_id?.room_number} - {r.guest_name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Button
                  onClick={handlePostRoom}
                  className="w-full bg-emerald-600 hover:bg-emerald-700 text-white"
                >
                  Postar Conta no Quarto
                </Button>
              </div>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
