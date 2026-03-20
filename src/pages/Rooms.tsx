import { useState } from 'react'
import { BedDouble, Sparkles, AlertCircle, Wrench, Lock, Search } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card'
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
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerDescription,
  DrawerFooter,
} from '@/components/ui/drawer'
import { Label } from '@/components/ui/label'
import { toast } from '@/components/ui/use-toast'

type RoomStatus = 'Disponível' | 'Ocupado' | 'Limpeza' | 'Manutenção' | 'Bloqueado'
type Room = {
  id: string
  num: string
  type: string
  status: RoomStatus
  history: string[]
  occupancy?: string
}

const INITIAL_ROOMS: Room[] = [
  { id: '1', num: '101', type: 'Standard', status: 'Disponível', history: ['Limpo hoje às 10:00'] },
  { id: '2', num: '102', type: 'Standard', status: 'Limpeza', history: ['Checkout às 12:00'] },
  {
    id: '3',
    num: '103',
    type: 'Standard',
    status: 'Ocupado',
    occupancy: 'Reserva #8492',
    history: ['Check-in 14:00'],
  },
  { id: '4', num: '201', type: 'Luxo', status: 'Disponível', history: [] },
  {
    id: '5',
    num: '202',
    type: 'Luxo',
    status: 'Manutenção',
    history: ['Ar condicionado com defeito'],
  },
  {
    id: '6',
    num: '301',
    type: 'Suite',
    status: 'Ocupado',
    occupancy: 'Reserva #9999',
    history: [],
  },
  { id: '7', num: '302', type: 'Suite', status: 'Limpeza', history: ['Aguardando governança'] },
]

