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
import { Checkbox } from '@/components/ui/checkbox'
import { PBReservation, getReservations, updateReservation } from '@/services/reservations'
import { updateRoom } from '@/services/rooms'
import { toast } from '@/components/ui/use-toast'
import { FileUp, ShieldCheck } from 'lucide-react'

export function CheckIn() {
  const [step, setStep] = useState(1)
  const [reservations, setReservations] = useState<PBReservation[]>([])
  const [selectedResId, setSelectedResId] = useState('')
  const [extras, setExtras] = useState<string[]>([])
  const [signature, setSignature] = useState(false)

  useEffect(() => {
    getReservations().then((res) => setReservations(res.filter((r) => r.status === 'previsto')))
  }, [])

  const selectedRes = reservations.find((r) => r.id === selectedResId)

  const toggleExtra = (ext: string) => {
    setExtras((p) => (p.includes(ext) ? p.filter((e) => e !== ext) : [...p, ext]))
  }

  const handleFinish = async () => {
    if (!signature) return toast({ title: 'Assinatura obrigatória', variant: 'destructive' })
    if (!selectedRes) return
    try {
      await updateReservation(selectedResId, { status: 'in_house' })
      if (selectedRes.room_id) {
        await updateRoom(selectedRes.room_id, { status: 'occupied' })
      }
      toast({ title: 'Check-in concluído com sucesso' })
      setStep(5)
    } catch (e) {
      toast({ title: 'Erro ao fazer check-in', variant: 'destructive' })
    }
  }

  return (
    <Card className="max-w-2xl mx-auto shadow-sm animate-fade-in">
      <CardHeader>
        <CardTitle>Módulo de Check-in Guiado</CardTitle>
        <CardDescription>Passo {step} de 4</CardDescription>
      </CardHeader>
      <CardContent className="min-h-[300px]">
        {step === 1 && (
          <div className="space-y-4">
            <Label>Selecione a Reserva</Label>
            <Select value={selectedResId} onValueChange={setSelectedResId}>
              <SelectTrigger>
                <SelectValue placeholder="Busque pelo hóspede..." />
              </SelectTrigger>
              <SelectContent>
                {reservations.map((r) => (
                  <SelectItem key={r.id} value={r.id}>
                    {r.guest_name} - Q.{r.expand?.room_id?.room_number}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {selectedRes && (
              <div className="bg-slate-50 p-4 rounded-md text-sm space-y-2 mt-4 border border-slate-100">
                <p>
                  <strong>Nome:</strong> {selectedRes.guest_name}
                </p>
                <p>
                  <strong>Quarto:</strong> {selectedRes.expand?.room_id?.room_number}
                </p>
                <p>
                  <strong>Período:</strong> {selectedRes.check_in} a {selectedRes.check_out}
                </p>
              </div>
            )}
          </div>
        )}
        {step === 2 && (
          <div className="space-y-4">
            <h3 className="font-semibold">Digitalização de Documentos</h3>
            <div className="border-2 border-dashed border-slate-300 p-8 rounded-md flex flex-col items-center justify-center text-slate-500 bg-slate-50">
              <FileUp className="w-8 h-8 mb-2" />
              <p>Clique ou arraste o documento (Passaporte/ID)</p>
              <Button variant="outline" className="mt-4" size="sm">
                Upload de Arquivo
              </Button>
            </div>
            <div className="flex items-center space-x-2 mt-4">
              <Checkbox id="doc_valid" />
              <Label htmlFor="doc_valid">
                Confirmo que os dados da reserva correspondem ao documento de identificação
              </Label>
            </div>
          </div>
        )}
        {step === 3 && (
          <div className="space-y-4">
            <h3 className="font-semibold">Garantia e Upsell</h3>
            <div className="bg-blue-50 p-4 rounded-md mb-4 border border-blue-100 flex justify-between items-center">
              <div>
                <p className="text-sm font-medium text-blue-900">Pré-autorização Pendente</p>
                <p className="text-2xl font-bold text-blue-700">R$ 500,00</p>
              </div>
              <Button size="sm" className="bg-blue-600 hover:bg-blue-700 text-white">
                Processar Cartão
              </Button>
            </div>
            <Label className="mb-2 block mt-6">Oferecer Serviços Extras (Upsell)</Label>
            <div className="grid grid-cols-2 gap-2">
              {['Upgrade de Quarto', 'Late Checkout', 'Pequeno-almoço Extra', 'Acesso ao Spa'].map(
                (ext) => (
                  <div
                    key={ext}
                    className="flex items-center space-x-2 p-3 border border-slate-200 rounded-md hover:bg-slate-50 cursor-pointer"
                  >
                    <Checkbox
                      id={ext}
                      checked={extras.includes(ext)}
                      onCheckedChange={() => toggleExtra(ext)}
                    />
                    <Label htmlFor={ext} className="cursor-pointer">
                      {ext}
                    </Label>
                  </div>
                ),
              )}
            </div>
          </div>
        )}
        {step === 4 && (
          <div className="space-y-4 text-center py-6">
            <ShieldCheck className="w-12 h-12 text-emerald-500 mx-auto mb-4" />
            <h3 className="font-semibold text-lg">Finalização de Check-in</h3>
            <p className="text-sm text-slate-500">
              Confirme o registro no PMS e capture a assinatura do hóspede para os termos de uso.
            </p>
            <div className="max-w-sm mx-auto p-4 bg-slate-50 border-2 border-dashed border-emerald-200 rounded-md mt-6">
              <div className="flex items-center space-x-3 justify-center">
                <Checkbox
                  id="sig"
                  checked={signature}
                  onCheckedChange={(c) => setSignature(!!c)}
                  className="w-5 h-5 data-[state=checked]:bg-emerald-600 data-[state=checked]:border-emerald-600"
                />
                <Label htmlFor="sig" className="font-medium text-base cursor-pointer">
                  Assinatura Digital Capturada
                </Label>
              </div>
            </div>
          </div>
        )}
        {step === 5 && (
          <div className="text-center py-10 space-y-4">
            <h3 className="text-2xl font-bold text-emerald-600">Check-in Finalizado!</h3>
            <p className="text-slate-500">
              Voucher enviado. O quarto já consta como ocupado no sistema.
            </p>
            <Button
              variant="outline"
              onClick={() => {
                setStep(1)
                setSelectedResId('')
                setSignature(false)
              }}
            >
              Novo Check-in
            </Button>
          </div>
        )}
      </CardContent>
      <CardFooter className="flex justify-between border-t pt-4 bg-slate-50/50">
        {step > 1 && step < 5 && (
          <Button variant="outline" onClick={() => setStep((s) => s - 1)}>
            Voltar
          </Button>
        )}
        {step < 4 && (
          <Button
            className="ml-auto"
            onClick={() => setStep((s) => s + 1)}
            disabled={step === 1 && !selectedResId}
          >
            Avançar
          </Button>
        )}
        {step === 4 && (
          <Button
            className="ml-auto bg-emerald-600 hover:bg-emerald-700 text-white"
            onClick={handleFinish}
          >
            Confirmar Check-in
          </Button>
        )}
      </CardFooter>
    </Card>
  )
}
