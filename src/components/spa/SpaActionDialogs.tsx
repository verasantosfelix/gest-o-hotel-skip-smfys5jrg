import { useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { AlertTriangle, CheckCircle } from 'lucide-react'
import { SpaAppointment } from '@/services/spa'

interface Props {
  actionType: 'checkin' | 'checkout' | null
  appt: SpaAppointment | null
  onClose: () => void
  onConfirm: (action: string, payload?: any) => Promise<void>
}

export function SpaActionDialog({ actionType, appt, onClose, onConfirm }: Props) {
  const [extraItems, setExtraItems] = useState('')

  if (!appt || !actionType) return null

  const isCheckin = actionType === 'checkin'

  return (
    <Dialog open={!!actionType} onOpenChange={(o) => !o && onClose()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{isCheckin ? 'Check-in SPA' : 'Check-out SPA'}</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="p-4 bg-slate-50 border rounded-lg">
            <p className="font-bold text-slate-800">{appt.guest_name}</p>
            <p className="text-sm text-slate-500">Serviço: {appt.expand?.service_id?.name}</p>
          </div>

          {isCheckin && appt.contraindications && (
            <div className="p-4 bg-rose-100 border border-rose-300 rounded-lg flex gap-3">
              <AlertTriangle className="w-5 h-5 text-rose-700 mt-0.5" />
              <div>
                <p className="font-bold text-rose-800">Atenção: Contraindicações</p>
                <p className="text-sm text-rose-700 mt-1">{appt.contraindications}</p>
              </div>
            </div>
          )}

          {!isCheckin && (
            <div className="space-y-4">
              <div className="flex justify-between items-center text-lg font-bold">
                <span>Valor do Serviço:</span>
                <span>R$ {appt.expand?.service_id?.price?.toFixed(2)}</span>
              </div>
              <div className="space-y-2">
                <Label>Consumos Extras (Opcional)</Label>
                <Input
                  placeholder="Ex: 1x Água Mineral"
                  value={extraItems}
                  onChange={(e) => setExtraItems(e.target.value)}
                />
              </div>
              {appt.hotel_reservation_id && (
                <p className="text-sm text-emerald-600 flex items-center gap-2">
                  <CheckCircle className="w-4 h-4" />
                  Será lançado na conta do Quarto{' '}
                  {appt.expand?.hotel_reservation_id?.expand?.room_id?.room_number}
                </p>
              )}
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancelar
          </Button>
          <Button onClick={() => onConfirm(actionType, { extraItems })}>
            {isCheckin ? 'Confirmar e Iniciar (DND)' : 'Finalizar e Lançar'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
