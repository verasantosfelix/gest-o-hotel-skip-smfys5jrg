import { useState, useEffect } from 'react'
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Checkbox } from '@/components/ui/checkbox'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { CheckCircle, Info, ShieldCheck } from 'lucide-react'
import pb from '@/lib/pocketbase/client'
import { getConsumables, ConsumableItem } from '@/services/consumables'
import { getReservations, PBReservation } from '@/services/reservations'
import { toast } from '@/components/ui/use-toast'
import { formatCurrency } from '@/lib/utils'

export function Consumption() {
  const [reservations, setReservations] = useState<PBReservation[]>([])
  const [items, setItems] = useState<ConsumableItem[]>([])

  const [step, setStep] = useState(1)
  const [form, setForm] = useState({
    reserva_id: '',
    categoria: '',
    inventory_item_id: '',
    descricao_item: '',
    preco_unitario: '',
    quantidade: '1',
    regra_desconto: 'none' as 'none' | 'vip' | 'promo',
  })
  const [assinatura, setAssinatura] = useState(false)
  const [error, setError] = useState('')
  const [lastSaved, setLastSaved] = useState<any>(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    getReservations().then((res) => setReservations(res.filter((r) => r.status === 'in_house')))
    getConsumables().then(setItems)
  }, [step])

  const availableItems = items.filter(
    (i) => i.category === (form.categoria === 'minibar' ? 'minibar' : 'hygiene'),
  )

  const preco = parseFloat(form.preco_unitario.replace(',', '.')) || 0
  const qtd = parseInt(form.quantidade, 10) || 1
  const subtotal = preco * qtd

  let desconto = 0
  let motivo = ''
  if (form.regra_desconto === 'vip') {
    desconto = subtotal * 0.1
    motivo = 'Perfil VIP (10%)'
  } else if (form.regra_desconto === 'promo') {
    desconto = subtotal * 0.15
    motivo = 'Promoção Ativa (15%)'
  }
  const total = subtotal - desconto

  const handleNext = async () => {
    if (step === 1) {
      if (
        !form.reserva_id ||
        !form.descricao_item ||
        !form.categoria ||
        !form.preco_unitario ||
        !form.quantidade
      ) {
        setError('Todos os campos obrigatórios devem ser preenchidos.')
        return
      }
      if (isNaN(preco) || preco <= 0) {
        setError('O preço unitário deve ser superior a zero.')
        return
      }
      if (isNaN(qtd) || qtd <= 0) {
        setError('A quantidade deve ser pelo menos 1.')
        return
      }
      const res = reservations.find((r) => r.id === form.reserva_id)
      if (!res) {
        setError('Reserva não encontrada ou sem check-in ativo.')
        return
      }
      setError('')
      setStep(2)
    } else if (step === 2) {
      if (!assinatura) {
        setError('A confirmação e assinatura do hóspede são obrigatórias.')
        return
      }

      setLoading(true)
      try {
        const payload = {
          reservation_id: form.reserva_id,
          type: form.categoria,
          amount: total,
          description: `${qtd}x ${form.descricao_item}${motivo ? ` (Desc: ${motivo})` : ''}`,
        }

        const cons = await pb.collection('consumptions').create(payload)

        setLastSaved(cons)
        setError('')
        setStep(3)
        toast({ title: 'Consumo registrado com sucesso.' })
      } catch (err: any) {
        setError(err.message || 'Erro ao registrar consumo')
      } finally {
        setLoading(false)
      }
    }
  }

  if (step === 3) {
    return (
      <Card className="border-emerald-500/20 bg-emerald-50 shadow-sm animate-fade-in-up max-w-2xl">
        <CardHeader>
          <CardTitle className="text-emerald-700 font-display flex items-center gap-2">
            <CheckCircle className="w-5 h-5" /> Lançamento Realizado
          </CardTitle>
        </CardHeader>
        <CardContent>
          <pre className="bg-slate-900 text-emerald-400 p-4 rounded-md font-mono text-sm overflow-x-auto shadow-inner">
            {`<OUTPUT>
  <item_id>${lastSaved?.id}</item_id>
  <reserva_id>${lastSaved?.reservation_id}</reserva_id>
  <categoria>${lastSaved?.type}</categoria>
  <valor_final>${lastSaved?.amount.toFixed(2)}</valor_final>
  <descricao>${lastSaved?.description}</descricao>
  <estoque_atualizado>${form.categoria === 'minibar' ? 'Sim (Auto)' : 'N/A'}</estoque_atualizado>
  <status>Item registrado com sucesso</status>
</OUTPUT>`}
          </pre>
        </CardContent>
        <CardFooter>
          <Button
            onClick={() => {
              setStep(1)
              setForm((p) => ({
                ...p,
                inventory_item_id: '',
                descricao_item: '',
                preco_unitario: '',
                quantidade: '1',
              }))
              setAssinatura(false)
              setLastSaved(null)
            }}
            className="bg-emerald-600 hover:bg-emerald-700 text-white"
          >
            Novo Lançamento
          </Button>
        </CardFooter>
      </Card>
    )
  }

  return (
    <Card className="border-slate-200 shadow-sm max-w-2xl animate-fade-in-up">
      <CardHeader>
        <CardTitle className="text-slate-800 font-display">Lançamento de Consumo</CardTitle>
        <CardDescription>
          Registre itens na conta da reserva. Estoque de minibar é deduzido automaticamente.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6 min-h-[250px]">
        {step === 1 && (
          <div className="space-y-4 animate-fade-in">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-slate-700">Reserva (In-House)</Label>
                <Select
                  value={form.reserva_id}
                  onValueChange={(v) => setForm({ ...form, reserva_id: v })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione..." />
                  </SelectTrigger>
                  <SelectContent>
                    {reservations.map((r) => (
                      <SelectItem key={r.id} value={r.id}>
                        {r.guest_name} - Q.{r.expand?.room_id?.room_number}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label className="text-slate-700">Categoria</Label>
                <Select
                  value={form.categoria}
                  onValueChange={(v) =>
                    setForm({
                      ...form,
                      categoria: v,
                      inventory_item_id: '',
                      descricao_item: '',
                      preco_unitario: '',
                    })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione..." />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="minibar">Minibar (Frigobar)</SelectItem>
                    <SelectItem value="restaurante">Restaurante / F&B</SelectItem>
                    <SelectItem value="spa">SPA / Wellness</SelectItem>
                    <SelectItem value="room_service">Room Service</SelectItem>
                    <SelectItem value="outros">Outros</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label className="text-slate-700">
                Item {form.categoria === 'minibar' && '(Estoque)'}
              </Label>
              {availableItems.length > 0 && form.categoria === 'minibar' ? (
                <Select
                  value={form.inventory_item_id}
                  onValueChange={(v) => {
                    const item = items.find((i) => i.id === v)
                    setForm({
                      ...form,
                      inventory_item_id: v,
                      descricao_item: item?.item_name || '',
                      preco_unitario: item?.unit_price.toString() || '',
                    })
                  }}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione do inventário..." />
                  </SelectTrigger>
                  <SelectContent>
                    {availableItems.map((i) => (
                      <SelectItem key={i.id} value={i.id}>
                        {i.item_name} (Estoque: {i.stock_quantity}) -{' '}
                        {formatCurrency(i.unit_price, 'AOA')}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              ) : (
                <Input
                  placeholder="Descreva o item"
                  value={form.descricao_item}
                  onChange={(e) => setForm({ ...form, descricao_item: e.target.value })}
                />
              )}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-slate-700">Quantidade</Label>
                <Input
                  type="number"
                  min="1"
                  value={form.quantidade}
                  onChange={(e) => setForm({ ...form, quantidade: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label className="text-slate-700">Preço Unitário (AOA)</Label>
                <Input
                  placeholder="0.00"
                  value={form.preco_unitario}
                  onChange={(e) => setForm({ ...form, preco_unitario: e.target.value })}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label className="text-slate-700">Regra de Desconto</Label>
              <Select
                value={form.regra_desconto}
                onValueChange={(v) => setForm({ ...form, regra_desconto: v as any })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Sem desconto" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">Nenhum</SelectItem>
                  <SelectItem value="vip">Perfil VIP (10%)</SelectItem>
                  <SelectItem value="promo">Promoção Ativa (15%)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {error && (
              <pre className="text-rose-600 bg-rose-50 p-3 rounded-md text-sm whitespace-pre-wrap font-mono border border-rose-200">
                {error}
              </pre>
            )}
          </div>
        )}

        {step === 2 && (
          <div className="space-y-4 animate-fade-in">
            <Alert className="bg-slate-50 border-slate-200 shadow-sm">
              <Info className="w-4 h-4 text-slate-500" />
              <AlertTitle className="text-slate-800 font-bold mb-2">
                Resumo do Lançamento
              </AlertTitle>
              <AlertDescription className="text-slate-700 space-y-2">
                <div className="flex justify-between">
                  <span>
                    Subtotal ({qtd}x {formatCurrency(preco, 'AOA')}):
                  </span>
                  <span>{formatCurrency(subtotal, 'AOA')}</span>
                </div>
                {desconto > 0 && (
                  <div className="flex justify-between text-emerald-600">
                    <span>Desconto ({motivo}):</span>
                    <span>- {formatCurrency(desconto, 'AOA')}</span>
                  </div>
                )}
                <div className="flex justify-between font-bold text-slate-900 pt-2 border-t border-slate-200">
                  <span>Total Final:</span>
                  <span>{formatCurrency(total, 'AOA')}</span>
                </div>
              </AlertDescription>
            </Alert>
            <div className="bg-white p-6 rounded-lg border border-slate-200 shadow-sm text-center space-y-4 mt-6">
              <div className="flex justify-center mb-2">
                <div className="bg-slate-100 p-3 rounded-full">
                  <ShieldCheck className="w-6 h-6 text-slate-600" />
                </div>
              </div>
              <h3 className="font-medium text-slate-800">Assinatura Digital do Hóspede</h3>
              <p className="text-sm text-slate-500 mb-4">
                Confirmo o consumo acima no valor de <strong>{formatCurrency(total, 'AOA')}</strong>
                .
              </p>
              <div className="max-w-sm mx-auto p-4 bg-slate-50 border-2 border-dashed border-slate-300 rounded-md">
                <div className="flex items-center space-x-3 justify-center">
                  <Checkbox
                    id="assinatura"
                    checked={assinatura}
                    onCheckedChange={(c) => setAssinatura(!!c)}
                    className="w-5 h-5 data-[state=checked]:bg-emerald-600 data-[state=checked]:border-emerald-600"
                  />
                  <Label
                    htmlFor="assinatura"
                    className="text-slate-700 font-medium cursor-pointer text-base"
                  >
                    Confirmar e Autorizar
                  </Label>
                </div>
              </div>
            </div>
            {error && (
              <pre className="text-rose-600 bg-rose-50 p-3 rounded-md text-sm border border-rose-200">
                {error}
              </pre>
            )}
          </div>
        )}
      </CardContent>
      <CardFooter className="flex justify-between border-t border-slate-100 pt-6">
        <Button
          variant="outline"
          onClick={() => {
            setStep((s) => Math.max(1, s - 1))
            setError('')
          }}
          disabled={step === 1 || loading}
        >
          Voltar
        </Button>
        <Button
          onClick={handleNext}
          disabled={loading}
          className="bg-slate-800 hover:bg-slate-900 text-white"
        >
          {step === 2 ? (loading ? 'Registrando...' : 'Registrar Consumo') : 'Avançar'}
        </Button>
      </CardFooter>
    </Card>
  )
}
