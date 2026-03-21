import { useState, useEffect, useRef } from 'react'
import pb from '@/lib/pocketbase/client'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { SignaturePad, SignaturePadRef } from '@/components/ui/signature-pad'
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

  const [checkoutMode, setCheckoutMode] = useState<'immediate' | 'room_charge' | 'deferred' | ''>(
    '',
  )
  const [isSubmitting, setIsSubmitting] = useState(false)
  const signatureRef = useRef<SignaturePadRef>(null)

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
    } catch (e) {
      console.error(e)
    }
  }

  const loadData = async () => {
    loadOrder()
    try {
      setProducts(await getFBProducts())
      const res = await getReservations()
      setReservations(res.filter((r) => r.status === 'in_house'))
    } catch (e) {
      console.error(e)
    }
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
    } catch (e) {
      console.error(e)
    }
  }

  const dataURLtoBlob = (dataurl: string) => {
    const arr = dataurl.split(',')
    const mimeMatch = arr[0].match(/:(.*?);/)
    const mime = mimeMatch ? mimeMatch[1] : 'image/png'
    const bstr = atob(arr[1])
    let n = bstr.length
    const u8arr = new Uint8Array(n)
    while (n--) {
      u8arr[n] = bstr.charCodeAt(n)
    }
    return new Blob([u8arr], { type: mime })
  }

  const handleConfirmCheckout = async () => {
    if (!order) return
    if (checkoutMode === 'room_charge' && !selRes) {
      return toast({ title: 'Selecione o hóspede', variant: 'destructive' })
    }

    const isDeferred = checkoutMode === 'room_charge' || checkoutMode === 'deferred'

    if (isDeferred && signatureRef.current?.isEmpty()) {
      return toast({
        title: 'Assinatura obrigatória para pagamentos a prazo',
        variant: 'destructive',
      })
    }

    setIsSubmitting(true)
    try {
      const formData = new FormData()
      formData.append('status', 'closed')
      formData.append('payment_method', checkoutMode)

      if (checkoutMode === 'room_charge') {
        formData.append('reservation_id', selRes)
        await createConsumption({
          reservation_id: selRes,
          type: 'restaurante',
          amount: order.total_amount,
          description: `Consumo Mesa ${table.table_number}`,
        })
      }

      if (isDeferred) {
        const dataUrl = signatureRef.current?.toDataURL()
        if (dataUrl) {
          const blob = dataURLtoBlob(dataUrl)
          formData.append('signature_file', blob, 'signature.png')
        }
      }

      await updateFBOrder(order.id, formData)
      await updateFBTable(table.id, { status: 'free' })

      await pb.collection('action_audit_logs').create({
        user_id: pb.authStore.record?.id,
        action_type: 'FNB_ORDER_CLOSED',
        module: 'F&B',
        details: {
          order_id: order.id,
          payment_method: checkoutMode,
          total: order.total_amount,
          has_signature: isDeferred,
        },
      })

      toast({ title: 'Conta fechada com sucesso!' })
      onClose()
    } catch (e: any) {
      console.error(e)
      toast({ title: 'Erro ao fechar conta', description: e.message, variant: 'destructive' })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Dialog open={true} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="max-w-xl max-h-[90vh] overflow-y-auto">
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
            {!checkoutMode && (
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
            )}

            <div
              className={`max-h-56 overflow-y-auto border border-slate-200 rounded-md p-2 space-y-1 bg-slate-50 ${checkoutMode ? 'opacity-80 pointer-events-none' : ''}`}
            >
              {items.map((it) => (
                <div
                  key={it.id}
                  className="flex justify-between items-center text-sm py-2 px-2 bg-white rounded shadow-sm border border-slate-100"
                >
                  <div>
                    <p className="font-semibold text-slate-800">
                      {it.quantity}x {it.expand?.product_id?.name}
                    </p>
                    {!checkoutMode && (
                      <p className="text-xs text-slate-400">Status Cozinha: {it.status}</p>
                    )}
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
              <span className="font-medium text-slate-300">Total da Mesa</span>
              <span className="text-2xl font-black">{formatCurrency(order.total_amount)}</span>
            </div>

            {!checkoutMode ? (
              <div className="grid sm:grid-cols-2 gap-4 border-t pt-4">
                <Button
                  variant="outline"
                  className="w-full h-auto py-3 whitespace-normal"
                  onClick={() => setCheckoutMode('immediate')}
                >
                  Pagar e Fechar (POS)
                  <br />
                  <span className="text-xs font-normal opacity-70">(Imediato - S/ Assinatura)</span>
                </Button>
                <Button
                  className="w-full h-auto py-3 whitespace-normal bg-emerald-600 hover:bg-emerald-700 text-white"
                  onClick={() => setCheckoutMode('room_charge')}
                >
                  Faturar / Lançar no Quarto
                  <br />
                  <span className="text-xs font-normal opacity-90">
                    (Requer Assinatura Digital)
                  </span>
                </Button>
              </div>
            ) : (
              <div className="border-t pt-4 mt-4 space-y-4 animate-in fade-in zoom-in-95 duration-200">
                <h3 className="font-semibold text-slate-800 text-lg">Detalhes do Fechamento</h3>
                <div className="space-y-3">
                  <div className="space-y-2">
                    <Label>Método de Pagamento</Label>
                    <Select value={checkoutMode} onValueChange={(v: any) => setCheckoutMode(v)}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="immediate">Pagamento Imediato (POS / Cash)</SelectItem>
                        <SelectItem value="room_charge">
                          Lançar no Quarto (Hóspede Interno)
                        </SelectItem>
                        <SelectItem value="deferred">Faturar Externo (Cliente Passante)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {checkoutMode === 'room_charge' && (
                    <div className="space-y-2 animate-in slide-in-from-top-2">
                      <Label>Selecione o Hóspede</Label>
                      <Select value={selRes} onValueChange={setSelRes}>
                        <SelectTrigger className="bg-white border-emerald-200 focus:ring-emerald-500">
                          <SelectValue placeholder="Buscar Hóspede em Casa..." />
                        </SelectTrigger>
                        <SelectContent>
                          {reservations.map((r) => (
                            <SelectItem key={r.id} value={r.id}>
                              Quarto {r.expand?.room_id?.room_number || 'S/N'} - {r.guest_name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  )}

                  {(checkoutMode === 'room_charge' || checkoutMode === 'deferred') && (
                    <div className="space-y-2 mt-4 animate-in fade-in slide-in-from-bottom-4">
                      <div className="flex items-center justify-between">
                        <Label className="text-emerald-700 font-semibold text-sm">
                          Assinatura do Cliente *
                        </Label>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-6 text-xs text-slate-500 hover:text-slate-800"
                          onClick={() => signatureRef.current?.clear()}
                        >
                          Limpar Tela
                        </Button>
                      </div>
                      <div className="bg-slate-50 p-1 border border-slate-200 rounded-lg">
                        <SignaturePad ref={signatureRef} className="h-40 w-full" />
                      </div>
                      <p className="text-xs text-slate-400 text-center">
                        Assine acima para confirmar a cobrança diferida do valor total de{' '}
                        {formatCurrency(order.total_amount)}.
                      </p>
                    </div>
                  )}

                  <div className="flex gap-2 justify-end pt-4 border-t border-slate-100">
                    <Button
                      variant="ghost"
                      onClick={() => setCheckoutMode('')}
                      disabled={isSubmitting}
                    >
                      Voltar
                    </Button>
                    <Button
                      onClick={handleConfirmCheckout}
                      disabled={isSubmitting}
                      className="bg-slate-900 hover:bg-black text-white"
                    >
                      {isSubmitting ? 'Processando...' : 'Confirmar Pagamento e Fechar'}
                    </Button>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
