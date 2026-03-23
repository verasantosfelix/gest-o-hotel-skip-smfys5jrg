import { useState, useRef } from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { SignaturePad, SignaturePadRef } from '@/components/ui/signature-pad'
import { FileUp, Eraser } from 'lucide-react'
import { PBReservation, updateReservation } from '@/services/reservations'
import { updateRoom } from '@/services/rooms'
import { toast } from '@/components/ui/use-toast'

export function DigitalCheckInDialog({
  open,
  onOpenChange,
  reservation,
}: {
  open: boolean
  onOpenChange: (o: boolean) => void
  reservation: PBReservation | null
}) {
  const [docFile, setDocFile] = useState<File | null>(null)
  const sigRef = useRef<SignaturePadRef>(null)
  const [loading, setLoading] = useState(false)

  const handleConfirm = async () => {
    if (!reservation) return
    if (sigRef.current?.isEmpty()) {
      toast({ title: 'Assinatura obrigatória', variant: 'destructive' })
      return
    }

    setLoading(true)
    try {
      const fd = new FormData()
      fd.append('status', 'in_house')

      const sigData = sigRef.current?.toDataURL()
      if (sigData) {
        const res = await fetch(sigData)
        const blob = await res.blob()
        fd.append('signature_file', blob, `sig_${reservation.id}.png`)
      }

      if (docFile) {
        fd.append('document_digitalization', docFile)
      }

      await updateReservation(reservation.id, fd)
      if (reservation.room_id) {
        await updateRoom(reservation.room_id, { status: 'occupied' })
      }

      toast({ title: 'Check-in realizado com sucesso!' })
      onOpenChange(false)
    } catch (e) {
      toast({ title: 'Erro no check-in', variant: 'destructive' })
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Check-in Digital - {reservation?.guest_name}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="border-2 border-dashed border-slate-300 bg-slate-50 rounded-md p-6 flex flex-col items-center">
            <FileUp className="w-8 h-8 text-slate-400 mb-2" />
            <span className="text-sm font-medium text-slate-700">
              Digitalização do Documento (ID/Passaporte)
            </span>
            <input
              type="file"
              className="text-xs mt-3 text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-xs file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
              onChange={(e) => setDocFile(e.target.files?.[0] || null)}
            />
          </div>

          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium text-slate-700">Assinatura do Hóspede</span>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => sigRef.current?.clear()}
                className="h-6 text-xs text-slate-500 hover:text-slate-800"
              >
                <Eraser className="w-3 h-3 mr-1" /> Limpar
              </Button>
            </div>
            <SignaturePad ref={sigRef} className="w-full h-[150px] shadow-sm" />
          </div>
        </div>
        <DialogFooter>
          <Button
            onClick={handleConfirm}
            disabled={loading}
            className="bg-emerald-600 hover:bg-emerald-700 text-white w-full sm:w-auto"
          >
            {loading ? 'Processando...' : 'Confirmar Check-in'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
