import { useState, useEffect } from 'react'
import {
  MoreHorizontal,
  Plus,
  Calendar as CalendarIcon,
  User,
  Clock,
  AlertCircle,
} from 'lucide-react'
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
  updateSpaRoom,
  getSpaRooms,
  getSpaServices,
  getUsers,
  getActiveReservations,
  getSpaBlockouts,
  SpaAppointment,
} from '@/services/spa'
import { createConsumption } from '@/services/reservations'
import { useRealtime } from '@/hooks/use-realtime'
import { toast } from '@/components/ui/use-toast'
import { SpaAppointmentForm } from './SpaAppointmentForm'
import { SpaActionDialog } from './SpaActionDialogs'
import useAuthStore from '@/stores/useAuthStore'
import pb from '@/lib/pocketbase/client'

export function SpaAgenda() {
  const { userRole } = useAuthStore()
  const isFrontDesk = userRole === 'Front_Desk' || userRole === 'Rececao_FrontOffice'

  const [appointments, setAppointments] = useState<SpaAppointment[]>([])
  const [blockouts, setBlockouts] = useState<any[]>([])
  const [rooms, setRooms] = useState<any[]>([])
  const [services, setServices] = useState<any[]>([])
  const [therapists, setTherapists] = useState<any[]>([])
  const [reservations, setReservations] = useState<any[]>([])

  const [formOpen, setFormOpen] = useState(false)
  const [selectedAppt, setSelectedAppt] = useState<SpaAppointment | null>(null)
  const [actionType, setActionType] = useState<'checkin' | 'checkout' | null>(null)

  const loadData = async () => {
    try {
      const [appts, s, t, res, bo] = await Promise.all([
        getSpaAppointments(),
        getSpaServices(),
        getUsers(),
        getActiveReservations(),
        getSpaBlockouts(),
      ])
      setAppointments(appts)
      setServices(s)
      setTherapists(t)
      setReservations(res)
      setBlockouts(bo)

      if (!isFrontDesk) {
        try {
          const r = await getSpaRooms()
          setRooms(r)
        } catch (e) {
          setRooms([])
        }
      } else {
        setRooms([])
      }
    } catch (e) {
      console.error('Failed to load SPA data')
    }
  }

  useEffect(() => {
    loadData()
  }, [isFrontDesk])

  useRealtime('spa_appointments', loadData)
  useRealtime('spa_rooms', loadData, !isFrontDesk)
  useRealtime('calendar_events', loadData)

  const handleFormSubmit = async (data: any) => {
    try {
      let isNewPending = false

      if (selectedAppt) {
        await updateSpaAppointment(selectedAppt.id, data)
        toast({ title: 'Agendamento atualizado!' })
      } else {
        await createSpaAppointment(data)
        toast({ title: 'Agendamento criado!' })
        if (data.status === 'pending_approval') {
          isNewPending = true
        }
      }

      if (isNewPending) {
        try {
          const usersToNotify = await pb.collection('users').getFullList({ expand: 'profile' })
          const targets = usersToNotify.filter(
            (u: any) =>
              u.role === 'manager' ||
              ['Direcao_Admin', 'Spa_Wellness'].includes(u.expand?.profile?.name),
          )
          for (const t of targets) {
            await pb.collection('notifications').create({
              recipient_id: t.id,
              sender_id: pb.authStore.record?.id,
              title: 'SPA: Aprovação Pendente',
              message: `Novo agendamento com conflito para ${data.guest_name} requer aprovação.`,
              type: 'approval_request',
              status: 'unread',
              link: '/spa/agenda',
            })
          }
        } catch (err) {
          console.error('Failed to notify managers', err)
        }
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
    pending_approval: 'bg-orange-100 text-orange-800 border-orange-300',
  }

  const statusLabels: Record<string, string> = {
    scheduled: 'AGENDADO',
    checked_in: 'CHECK-IN',
    in_progress: 'EM ANDAMENTO',
    completed: 'CONCLUÍDO',
    cancelled: 'CANCELADO',
    pending_approval: 'PENDENTE APROVAÇÃO',
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
              {!isFrontDesk && <TableHead>Sala SPA</TableHead>}
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
                    <div className="font-medium text-slate-900 flex items-center gap-1.5">
                      {a.status === 'pending_approval' && (
                        <AlertCircle className="w-3.5 h-3.5 text-orange-500" />
                      )}
                      {a.guest_name}
                    </div>
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
                  {!isFrontDesk && (
                    <TableCell className="text-sm">{a.expand?.spa_room_id?.name || '-'}</TableCell>
                  )}
                  <TableCell>
                    <Badge variant="outline" className={statusColors[a.status] || ''}>
                      {statusLabels[a.status] || a.status.toUpperCase()}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    {!isFrontDesk ? (
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
                          {a.status !== 'cancelled' && (
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
                          )}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    ) : (
                      <span className="text-slate-400 text-[10px] uppercase font-bold tracking-wider">
                        Apenas Leitura
                      </span>
                    )}
                  </TableCell>
                </TableRow>
              )
            })}
            {appointments.length === 0 && (
              <TableRow>
                <TableCell
                  colSpan={isFrontDesk ? 6 : 7}
                  className="text-center py-8 text-slate-500"
                >
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
        appointments={appointments}
        blockouts={blockouts}
        isFrontDesk={isFrontDesk}
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
