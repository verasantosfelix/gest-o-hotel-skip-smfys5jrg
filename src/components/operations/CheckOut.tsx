import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { CreditCard, Banknote, Wallet, AlertTriangle, CheckCircle, Loader2 } from 'lucide-react'
import useReservationStore, { Reservation } from '@/stores/useReservationStore'
import useAuditStore from '@/stores/useAuditStore'

export function CheckOut() {
  const { reservations, getConsumptionsByReservation, updateReservationStatus } =
    useReservationStore()
  const { addLog } = useAuditStore()

  const [step, setStep] = useState(1)
  const [form, setForm] = useState({ quarto: '', pagamento: 'credito' })
  const [error, setError] = useState('')
  const [reserva, setReserva] = useState<Reservation | null>(null)
  const [consumoTotal, setConsumoTotal] = useState(0)
  const [descontoTotal, setDescontoTotal] = useState(0)

  const [isProcessingPOS, setIsProcessingPOS] = useState(false)
  const [posSuccess, setPosSuccess] = useState(false)

  const values = {
    diarias: 1200.0,
    consumos: consumoTotal,
    taxas: 67.5,
    get total() {
      return this.diarias + this.consumos + this.taxas
    },
  }

  const nextStep = () => {
    if (step === 1) {
      if (!form.quarto) return
      const res = reservations.find(
        (r) =>
          r.room === form.quarto ||
          r.id === form.quarto ||
          r.guestName.toLowerCase().includes(form.quarto.toLowerCase()),
      )
      if (!res) {
        setError('<erro>Reserva não encontrada. Tente quarto 304 ou ID 12345.</erro>')
        return
      }
      if (res.status !== 'checked-in') {
        setError('<erro>Não é possível fazer check-out sem check-in ativo.</erro>')
        return
      }
      const cons = getConsumptionsByReservation(res.id).filter((c) => c.validacao_hospede)
      setReserva(res)
      setConsumoTotal(cons.reduce((acc, c) => acc + c.valor, 0))
      setDescontoTotal(cons.reduce((acc, c) => acc + (c.desconto || 0), 0))
      setError('')
      setStep(2)
    } else if (step === 4) {
      if (reserva) {
        updateReservationStatus(reserva.id, 'checked-out')
      }
      setStep(5)
    } else {
      setStep((s) => s + 1)
    }
  }

  const handlePOS = () => {
    setIsProcessingPOS(true)
    setTimeout(() => {
      setIsProcessingPOS(false)
      setPosSuccess(true)
      addLog(
        'POS_INTEGRATION',
        `Terminal payment confirmed for reservation ${reserva?.id} amount R$ ${values.total.toFixed(2)}`,
      )
    }, 2500)
  }

  if (step === 5) {
    return (
      <Card className="border-emerald-500/20 bg-emerald-50 shadow-sm animate-fade-in-up">
        <CardHeader>
          <CardTitle className="text-emerald-700 font-display">Check-out Concluído</CardTitle>
        </CardHeader>
        <CardContent>
          <pre className="bg-slate-900 text-emerald-400 p-4 rounded-md font-mono text-sm overflow-x-auto shadow-inner">
            {`<OUTPUT>
  <resumo>Check-out finalizado. Quarto liberado para limpeza.</resumo>
  <dados>
    <quarto>${reserva?.room}</quarto>
    <metodo_pagamento>${form.pagamento} ${posSuccess ? '(POS Terminal)' : ''}</metodo_pagamento>
    <total_pago>R$ ${values.total.toFixed(2)}</total_pago>
    <status>Check-out concluído</status>
  </dados>
</OUTPUT>`}
          </pre>
        </CardContent>
        <CardFooter>
          <Button
            onClick={() => {
              setStep(1)
              setForm({ quarto: '', pagamento: 'credito' })
              setReserva(null)
              setPosSuccess(false)
            }}
            className="bg-emerald-600 hover:bg-emerald-700 text-white"
          >
            Novo Check-out
          </Button>
        </CardFooter>
      </Card>
    )
  }

  return (
    <Card className="border-slate-200 shadow-sm max-w-2xl animate-fade-in-up">
      <CardHeader>
        <CardTitle className="text-slate-800 font-display">Check-out de Hóspede</CardTitle>
        <CardDescription>Passo {step} de 4 - Finalização de estadia e faturamento</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4 min-h-[250px]">
        {step === 1 && (
          <div className="space-y-4 animate-fade-in">
            <div className="space-y-2">
              <Label>Número do Quarto, Nome ou ID da Reserva</Label>
              <Input
                placeholder="Ex: 304, 12345 ou João Silva"
                value={form.quarto}
                onChange={(e) => setForm({ ...form, quarto: e.target.value })}
              />
            </div>
            {error && (
              <div className="text-xs text-rose-600 bg-rose-50 p-3 rounded font-mono border border-rose-200 flex items-start gap-2">
                <AlertTriangle className="w-4 h-4 shrink-0" />
                {error}
              </div>
            )}
          </div>
        )}

        {step === 2 && (
          <div className="space-y-4 animate-fade-in">
            <div className="bg-slate-50 p-5 rounded-lg border border-slate-200 shadow-sm">
              <h3 className="font-semibold text-slate-800 mb-4">
                Extrato Consolidado (Quarto {reserva?.room})
              </h3>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between border-b pb-2">
                  <span className="text-slate-600">Diárias:</span>
                  <span className="font-medium">R$ {values.diarias.toFixed(2)}</span>
                </div>
                <div className="flex flex-col border-b pb-2">
                  <div className="flex justify-between">
                    <span className="text-slate-600">Consumos (Validados):</span>
                    <span className="font-medium">R$ {values.consumos.toFixed(2)}</span>
                  </div>
                  {descontoTotal > 0 && (
                    <div className="flex justify-between text-xs text-emerald-600 mt-1">
                      <span>Descontos:</span>
                      <span>- R$ {descontoTotal.toFixed(2)}</span>
                    </div>
                  )}
                </div>
                <div className="flex justify-between border-b pb-2">
                  <span className="text-slate-600">Taxas:</span>
                  <span className="font-medium">R$ {values.taxas.toFixed(2)}</span>
                </div>
                <div className="flex justify-between pt-2">
                  <span className="font-bold text-slate-800">Total a Pagar:</span>
                  <span className="font-bold text-emerald-600 text-lg">
                    R$ {values.total.toFixed(2)}
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="space-y-4 animate-fade-in">
            <h3 className="font-medium text-slate-800">Método de Pagamento</h3>
            <RadioGroup
              value={form.pagamento}
              onValueChange={(v) => setForm({ ...form, pagamento: v })}
              className="grid gap-3"
            >
              <Label
                htmlFor="credito"
                className="flex items-center space-x-3 p-4 rounded-lg border cursor-pointer hover:bg-slate-50 [&:has([data-state=checked])]:border-slate-800"
              >
                <RadioGroupItem value="credito" id="credito" />
                <CreditCard className="w-5 h-5" />
                <span className="font-medium">Cartão de Crédito</span>
              </Label>
              <Label
                htmlFor="debito"
                className="flex items-center space-x-3 p-4 rounded-lg border cursor-pointer hover:bg-slate-50 [&:has([data-state=checked])]:border-slate-800"
              >
                <RadioGroupItem value="debito" id="debito" />
                <Banknote className="w-5 h-5" />
                <span className="font-medium">Cartão de Débito</span>
              </Label>
              <Label
                htmlFor="dinheiro"
                className="flex items-center space-x-3 p-4 rounded-lg border cursor-pointer hover:bg-slate-50 [&:has([data-state=checked])]:border-slate-800"
              >
                <RadioGroupItem value="dinheiro" id="dinheiro" />
                <Wallet className="w-5 h-5" />
                <span className="font-medium">Dinheiro / Pix</span>
              </Label>
            </RadioGroup>
          </div>
        )}

        {step === 4 && (
          <div className="space-y-4 animate-fade-in">
            <Alert className="bg-amber-50 border-amber-200">
              <AlertTitle className="text-amber-800 font-bold mb-2">Confirmação Final</AlertTitle>
              <AlertDescription className="text-amber-700 text-sm">
                Tem certeza que deseja processar o pagamento de{' '}
                <strong>R$ {values.total.toFixed(2)}</strong> via {form.pagamento} e concluir o
                check-out do quarto <strong>{reserva?.room}</strong>?
              </AlertDescription>
            </Alert>

            <div className="p-4 border rounded-lg bg-slate-50 flex flex-col items-center justify-center space-y-3">
              <h4 className="font-medium text-slate-800">Integração com Terminal (POS)</h4>
              {!posSuccess ? (
                <Button
                  variant="outline"
                  className="w-full border-slate-300 bg-white"
                  onClick={handlePOS}
                  disabled={isProcessingPOS}
                >
                  {isProcessingPOS ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Aguardando Terminal...
                    </>
                  ) : (
                    'Processar via Terminal Externo'
                  )}
                </Button>
              ) : (
                <div className="flex items-center gap-2 text-emerald-600 font-medium py-2">
                  <CheckCircle className="w-5 h-5" /> Pagamento Confirmado no Terminal
                </div>
              )}
            </div>
          </div>
        )}
      </CardContent>
      <CardFooter className="flex justify-between border-t pt-6">
        <Button
          variant="outline"
          onClick={() => setStep((s) => Math.max(1, s - 1))}
          disabled={step === 1 || isProcessingPOS}
        >
          Voltar
        </Button>
        <Button
          onClick={nextStep}
          disabled={(step === 1 && !form.quarto) || isProcessingPOS}
          className="bg-slate-800 text-white"
        >
          {step === 4 ? 'Concluir Check-out' : 'Avançar'}
        </Button>
      </CardFooter>
    </Card>
  )
}
