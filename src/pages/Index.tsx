import { Navigate } from 'react-router-dom'
import { useEffect, useState } from 'react'
import {
  BedDouble,
  ShieldCheck,
  TerminalSquare,
  PackageSearch,
  Sparkles,
  AlertCircle,
  LayoutGrid,
  Users,
  CalendarCheck,
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import useHotelStore from '@/stores/useHotelStore'
import useInventoryStore from '@/stores/useInventoryStore'
import useAuthStore from '@/stores/useAuthStore'
import useRoomStore from '@/stores/useRoomStore'
import useReservationStore from '@/stores/useReservationStore'
import { CheckIn } from '@/components/operations/CheckIn'
import { CheckOut } from '@/components/operations/CheckOut'
import { Consumption } from '@/components/operations/Consumption'
import { FinancialDashboard } from '@/components/operations/FinancialDashboard'
import { InventoryManagement } from '@/components/operations/InventoryManagement'
import { getRooms, RoomRecord } from '@/services/rooms'
import { useRealtime } from '@/hooks/use-realtime'
import { cn } from '@/lib/utils'

export default function Index() {
  const { userRole } = useAuthStore()
  const { selectedHotel } = useHotelStore()
  const { items } = useInventoryStore()
  const { rooms: localRooms } = useRoomStore()
  const { reservations } = useReservationStore()

  const [dbRooms, setDbRooms] = useState<RoomRecord[]>([])

  useEffect(() => {
    getRooms().then(setDbRooms).catch(console.error)
  }, [])
  useRealtime('rooms', () => getRooms().then(setDbRooms))

  if (userRole === 'Lavanderia_Limpeza') return <Navigate to="/governanca" replace />
  if (userRole === 'Restaurante_Bar') return <Navigate to="/fnb" replace />
  if (userRole === 'Spa_Wellness') return <Navigate to="/spa" replace />
  if (userRole === 'Manutencao_Oficina') return <Navigate to="/manutencao" replace />
  if (userRole === 'Tecnologia_TI') return <Navigate to="/it-admin" replace />
  if (userRole === 'Administrativo_Financeiro') return <Navigate to="/financeiro-corp" replace />

  const isFrontOffice = userRole === 'Rececao_FrontOffice'
  const isExecutive = userRole === 'Direcao_Admin'

  const inHouseCount = reservations.filter((r) => r.status === 'checked-in').length
  const pendingCheckins = reservations.filter((r) => r.status === 'confirmed').length
  const dirtyRooms = localRooms.filter((r) => r.cleaningStatus === 'Sujo').length
  const availableRooms = dbRooms.filter((r) => r.status === 'available').length

  // ==========================================
  // PROFILE 8: DIRECAO_ADMIN (EXECUTIVE) VIEW
  // ==========================================
  if (isExecutive) {
    const kpis = [
      {
        title: 'Ocupação',
        value: '82%',
        desc: `${availableRooms} quartos disp.`,
        icon: BedDouble,
        color: 'text-blue-600',
      },
      {
        title: 'Check-ins',
        value: pendingCheckins.toString(),
        desc: 'Pendentes hoje',
        icon: ShieldCheck,
        color: 'text-emerald-600',
      },
      {
        title: 'Limpeza',
        value: dirtyRooms.toString(),
        desc: 'Quartos sujos',
        icon: Sparkles,
        color: dirtyRooms > 0 ? 'text-amber-500' : 'text-emerald-600',
      },
      {
        title: 'RevPAR',
        value: 'R$ 450',
        desc: '+12% vs Ontem',
        icon: LayoutGrid,
        color: 'text-purple-600',
      },
    ]

    return (
      <div className="space-y-6 animate-fade-in-up pb-8">
        <div className="mb-4">
          <h1 className="text-3xl font-black tracking-tight text-slate-900">Executive Dashboard</h1>
          <p className="text-slate-500">Visão Geral da Operação - {selectedHotel.name}</p>
        </div>

        {/* MOBILE: Minimalist KPIs */}
        <div className="grid grid-cols-1 gap-3 md:hidden">
          {kpis.map((kpi, i) => (
            <Card key={i} className="border-slate-200">
              <CardContent className="p-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className={`p-2 bg-slate-50 rounded-lg ${kpi.color}`}>
                    <kpi.icon className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-slate-600">{kpi.title}</p>
                    <p className="text-xs text-slate-400">{kpi.desc}</p>
                  </div>
                </div>
                <span className="text-2xl font-black text-slate-800">{kpi.value}</span>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* TABLET: 2 Metrics Focus */}
        <div className="hidden md:grid lg:hidden grid-cols-2 gap-4">
          <Card className="bg-slate-900 text-white border-slate-800 shadow-lg">
            <CardContent className="p-6">
              <BedDouble className="w-8 h-8 text-blue-400 mb-4" />
              <p className="text-sm text-slate-400 font-bold uppercase tracking-wider">
                Taxa de Ocupação Global
              </p>
              <h2 className="text-5xl font-black mt-2">82%</h2>
              <p className="text-sm text-emerald-400 mt-2 font-mono">+5% projeção fim de semana</p>
            </CardContent>
          </Card>
          <Card className="bg-emerald-50 border-emerald-200 shadow-sm">
            <CardContent className="p-6">
              <LayoutGrid className="w-8 h-8 text-emerald-600 mb-4" />
              <p className="text-sm text-emerald-800 font-bold uppercase tracking-wider">
                Receita (RevPAR)
              </p>
              <h2 className="text-5xl font-black mt-2 text-emerald-900">R$ 450</h2>
              <p className="text-sm text-emerald-600 mt-2 font-mono">Meta superada em 12%</p>
            </CardContent>
          </Card>
        </div>

        {/* DESKTOP: Full Dashboard */}
        <div className="hidden lg:grid grid-cols-4 gap-4 mb-6">
          {kpis.map((kpi, i) => (
            <Card
              key={`desk-${i}`}
              className="border-slate-200 shadow-sm hover:shadow-md transition-shadow"
            >
              <CardContent className="p-6">
                <div className="flex justify-between items-start mb-4">
                  <div className={`p-3 bg-slate-50 rounded-xl ${kpi.color}`}>
                    <kpi.icon className="w-6 h-6" />
                  </div>
                  <span className="text-3xl font-black text-slate-800">{kpi.value}</span>
                </div>
                <p className="text-sm font-bold text-slate-600">{kpi.title}</p>
                <p className="text-xs text-slate-400 mt-1">{kpi.desc}</p>
              </CardContent>
            </Card>
          ))}
        </div>
        <div className="hidden lg:grid grid-cols-1 gap-6">
          <FinancialDashboard />
        </div>
      </div>
    )
  }

  // ==========================================
  // PROFILE 4: RECECAO_FRONTOFFICE VIEW
  // ==========================================
  return (
    <div className="space-y-6 animate-fade-in-up pb-8">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">Front Office</h1>
        <p className="text-slate-500">Gestão Dinâmica de Recepção</p>
      </div>

      {/* MOBILE: Combined List */}
      <div className="block md:hidden space-y-6">
        <div className="space-y-3">
          <h2 className="font-bold text-slate-800 flex items-center gap-2">
            <Users className="w-4 h-4" /> In-House ({inHouseCount})
          </h2>
          {reservations
            .filter((r) => r.status === 'checked-in')
            .map((res) => (
              <Card key={res.id} className="border-l-4 border-l-emerald-500 shadow-sm">
                <CardContent className="p-3 flex justify-between items-center">
                  <div>
                    <p className="font-bold text-sm text-slate-900">{res.guestName}</p>
                    <p className="text-xs text-slate-500">Quarto {res.room || 'N/A'}</p>
                  </div>
                  <Badge variant="outline" className="text-[10px]">
                    Hospedado
                  </Badge>
                </CardContent>
              </Card>
            ))}
        </div>
        <div className="space-y-3">
          <h2 className="font-bold text-slate-800 flex items-center gap-2">
            <CalendarCheck className="w-4 h-4" /> Chegadas Hoje
          </h2>
          {reservations
            .filter((r) => r.status === 'confirmed')
            .map((res) => (
              <Card key={res.id} className="border-l-4 border-l-blue-500 shadow-sm">
                <CardContent className="p-3 flex justify-between items-center">
                  <div>
                    <p className="font-bold text-sm text-slate-900">{res.guestName}</p>
                    <p className="text-xs text-slate-500">{res.roomType}</p>
                  </div>
                  <Button size="sm" className="h-7 text-xs bg-slate-900">
                    Check-in
                  </Button>
                </CardContent>
              </Card>
            ))}
        </div>
      </div>

      {/* TABLET: Reservation Table Panel */}
      <div className="hidden md:block lg:hidden">
        <Card className="border-slate-200 shadow-sm">
          <CardHeader className="bg-slate-50 border-b pb-4">
            <CardTitle className="text-lg">Painel de Reservas</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="divide-y">
              {reservations.slice(0, 10).map((res) => (
                <div
                  key={res.id}
                  className="p-4 flex justify-between items-center hover:bg-slate-50"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center font-bold text-slate-600">
                      {res.guestName.charAt(0)}
                    </div>
                    <div>
                      <p className="font-bold text-slate-800">{res.guestName}</p>
                      <p className="text-xs text-slate-500">
                        ID: {res.id} | Tipo: {res.roomType}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <Badge
                      className={res.status === 'checked-in' ? 'bg-emerald-500' : 'bg-blue-500'}
                    >
                      {res.status}
                    </Badge>
                    <Button variant="outline" size="sm">
                      Gerenciar
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* DESKTOP: Command Center (Tabs + Rooms Grid) */}
      <div className="hidden lg:block space-y-6">
        <Tabs defaultValue="checkin" className="w-full">
          <TabsList className="bg-slate-100 p-1 mb-4">
            <TabsTrigger value="checkin">Check-in</TabsTrigger>
            <TabsTrigger value="checkout">Check-out</TabsTrigger>
            <TabsTrigger value="consumo">Lançamento de Consumo</TabsTrigger>
            <TabsTrigger value="mapa">Mapa de Ocupação (Ao Vivo)</TabsTrigger>
          </TabsList>

          <TabsContent value="checkin">
            <CheckIn />
          </TabsContent>
          <TabsContent value="checkout">
            <CheckOut />
          </TabsContent>
          <TabsContent value="consumo">
            <Consumption />
          </TabsContent>

          <TabsContent value="mapa" className="bg-white border rounded-lg shadow-sm p-6">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg font-bold text-slate-800">Status em Tempo Real (PMS)</h3>
              <div className="flex gap-4 text-sm font-medium">
                <span className="flex items-center gap-1">
                  <div className="w-3 h-3 bg-emerald-100 border border-emerald-300 rounded-sm"></div>{' '}
                  Livre
                </span>
                <span className="flex items-center gap-1">
                  <div className="w-3 h-3 bg-blue-100 border border-blue-300 rounded-sm"></div>{' '}
                  Ocupado
                </span>
                <span className="flex items-center gap-1">
                  <div className="w-3 h-3 bg-amber-100 border border-amber-300 rounded-sm"></div>{' '}
                  Limpeza
                </span>
                <span className="flex items-center gap-1">
                  <div className="w-3 h-3 bg-rose-100 border border-rose-300 rounded-sm"></div>{' '}
                  Bloqueado
                </span>
              </div>
            </div>
            <div className="grid grid-cols-8 gap-3">
              {dbRooms.map((room) => {
                let color = 'bg-slate-50 border-slate-200 text-slate-700'
                if (room.status === 'available')
                  color = 'bg-emerald-50 border-emerald-200 text-emerald-800 hover:bg-emerald-100'
                if (room.status === 'occupied')
                  color = 'bg-blue-50 border-blue-200 text-blue-800 shadow-inner'
                if (room.status === 'cleaning')
                  color = 'bg-amber-50 border-amber-200 text-amber-800'
                if (room.status === 'maintenance' || room.status === 'out_of_order')
                  color = 'bg-rose-50 border-rose-200 text-rose-800'

                return (
                  <div
                    key={room.id}
                    className={cn(
                      'aspect-square rounded-lg border-2 flex flex-col items-center justify-center p-2 cursor-pointer transition-all',
                      color,
                    )}
                  >
                    <span className="text-xl font-black font-mono">{room.room_number}</span>
                    <span className="text-[10px] uppercase font-bold opacity-70 mt-1">
                      {room.status.replace('_', ' ')}
                    </span>
                  </div>
                )
              })}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