export default function Rooms() {
  const [rooms, setRooms] = useState<Room[]>(INITIAL_ROOMS)
  const [filter, setFilter] = useState('Todos')
  const [search, setSearch] = useState('')
  const [selectedRoom, setSelectedRoom] = useState<Room | null>(null)
  const [blockReason, setBlockReason] = useState('')

  const handleStatusChange = (id: string, newStatus: RoomStatus, reason?: string) => {
    setRooms(
      rooms.map((r) => {
        if (r.id === id) {
          const newHistory = [
            ...r.history,
            `Alterado para ${newStatus}${reason ? `: ${reason}` : ''}`,
          ]
          return { ...r, status: newStatus, history: newHistory }
        }
        return r
      }),
    )
    toast({
      title: 'Status Atualizado',
      description: `O quarto foi alterado para ${newStatus}.`,
    })
    setSelectedRoom(null)
    setBlockReason('')
  }

  const filteredRooms = rooms.filter((r) => {
    const matchFilter = filter === 'Todos' || r.status === filter
    const matchSearch = r.num.includes(search)
    return matchFilter && matchSearch
  })

  const getStatusConfig = (status: RoomStatus) => {
    switch (status) {
      case 'Disponível':
        return { icon: Sparkles, color: 'bg-emerald-500/10 text-emerald-600 border-emerald-200' }
      case 'Ocupado':
        return { icon: BedDouble, color: 'bg-blue-500/10 text-blue-600 border-blue-200' }
      case 'Limpeza':
        return { icon: AlertCircle, color: 'bg-amber-500/10 text-amber-600 border-amber-200' }
      case 'Manutenção':
        return { icon: Wrench, color: 'bg-rose-500/10 text-rose-600 border-rose-200' }
      case 'Bloqueado':
        return { icon: Lock, color: 'bg-slate-500/10 text-slate-600 border-slate-300' }
    }
  }

  return (
    <div className="space-y-6 animate-fade-in pb-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Mapa de Acomodações</h1>
          <p className="text-sm text-muted-foreground">
            Controle de status e manutenção em tempo real.
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
          <Select value={filter} onValueChange={setFilter}>
            <SelectTrigger className="w-full sm:w-[180px]">
              <SelectValue placeholder="Filtrar por Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Todos">Todos os Quartos</SelectItem>
              <SelectItem value="Disponível">Disponível</SelectItem>
              <SelectItem value="Ocupado">Ocupado</SelectItem>
              <SelectItem value="Limpeza">Limpeza</SelectItem>
              <SelectItem value="Manutenção">Manutenção</SelectItem>
              <SelectItem value="Bloqueado">Bloqueado</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
        {filteredRooms.map((room) => {
          const config = getStatusConfig(room.status)
          return (
            <Card
              key={room.id}
              className="relative overflow-hidden group hover:shadow-md transition-all cursor-pointer border-slate-200"
              onClick={() => setSelectedRoom(room)}
            >
              <div
                className={`absolute top-0 left-0 w-1 h-full ${config.color.split(' ')[0].replace('/10', '')}`}
              />
              <CardHeader className="pb-2">
                <CardTitle className="flex justify-between items-center text-lg">
                  <span className="font-mono">{room.num}</span>
                  <Badge
                    variant="outline"
                    className={`${config.color} border flex gap-1 items-center`}
                  >
                    <config.icon className="w-3 h-3" />
                    {room.status}
                  </Badge>
                </CardTitle>
                <p className="text-sm text-muted-foreground">{room.type}</p>
              </CardHeader>
              <CardContent className="pt-0 pb-4">
                {room.occupancy && (
                  <p className="text-xs font-medium text-blue-600 mt-2">{room.occupancy}</p>
                )}
              </CardContent>
            </Card>
          )
        })}
      </div>

      <Drawer open={!!selectedRoom} onOpenChange={(o) => !o && setSelectedRoom(null)}>
        <DrawerContent className="max-w-xl mx-auto h-[85vh]">
          <DrawerHeader>
            <DrawerTitle className="flex items-center gap-2">
              Quarto {selectedRoom?.num}
              {selectedRoom && (
                <Badge variant="outline" className={getStatusConfig(selectedRoom.status).color}>
                  {selectedRoom.status}
                </Badge>
              )}
            </DrawerTitle>
            <DrawerDescription>Gestão detalhada do quarto e histórico.</DrawerDescription>
          </DrawerHeader>
          <div className="p-4 space-y-6 overflow-y-auto">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-muted-foreground">Categoria</p>
                <p className="font-medium">{selectedRoom?.type}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Ocupação Atual</p>
                <p className="font-medium">{selectedRoom?.occupancy || 'Livre'}</p>
              </div>
            </div>

            <div className="space-y-2">
              <h4 className="text-sm font-semibold border-b pb-2">Histórico de Eventos</h4>
              {selectedRoom?.history.length === 0 ? (
                <p className="text-sm text-slate-500">Nenhum evento recente.</p>
              ) : (
                <ul className="space-y-1">
                  {selectedRoom?.history.map((h, i) => (
                    <li key={i} className="text-sm text-slate-700 flex items-start gap-2">
                      <span className="mt-1.5 w-1 h-1 rounded-full bg-slate-400 shrink-0" />
                      {h}
                    </li>
                  ))}
                </ul>
              )}
            </div>

            <div className="space-y-4 pt-4 border-t">
              <h4 className="text-sm font-semibold">Ações Operacionais</h4>
              <div className="flex flex-wrap gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleStatusChange(selectedRoom!.id, 'Disponível')}
                  disabled={
                    selectedRoom?.status === 'Disponível' || selectedRoom?.status === 'Ocupado'
                  }
                >
                  Marcar Disponível
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleStatusChange(selectedRoom!.id, 'Limpeza')}
                  disabled={
                    selectedRoom?.status === 'Limpeza' || selectedRoom?.status === 'Ocupado'
                  }
                >
                  Enviar p/ Limpeza
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="text-rose-600 hover:text-rose-700"
                  onClick={() => handleStatusChange(selectedRoom!.id, 'Manutenção')}
                  disabled={
                    selectedRoom?.status === 'Manutenção' || selectedRoom?.status === 'Ocupado'
                  }
                >
                  Reportar Manutenção
                </Button>
              </div>

              <div className="bg-slate-50 p-4 rounded-lg border border-slate-200 mt-4 space-y-3">
                <Label className="text-slate-700 font-bold">Bloquear Quarto</Label>
                <Input
                  placeholder="Motivo do bloqueio (Obrigatório)"
                  value={blockReason}
                  onChange={(e) => setBlockReason(e.target.value)}
                />
                <Button
                  variant="secondary"
                  className="w-full bg-slate-800 text-white hover:bg-slate-900"
                  disabled={!blockReason.trim()}
                  onClick={() => handleStatusChange(selectedRoom!.id, 'Bloqueado', blockReason)}
                >
                  Confirmar Bloqueio
                </Button>
              </div>
            </div>
          </div>
          <DrawerFooter>
            <Button variant="ghost" onClick={() => setSelectedRoom(null)}>
              Fechar
            </Button>
          </DrawerFooter>
        </DrawerContent>
      </Drawer>
    </div>
  )
}
