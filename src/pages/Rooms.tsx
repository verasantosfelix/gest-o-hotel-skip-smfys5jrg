import { useState } from 'react'
import { BedDouble, Sparkles, AlertCircle, Wrench } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { toast } from '@/components/ui/use-toast'

type RoomStatus = 'Disponível' | 'Ocupado' | 'Sujo' | 'Manutenção'
type Room = { id: string; num: string; type: string; status: RoomStatus }

const INITIAL_ROOMS: Room[] = [
  { id: '1', num: '101', type: 'Standard', status: 'Disponível' },
  { id: '2', num: '102', type: 'Standard', status: 'Sujo' },
  { id: '3', num: '103', type: 'Standard', status: 'Ocupado' },
  { id: '4', num: '201', type: 'Luxo', status: 'Disponível' },
  { id: '5', num: '202', type: 'Luxo', status: 'Manutenção' },
  { id: '6', num: '301', type: 'Suite', status: 'Ocupado' },
  { id: '7', num: '302', type: 'Suite', status: 'Sujo' },
]

export default function Rooms() {
  const [rooms, setRooms] = useState<Room[]>(INITIAL_ROOMS)
  const [filter, setFilter] = useState('Todos')

  const toggleStatus = (id: string, newStatus: RoomStatus) => {
    setRooms(rooms.map((r) => (r.id === id ? { ...r, status: newStatus } : r)))
    toast({
      title: 'Status Atualizado',
      description: `O status do quarto foi alterado para ${newStatus}. Ação registrada.`,
    })
  }

  const filteredRooms = filter === 'Todos' ? rooms : rooms.filter((r) => r.status === filter)

  const getStatusConfig = (status: RoomStatus) => {
    switch (status) {
      case 'Disponível':
        return { icon: Sparkles, color: 'bg-accent/10 text-accent border-accent/20' }
      case 'Ocupado':
        return { icon: BedDouble, color: 'bg-primary/10 text-primary border-primary/20' }
      case 'Sujo':
        return { icon: AlertCircle, color: 'bg-warning/10 text-warning border-warning/20' }
      case 'Manutenção':
        return { icon: Wrench, color: 'bg-destructive/10 text-destructive border-destructive/20' }
    }
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h1 className="text-2xl font-bold tracking-tight">Mapa de Acomodações</h1>
        <Select value={filter} onValueChange={setFilter}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Filtrar por Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="Todos">Todos os Quartos</SelectItem>
            <SelectItem value="Disponível">Disponível</SelectItem>
            <SelectItem value="Ocupado">Ocupado</SelectItem>
            <SelectItem value="Sujo">Sujo</SelectItem>
            <SelectItem value="Manutenção">Manutenção</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
        {filteredRooms.map((room) => {
          const config = getStatusConfig(room.status)
          return (
            <Card
              key={room.id}
              className="relative overflow-hidden group hover:shadow-md transition-all"
            >
              <div
                className={`absolute top-0 left-0 w-1 h-full ${config.color.split(' ')[0].replace('/10', '')}`}
              />
              <CardHeader className="pb-2">
                <CardTitle className="flex justify-between items-center text-lg">
                  <span>{room.num}</span>
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
              <CardFooter className="pt-2 pb-4 px-6 flex flex-col gap-2">
                {room.status === 'Sujo' && (
                  <Button
                    variant="outline"
                    className="w-full text-xs"
                    onClick={() => toggleStatus(room.id, 'Disponível')}
                  >
                    Marcar como Limpo
                  </Button>
                )}
                {room.status === 'Disponível' && (
                  <Button
                    variant="secondary"
                    className="w-full text-xs"
                    onClick={() => toggleStatus(room.id, 'Manutenção')}
                  >
                    Bloquear p/ Manutenção
                  </Button>
                )}
                <Button variant="ghost" className="w-full text-xs">
                  Ver Histórico
                </Button>
              </CardFooter>
            </Card>
          )
        })}
      </div>
    </div>
  )
}
