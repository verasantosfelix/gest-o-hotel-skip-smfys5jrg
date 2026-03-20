import { useState } from 'react'
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
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import useReservationStore, {
  ConsumptionCategory,
  Consumption as IConsumption,
} from '@/stores/useReservationStore'
import { CheckCircle } from 'lucide-react'

export function Consumption() {
  const { reservations, addConsumption, getConsumptionsByReservation } = useReservationStore()
  const [step, setStep] = useState(1)
  const [form, setForm] = useState({
    reserva_id: '',
    descricao_item: '',
    categoria: '' as ConsumptionCategory | '',
    valor: '',
  })
  const [error, setError] = useState('')
  const [lastSaved, setLastSaved] = useState<IConsumption | null>(null)

  const activeReservation = reservations.find(
    (r) => r.id === form.reserva_id && r.status === 'checked-in',
  )
  const activeConsumptions = activeReservation
    ? getConsumptionsByReservation(activeReservation.id)
    : []

  const handleNext = () => {
    if (step === 1) {
      if (!form.reserva_id || !form.descricao_item || !form.categoria || !form.valor) {
        setError('<erro>Todos os campos são obrigatórios.</erro>')
        return
      }

      const valStr = form.valor.replace(',', '.')
      const val = parseFloat(valStr)
      if (isNaN(val) || val <= 0) {
        setError('<erro tipo="valor-invalido">O valor do item deve ser superior a zero.</erro>')
        return
      }

      const res = reservations.find((r) => r.id === form.reserva_id)
      if (!res || res.status !== 'checked-in') {
        setError(
          '<erro tipo="status-invalido">Não é possível registrar consumo para uma reserva sem check-in ativo.</erro>',
        )
        return
      }

      setError('')
      setStep(2)
    } else if (step === 2) {
      const cons: IConsumption = {
        id: `ITEM-${Math.floor(Math.random() * 10000)}`,
        reserva_id: form.reserva_id,
        categoria: form.categoria as ConsumptionCategory,
        descricao: form.descricao_item,
        valor: parseFloat(form.valor.replace(',', '.')),
        data_registro: new Date().toISOString(),
      }
      addConsumption(cons)
      setLastSaved(cons)
      setStep(3)
    }
  }

  if (step === 3) {
    return (
      <Card className="border-emerald-500/20 bg-emerald-50 shadow-sm animate-fade-in-up max-w-2xl">
        <CardHeader>
          <CardTitle className="text-emerald-700 font-display flex items-center gap-2">
            <CheckCircle className="w-5 h-5" />
            Lançamento Realizado
          </CardTitle>
        </CardHeader>
        <CardContent>
          <pre className="bg-slate-900 text-emerald-400 p-4 rounded-md font-mono text-sm overflow-x-auto shadow-inner">
            {`<OUTPUT>
  <item_id>${lastSaved?.id}</item_id>
  <reserva_id>${lastSaved?.reserva_id}</reserva_id>
  <categoria>${lastSaved?.categoria}</categoria>
  <valor>${lastSaved?.valor.toFixed(2)}</valor>
  <data_registro>${lastSaved?.data_registro}</data_registro>
  <status>Item registrado com sucesso</status>
</OUTPUT>`}
          </pre>
        </CardContent>
        <CardFooter>
          <Button
            onClick={() => {
              setStep(1)
              setForm((prev) => ({ ...prev, descricao_item: '', categoria: '', valor: '' }))
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
          Registre itens na conta do hóspede (Minibar, Restaurante, Serviços)
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6 min-h-[250px]">
        {step === 1 && (
          <div className="space-y-4 animate-fade-in">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-slate-700">ID da Reserva</Label>
                <Input
                  className="border-slate-300 focus-visible:ring-slate-500"
                  placeholder="Ex: 12345"
                  value={form.reserva_id}
                  onChange={(e) => setForm({ ...form, reserva_id: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label className="text-slate-700">Categoria</Label>
                <Select
                  value={form.categoria}
                  onValueChange={(v) => setForm({ ...form, categoria: v as any })}
                >
                  <SelectTrigger className="border-slate-300">
                    <SelectValue placeholder="Selecione..." />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Minibar">Minibar (Frigobar)</SelectItem>
                    <SelectItem value="Restaurante">Restaurante</SelectItem>
                    <SelectItem value="Serviços Extras">Serviços Extras</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label className="text-slate-700">Descrição do Item</Label>
              <Input
                className="border-slate-300 focus-visible:ring-slate-500"
                placeholder="Ex: Água mineral com gás"
                value={form.descricao_item}
                onChange={(e) => setForm({ ...form, descricao_item: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label className="text-slate-700">Valor (R$)</Label>
              <Input
                className="border-slate-300 focus-visible:ring-slate-500"
                placeholder="0.00"
                type="text"
                value={form.valor}
                onChange={(e) => setForm({ ...form, valor: e.target.value })}
              />
            </div>

            {error && (
              <pre className="text-rose-600 bg-rose-50 p-3 rounded-md text-sm whitespace-pre-wrap font-mono border border-rose-200 shadow-sm animate-fade-in">
                {error}
              </pre>
            )}

            {activeReservation && (
              <div className="mt-8 space-y-4 animate-fade-in">
                <h3 className="font-semibold text-slate-800 border-b pb-2">
                  Extrato Atual - Quarto {activeReservation.room}
                </h3>
                {activeConsumptions.length === 0 ? (
                  <p className="text-sm text-slate-500">Nenhum consumo registrado ainda.</p>
                ) : (
                  <div className="space-y-2 max-h-48 overflow-y-auto pr-2">
                    {activeConsumptions.map((c) => (
                      <div
                        key={c.id}
                        className="flex justify-between items-center bg-slate-50 p-3 rounded-md border border-slate-100"
                      >
                        <div>
                          <p className="text-sm font-medium text-slate-800">{c.descricao}</p>
                          <p className="text-xs text-slate-500">{c.categoria}</p>
                        </div>
                        <span className="font-semibold text-slate-700">
                          R$ {c.valor.toFixed(2)}
                        </span>
                      </div>
                    ))}
                    <div className="flex justify-between items-center pt-2 border-t border-slate-200 sticky bottom-0 bg-white">
                      <span className="font-bold text-slate-800">Total Parcial</span>
                      <span className="font-bold text-emerald-600">
                        R$ {activeConsumptions.reduce((a, b) => a + b.valor, 0).toFixed(2)}
                      </span>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {step === 2 && (
          <div className="space-y-4 animate-fade-in">
            <Alert className="bg-slate-50 border-slate-200 shadow-sm">
              <AlertTitle className="text-slate-800 font-bold mb-2">
                Confirmar Lançamento
              </AlertTitle>
              <AlertDescription className="text-slate-700">
                Confirma o registro de <strong>{form.descricao_item}</strong> no valor de{' '}
                <strong>R$ {parseFloat(form.valor.replace(',', '.')).toFixed(2)}</strong> para o
                hóspede da reserva <strong>{form.reserva_id}</strong>?
              </AlertDescription>
            </Alert>
          </div>
        )}
      </CardContent>
      <CardFooter className="flex justify-between border-t border-slate-100 pt-6">
        <Button
          variant="outline"
          className="text-slate-600 border-slate-300"
          onClick={() => setStep((s) => Math.max(1, s - 1))}
          disabled={step === 1}
        >
          Voltar
        </Button>
        <Button
          onClick={handleNext}
          className="bg-slate-800 hover:bg-slate-900 text-white shadow-sm"
        >
          {step === 2 ? 'Confirmar Lançamento' : 'Avançar'}
        </Button>
      </CardFooter>
    </Card>
  )
}
