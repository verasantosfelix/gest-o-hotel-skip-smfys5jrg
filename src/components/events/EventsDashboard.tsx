import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { CalendarRange, Users, Settings2, CheckCircle2 } from 'lucide-react'
import { getEvents, HotelEvent } from '@/services/events'
import { useRealtime } from '@/hooks/use-realtime'
import { Badge } from '@/components/ui/badge'

export function EventsDashboard() {
  const [events, setEvents] = useState<HotelEvent[]>([])

  const loadData = async () => {
    try {
      setEvents(await getEvents())
    } catch (e) {
      console.error(e)
    }
  }

  useEffect(() => {
    loadData()
  }, [])
  useRealtime('events', loadData)

  const today = new Date().toISOString().split('T')[0]
  const todayEvents = events.filter((e) => e.start_time.startsWith(today))
  const participantsCount = todayEvents.reduce(
    (acc, curr) => acc + (curr.participants_count || 0),
    0,
  )
  const preparingCount = events.filter((e) => e.status === 'preparation').length
  const ongoingCount = events.filter((e) => e.status === 'ongoing').length

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-4">
        <Card className="border-slate-200 shadow-sm">
          <CardContent className="p-6 flex items-center gap-4">
            <div className="bg-purple-100 p-3 rounded-full">
              <CalendarRange className="w-6 h-6 text-purple-700" />
            </div>
            <div>
              <p className="text-sm font-medium text-slate-500">Eventos Hoje</p>
              <h3 className="text-2xl font-bold">{todayEvents.length}</h3>
            </div>
          </CardContent>
        </Card>
        <Card className="border-slate-200 shadow-sm">
          <CardContent className="p-6 flex items-center gap-4">
            <div className="bg-blue-100 p-3 rounded-full">
              <Users className="w-6 h-6 text-blue-700" />
            </div>
            <div>
              <p className="text-sm font-medium text-slate-500">Participantes Estimados</p>
              <h3 className="text-2xl font-bold">{participantsCount}</h3>
            </div>
          </CardContent>
        </Card>
        <Card className="border-slate-200 shadow-sm">
          <CardContent className="p-6 flex items-center gap-4">
            <div className="bg-amber-100 p-3 rounded-full">
              <Settings2 className="w-6 h-6 text-amber-700" />
            </div>
            <div>
              <p className="text-sm font-medium text-slate-500">Em Montagem</p>
              <h3 className="text-2xl font-bold">{preparingCount}</h3>
            </div>
          </CardContent>
        </Card>
        <Card className="border-slate-200 shadow-sm">
          <CardContent className="p-6 flex items-center gap-4">
            <div className="bg-emerald-100 p-3 rounded-full">
              <CheckCircle2 className="w-6 h-6 text-emerald-700" />
            </div>
            <div>
              <p className="text-sm font-medium text-slate-500">Em Execução</p>
              <h3 className="text-2xl font-bold">{ongoingCount}</h3>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="border-slate-200 shadow-sm">
        <CardHeader className="bg-slate-50 border-b pb-4">
          <CardTitle className="text-lg">Agenda Recente</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="divide-y">
            {events.slice(0, 5).map((e) => (
              <div
                key={e.id}
                className="flex justify-between items-center p-4 hover:bg-slate-50/50 transition-colors"
              >
                <div>
                  <p className="font-bold text-slate-900">{e.title}</p>
                  <p className="text-sm text-slate-500">
                    {e.client_name} • {new Date(e.start_time).toLocaleDateString()}
                  </p>
                </div>
                <Badge
                  variant={
                    e.status === 'ongoing'
                      ? 'default'
                      : e.status === 'finished'
                        ? 'secondary'
                        : 'outline'
                  }
                >
                  {e.status.toUpperCase()}
                </Badge>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
