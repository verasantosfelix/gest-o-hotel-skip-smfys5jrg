import { useState, useEffect, useRef } from 'react'
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
import { PBReservation, getReservations, updateReservation } from '@/services/reservations'
import { updateRoom } from '@/services/rooms'
import { getConsolidatedReport, ConsolidatedData } from '@/services/guest_consumptions'
import { createFinancialDoc } from '@/services/financial'
import { toast } from '@/components/ui/use-toast'
import { formatCurrency } from '@/lib/utils'
import { Banknote, Building2, Eraser, PenTool } from 'lucide-react'
import { SignaturePad, type SignaturePadRef } from '@/components/ui/signature-pad'
import { ScrollArea } from '@/components/ui/scroll-area'

export function CheckOut() {
  const [step, setStep] = useState(1)
  const [reservations, setReservations] = useState<PBReservation[]>([])
  const [selectedResId, setSelectedResId] = useState('')
  const [reportData, setReportData] = useState<ConsolidatedData | null>(null)
  const sigPadRef = useRef<SignaturePadRef>(null)

  useEffect(() => {
    getReservations().then((res) => setReservations(res.filter((r) => r.status === 'in_house')))
  }, [])

  const selectedRes = reservations.find((r) => r.id === selectedResId)

  let totalExtras = 0
  const itemsList: { desc: string; amount: number; type: string }[] = []

  if (reportData) {
    reportData.fb.forEach((o) => {
      totalExtras += o.total_amount
      itemsList.push({
        desc: `F&B - Pedido #${o.id.slice(0, 4)}`,
        amount: o.total_amount,
        type: 'fb',
      })
    })
    reportData.cons.forEach((c) => {
      totalExtras += c.amount
      itemsList.push({ desc: c.description || c.type, amount: c.amount, type: 'minibar' })
    })
    reportData.spa.forEach((s) => {
      const price = s.expand?.service_id?.price || 0
      totalExtras += price
      itemsList.push({
        desc: `SPA - ${s.expand?.service_id?.name || 'Serviço'}`,
        amount: price,
        type: 'spa',
      })
    })
  }

  const totalGeral = 12000 + totalExtras // 12000 fixed daily rate mock

  const handleNext = async () => {
    if (step === 1) {
      if (!selectedResId || !selectedRes) return
      const report = await getConsolidatedReport(
        selectedResId,
        selectedRes.room_id || '',
        selectedRes.expand?.room_id?.room_number || '',
      )
      setReportData(report)
      setStep(2)
    } else if (step === 2) {
      setStep(3)
    } else if (step === 3) {
      if (!selectedRes) return

      try {
        let formData: FormData | Partial<PBReservation> = { status: 'checked_out' }

        if (selectedRes.is_corporate) {
          if (sigPadRef.current?.isEmpty()) {
            toast({
              title: 'Assinatura obrigatória',
              description: 'Por favor, assine o termo de reconhecimento.',
              variant: 'destructive',
            })
            return
          }

          const dataUrl = sigPadRef.current?.toDataURL()
          if (dataUrl) {
            const res = await fetch(dataUrl)
            const blob = await res.blob()
            const fd = new FormData()
            fd.append('status', 'checked_out')
            fd.append('signature_file', blob, `signature_${selectedRes.id}.png`)
            formData = fd
          }

          // Create A/R Financial Document for Corporate
          await createFinancialDoc({
            doc_type: 'Invoice/Acknowledgment',
            category: 'A/R',
            status: 'pending_transfer',
            amount: totalGeral,
            entity_name: selectedRes.guest_name,
            currency: 'AOA',
          })
        }

        await updateReservation(selectedResId, formData)

        if (selectedRes.room_id) {
          await updateRoom(selectedRes.room_id, { status: 'sujo' })
        }

        toast({ title: 'Check-out processado com sucesso.' })
        setStep(4)
      } catch (e) {
        toast({ title: 'Erro ao processar check-out', variant: 'destructive' })
      }
    }
  }

  return (
    <Card className="max-w-2xl mx-auto shadow-sm animate-fade-in">
      <CardHeader>
        <CardTitle>Módulo de Check-out Guiado</CardTitle>
        <CardDescription>Consolidação de faturas e liberação de quartos.</CardDescription>
      </CardHeader>
      <CardContent className="min-h-[350px]">
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
                    {r.guest_name} - Quarto {r.expand?.room_id?.room_number}{' '}
                    {r.is_corporate ? '(Corp)' : ''}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="font-semibold text-slate-800">
                Verificação Consolidada (Apenas Leitura)
              </h3>
              {selectedRes?.is_corporate && (
                <div className="inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold bg-blue-100 text-blue-800 border-transparent shadow-sm">
                  <Building2 className="w-3 h-3 mr-1" /> Faturamento Corporativo
                </div>
              )}
            </div>

            {itemsList.length === 0 ? (
              <p className="text-sm text-slate-500 bg-slate-50 p-4 rounded text-center border border-slate-100">
                Nenhum consumo extra registrado para esta reserva.
              </p>
            ) : (
              <ScrollArea className="h-48 border border-slate-200 rounded-md p-3">
                <div className="space-y-2 pr-3">
                  {itemsList.map((c, i) => (
                    <div
                      key={i}
                      className="flex justify-between text-sm py-2 border-b border-slate-100 last:border-0"
                    >
                      <span className="font-medium text-slate-700 capitalize">{c.desc}</span>
                      <span className="font-mono text-slate-900">
                        {formatCurrency(c.amount, 'AOA')}
                      </span>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            )}

            <div className="bg-slate-100 p-3 rounded-md flex justify-between font-bold mt-4 border border-slate-200">
              <span className="text-slate-700">Total de Extras:</span>
              <span className="text-slate-900">{formatCurrency(totalExtras, 'AOA')}</span>
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="space-y-4">
            <h3 className="font-semibold text-slate-800">
              {selectedRes?.is_corporate ? 'Reconhecimento Corporativo' : 'Faturamento e Pagamento'}
            </h3>
            <div className="bg-emerald-50 p-5 rounded-md border border-emerald-200 space-y-3">
              <div className="flex justify-between text-sm text-emerald-800">
                <span>Diárias (Fixo Mock):</span>
                <span className="font-mono">{formatCurrency(12000, 'AOA')}</span>
              </div>
              <div className="flex justify-between text-sm text-emerald-800">
                <span>Consumos Extras:</span>
                <span className="font-mono">{formatCurrency(totalExtras, 'AOA')}</span>
              </div>
              <div className="flex justify-between font-bold text-xl pt-3 border-t border-emerald-200 text-emerald-900">
                <span>Total Consolidado:</span>
                <span className="font-mono">{formatCurrency(totalGeral, 'AOA')}</span>
              </div>
            </div>

            {selectedRes?.is_corporate ? (
              <div className="space-y-3 pt-4 animate-fade-in">
                <div className="flex justify-between items-center px-1">
                  <Label className="text-sm font-semibold text-slate-800 flex items-center gap-2">
                    <PenTool className="w-4 h-4 text-blue-600" /> Assinatura do Hóspede
                  </Label>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => sigPadRef.current?.clear()}
                    className="h-7 text-xs text-slate-500"
                  >
                    <Eraser className="w-3 h-3 mr-1" /> Limpar
                  </Button>
                </div>
                <p className="text-xs text-slate-500 px-1">
                  Reconheço a dívida no valor total de{' '}
                  <strong>{formatCurrency(totalGeral, 'AOA')}</strong> a ser faturada para a conta
                  corporativa.
                </p>
                <div className="flex justify-center bg-slate-50 p-2 rounded-lg border border-slate-200">
                  <SignaturePad ref={sigPadRef} className="w-full max-w-[400px] h-[150px]" />
                </div>
                <div className="pt-2 flex justify-center">
                  <Button
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white gap-2 h-12 text-base"
                    onClick={handleNext}
                  >
                    <Building2 className="w-5 h-5" /> Confirmar e Assinar (A/R)
                  </Button>
                </div>
              </div>
            ) : (
              <div className="pt-4 flex justify-center border-t border-slate-100">
                <Button
                  className="w-full bg-slate-900 text-white gap-2 h-12 text-base hover:bg-slate-800"
                  onClick={handleNext}
                >
                  <Banknote className="w-5 h-5" /> Processar Pagamento & Liberar
                </Button>
              </div>
            )}
          </div>
        )}

        {step === 4 && (
          <div className="text-center py-10 space-y-4 animate-fade-in-up">
            <h3 className="text-2xl font-bold text-emerald-600">Check-out Finalizado!</h3>
            <p className="text-slate-500">
              O quarto foi marcado como "Sujo" e a equipe de Governança foi notificada.
            </p>
            {selectedRes?.is_corporate && (
              <p className="text-sm text-blue-600 bg-blue-50 p-2 rounded inline-block">
                Fatura Corporativa gerada em A Receber (A/R).
              </p>
            )}
            <div className="pt-4">
              <Button
                variant="outline"
                onClick={() => {
                  setStep(1)
                  setSelectedResId('')
                  setReportData(null)
                }}
              >
                Novo Check-out
              </Button>
            </div>
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
          <Button
            className="ml-auto bg-slate-900 text-white"
            onClick={handleNext}
            disabled={step === 1 && !selectedResId}
          >
            Avançar para {step === 1 ? 'Resumo' : 'Pagamento'}
          </Button>
        )}
      </CardFooter>
    </Card>
  )
}
