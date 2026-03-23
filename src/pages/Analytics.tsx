import { useState, useEffect } from 'react'
import { BarChart as BarChartIcon, Users, TrendingUp } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, LineChart, Line } from 'recharts'
import { useAccess } from '@/hooks/use-access'
import { RestrictedAccess } from '@/components/RestrictedAccess'
import { getReservations, PBReservation } from '@/services/reservations'
import { getRooms, RoomRecord } from '@/services/rooms'
import { formatCurrency } from '@/lib/utils'

export default function Analytics() {
  const { hasAccess } = useAccess()
  const [reservations, setReservations] = useState<PBReservation[]>([])
  const [rooms, setRooms] = useState<RoomRecord[]>([])

  useEffect(() => {
    Promise.all([getReservations(), getRooms()]).then(([res, rms]) => {
      setReservations(res)
      setRooms(rms)
    })
  }, [])

  if (!hasAccess(['Administrativo_Financeiro', 'Direcao_Admin'], 'Analytics')) {
    return <RestrictedAccess requiredRoles={['Administrativo_Financeiro', 'Direcao_Admin']} />
  }

  // Calculate KPIs
  const totalRooms = rooms.length
  const occupiedRooms = reservations.filter((r) => r.status === 'in_house').length
  const occupancyRate = totalRooms > 0 ? (occupiedRooms / totalRooms) * 100 : 0

  const todaysRevenue = reservations
    .filter((r) => r.status === 'in_house')
    .reduce((sum, r) => sum + (r.balance || 12000), 0)

  const revPar = totalRooms > 0 ? todaysRevenue / totalRooms : 0

  const chartConfig = {
    occ: { label: 'Ocupação (%)', color: 'hsl(var(--primary))' },
  }

  const chartConfigRev = {
    rev: { label: 'RevPAR', color: 'hsl(var(--primary))' },
  }

  const mockOccData = [
    { day: 'Seg', occ: 60 },
    { day: 'Ter', occ: 65 },
    { day: 'Qua', occ: 70 },
    { day: 'Qui', occ: 80 },
    { day: 'Sex', occ: 95 },
    { day: 'Sáb', occ: 98 },
    { day: 'Dom', occ: 85 },
  ]

  const mockRevData = [
    { day: 'Seg', rev: 5000 },
    { day: 'Ter', rev: 5500 },
    { day: 'Qua', rev: 6000 },
    { day: 'Qui', rev: 8000 },
    { day: 'Sex', rev: 12000 },
    { day: 'Sáb', rev: 13500 },
    { day: 'Dom', rev: 9000 },
  ]

  return (
    <div className="space-y-6 animate-fade-in pb-8">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-3 bg-blue-100 rounded-lg shadow-sm border border-blue-200">
          <BarChartIcon className="w-6 h-6 text-blue-700" />
        </div>
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            Performance Analytics
          </h1>
          <p className="text-sm text-slate-500">Métricas financeiras e de ocupação consolidadas</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="shadow-sm border-slate-200 hover:shadow-md transition-shadow">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-bold text-slate-500 uppercase tracking-wider flex items-center gap-2">
              <Users className="w-4 h-4 text-blue-500" /> Average Occupancy Rate
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-black text-slate-800">{occupancyRate.toFixed(1)}%</div>
            <p className="text-xs text-slate-400 mt-2 font-medium">
              Hoje: {occupiedRooms} de {totalRooms} quartos ocupados
            </p>
          </CardContent>
        </Card>

        <Card className="shadow-sm border-slate-200 hover:shadow-md transition-shadow">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-bold text-slate-500 uppercase tracking-wider flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-emerald-500" /> RevPAR (Rev. Per Available Room)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-black text-emerald-600">
              {formatCurrency(revPar, 'AOA')}
            </div>
            <p className="text-xs text-slate-400 mt-2 font-medium">
              Receita diária estimada / Quartos disponíveis
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="border-slate-200 shadow-sm">
          <CardHeader className="bg-slate-50 border-b pb-4">
            <CardTitle className="text-lg">Histórico de Ocupação (7 Dias)</CardTitle>
          </CardHeader>
          <CardContent className="pt-6">
            <ChartContainer config={chartConfig} className="h-[250px] w-full">
              <BarChart data={mockOccData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} opacity={0.3} />
                <XAxis dataKey="day" axisLine={false} tickLine={false} />
                <YAxis axisLine={false} tickLine={false} />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Bar dataKey="occ" fill="var(--color-occ)" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ChartContainer>
          </CardContent>
        </Card>

        <Card className="border-slate-200 shadow-sm">
          <CardHeader className="bg-slate-50 border-b pb-4">
            <CardTitle className="text-lg">Evolução do RevPAR</CardTitle>
          </CardHeader>
          <CardContent className="pt-6">
            <ChartContainer config={chartConfigRev} className="h-[250px] w-full">
              <LineChart data={mockRevData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} opacity={0.3} />
                <XAxis dataKey="day" axisLine={false} tickLine={false} />
                <YAxis axisLine={false} tickLine={false} />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Line
                  type="monotone"
                  dataKey="rev"
                  stroke="var(--color-rev)"
                  strokeWidth={3}
                  dot={{ r: 4 }}
                />
              </LineChart>
            </ChartContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
