import { useState, useEffect } from 'react'
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
import { AlertTriangle, MessageCircle } from 'lucide-react'
import { SpaAppointment } from '@/services/spa'

interface Props {
  open: boolean
  onOpenChange: (o: boolean) => void
  initialData?: SpaAppointment | null
  services: any[]
  rooms: any[]
  therapists: any[]
  reservations: any[]
  appointments: SpaAppointment[]
  blockouts: any[]
  isFrontDesk: boolean
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
  appointments,
  blockouts,
  isFrontDesk,
  onSubmit,
}: Props) {
  const [form, setForm] = useState({
    guest_name: initialData?.guest_name || '',
    guest_phone: initialData?.guest_phone || '',
    hotel_reservation_id: initialData?.hotel_reservation_id || '',
    service_id: initialData?.service_id || '',
    spa_room_id: initialData?.spa_room_id || '',
    therapist_id: initialData?.therapist_id || '',
    start_time: initialData?.start_time || new Date().toISOString().slice(0, 16),
    end_time: initialData?.end_time || '',
    preparation_time_buffer: initialData?.preparation_time_buffer || 15,
    contraindications: initialData?.contraindications || '',
    notes: initialData?.notes || '',
    status: initialData?.status || 'scheduled',
  })

  const [isConflict, setIsConflict] = useState(false)

  // Recalculate conflict status when time, therapist or service changes
  useEffect(() => {
    if (!form.start_time || !form.therapist_id || !form.service_id) {
      setIsConflict(false)
      return
    }

    const start = new Date(form.start_time)
    const svc = services.find((s) => s.id === form.service_id)
    if (!svc) return

    const buffer = form.preparation_time_buffer || 0
    const end = new Date(start.getTime() + (svc.duration_minutes + buffer) * 60000)

    let conflict = false

    // 1. Check existing appointments overlap
    for (const a of appointments) {
      if (initialData && a.id === initialData.id) continue
      if (a.therapist_id !== form.therapist_id) continue
      if (['cancelled', 'completed'].includes(a.status)) continue

      const aStart = new Date(a.start_time)
      const aEnd = new Date(
        new Date(a.end_time).getTime() + (a.preparation_time_buffer || 0) * 60000,
      )

      if (Math.max(start.getTime(), aStart.getTime()) < Math.min(end.getTime(), aEnd.getTime())) {
        conflict = true
        break
      }
    }

    // 2. Check blockouts overlap
    if (!conflict && blockouts) {
      for (const b of blockouts) {
        if (b.user_id !== form.therapist_id) continue
        const bStart = new Date(b.start_date)
        const bEnd = new Date(b.end_date)

        if (Math.max(start.getTime(), bStart.getTime()) < Math.min(end.getTime(), bEnd.getTime())) {
          conflict = true
          break
        }
      }
    }

    setIsConflict(conflict)
  }, [
    form.start_time,
    form.therapist_id,
    form.service_id,
    form.preparation_time_buffer,
    appointments,
    blockouts,
    services,
    initialData,
  ])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    let finalEnd = form.end_time
    if (!finalEnd && form.service_id && form.start_time) {
      const svc = services.find((s) => s.id === form.service_id)
      if (svc) {
        const d = new Date(form.start_time)
        d.setMinutes(d.getMinutes() + svc.duration_minutes)
        finalEnd = d.toISOString().slice(0, 16)
      }
    }

    // Determine final status
    let finalStatus = form.status
    if (!initialData) {
      if (isConflict) {
        finalStatus = 'pending_approval'
      } else {
        finalStatus = 'scheduled'
      }
    }

    const payload = {
      ...form,
      end_time: finalEnd || form.start_time,
      status: finalStatus,
      spa_room_id: isFrontDesk ? '' : form.spa_room_id,
    }

    await onSubmit(payload)
  }

  const handleGuestChange = (resId: string) => {
    const res = reservations.find((r) => r.id === resId)
    setForm({ ...form, hotel_reservation_id: resId, guest_name: res ? res.guest_name : '' })
  }

  const handleWhatsApp = () => {
    const svc = services.find((s) => s.id === form.service_id)
    const svcName = svc ? svc.name : 'Serviço'
    let dateStr = form.start_time
    try {
      dateStr = new Date(form.start_time).toLocaleString('pt-PT', {
        dateStyle: 'short',
        timeStyle: 'short',
      })
    } catch (e) {}
    const msg = `Olá ${form.guest_name}, a sua reserva de ${svcName} no Complexo Agroturístico de Cacuso para o dia ${dateStr} foi confirmada! Vemo-nos em breve.`
    const cleanPhone = form.guest_phone.replace(/\D/g, '')
    const url = `https://wa.me/${cleanPhone}?text=${encodeURIComponent(msg)}`
    window.open(url, '_blank')
  }

  const availableRooms = rooms.filter((r) => r.status !== 'maintenance')

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{initialData ? 'Editar Agendamento' : 'Novo Agendamento SPA'}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 pt-4">
          {isConflict && !initialData && (
            <div className="p-3 bg-orange-50 border border-orange-200 rounded-md text-sm text-orange-800 flex gap-2 items-start animate-in fade-in slide-in-from-top-2">
              <AlertTriangle className="w-5 h-5 text-orange-600 shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold text-orange-900">Conflito de Agenda Detectado</p>
                <p className="mt-1">
                  O terapeuta selecionado já possui um agendamento ou bloqueio neste horário. Se
                  você prosseguir, a reserva será criada com status{' '}
                  <strong>Pendente de Aprovação</strong> para avaliação da gerência.
                </p>
              </div>
            </div>
          )}

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

          <div className="space-y-2">
            <Label>Telefone / WhatsApp</Label>
            <Input
              value={form.guest_phone}
              onChange={(e) => setForm({ ...form, guest_phone: e.target.value })}
              placeholder="Ex: 9XX XXX XXX"
            />
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

            {!isFrontDesk && (
              <div className="space-y-2">
                <Label>Sala SPA</Label>
                <Select
                  value={form.spa_room_id}
                  onValueChange={(v) => setForm({ ...form, spa_room_id: v })}
                  required={!isFrontDesk}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione..." />
                  </SelectTrigger>
                  <SelectContent>
                    {availableRooms.map((r) => (
                      <SelectItem key={r.id} value={r.id}>
                        {r.name} - {r.status}
                      </SelectItem>
                    ))}
                    {availableRooms.length === 0 && (
                      <SelectItem value="none" disabled>
                        Nenhuma sala livre
                      </SelectItem>
                    )}
                  </SelectContent>
                </Select>
              </div>
            )}
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

          {!isFrontDesk && initialData && (
            <div className="space-y-2">
              <Label>Status</Label>
              <Select value={form.status} onValueChange={(v) => setForm({ ...form, status: v })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="pending_approval">Pendente Aprovação</SelectItem>
                  <SelectItem value="scheduled">Agendado</SelectItem>
                  <SelectItem value="checked_in">Check-in Realizado</SelectItem>
                  <SelectItem value="in_progress">Em Andamento</SelectItem>
                  <SelectItem value="completed">Concluído</SelectItem>
                  <SelectItem value="cancelled">Cancelado</SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}

          {!isFrontDesk && (
            <div className="space-y-2">
              <Label>Buffer de Preparação (minutos)</Label>
              <Input
                type="number"
                value={form.preparation_time_buffer}
                onChange={(e) =>
                  setForm({ ...form, preparation_time_buffer: parseInt(e.target.value) || 0 })
                }
                placeholder="Ex: 15"
              />
            </div>
          )}

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
            <Label>Observações Internas</Label>
            <Textarea
              value={form.notes}
              onChange={(e) => setForm({ ...form, notes: e.target.value })}
            />
          </div>

          <DialogFooter className="flex justify-between items-center sm:justify-between w-full mt-4">
            <div>
              {form.status === 'scheduled' && form.guest_phone && (
                <Button
                  type="button"
                  variant="outline"
                  className="bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100"
                  onClick={handleWhatsApp}
                >
                  <MessageCircle className="w-4 h-4 mr-2" />
                  Enviar WhatsApp
                </Button>
              )}
            </div>
            <div className="flex gap-2">
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                Cancelar
              </Button>
              <Button type="submit">
                {isConflict && !initialData ? 'Salvar (Pendente)' : 'Salvar Agendamento'}
              </Button>
            </div>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
