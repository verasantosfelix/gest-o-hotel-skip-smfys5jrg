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
import { Checkbox } from '@/components/ui/checkbox'
import { CheckCircle } from 'lucide-react'
import useReservationStore from '@/stores/useReservationStore'

export function CheckIn() {
  const { addReservation, updateReservationStatus, reservations } = useReservationStore()
  const [step, setStep] = useState(1)
  const [form, setForm] = useState({
    reserva_id: '',
    nome: '',
    documento: '',
    adicionais: [] as string[],
  })
  const [error, setError] = useState('')
  const [assignedRoom, setAssignedRoom] = useState('')

  const toggleAdicional = (item: string) => {
    setForm((prev) => ({
      ...prev,
      adicionais: prev.adicionais.includes(item)
        ? prev.adicionais.filter((i) => i !== item)
        : [...prev.adicionais, item],
    }))
  }

  const nextStep = () => {
    if (step === 1) {
      if (!form.reserva_id) {
        setError('<erro>Informe o ID da reserva (Ex: 12345).</erro>')
        return
      }
      setError('')
      setStep((s) => s + 1)
    } else if (step === 2) {
      setStep((s) => s + 1)
    } else if (step === 3) {
      const existing = reservations.find((r) => r.id === form.reserva_id)
      const roomNumber = String(Math.floor(Math.random() * 100) + 200)

      if (existing) {
        updateReservationStatus(form.reserva_id, 'checked-in', roomNumber)
      } else {
        addReservation({
          id: form.reserva_id,
          guestName: form.nome || 'Hóspede',
          room: roomNumber,
          status: 'checked-in',
        })
      }

      setAssignedRoom(roomNumber)
      setStep(4)
    }
  }

  if (step === 4) {
    return (
      <Card className="border-emerald-500/20 bg-emerald-50 shadow-sm animate-fade-in-up">
        <CardHeader>
          <CardTitle className="text-emerald-700 font-display">Check-in Realizado</CardTitle>
        </CardHeader>
        <CardContent>
          <pre className="bg-slate-900 text-emerald-400 p-4 rounded-md font-mono text-sm overflow-x-auto shadow-inner">
            {`<OUTPUT>
  <quarto>${assignedRoom}</quarto>
  <horarios>${new Date().toLocaleTimeString()}</horarios>
  <itens_contratados>${form.adicionais.length ? form.adicionais.join(', ') : 'Nenhum'}</itens_contratados>
  <status>Check-in realizado</status>
</OUTPUT>`}
          </pre>
        </CardContent>
        <CardFooter>
          <Button
            onClick={() => {
              setStep(1)
              setForm({ reserva_id: '', nome: '', documento: '', adicionais: [] })
            }}
            className="bg-emerald-600 hover:bg-emerald-700 text-white"
          >
            Novo Check-in
          </Button>
        </CardFooter>
      </Card>
    )
  }

  return (
    <Card className="border-slate-200 shadow-sm max-w-2xl animate-fade-in-up">
      <CardHeader>
        <CardTitle className="text-slate-800 font-display">Check-in de Hóspede</CardTitle>
        <CardDescription>Passo {step} de 3 - Validação e registro de entrada</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4 min-h-[250px]">
        {step === 1 && (
          <div className="space-y-4 animate-fade-in">
            <div className="space-y-2">
              <Label className="text-slate-700">
                ID da Reserva <span className="text-slate-400 font-normal">(Ex: 12345)</span>
              </Label>
              <Input
                className="border-slate-300 focus-visible:ring-slate-500"
                value={form.reserva_id}
                onChange={(e) => setForm({ ...form, reserva_id: e.target.value })}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-slate-700">Nome Completo</Label>
                <Input
                  className="border-slate-300 focus-visible:ring-slate-500"
                  value={form.nome}
                  onChange={(e) => setForm({ ...form, nome: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label className="text-slate-700">Documento (CPF/Passaporte)</Label>
                <Input
                  className="border-slate-300 focus-visible:ring-slate-500"
                  value={form.documento}
                  onChange={(e) => setForm({ ...form, documento: e.target.value })}
                />
              </div>
            </div>
            {error && (
              <pre className="text-rose-600 bg-rose-50 p-3 rounded-md text-sm whitespace-pre-wrap font-mono border border-rose-200 shadow-sm animate-fade-in">
                {error}
              </pre>
            )}
          </div>
        )}

        {step === 2 && (
          <div className="space-y-4 animate-fade-in">
            <h3 className="font-medium text-slate-800">Adicionais Oferecidos</h3>
            <div className="grid gap-3">
              {[
                'Café da Manhã Premium',
                'Estacionamento Valet',
                'Acesso ao Spa',
                'Late Check-out',
              ].map((item) => (
                <div
                  key={item}
                  className="flex items-center space-x-3 p-3 rounded-lg border border-slate-200 hover:bg-slate-50 transition-colors"
                >
                  <Checkbox
                    id={item}
                    checked={form.adicionais.includes(item)}
                    onCheckedChange={() => toggleAdicional(item)}
                    className="data-[state=checked]:bg-slate-800 data-[state=checked]:border-slate-800"
                  />
                  <Label
                    htmlFor={item}
                    className="cursor-pointer flex-1 font-medium text-slate-700"
                  >
                    {item}
                  </Label>
                </div>
              ))}
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="space-y-4 animate-fade-in">
            <div className="bg-slate-50 p-5 rounded-lg border border-slate-200 shadow-sm">
              <h3 className="font-semibold text-slate-800 mb-4 flex items-center gap-2">
                <span className="bg-emerald-100 text-emerald-800 p-1 rounded-full">
                  <CheckCircle className="w-4 h-4" />
                </span>
                Confirmação Final
              </h3>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between border-b border-slate-200 pb-2">
                  <span className="text-slate-500">Reserva:</span>
                  <span className="font-medium text-slate-900">{form.reserva_id}</span>
                </div>
                <div className="flex justify-between border-b border-slate-200 pb-2">
                  <span className="text-slate-500">Hóspede:</span>
                  <span className="font-medium text-slate-900">
                    {form.nome || 'Hóspede'} ({form.documento || 'Não informado'})
                  </span>
                </div>
                <div className="flex justify-between pb-2">
                  <span className="text-slate-500">Adicionais:</span>
                  <span className="font-medium text-slate-900 text-right">
                    {form.adicionais.length ? form.adicionais.join(', ') : 'Nenhum'}
                  </span>
                </div>
              </div>
            </div>
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
        <Button onClick={nextStep} className="bg-slate-800 hover:bg-slate-900 text-white shadow-sm">
          {step === 3 ? 'Confirmar Entrada' : 'Avançar Passo'}
        </Button>
      </CardFooter>
    </Card>
  )
}
