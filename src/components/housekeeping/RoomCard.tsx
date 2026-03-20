import { RoomRecord } from '@/services/rooms'
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'
import { Wrench, Martini, SearchX, PlayCircle, ShieldAlert, CheckCircle2 } from 'lucide-react'
import { cn } from '@/lib/utils'

interface RoomCardProps {
  room: RoomRecord
  onAction: (type: 'checklist' | 'maintenance' | 'minibar' | 'lost_found', room: RoomRecord) => void
}

const getStatusStyles = (status: string) => {
  switch (status) {
    case 'vago_pronto':
      return 'border-emerald-400 bg-emerald-50 text-emerald-800'
    case 'ocupado_pronto':
      return 'border-blue-400 bg-blue-50 text-blue-800'
    case 'sujo':
      return 'border-rose-400 bg-rose-50 text-rose-800'
    case 'em_arrumacao':
      return 'border-amber-400 bg-amber-50 text-amber-800'
    case 'manutencao':
      return 'border-slate-400 bg-slate-100 text-slate-800'
    case 'nao_perturbar':
      return 'border-purple-400 bg-purple-50 text-purple-800'
    default:
      return 'border-gray-300 bg-gray-50 text-gray-800'
  }
}

const getStatusLabel = (status: string) => {
  return status.replace('_', ' ').toUpperCase()
}

export function RoomCard({ room, onAction }: RoomCardProps) {
  const styles = getStatusStyles(room.status)

  return (
    <Card className={cn('overflow-hidden transition-all hover:shadow-md border-l-4', styles)}>
      <CardHeader className="pb-2 pt-4 px-4 flex flex-row items-start justify-between space-y-0">
        <div>
          <CardTitle className="text-2xl font-black tracking-tight font-mono">
            {room.room_number}
          </CardTitle>
          <p className="text-xs font-semibold opacity-70 mt-1">
            Piso {room.floor} • {room.room_type}
          </p>
        </div>
        <div className="flex flex-col items-end gap-1">
          <Badge variant="outline" className={cn('text-[10px] font-bold', styles)}>
            {getStatusLabel(room.status)}
          </Badge>
          {room.housekeeping_priority === 'vip' && (
            <Badge className="bg-amber-500 text-white text-[10px]">VIP</Badge>
          )}
        </div>
      </CardHeader>

      <CardContent className="px-4 py-3 flex-1">
        {room.status === 'nao_perturbar' && (
          <div className="flex items-center gap-2 text-purple-700 bg-purple-100 p-2 rounded text-sm">
            <ShieldAlert className="w-4 h-4" /> Não Perturbe
          </div>
        )}
        {room.status === 'manutencao' && (
          <div className="flex items-center gap-2 text-slate-700 bg-slate-200 p-2 rounded text-sm line-clamp-2">
            <Wrench className="w-4 h-4 shrink-0" />{' '}
            {room.maintenance_description || 'Manutenção geral'}
          </div>
        )}
      </CardContent>

      <CardFooter className="px-4 pb-4 pt-0 grid grid-cols-5 gap-2">
        <Button
          variant="default"
          className="col-span-2 bg-slate-900 text-white hover:bg-slate-800"
          onClick={() => onAction('checklist', room)}
          disabled={
            room.status === 'nao_perturbar' ||
            room.status === 'manutencao' ||
            room.status === 'vago_pronto'
          }
        >
          <PlayCircle className="w-4 h-4 mr-1" /> Iniciar
        </Button>

        <Tooltip>
          <TooltipTrigger asChild>
            <Button variant="outline" size="icon" onClick={() => onAction('maintenance', room)}>
              <Wrench className="w-4 h-4 text-slate-600" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>Abrir OS de Manutenção</TooltipContent>
        </Tooltip>

        <Tooltip>
          <TooltipTrigger asChild>
            <Button variant="outline" size="icon" onClick={() => onAction('minibar', room)}>
              <Martini className="w-4 h-4 text-blue-600" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>Registrar Minibar</TooltipContent>
        </Tooltip>

        <Tooltip>
          <TooltipTrigger asChild>
            <Button variant="outline" size="icon" onClick={() => onAction('lost_found', room)}>
              <SearchX className="w-4 h-4 text-rose-600" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>Reportar Achados & Perdidos</TooltipContent>
        </Tooltip>
      </CardFooter>
    </Card>
  )
}
