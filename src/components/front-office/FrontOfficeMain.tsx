import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import {
  BedDouble,
  CalendarCheck,
  DoorOpen,
  Users,
  LogIn,
  LogOut,
  FileText,
  Send,
} from 'lucide-react'
import { PBReservation, getReservations } from '@/services/reservations'
import { getRooms, RoomRecord } from '@/services/rooms'
import { useRealtime } from '@/hooks/use-realtime'
import { Badge } from '@/components/ui/badge'

export function FrontOfficeMain({ onNavigate }: { onNavigate: (tab: string) => void }) {
  const [reservations, setReservations] = useState<PBReservation[]>([])
  const [rooms, setRooms] = useState<RoomRecord[]>([])

  const loadData = async () => {
    Promise.all([getReservations(), getRooms()])
      .then(([res, rms]) => {
        setReservations(res)
        setRooms(rms)
      })
      .catch(console.error)
  }

  useEffect(() => {
    loadData()
  }, [])
  useRealtime('reservations', loadData)
  useRealtime('rooms', loadData)

  const todayStr = new Date().toISOString().split('T')[0]
  const expectedCheckIns = reservations.filter(
    (r) => r.check_in === todayStr && r.status === 'previsto',
  )
  const expectedCheckOuts = reservations.filter(
    (r) => r.check_out === todayStr && r.status === 'in_house',
  )
  const inHouse = reservations.filter((r) => r.status === 'in_house')

  const readyRooms = rooms.filter((r) => r.status === 'available').length
  const dirtyRooms = rooms.filter((r) => r.status === 'cleaning').length
  const maintRooms = rooms.filter((r) => r.status === 'maintenance').length

  return (
    <div className="space-y-6 animate-fade-in pb-8">
      <div className="grid gap-4 md:grid-cols-4">
        <Card className="border-slate-200 shadow-sm">
          <CardContent className="p-4 flex items-center gap-4">
            <div className="bg-blue-100 p-3 rounded-full">
              <Users className="w-5 h-5 text-blue-700" />
            </div>
            <div>
              <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">In-House</p>
              <h3 className="text-2xl font-black text-slate-800">
                {inHouse.length}{' '}
                <span className="text-sm font-normal text-slate-400">hóspedes</span>
              </h3>
            </div>
          </CardContent>
        </Card>
        <Card className="border-slate-200 shadow-sm">
          <CardContent className="p-4 flex items-center gap-4">
            <div className="bg-emerald-100 p-3 rounded-full">
              <CalendarCheck className="w-5 h-5 text-emerald-700" />
            </div>
            <div>
              <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                Check-ins Previstos
              </p>
              <h3 className="text-2xl font-black text-slate-800">{expectedCheckIns.length}</h3>
            </div>
          </CardContent>
        </Card>
        <Card className="border-slate-200 shadow-sm">
          <CardContent className="p-4 flex items-center gap-4">
            <div className="bg-amber-100 p-3 rounded-full">
              <DoorOpen className="w-5 h-5 text-amber-700" />
            </div>
            <div>
              <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                Check-outs Hoje
              </p>
              <h3 className="text-2xl font-black text-slate-800">{expectedCheckOuts.length}</h3>
            </div>
          </CardContent>
        </Card>
        <Card className="border-slate-200 shadow-sm">
          <CardContent className="p-4 flex items-center gap-4">
            <div className="bg-rose-100 p-3 rounded-full">
              <BedDouble className="w-5 h-5 text-rose-700" />
            </div>
            <div>
              <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                Status Quartos
              </p>
              <div className="flex gap-2 text-xs font-bold mt-1">
                <span className="bg-emerald-50 text-emerald-700 px-1.5 py-0.5 rounded border border-emerald-100">
                  {readyRooms} L
                </span>
                <span className="bg-amber-50 text-amber-700 px-1.5 py-0.5 rounded border border-amber-100">
                  {dirtyRooms} S
                </span>
                <span className="bg-rose-50 text-rose-700 px-1.5 py-0.5 rounded border border-rose-100">
                  {maintRooms} M
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <Card className="shadow-sm border-slate-200">
          <CardHeader className="pb-3 border-b bg-slate-50/50">
            <CardTitle className="text-lg text-slate-800">Ações Rápidas (Quick Actions)</CardTitle>
          </CardHeader>
          <CardContent className="p-4 grid grid-cols-2 gap-3">
            <Button
              variant="outline"
              className="justify-start gap-2 h-12 shadow-sm"
              onClick={() => onNavigate('checkin')}
            >
              <LogIn className="w-4 h-4 text-emerald-500" /> Efetuar Check-in
            </Button>
            <Button
              variant="outline"
              className="justify-start gap-2 h-12 shadow-sm"
              onClick={() => onNavigate('checkout')}
            >
              <LogOut className="w-4 h-4 text-rose-500" /> Efetuar Check-out
            </Button>
            <Button variant="outline" className="justify-start gap-2 h-12 shadow-sm">
              <FileText className="w-4 h-4 text-blue-500" /> Criar Reserva Nova
            </Button>
            <Button variant="outline" className="justify-start gap-2 h-12 shadow-sm">
              <Send className="w-4 h-4 text-amber-500" /> Pedido para Departamentos
            </Button>
          </CardContent>
        </Card>
        <Card className="shadow-sm border-slate-200">
          <CardHeader className="pb-3 border-b bg-slate-50/50">
            <CardTitle className="text-lg text-slate-800">Listas Operacionais (Hoje)</CardTitle>
          </CardHeader>
          <CardContent className="p-0 divide-y max-h-60 overflow-y-auto">
            {expectedCheckIns.map((r) => (
              <div
                key={r.id}
                className="p-3 flex justify-between items-center hover:bg-slate-50 transition-colors"
              >
                <div>
                  <p className="font-semibold text-sm text-slate-800">{r.guest_name}</p>
                  <p className="text-xs text-slate-500">
                    Quarto Previsto: {r.expand?.room_id?.room_number || 'Não alocado'}
                  </p>
                </div>
                <Badge
                  variant="outline"
                  className="bg-emerald-50 text-emerald-700 border-emerald-200"
                >
                  Chegada Pendente
                </Badge>
              </div>
            ))}
            {expectedCheckOuts.map((r) => (
              <div
                key={r.id}
                className="p-3 flex justify-between items-center hover:bg-slate-50 transition-colors"
              >
                <div>
                  <p className="font-semibold text-sm text-slate-800">{r.guest_name}</p>
                  <p className="text-xs text-slate-500">
                    Quarto Ocupado: {r.expand?.room_id?.room_number}
                  </p>
                </div>
                <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200">
                  Saída Pendente
                </Badge>
              </div>
            ))}
            {expectedCheckIns.length === 0 && expectedCheckOuts.length === 0 && (
              <div className="p-6 text-center text-slate-400 text-sm">
                Nenhuma movimentação pendente para hoje.
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
