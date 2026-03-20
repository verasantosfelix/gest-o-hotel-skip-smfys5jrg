import { useState, useEffect } from 'react'
import { MoreHorizontal, Plus, Calendar as CalendarIcon, User, Clock } from 'lucide-react'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  getSpaAppointments,
  createSpaAppointment,
  updateSpaAppointment,
  deleteSpaAppointment,
  updateSpaRoom,
  getSpaRooms,
  getSpaServices,
  getUsers,
  getActiveReservations,
  SpaAppointment,
} from '@/services/spa'
import { createConsumption } from '@/services/reservations'
import { useRealtime } from '@/hooks/use-realtime'
import { toast } from '@/components/ui/use-toast'
import { SpaAppointmentForm } from './SpaAppointmentForm'
import { SpaActionDialog } from './SpaActionDialogs'

export function SpaAgenda() {
  const [appointments, setAppointments] = useState<SpaAppointment[]>([])
  const [rooms, setRooms] = useState<any[]>([])
  const [services, setServices] = useState<any[]>([])
  const [therapists, setTherapists] = useState<any[]>([])
  const [reservations, setReservations] = useState<any[]>([])

  const [formOpen, setFormOpen] = useState(false)
  const [selectedAppt, setSelectedAppt] = useState<SpaAppointment | null>(null)
  const [actionType, setActionType] = useState<'checkin' | 'checkout' | null>(null)

  const loadData = async () => {
    try {
      const [appts, r, s, t, res] = await Promise.all([
        getSpaAppointments(),
        getSpaRooms(),
        getSpaServices(),
        getUsers(),
        getActiveReservations(),
      ])
      setAppointments(appts)
      setRooms(r)
      setServices(s)
      setTherapists(t)
      setReservations(res)
    } catch (e) {
      console.error('Failed to load SPA data')
    }
  }

  useEffect(() => {
    loadData()
  }, [])

  useRealtime('spa_appointments', loadData)
  useRealtime('spa_rooms', loadData)

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
          toast({ title: 'Checkout concluído e lançado na conta do hóspede.' })
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

  const statusColors: Record<string, string> = {
    scheduled: 'bg-slate-100 text-slate-700',
    checked_in: 'bg-blue-100 text-blue-700',
    in_progress: 'bg-amber-100 text-amber-700 animate-pulse',
    completed: 'bg-emerald-100 text-emerald-700',
    cancelled: 'bg-rose-100 text-rose-700',
  }

  return (
    <div className="space-y-4 animate-fade-in">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
          <CalendarIcon className="w-5 h-5" /> Agenda Diária
        </h2>
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

      <div className="bg-white border border-slate-200 rounded-lg shadow-sm overflow-hidden overflow-x-auto">
        <Table>
          <TableHeader className="bg-slate-50">
            <TableRow>
              <TableHead>Horário</TableHead>
              <TableHead>Hóspede (Qto)</TableHead>
              <TableHead>Serviço</TableHead>
              <TableHead>Terapeuta</TableHead>
              <TableHead>Sala SPA</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {appointments.map((a) => {
              const d = new Date(a.start_time)
              const time = d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
              const roomNum =
                a.expand?.hotel_reservation_id?.expand?.room_id?.room_number || 'Avulso'
              return (
                <TableRow key={a.id} className="hover:bg-slate-50/50">
                  <TableCell className="font-mono text-sm">
                    <div className="flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5 text-slate-400" /> {time}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="font-medium text-slate-900">{a.guest_name}</div>
                    <div className="text-xs text-slate-500">Qto: {roomNum}</div>
                  </TableCell>
                  <TableCell>
                    <div className="font-medium">{a.expand?.service_id?.name}</div>
                    <div className="text-xs text-slate-500">
                      {a.expand?.service_id?.duration_minutes} min
                    </div>
                  </TableCell>
                  <TableCell className="text-slate-600">
                    <div className="flex items-center gap-1.5 text-sm">
                      <User className="w-3.5 h-3.5" />
                      {a.expand?.therapist_id?.name || 'Não atri.'}
                    </div>
                  </TableCell>
                  <TableCell className="text-sm">{a.expand?.spa_room_id?.name}</TableCell>
                  <TableCell>
                    <Badge variant="outline" className={statusColors[a.status] || ''}>
                      {a.status.replace('_', ' ').toUpperCase()}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem
                          onClick={() => {
                            setSelectedAppt(a)
                            setFormOpen(true)
                          }}
                        >
                          Editar / Alterar
                        </DropdownMenuItem>
                        {a.status === 'scheduled' && (
                          <DropdownMenuItem
                            onClick={() => {
                              setSelectedAppt(a)
                              setActionType('checkin')
                            }}
                          >
                            Realizar Check-in
                          </DropdownMenuItem>
                        )}
                        {a.status === 'in_progress' && (
                          <DropdownMenuItem
                            onClick={() => {
                              setSelectedAppt(a)
                              setActionType('checkout')
                            }}
                          >
                            Finalizar (Check-out)
                          </DropdownMenuItem>
                        )}
                        <DropdownMenuItem
                          className="text-rose-600"
                          onClick={async () => {
                            if (confirm('Cancelar agendamento?')) {
                              await updateSpaAppointment(a.id, { status: 'cancelled' })
                              toast({ title: 'Cancelado' })
                            }
                          }}
                        >
                          Cancelar Agendamento
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              )
            })}
            {appointments.length === 0 && (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-8 text-slate-500">
                  Nenhum agendamento encontrado.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

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
