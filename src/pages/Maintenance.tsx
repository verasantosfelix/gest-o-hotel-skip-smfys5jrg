import { useState, useEffect } from 'react'
import { Wrench, MapPin, AlertTriangle } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { useAccess } from '@/hooks/use-access'
import { RestrictedAccess } from '@/components/RestrictedAccess'
import { getRooms, RoomRecord } from '@/services/rooms'
import { useRealtime } from '@/hooks/use-realtime'
import { cn } from '@/lib/utils'

export default function Maintenance() {
  const { hasAccess } = useAccess()
  const [rooms, setRooms] = useState<RoomRecord[]>([])

  const loadData = async () => {
    try {
      const data = await getRooms()
      setRooms(data)
    } catch (e) {
      console.error(e)
    }
  }

  useEffect(() => {
    loadData()
  }, [])

  useRealtime('rooms', loadData)

  if (!hasAccess(['Manutencao_Oficina', 'Direcao_Admin'])) {
    return <RestrictedAccess requiredRoles={['Manutencao_Oficina', 'Direcao_Admin']} />
  }

  const maintenanceRooms = rooms.filter((r) => r.status === 'maintenance')
  const floors = Array.from(new Set(rooms.map((r) => r.floor))).sort()

  const getPriorityColor = (p?: string) => {
    if (p === 'high') return 'bg-rose-500 text-white'
    if (p === 'medium') return 'bg-amber-500 text-white'
    return 'bg-slate-200 text-slate-800'
  }

  return (
    <div className="space-y-6 animate-fade-in pb-8">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-3 bg-red-100 rounded-full">
          <Wrench className="w-6 h-6 text-red-700" />
        </div>
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">Painel de Manutenção</h1>
          <p className="text-sm text-slate-500">Gestão Adaptativa de Ordens de Serviço (OS)</p>
        </div>
      </div>

      {/* MOBILE VIEW: Vertical OS List */}
      <div className="block md:hidden space-y-4">
        <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2 px-1">
          <AlertTriangle className="w-5 h-5 text-rose-500" /> OS Pendentes (
          {maintenanceRooms.length})
        </h2>
        {maintenanceRooms.map((room) => (
          <Card key={room.id} className="border-l-4 border-l-rose-500 shadow-sm">
            <CardHeader className="pb-2 pt-4 px-4">
              <div className="flex justify-between items-start">
                <CardTitle className="text-xl font-black text-slate-800">
                  Quarto {room.room_number}
                </CardTitle>
                <Badge className={getPriorityColor(room.priority)}>
                  {room.priority === 'high'
                    ? 'Urgente'
                    : room.priority === 'medium'
                      ? 'Média'
                      : 'Baixa'}
                </Badge>
              </div>
              <p className="text-xs text-slate-500 font-medium">Andar {room.floor}</p>
            </CardHeader>
            <CardContent className="px-4 pb-4">
              <p className="text-slate-700 text-sm bg-slate-50 p-2 rounded border border-slate-100">
                {room.maintenance_description || 'Manutenção geral requerida.'}
              </p>
              <Button className="w-full mt-4 bg-slate-900 text-white">Iniciar Reparo</Button>
            </CardContent>
          </Card>
        ))}
        {maintenanceRooms.length === 0 && (
          <p className="text-slate-500 text-center py-8">Nenhuma manutenção pendente.</p>
        )}
      </div>

      {/* TABLET VIEW: Two-column OS List */}
      <div className="hidden md:grid lg:hidden grid-cols-2 gap-4">
        {maintenanceRooms.map((room) => (
          <Card
            key={`tab-${room.id}`}
            className="border-t-4 border-t-rose-500 shadow-sm flex flex-col"
          >
            <CardHeader className="pb-2">
              <div className="flex justify-between items-center">
                <h3 className="text-2xl font-mono font-bold text-slate-900">{room.room_number}</h3>
                <Badge className={getPriorityColor(room.priority)}>
                  Prioridade {room.priority || 'Baixa'}
                </Badge>
              </div>
              <p className="text-sm text-slate-500 flex items-center gap-1">
                <MapPin className="w-3 h-3" /> Piso {room.floor}
              </p>
            </CardHeader>
            <CardContent className="flex-1">
              <p className="text-slate-700 text-sm">{room.maintenance_description}</p>
            </CardContent>
            <CardFooter>
              <Button variant="outline" className="w-full">
                Ver Detalhes da OS
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>

      {/* DESKTOP VIEW: Comprehensive OS List + Visual Room Map */}
      <div className="hidden lg:grid grid-cols-12 gap-8">
        <div className="col-span-5 space-y-4">
          <div className="bg-rose-50 border border-rose-200 rounded-lg p-4 flex justify-between items-center">
            <div>
              <h2 className="text-lg font-bold text-rose-900">Ordens de Serviço (OS)</h2>
              <p className="text-sm text-rose-700">
                {maintenanceRooms.length} reparos críticos ativos
              </p>
            </div>
            <Wrench className="w-8 h-8 text-rose-300" />
          </div>

          <div className="space-y-3 max-h-[600px] overflow-y-auto pr-2">
            {maintenanceRooms.map((room) => (
              <Card
                key={`desk-${room.id}`}
                className="shadow-sm hover:shadow-md transition-shadow border-slate-200 cursor-pointer"
              >
                <CardContent className="p-4 flex gap-4">
                  <div className="flex flex-col items-center justify-center p-3 bg-slate-100 rounded-md min-w-[70px]">
                    <span className="text-xs text-slate-500 font-bold uppercase">Quarto</span>
                    <span className="text-xl font-black text-slate-800">{room.room_number}</span>
                  </div>
                  <div className="flex-1">
                    <div className="flex justify-between mb-1">
                      <span className="text-xs font-bold text-slate-400">Piso {room.floor}</span>
                      <Badge className={cn('text-[10px] px-1.5', getPriorityColor(room.priority))}>
                        {room.priority || 'N/A'}
                      </Badge>
                    </div>
                    <p className="text-sm text-slate-700 font-medium line-clamp-2">
                      {room.maintenance_description}
                    </p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        <div className="col-span-7">
          <Card className="border-slate-200 shadow-sm h-full">
            <CardHeader className="bg-slate-50 border-b pb-4">
              <CardTitle className="text-lg flex items-center gap-2">
                <MapPin className="w-5 h-5 text-slate-500" /> Mapa Visual de Acomodações
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <div className="flex gap-4 mb-6 text-sm">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-rose-500 rounded-sm"></div> Manutenção
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-emerald-400 rounded-sm"></div> Livre
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-blue-400 rounded-sm"></div> Ocupado
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-slate-300 rounded-sm"></div> Outros
                </div>
              </div>

              <div className="space-y-8">
                {floats.map((floor) => (
                  <div key={floor}>
                    <h3 className="text-sm font-bold text-slate-400 mb-3 border-b pb-1">
                      Andar {floor}
                    </h3>
                    <div className="flex flex-wrap gap-2">
                      {rooms
                        .filter((r) => r.floor === floor)
                        .map((room) => {
                          let bgColor = 'bg-slate-200 border-slate-300 text-slate-600'
                          if (room.status === 'maintenance')
                            bgColor =
                              'bg-rose-500 border-rose-600 text-white shadow-sm ring-2 ring-rose-200 animate-pulse'
                          if (room.status === 'available')
                            bgColor = 'bg-emerald-100 border-emerald-200 text-emerald-700'
                          if (room.status === 'occupied')
                            bgColor = 'bg-blue-100 border-blue-200 text-blue-700'

                          return (
                            <div
                              key={room.id}
                              className={cn(
                                'w-14 h-14 rounded-md border flex items-center justify-center font-mono font-bold text-sm transition-transform hover:scale-105',
                                bgColor,
                              )}
                              title={
                                room.status === 'maintenance'
                                  ? room.maintenance_description
                                  : room.status
                              }
                            >
                              {room.room_number}
                            </div>
                          )
                        })}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
