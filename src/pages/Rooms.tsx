import { useState, useEffect } from 'react'
import {
  BedDouble,
  Sparkles,
  Wrench,
  Search,
  Wind,
  Calendar,
  Users,
  Coffee,
  Edit,
  Plus,
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
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
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog'
import { useAccess } from '@/hooks/use-access'
import { RestrictedAccess } from '@/components/RestrictedAccess'
import { useRealtime } from '@/hooks/use-realtime'
import { getRooms, updateRoom, type RoomRecord } from '@/services/rooms'
import { format } from 'date-fns'
import { cn, formatCurrency } from '@/lib/utils'
import { toast } from '@/components/ui/use-toast'
import useAuthStore from '@/stores/useAuthStore'
import { CreateReservationDialog } from '@/components/operations/CreateReservationDialog'
import { RoomFormDialog } from '@/components/operations/RoomFormDialog'

const getStatusConfig = (status: string) => {
  switch (status) {
    case 'Manutenção':
      return {
        icon: Wrench,
        color: 'bg-rose-500/10 text-rose-700 border-rose-300',
        label: 'Manutenção',
      }
    case 'Ocupado':
      return {
        icon: BedDouble,
        color: 'bg-blue-500/10 text-blue-700 border-blue-200',
        label: 'Ocupado',
      }
    case 'Limpeza':
      return {
        icon: Wind,
        color: 'bg-amber-500/10 text-amber-700 border-amber-200',
        label: 'Limpeza',
      }
    case 'Disponível':
    default:
      return {
        icon: Sparkles,
        color: 'bg-emerald-500/10 text-emerald-700 border-emerald-200',
        label: 'Disponível',
      }
  }
}

export default function Rooms() {
  const { hasAccess, canWrite } = useAccess()
  const { profile } = useAuthStore()

  const [rooms, setRooms] = useState<RoomRecord[]>([])
  const [search, setSearch] = useState('')
  const [selectedRoom, setSelectedRoom] = useState<RoomRecord | null>(null)
  const [newResOpen, setNewResOpen] = useState(false)

  const [formOpen, setFormOpen] = useState(false)
  const [editingRoom, setEditingRoom] = useState<RoomRecord | null>(null)

  const isMaintenance =
    profile?.allowed_actions?.includes('Manutenção') &&
    !profile?.allowed_actions?.includes('Quartos')
  const [filter, setFilter] = useState(isMaintenance ? 'Manutenção' : 'all')

  const loadRooms = async () => {
    try {
      const data = await getRooms()
      setRooms(data)
    } catch (e) {
      console.error('Failed to load rooms data', e)
    }
  }

  useEffect(() => {
    loadRooms()
  }, [])
  useRealtime('rooms', loadRooms)

  if (!hasAccess([], 'Quartos') && !hasAccess([], 'Manutenção')) {
    return <RestrictedAccess />
  }

  const handleResolve = async (id: string) => {
    try {
      await updateRoom(id, { status: 'Limpeza', maintenance_description: '', priority: '' })
      toast({
        title: 'Manutenção Resolvida',
        description: 'O quarto foi encaminhado para limpeza.',
      })
      setSelectedRoom(null)
    } catch (e) {
      toast({ title: 'Erro', description: 'Falha ao atualizar o status.', variant: 'destructive' })
    }
  }

  const handleEditRoom = (e: React.MouseEvent, room: RoomRecord) => {
    e.stopPropagation()
    setEditingRoom(room)
    setFormOpen(true)
  }

  const handleNewRoom = () => {
    setEditingRoom(null)
    setFormOpen(true)
  }

  const filteredRooms = rooms.filter((r) => {
    if (!r.room_number.includes(search)) return false
    if (isMaintenance) return r.status === 'Manutenção'
    if (filter !== 'all') return r.status === filter
    return true
  })

  return (
    <div className="space-y-6 animate-fade-in pb-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold tracking-tight">Mapa de Acomodações e Inventário</h1>
            {!isMaintenance && canWrite('Quartos') && (
              <>
                <Button onClick={handleNewRoom} size="sm" variant="outline" className="gap-2">
                  <Plus className="w-4 h-4" />
                  Novo Quarto
                </Button>
                <Button
                  onClick={() => setNewResOpen(true)}
                  size="sm"
                  className="bg-emerald-600 hover:bg-emerald-700"
                >
                  Nova Reserva
                </Button>
              </>
            )}
          </div>
          <p className="text-sm text-muted-foreground">
            {isMaintenance
              ? 'Visão focada em reparos e manutenções pendentes.'
              : 'Controle de inventário de quartos, capacidades, bloqueios e status de governança.'}
          </p>
        </div>
        <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
          <div className="relative w-full sm:w-48">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar quarto..."
              className="pl-8"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          {!isMaintenance && (
            <Select value={filter} onValueChange={setFilter}>
              <SelectTrigger className="w-full sm:w-[180px]">
                <SelectValue placeholder="Filtrar por Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos os Quartos</SelectItem>
                <SelectItem value="Manutenção">Manutenção</SelectItem>
                <SelectItem value="Disponível">Disponível</SelectItem>
                <SelectItem value="Ocupado">Ocupado</SelectItem>
                <SelectItem value="Limpeza">Em Limpeza</SelectItem>
              </SelectContent>
            </Select>
          )}
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
        {filteredRooms.map((room) => {
          const config = getStatusConfig(room.status)
          return (
            <Card
              key={room.id}
              className={cn(
                'relative overflow-hidden group hover:shadow-md transition-all cursor-pointer border-slate-200',
                room.status === 'Manutenção' && 'border-rose-300 bg-rose-50/30',
              )}
              onClick={() => setSelectedRoom(room)}
            >
              <div
                className={cn(
                  'absolute top-0 left-0 w-1 h-full',
                  config.color.split(' ')[0].replace('/10', ''),
                )}
              />
              <CardHeader className="pb-2">
                <CardTitle className="flex justify-between items-center text-lg">
                  <div className="flex flex-col">
                    <span className="font-mono">{room.room_number}</span>
                    <span className="text-xs font-normal text-slate-500 mt-0.5">
                      {room.room_type}
                    </span>
                  </div>
                  <div className="flex flex-col items-end gap-1">
                    <Badge
                      variant="outline"
                      className={cn(config.color, 'border flex gap-1 items-center')}
                    >
                      <config.icon className="w-3 h-3" /> {config.label}
                    </Badge>
                    {canWrite('Quartos') && (
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                        onClick={(e) => handleEditRoom(e, room)}
                      >
                        <Edit className="h-3.5 w-3.5 text-slate-500" />
                      </Button>
                    )}
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-0 pb-4">
                <div className="flex items-center justify-between mt-2">
                  <div className="flex gap-3 text-xs text-slate-500">
                    <span className="flex items-center gap-1" title="Capacidade Máxima">
                      <Users className="w-3.5 h-3.5" />
                      {room.max_occupancy || 2}
                    </span>
                    <span className="flex items-center gap-1" title="Camas">
                      <BedDouble className="w-3.5 h-3.5" />
                      {room.bed_count || 1}
                    </span>
                    {(room.appliances?.length || 0) > 0 && (
                      <span
                        className="flex items-center gap-1"
                        title={`${room.appliances?.length} Equipamentos`}
                      >
                        <Coffee className="w-3.5 h-3.5" />
                        {room.appliances?.length}
                      </span>
                    )}
                  </div>
                  <div className="font-medium text-sm text-slate-700">
                    {room.base_rate ? formatCurrency(room.base_rate, 'AOA') : '—'}
                  </div>
                </div>

                {room.status === 'Manutenção' && (
                  <div className="flex flex-col gap-2 mt-3 pt-3 border-t border-rose-100">
                    {room.priority && (
                      <div className="flex items-center gap-2">
                        <Badge
                          variant="outline"
                          className={cn(
                            'text-[10px] uppercase font-bold px-1.5 py-0',
                            room.priority === 'high'
                              ? 'text-rose-700 border-rose-200 bg-rose-100'
                              : room.priority === 'medium'
                                ? 'text-orange-700 border-orange-200 bg-orange-100'
                                : 'text-slate-700 border-slate-200 bg-slate-100',
                          )}
                        >
                          {room.priority === 'high'
                            ? 'Alta'
                            : room.priority === 'medium'
                              ? 'Média'
                              : 'Baixa'}
                        </Badge>
                      </div>
                    )}
                    <div className="text-xs text-slate-700 line-clamp-2 font-medium">
                      {room.maintenance_description || 'Sem descrição'}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          )
        })}
      </div>

      <Dialog open={!!selectedRoom} onOpenChange={(o) => !o && setSelectedRoom(null)}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex justify-between items-center pr-6">
              <span className="flex items-center gap-2">
                {selectedRoom?.status === 'Manutenção' ? (
                  <Wrench className="w-5 h-5 text-rose-600" />
                ) : (
                  <BedDouble className="w-5 h-5" />
                )}{' '}
                Quarto {selectedRoom?.room_number}
              </span>
              <Badge variant="secondary" className="font-normal">
                {selectedRoom?.room_type}
              </Badge>
            </DialogTitle>
            <DialogDescription>Detalhes do quarto e inventário.</DialogDescription>
          </DialogHeader>

          {selectedRoom && (
            <div className="space-y-4">
              <div className="grid grid-cols-3 gap-4 bg-slate-50 p-4 rounded-lg border border-slate-200 shadow-sm">
                <div>
                  <p className="text-xs text-slate-500">Status Ocupação</p>
                  <p className="font-bold text-slate-900 capitalize">{selectedRoom.status}</p>
                </div>
                <div>
                  <p className="text-xs text-slate-500">Andar</p>
                  <p className="font-bold text-slate-900">{selectedRoom.floor}º</p>
                </div>
                <div>
                  <p className="text-xs text-slate-500">Diária Base</p>
                  <p className="font-bold text-slate-900">
                    {selectedRoom.base_rate ? formatCurrency(selectedRoom.base_rate, 'AOA') : 'N/D'}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-slate-500">Ocupação Máx.</p>
                  <p className="font-bold text-slate-900">{selectedRoom.max_occupancy || 2} Pax</p>
                </div>
                <div>
                  <p className="text-xs text-slate-500">Camas</p>
                  <p className="font-bold text-slate-900">{selectedRoom.bed_count || 1}</p>
                </div>
                <div>
                  <p className="text-xs text-slate-500">Cama Extra?</p>
                  <p className="font-bold text-slate-900">
                    {selectedRoom.allow_extra_bed ? 'Sim' : 'Não'}
                  </p>
                </div>
              </div>

              {selectedRoom.appliances && selectedRoom.appliances.length > 0 && (
                <div className="space-y-2">
                  <h4 className="text-sm font-semibold text-slate-800">Equipamentos no Quarto</h4>
                  <div className="flex flex-wrap gap-2">
                    {selectedRoom.appliances.map((app) => (
                      <Badge
                        key={app}
                        variant="secondary"
                        className="bg-slate-100 text-slate-700 border-slate-200"
                      >
                        {app}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              {selectedRoom.status === 'Manutenção' && (
                <div className="p-4 bg-rose-50 border border-rose-100 rounded-lg space-y-3 shadow-sm mt-4">
                  <div>
                    <h4 className="text-xs font-bold uppercase text-rose-800 tracking-wider">
                      Descrição do Problema
                    </h4>
                    <p className="text-sm text-slate-800 mt-1">
                      {selectedRoom.maintenance_description}
                    </p>
                  </div>
                  <div className="flex justify-between items-center pt-3 border-t border-rose-200/50">
                    <div className="flex items-center gap-1.5 text-xs text-rose-700 font-medium">
                      <Calendar className="w-3.5 h-3.5" />
                      {format(new Date(selectedRoom.created), 'dd/MM/yyyy HH:mm')}
                    </div>
                    {selectedRoom.priority && (
                      <Badge
                        variant="outline"
                        className={cn(
                          'uppercase text-[10px] font-bold',
                          selectedRoom.priority === 'high'
                            ? 'text-rose-700 border-rose-200 bg-rose-100'
                            : selectedRoom.priority === 'medium'
                              ? 'text-orange-700 border-orange-200 bg-orange-100'
                              : 'text-slate-700 border-slate-200 bg-slate-100',
                        )}
                      >
                        Prioridade{' '}
                        {selectedRoom.priority === 'high'
                          ? 'Alta'
                          : selectedRoom.priority === 'medium'
                            ? 'Média'
                            : 'Baixa'}
                      </Badge>
                    )}
                  </div>
                </div>
              )}

              <DialogFooter className="gap-2 sm:gap-0 mt-6">
                <Button variant="outline" onClick={() => setSelectedRoom(null)}>
                  Fechar
                </Button>
                {selectedRoom.status === 'Manutenção' && canWrite('Manutenção') && (
                  <Button
                    onClick={() => handleResolve(selectedRoom.id)}
                    className="bg-emerald-600 hover:bg-emerald-700 text-white"
                  >
                    Marcar como Resolvido
                  </Button>
                )}
                {canWrite('Quartos') && (
                  <Button
                    onClick={(e) => {
                      setSelectedRoom(null)
                      handleEditRoom(e, selectedRoom)
                    }}
                  >
                    Editar Dados
                  </Button>
                )}
              </DialogFooter>
            </div>
          )}
        </DialogContent>
      </Dialog>

      <CreateReservationDialog open={newResOpen} onOpenChange={setNewResOpen} />
      <RoomFormDialog open={formOpen} onOpenChange={setFormOpen} room={editingRoom} />
    </div>
  )
}
