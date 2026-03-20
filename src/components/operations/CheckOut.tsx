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
import { CreditCard, Banknote, Wallet } from 'lucide-react'

export function CheckOut() {
  const [step, setStep] = useState(1)
  const [form, setForm] = useState({ quarto: '', pagamento: 'credito' })

  const values = {
    diarias: 1200.0,
    consumos: 150.5,
    taxas: 67.5,
    total: 1418.0,
  }

  const nextStep = () => {
    if (step === 1 && !form.quarto) return
    setStep((s) => s + 1)
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
  <recibo>REC-${Math.floor(Math.random() * 10000)}</recibo>
  <valores>
    <diarias>R$ ${values.diarias.toFixed(2)}</diarias>
    <consumos>R$ ${values.consumos.toFixed(2)}</consumos>
    <taxas>R$ ${values.taxas.toFixed(2)}</taxas>
    <total>R$ ${values.total.toFixed(2)}</total>
  </valores>
  <status>Check-out concluído</status>
</OUTPUT>`}
          </pre>
        </CardContent>
        <CardFooter>
          <Button
            onClick={() => {
              setStep(1)
              setForm({ quarto: '', pagamento: 'credito' })
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
              <Label className="text-slate-700">Número do Quarto ou Nome do Hóspede</Label>
              <Input
                className="border-slate-300 focus-visible:ring-slate-500"
                placeholder="Ex: 304 ou João Silva"
                value={form.quarto}
                onChange={(e) => setForm({ ...form, quarto: e.target.value })}
              />
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-4 animate-fade-in">
            <div className="bg-slate-50 p-5 rounded-lg border border-slate-200 shadow-sm">
              <h3 className="font-semibold text-slate-800 mb-4">
                Cálculo de Fechamento (Quarto {form.quarto})
              </h3>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between border-b border-slate-200 pb-2">
                  <span className="text-slate-600">Diárias (3 noites):</span>
                  <span className="font-medium text-slate-900">R$ {values.diarias.toFixed(2)}</span>
                </div>
                <div className="flex justify-between border-b border-slate-200 pb-2">
                  <span className="text-slate-600">Consumos (Frigobar/Restaurante):</span>
                  <span className="font-medium text-slate-900">
                    R$ {values.consumos.toFixed(2)}
                  </span>
                </div>
                <div className="flex justify-between border-b border-slate-200 pb-2">
                  <span className="text-slate-600">Taxas (ISS/Turismo):</span>
                  <span className="font-medium text-slate-900">R$ {values.taxas.toFixed(2)}</span>
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
                className="flex items-center space-x-3 p-4 rounded-lg border border-slate-200 cursor-pointer hover:bg-slate-50 [&:has([data-state=checked])]:border-slate-800 [&:has([data-state=checked])]:bg-slate-50 transition-colors"
              >
                <RadioGroupItem
                  value="credito"
                  id="credito"
                  className="text-slate-800 border-slate-400"
                />
                <CreditCard className="w-5 h-5 text-slate-600" />
                <span className="font-medium text-slate-700">Cartão de Crédito</span>
              </Label>
              <Label
                htmlFor="debito"
                className="flex items-center space-x-3 p-4 rounded-lg border border-slate-200 cursor-pointer hover:bg-slate-50 [&:has([data-state=checked])]:border-slate-800 [&:has([data-state=checked])]:bg-slate-50 transition-colors"
              >
                <RadioGroupItem
                  value="debito"
                  id="debito"
                  className="text-slate-800 border-slate-400"
                />
                <Banknote className="w-5 h-5 text-slate-600" />
                <span className="font-medium text-slate-700">Cartão de Débito</span>
              </Label>
              <Label
                htmlFor="dinheiro"
                className="flex items-center space-x-3 p-4 rounded-lg border border-slate-200 cursor-pointer hover:bg-slate-50 [&:has([data-state=checked])]:border-slate-800 [&:has([data-state=checked])]:bg-slate-50 transition-colors"
              >
                <RadioGroupItem
                  value="dinheiro"
                  id="dinheiro"
                  className="text-slate-800 border-slate-400"
                />
                <Wallet className="w-5 h-5 text-slate-600" />
                <span className="font-medium text-slate-700">Dinheiro / Pix</span>
              </Label>
            </RadioGroup>
          </div>
        )}

        {step === 4 && (
          <div className="space-y-4 animate-fade-in">
            <Alert className="bg-rose-50 border-rose-200 shadow-sm">
              <AlertTitle className="text-rose-800 font-bold text-lg mb-2">
                Confirmação de Check-out
              </AlertTitle>
              <AlertDescription className="text-rose-700 text-sm leading-relaxed">
                Deseja concluir o check-out agora? <br />
                Esta ação emitirá a nota fiscal, registrará o pagamento de{' '}
                <strong>R$ {values.total.toFixed(2)}</strong> e liberará o quarto{' '}
                <strong>{form.quarto}</strong> para a equipe de limpeza.
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
          onClick={nextStep}
          disabled={step === 1 && !form.quarto}
          className="bg-slate-800 hover:bg-slate-900 text-white shadow-sm"
        >
          {step === 4 ? 'Concluir Check-out' : 'Avançar Passo'}
        </Button>
      </CardFooter>
    </Card>
  )
}
