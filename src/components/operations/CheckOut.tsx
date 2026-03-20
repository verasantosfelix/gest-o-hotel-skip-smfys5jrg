import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  PBReservation,
  PBConsumption,
  getReservations,
  getConsumptions,
  updateReservation,
} from '@/services/reservations'
import { updateRoom } from '@/services/rooms'
import { toast } from '@/components/ui/use-toast'
import { formatCurrency } from '@/lib/utils'
import { Banknote } from 'lucide-react'

export function CheckOut() {
  const [step, setStep] = useState(1)
  const [reservations, setReservations] = useState<PBReservation[]>([])
  const [selectedResId, setSelectedResId] = useState('')
  const [consumptions, setConsumptions] = useState<PBConsumption[]>([])

  useEffect(() => {
    getReservations().then((res) => setReservations(res.filter((r) => r.status === 'in_house')))
  }, [])

  const selectedRes = reservations.find((r) => r.id === selectedResId)

  const handleNext = async () => {
    if (step === 1) {
      if (!selectedResId) return
      const cons = await getConsumptions(selectedResId)
      setConsumptions(cons)
      setStep(2)
    } else if (step === 2) {
      setStep(3)
    } else if (step === 3) {
      if (!selectedRes) return
      try {
        await updateReservation(selectedResId, { status: 'checked_out' })
        if (selectedRes.room_id) {
          await updateRoom(selectedRes.room_id, { status: 'cleaning' })
        }
        toast({ title: 'Check-out processado com sucesso.' })
        setStep(4)
      } catch (e) {
        toast({ title: 'Erro ao processar check-out', variant: 'destructive' })
      }
    }
  }

  const totalConsumos = consumptions.reduce((a, b) => a + b.amount, 0)
  const totalGeral = 1200 + totalConsumos // mock de diárias fixo

  return (
    <Card className="max-w-2xl mx-auto shadow-sm animate-fade-in">
      <CardHeader>
        <CardTitle>Módulo de Check-out Guiado</CardTitle>
        <CardDescription>Consolidação de faturas e liberação de quartos.</CardDescription>
      </CardHeader>
      <CardContent className="min-h-[300px]">
        {step === 1 && (
          <div className="space-y-4">
            <Label>Selecione a Reserva (In-House)</Label>
            <Select value={selectedResId} onValueChange={setSelectedResId}>
              <SelectTrigger>
                <SelectValue placeholder="Busque pelo hóspede ou quarto..." />
              </SelectTrigger>
              <SelectContent>
                {reservations.map((r) => (
                  <SelectItem key={r.id} value={r.id}>
                    {r.guest_name} - Quarto {r.expand?.room_id?.room_number}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}
        {step === 2 && (
          <div className="space-y-4">
            <h3 className="font-semibold text-slate-800">Verificação de Consumos</h3>
            {consumptions.length === 0 ? (
              <p className="text-sm text-slate-500 bg-slate-50 p-4 rounded text-center border border-slate-100">
                Nenhum consumo extra registrado para esta reserva.
              </p>
            ) : (
              <div className="space-y-2 border border-slate-200 rounded-md p-3 max-h-48 overflow-y-auto">
                {consumptions.map((c) => (
                  <div
                    key={c.id}
                    className="flex justify-between text-sm py-2 border-b border-slate-100 last:border-0"
                  >
                    <span className="font-medium text-slate-700 capitalize">
                      {c.description || c.type}
                    </span>
                    <span className="font-mono text-slate-900">
                      {formatCurrency(c.amount, 'AOA')}
                    </span>
                  </div>
                ))}
              </div>
            )}
            <div className="bg-slate-100 p-3 rounded-md flex justify-between font-bold mt-4 border border-slate-200">
              <span className="text-slate-700">Total de Extras:</span>
              <span className="text-slate-900">{formatCurrency(totalConsumos, 'AOA')}</span>
            </div>
          </div>
        )}
        {step === 3 && (
          <div className="space-y-4">
            <h3 className="font-semibold text-slate-800">Faturamento e Pagamento</h3>
            <div className="bg-emerald-50 p-5 rounded-md border border-emerald-200 space-y-3">
              <div className="flex justify-between text-sm text-emerald-800">
                <span>Diárias (Fixo):</span>
                <span className="font-mono">{formatCurrency(1200, 'AOA')}</span>
              </div>
              <div className="flex justify-between text-sm text-emerald-800">
                <span>Consumos Extras:</span>
                <span className="font-mono">{formatCurrency(totalConsumos, 'AOA')}</span>
              </div>
              <div className="flex justify-between font-bold text-xl pt-3 border-t border-emerald-200 text-emerald-900">
                <span>Total a Pagar:</span>
                <span className="font-mono">{formatCurrency(totalGeral, 'AOA')}</span>
              </div>
            </div>
            <div className="pt-4 flex justify-center">
              <Button className="w-full bg-slate-900 text-white gap-2 h-12 text-base">
                <Banknote className="w-5 h-5" /> Processar Pagamento & Emitir Fatura
              </Button>
            </div>
          </div>
        )}
        {step === 4 && (
          <div className="text-center py-10 space-y-4">
            <h3 className="text-2xl font-bold text-emerald-600">Check-out Finalizado!</h3>
            <p className="text-slate-500">
              O quarto foi marcado como "Sujo" e a equipe de Governança foi notificada
              automaticamente.
            </p>
            <Button
              variant="outline"
              onClick={() => {
                setStep(1)
                setSelectedResId('')
              }}
            >
              Novo Check-out
            </Button>
          </div>
        )}
      </CardContent>
      <CardFooter className="flex justify-between border-t pt-4 bg-slate-50/50">
        {step > 1 && step < 4 && (
          <Button variant="outline" onClick={() => setStep((s) => s - 1)}>
            Voltar
          </Button>
        )}
        {step < 3 && (
          <Button className="ml-auto" onClick={handleNext} disabled={step === 1 && !selectedResId}>
            Avançar
          </Button>
        )}
        {step === 3 && (
          <Button className="ml-auto bg-rose-600 hover:bg-rose-700 text-white" onClick={handleNext}>
            Concluir e Liberar Quarto
          </Button>
        )}
      </CardFooter>
    </Card>
  )
}
