import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import { SpaAppointment } from '@/services/spa'

interface Props {
  open: boolean
  onOpenChange: (o: boolean) => void
  initialData?: SpaAppointment | null
  services: any[]
  rooms: any[]
  therapists: any[]
  reservations: any[]
  onSubmit: (data: any) => Promise<void>
}

export function SpaAppointmentForm({
  open,
  onOpenChange,
  initialData,
  services,
  rooms,
  therapists,
  reservations,
  onSubmit,
}: Props) {
  const [form, setForm] = useState({
    guest_name: initialData?.guest_name || '',
    hotel_reservation_id: initialData?.hotel_reservation_id || '',
    service_id: initialData?.service_id || '',
    spa_room_id: initialData?.spa_room_id || '',
    therapist_id: initialData?.therapist_id || '',
    start_time: initialData?.start_time || new Date().toISOString().slice(0, 16),
    end_time: initialData?.end_time || '',
    contraindications: initialData?.contraindications || '',
    notes: initialData?.notes || '',
    status: initialData?.status || 'scheduled',
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    // Auto calc end time based on service duration if empty
    let finalEnd = form.end_time
    if (!finalEnd && form.service_id && form.start_time) {
      const svc = services.find((s) => s.id === form.service_id)
      if (svc) {
        const d = new Date(form.start_time)
        d.setMinutes(d.getMinutes() + svc.duration_minutes)
        finalEnd = d.toISOString().slice(0, 16)
      }
    }
    await onSubmit({ ...form, end_time: finalEnd || form.start_time })
  }

  const handleGuestChange = (resId: string) => {
    const res = reservations.find((r) => r.id === resId)
    setForm({ ...form, hotel_reservation_id: resId, guest_name: res ? res.guest_name : '' })
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{initialData ? 'Editar Agendamento' : 'Novo Agendamento SPA'}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 pt-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Hóspede (Reserva Hotel)</Label>
              <Select value={form.hotel_reservation_id} onValueChange={handleGuestChange}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione..." />
                </SelectTrigger>
                <SelectContent>
                  {reservations.map((r) => (
                    <SelectItem key={r.id} value={r.id}>
                      {r.guest_name} (Q. {r.expand?.room_id?.room_number || 'N/A'})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Nome (Avulso)</Label>
              <Input
                value={form.guest_name}
                onChange={(e) => setForm({ ...form, guest_name: e.target.value })}
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Serviço</Label>
              <Select
                value={form.service_id}
                onValueChange={(v) => setForm({ ...form, service_id: v })}
                required
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione..." />
                </SelectTrigger>
                <SelectContent>
                  {services.map((s) => (
                    <SelectItem key={s.id} value={s.id}>
                      {s.name} ({s.duration_minutes}m)
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Sala SPA</Label>
              <Select
                value={form.spa_room_id}
                onValueChange={(v) => setForm({ ...form, spa_room_id: v })}
                required
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione..." />
                </SelectTrigger>
                <SelectContent>
                  {rooms.map((r) => (
                    <SelectItem key={r.id} value={r.id}>
                      {r.name} - {r.status}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Terapeuta</Label>
              <Select
                value={form.therapist_id}
                onValueChange={(v) => setForm({ ...form, therapist_id: v })}
                required
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione..." />
                </SelectTrigger>
                <SelectContent>
                  {therapists.map((t) => (
                    <SelectItem key={t.id} value={t.id}>
                      {t.name || t.email}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Início</Label>
              <Input
                type="datetime-local"
                value={form.start_time}
                onChange={(e) => setForm({ ...form, start_time: e.target.value })}
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label className="text-rose-600 font-bold">Contraindicações / Alergias</Label>
            <Textarea
              value={form.contraindications}
              onChange={(e) => setForm({ ...form, contraindications: e.target.value })}
              placeholder="Ex: Alergia a amendoim, hipertensão..."
              className="border-rose-200"
            />
          </div>
          <div className="space-y-2">
            <Label>Observações</Label>
            <Textarea
              value={form.notes}
              onChange={(e) => setForm({ ...form, notes: e.target.value })}
            />
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button type="submit">Salvar Agendamento</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
