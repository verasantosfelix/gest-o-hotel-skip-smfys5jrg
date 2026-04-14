import { useState, useEffect } from 'react'
import { BedDouble, Sparkles, AlertTriangle, Wrench, Search, Wind, Calendar } from 'lucide-react'
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
import { cn } from '@/lib/utils'
import { toast } from '@/components/ui/use-toast'
import useAuthStore from '@/stores/useAuthStore'
import { CreateReservationDialog } from '@/components/operations/CreateReservationDialog'

const getStatusConfig = (status: string) => {
  switch (status) {
    case 'maintenance':
      return {
        icon: Wrench,
        color: 'bg-rose-500/10 text-rose-700 border-rose-300',
        label: 'Manutenção',
      }
    case 'out_of_order':
      return {
        icon: AlertTriangle,
        color: 'bg-slate-500/10 text-slate-700 border-slate-300',
        label: 'Bloqueado',
      }
    case 'occupied':
      return {
        icon: BedDouble,
        color: 'bg-blue-500/10 text-blue-700 border-blue-200',
        label: 'Ocupado',
      }
    case 'cleaning':
      return {
        icon: Wind,
        color: 'bg-amber-500/10 text-amber-700 border-amber-200',
        label: 'Limpeza',
      }
    case 'available':
    default:
      return {
        icon: Sparkles,
        color: 'bg-emerald-500/10 text-emerald-700 border-emerald-200',
        label: 'Livre',
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

  const isMaintenance =
    profile?.allowed_actions?.includes('Manutenção') &&
    !profile?.allowed_actions?.includes('Quartos')
  const [filter, setFilter] = useState(isMaintenance ? 'maintenance' : 'all')

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
      await updateRoom(id, { status: 'cleaning', maintenance_description: '', priority: '' })
      toast({
        title: 'Manutenção Resolvida',
        description: 'O quarto foi encaminhado para limpeza.',
      })
      setSelectedRoom(null)
    } catch (e) {
      toast({ title: 'Erro', description: 'Falha ao atualizar o status.', variant: 'destructive' })
    }
  }

  const filteredRooms = rooms.filter((r) => {
    if (!r.room_number.includes(search)) return false
    if (isMaintenance) return r.status === 'maintenance'
    if (filter !== 'all') return r.status === filter
    return true
  })

  return (
    <div className="space-y-6 animate-fade-in pb-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold tracking-tight">Mapa de Acomodações</h1>
            {!isMaintenance && (
              <Button
                onClick={() => setNewResOpen(true)}
                size="sm"
                className="bg-emerald-600 hover:bg-emerald-700"
              >
                Nova Reserva
              </Button>
            )}
          </div>
          <p className="text-sm text-muted-foreground">
            {isMaintenance
              ? 'Visão focada em reparos e manutenções pendentes.'
              : 'Controle de ocupação, bloqueios e status de governança.'}
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
                <SelectItem value="maintenance">Manutenção</SelectItem>
                <SelectItem value="available">Livre</SelectItem>
                <SelectItem value="occupied">Ocupado</SelectItem>
                <SelectItem value="cleaning">Em Limpeza</SelectItem>
                <SelectItem value="out_of_order">Bloqueado</SelectItem>
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
                room.status === 'maintenance' && 'border-rose-300 bg-rose-50/30',
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
                  <span className="font-mono">{room.room_number}</span>
                  <Badge
                    variant="outline"
                    className={cn(config.color, 'border flex gap-1 items-center')}
                  >
                    <config.icon className="w-3 h-3" /> {config.label}
                  </Badge>
                </CardTitle>
                <p className="text-sm text-muted-foreground">{room.floor}º Andar</p>
              </CardHeader>
              <CardContent className="pt-0 pb-4">
                {room.status === 'maintenance' && (
                  <div className="flex flex-col gap-2 mt-2">
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
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              {selectedRoom?.status === 'maintenance' ? (
                <Wrench className="w-5 h-5 text-rose-600" />
              ) : (
                <BedDouble className="w-5 h-5" />
              )}{' '}
              Quarto {selectedRoom?.room_number}
            </DialogTitle>
            <DialogDescription>Detalhes e status do quarto.</DialogDescription>
          </DialogHeader>
          {selectedRoom && selectedRoom.status === 'maintenance' ? (
            <div className="space-y-4">
              <div className="p-4 bg-rose-50 border border-rose-100 rounded-lg space-y-3 shadow-sm">
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
              <DialogFooter className="gap-2 sm:gap-0">
                <Button variant="outline" onClick={() => setSelectedRoom(null)}>
                  Fechar
                </Button>
                {canWrite('Manutenção') && (
                  <Button
                    onClick={() => handleResolve(selectedRoom.id)}
                    className="bg-emerald-600 hover:bg-emerald-700 text-white"
                  >
                    Marcar como Resolvido
                  </Button>
                )}
              </DialogFooter>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4 bg-slate-50 p-4 rounded-lg border border-slate-200 shadow-sm">
                <div>
                  <p className="text-sm text-slate-500">Status Ocupação</p>
                  <p className="font-bold text-slate-900 capitalize">
                    {selectedRoom?.status.replace('_', ' ')}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-slate-500">Andar</p>
                  <p className="font-bold text-slate-900">{selectedRoom?.floor}º Andar</p>
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setSelectedRoom(null)}>
                  Fechar
                </Button>
              </DialogFooter>
            </div>
          )}
        </DialogContent>
      </Dialog>

      <CreateReservationDialog open={newResOpen} onOpenChange={setNewResOpen} />
    </div>
  )
}
