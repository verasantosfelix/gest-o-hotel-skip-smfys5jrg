import { useState } from 'react'
import { BedDouble, Sparkles, AlertCircle, Wrench, Lock, Search, Wind } from 'lucide-react'
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
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerDescription,
  DrawerFooter,
} from '@/components/ui/drawer'
import { Label } from '@/components/ui/label'
import useRoomStore, { Room, RoomStatus, CleaningStatus } from '@/stores/useRoomStore'
import { useAccess } from '@/hooks/use-access'
import { RestrictedAccess } from '@/components/RestrictedAccess'

export default function Rooms() {
  const { hasAccess } = useAccess()
  const { rooms, updateRoomStatus } = useRoomStore()
  const [filter, setFilter] = useState('Todos')
  const [search, setSearch] = useState('')
  const [selectedRoom, setSelectedRoom] = useState<Room | null>(null)
  const [blockReason, setBlockReason] = useState('')

  if (!hasAccess(['Rececao_FrontOffice', 'Manutencao_Oficina', 'Direcao_Admin'])) {
    return (
      <RestrictedAccess
        requiredRoles={['Rececao_FrontOffice', 'Manutencao_Oficina', 'Direcao_Admin']}
      />
    )
  }

  const handleStatusChange = (newStatus: RoomStatus) => {
    if (selectedRoom) {
      updateRoomStatus(
        selectedRoom.id,
        undefined,
        newStatus,
        newStatus === 'Bloqueado' ? blockReason : undefined,
      )
      setSelectedRoom(null)
      setBlockReason('')
    }
  }

  const handleCleaningChange = (newStatus: CleaningStatus) => {
    if (selectedRoom) {
      updateRoomStatus(selectedRoom.id, newStatus)
      setSelectedRoom(null)
    }
  }

  const filteredRooms = rooms.filter((r) => {
    const matchFilter = filter === 'Todos' || r.status === filter || r.cleaningStatus === filter
    const matchSearch = r.num.includes(search)
    return matchFilter && matchSearch
  })

  const getStatusConfig = (status: RoomStatus, cleaning: CleaningStatus) => {
    if (status === 'Bloqueado')
      return { icon: Lock, color: 'bg-slate-500/10 text-slate-700 border-slate-300' }
    if (cleaning === 'Manutenção')
      return { icon: Wrench, color: 'bg-rose-500/10 text-rose-700 border-rose-300' }
    if (status === 'Ocupado')
      return { icon: BedDouble, color: 'bg-blue-500/10 text-blue-700 border-blue-200' }
    if (cleaning === 'Limpo')
      return { icon: Sparkles, color: 'bg-emerald-500/10 text-emerald-700 border-emerald-200' }
    return { icon: Wind, color: 'bg-amber-500/10 text-amber-700 border-amber-200' }
  }

  return (
    <div className="space-y-6 animate-fade-in pb-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Mapa de Acomodações</h1>
          <p className="text-sm text-muted-foreground">
            Controle de ocupação, bloqueios e status de governança.
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
              <SelectItem value="Livre">Livre</SelectItem>
              <SelectItem value="Ocupado">Ocupado</SelectItem>
              <SelectItem value="Sujo">Sujo</SelectItem>
              <SelectItem value="Em Limpeza">Em Limpeza</SelectItem>
              <SelectItem value="Manutenção">Manutenção</SelectItem>
              <SelectItem value="Bloqueado">Bloqueado</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
        {filteredRooms.map((room) => {
          const config = getStatusConfig(room.status, room.cleaningStatus)
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
                    {room.status === 'Livre' && room.cleaningStatus === 'Limpo'
                      ? 'Pronto'
                      : room.status !== 'Livre'
                        ? room.status
                        : room.cleaningStatus}
                  </Badge>
                </CardTitle>
                <p className="text-sm text-muted-foreground">{room.type}</p>
              </CardHeader>
              <CardContent className="pt-0 pb-4">
                <div className="flex flex-col gap-1 mt-2">
                  {room.occupancy && (
                    <span className="text-xs font-medium text-blue-700">
                      {room.occupancy} - {room.guestName}
                    </span>
                  )}
                  {room.cleaningStatus === 'Sujo' && room.status === 'Livre' && (
                    <span className="text-xs font-medium text-amber-600 flex items-center gap-1">
                      <AlertCircle className="w-3 h-3" /> Aguarda Limpeza
                    </span>
                  )}
                </div>
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
            </DrawerTitle>
            <DrawerDescription>Gestão detalhada do quarto e histórico.</DrawerDescription>
          </DrawerHeader>
          {selectedRoom && (
            <div className="p-4 space-y-6 overflow-y-auto">
              <div className="grid grid-cols-2 gap-4 bg-slate-50 p-4 rounded-lg border border-slate-200">
                <div>
                  <p className="text-sm text-slate-500">Status Ocupação</p>
                  <p className="font-bold text-slate-900">{selectedRoom.status}</p>
                </div>
                <div>
                  <p className="text-sm text-slate-500">Status Governança</p>
                  <p className="font-bold text-slate-900">{selectedRoom.cleaningStatus}</p>
                </div>
              </div>

              <div className="space-y-4 pt-2 border-t">
                <h4 className="text-sm font-semibold">Alterar Ocupação</h4>
                <div className="flex flex-wrap gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleStatusChange('Livre')}
                    disabled={selectedRoom.status === 'Livre'}
                  >
                    Marcar Livre
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleStatusChange('Ocupado')}
                    disabled={selectedRoom.status === 'Ocupado'}
                  >
                    Marcar Ocupado
                  </Button>
                </div>
              </div>
            </div>
          )}
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
