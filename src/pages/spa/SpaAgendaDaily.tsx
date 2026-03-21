import { useState, useEffect } from 'react'
import { CalendarHeart, Filter, Plus, Clock, User } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { useAccess } from '@/hooks/use-access'
import { RestrictedAccess } from '@/components/RestrictedAccess'
import { useRealtime } from '@/hooks/use-realtime'
import {
  getSpaAppointments,
  getUsers,
  getSpaRooms,
  getSpaServices,
  getActiveReservations,
  SpaAppointment,
} from '@/services/spa'
import { SpaAppointmentForm } from '@/components/spa/SpaAppointmentForm'
import { SpaActionDialog } from '@/components/spa/SpaActionDialogs'
import { updateSpaAppointment, updateSpaRoom } from '@/services/spa'
import { createConsumption } from '@/services/reservations'
import { toast } from '@/components/ui/use-toast'
import { format, parseISO, getHours, getMinutes, addMinutes, isSameDay } from 'date-fns'
import { cn } from '@/lib/utils'
import useAuthStore from '@/stores/useAuthStore'

export default function SpaAgendaDaily() {
  const { hasAccess } = useAccess()
  const { userRole } = useAuthStore()
  const isFrontDesk = userRole === 'Front_Desk'

  const [date, setDate] = useState<string>(format(new Date(), 'yyyy-MM-dd'))
  const [appointments, setAppointments] = useState<SpaAppointment[]>([])
  const [therapists, setTherapists] = useState<any[]>([])
  const [rooms, setRooms] = useState<any[]>([])
  const [services, setServices] = useState<any[]>([])
  const [reservations, setReservations] = useState<any[]>([])

  const [formOpen, setFormOpen] = useState(false)
  const [selectedAppt, setSelectedAppt] = useState<SpaAppointment | null>(null)
  const [actionType, setActionType] = useState<'checkin' | 'checkout' | null>(null)
  const [therapistFilter, setTherapistFilter] = useState('')

  const loadData = async () => {
    try {
      const [appts, r, s, t, res] = await Promise.all([
        getSpaAppointments(),
        getSpaRooms(),
        getSpaServices("status='published'"),
        getUsers(),
        getActiveReservations(),
      ])
      setAppointments(appts)
      setRooms(r)
      setServices(s)
      setTherapists(t)
      setReservations(res)
    } catch (e) {
      console.error(e)
    }
  }

  useEffect(() => {
    loadData()
  }, [])

  useRealtime('spa_appointments', loadData)
  useRealtime('spa_rooms', loadData)

  if (
    !hasAccess(
      ['Spa_Wellness', 'Rececao_FrontOffice', 'Direcao_Admin', 'Front_Desk'],
      'Agenda Diária',
    )
  ) {
    return (
      <RestrictedAccess
        requiredRoles={['Spa_Wellness', 'Rececao_FrontOffice', 'Direcao_Admin', 'Front_Desk']}
      />
    )
  }

  const handleFormSubmit = async (data: any) => {
    try {
      if (selectedAppt) {
        await updateSpaAppointment(selectedAppt.id, data)
        toast({ title: 'Agendamento atualizado!' })
      } else {
        await createSpaAppointment(data)
        toast({ title: 'Agendamento criado!' })
      }
      setFormOpen(false)
      setSelectedAppt(null)
    } catch (e) {
      toast({ title: 'Erro ao salvar', variant: 'destructive' })
    }
  }

  const handleActionConfirm = async (action: string, payload?: any) => {
    if (!selectedAppt) return
    try {
      if (action === 'checkin') {
        await updateSpaAppointment(selectedAppt.id, { status: 'in_progress' })
        await updateSpaRoom(selectedAppt.spa_room_id, { status: 'occupied' })
        toast({ title: 'Check-in realizado com sucesso.' })
      } else if (action === 'checkout') {
        await updateSpaAppointment(selectedAppt.id, { status: 'completed' })
        await updateSpaRoom(selectedAppt.spa_room_id, { status: 'cleaning' })
        if (selectedAppt.hotel_reservation_id) {
          const desc = payload?.extraItems
            ? `SPA: ${selectedAppt.expand?.service_id?.name} + ${payload.extraItems}`
            : `SPA: ${selectedAppt.expand?.service_id?.name}`
          await createConsumption({
            reservation_id: selectedAppt.hotel_reservation_id,
            type: 'spa',
            amount: selectedAppt.expand?.service_id?.price || 0,
            description: desc,
          })
          toast({ title: 'Lançado na conta do hóspede.' })
        } else {
          toast({ title: 'Checkout concluído (Cliente Avulso).' })
        }
      }
      setActionType(null)
      setSelectedAppt(null)
    } catch (e) {
      toast({ title: 'Erro na operação', variant: 'destructive' })
    }
  }

  const selectedDateObj = parseISO(date)
  const dayAppts = appointments.filter((a) => isSameDay(parseISO(a.start_time), selectedDateObj))
  const displayTherapists = therapists.filter(
    (t) => therapistFilter === '' || t.id === therapistFilter,
  )

  const hours = Array.from({ length: 13 }, (_, i) => i + 8) // 08:00 to 20:00

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'scheduled':
        return 'bg-blue-100 border-blue-300 text-blue-900'
      case 'checked_in':
        return 'bg-amber-100 border-amber-300 text-amber-900'
      case 'in_progress':
        return 'bg-indigo-100 border-indigo-400 text-indigo-900 animate-pulse'
      case 'completed':
        return 'bg-emerald-100 border-emerald-300 text-emerald-900'
      case 'cancelled':
        return 'bg-rose-100 border-rose-300 text-rose-900 opacity-50'
      default:
        return 'bg-slate-100 border-slate-300 text-slate-900'
    }
  }

  return (
    <div className="space-y-6 animate-fade-in pb-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-rose-100 rounded-lg shadow-sm border border-rose-200">
            <CalendarHeart className="w-6 h-6 text-rose-700" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-900">Agenda Diária SPA</h1>
            <p className="text-sm text-slate-500">Timeline de agendamentos por terapeuta</p>
          </div>
        </div>
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <Input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="w-auto"
          />
          <Button
            onClick={() => {
              setSelectedAppt(null)
              setFormOpen(true)
            }}
            className="gap-2"
          >
            <Plus className="w-4 h-4" /> Novo Agendamento
          </Button>
        </div>
      </div>

      <Card className="border-slate-200 shadow-sm overflow-hidden flex flex-col h-[700px]">
        <div className="bg-slate-50 border-b p-2 flex gap-4 overflow-x-auto">
          <div className="flex items-center gap-2 min-w-[200px]">
            <Filter className="w-4 h-4 text-slate-400" />
            <select
              className="text-sm bg-transparent outline-none w-full"
              value={therapistFilter}
              onChange={(e) => setTherapistFilter(e.target.value)}
            >
              <option value="">Todos os Terapeutas</option>
              {therapists.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.name || t.email}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="flex-1 overflow-auto relative bg-slate-50/50 flex">
          {/* Y-Axis: Time Labels */}
          <div className="w-16 shrink-0 border-r bg-white sticky left-0 z-10">
            {hours.map((h) => (
              <div
                key={h}
                className="h-[60px] border-b border-slate-100 text-xs text-slate-400 p-2 text-right relative"
              >
                <span className="absolute -top-2.5 right-2 bg-white px-1">
                  {String(h).padStart(2, '0')}:00
                </span>
              </div>
            ))}
          </div>

          {/* X-Axis: Therapist Columns */}
          <div className="flex-1 flex min-w-max">
            {displayTherapists.map((t) => {
              const tAppts = dayAppts.filter((a) => a.therapist_id === t.id)
              return (
                <div
                  key={t.id}
                  className="w-[280px] border-r border-slate-100 relative min-h-[780px]"
                >
                  <div className="h-10 bg-white border-b flex items-center justify-center font-semibold text-sm sticky top-0 z-10 shadow-sm">
                    <User className="w-3.5 h-3.5 mr-1 text-slate-400" />{' '}
                    {t.name || t.email.split('@')[0]}
                  </div>

                  {/* Grid Lines */}
                  {hours.map((h) => (
                    <div
                      key={h}
                      className="h-[60px] border-b border-slate-100/50 w-full absolute pointer-events-none"
                      style={{ top: `${(h - 8) * 60 + 40}px` }}
                    />
                  ))}

                  {/* Appointments */}
                  {tAppts.map((a) => {
                    const start = parseISO(a.start_time)
                    const end = parseISO(a.end_time)
                    const duration = (end.getTime() - start.getTime()) / 60000
                    const buffer = a.preparation_time_buffer || 15

                    let topOffset = (getHours(start) - 8) * 60 + getMinutes(start) + 40 // +40 for header
                    if (topOffset < 40) topOffset = 40

                    return (
                      <div
                        key={a.id}
                        className="absolute w-[95%] left-[2.5%] group"
                        style={{ top: `${topOffset}px`, height: `${duration}px` }}
                      >
                        <div
                          onClick={(e) => {
                            if (isFrontDesk) {
                              toast({
                                title: 'Acesso Restrito',
                                description:
                                  'Apenas leitura de detalhes permitida para Front Desk.',
                              })
                              e.stopPropagation()
                              return
                            }
                            setSelectedAppt(a)
                            setFormOpen(true)
                          }}
                          className={cn(
                            'w-full h-full rounded-md border p-2 text-xs cursor-pointer shadow-sm overflow-hidden hover:shadow-md transition-all',
                            getStatusColor(a.status),
                          )}
                        >
                          <div className="font-bold truncate">{a.guest_name}</div>
                          <div className="text-[10px] truncate opacity-80">
                            {a.expand?.service_id?.name}
                          </div>
                          <div className="flex items-center gap-1 mt-1 opacity-70">
                            <Clock className="w-3 h-3" /> {format(start, 'HH:mm')} -{' '}
                            {format(end, 'HH:mm')}
                          </div>
                        </div>
                        {buffer > 0 && (
                          <div
                            className="absolute w-full left-0 bg-stripes opacity-20 border border-slate-300 rounded-b-md"
                            style={{ top: `${duration}px`, height: `${buffer}px` }}
                            title="Tempo de Preparação"
                          />
                        )}
                        {/* Hover Actions */}
                        {!isFrontDesk && (
                          <div className="hidden group-hover:flex absolute top-1 right-1 gap-1">
                            {a.status === 'scheduled' && (
                              <Button
                                size="icon"
                                className="h-6 w-6"
                                onClick={(e) => {
                                  e.stopPropagation()
                                  setSelectedAppt(a)
                                  setActionType('checkin')
                                }}
                              >
                                C
                              </Button>
                            )}
                            {a.status === 'in_progress' && (
                              <Button
                                size="icon"
                                className="h-6 w-6"
                                onClick={(e) => {
                                  e.stopPropagation()
                                  setSelectedAppt(a)
                                  setActionType('checkout')
                                }}
                              >
                                F
                              </Button>
                            )}
                          </div>
                        )}
                      </div>
                    )
                  })}
                </div>
              )
            })}
          </div>
        </div>
      </Card>

      <SpaAppointmentForm
        open={formOpen}
        onOpenChange={setFormOpen}
        initialData={selectedAppt}
        services={services}
        rooms={rooms}
        therapists={therapists}
        reservations={reservations}
        onSubmit={handleFormSubmit}
      />

      <SpaActionDialog
        actionType={actionType}
        appt={selectedAppt}
        onClose={() => {
          setActionType(null)
          setSelectedAppt(null)
        }}
        onConfirm={handleActionConfirm}
      />
    </div>
  )
}
