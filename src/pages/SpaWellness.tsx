import { useState, useEffect } from 'react'
import { Heart, Clock, Calendar as CalendarIcon } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { useAccess } from '@/hooks/use-access'
import { RestrictedAccess } from '@/components/RestrictedAccess'
import { ModuleCalendar } from '@/components/dashboard/ModuleCalendar'
import { getCalendarEvents, CalendarEvent } from '@/services/calendar'
import { useRealtime } from '@/hooks/use-realtime'

export default function SpaWellness() {
  const { hasAccess } = useAccess()
  const [events, setEvents] = useState<CalendarEvent[]>([])

  const loadData = async () => {
    try {
      const data = await getCalendarEvents('spa')
      setEvents(data)
    } catch (e) {
      console.error(e)
    }
  }

  useEffect(() => {
    loadData()
  }, [])

  useRealtime('calendar_events', loadData)

  if (!hasAccess(['Spa_Wellness', 'Direcao_Admin'])) {
    return <RestrictedAccess requiredRoles={['Spa_Wellness', 'Direcao_Admin']} />
  }

  // Sort events by time for the linear views
  const sortedEvents = [...events].sort(
    (a, b) => new Date(a.start_date).getTime() - new Date(b.start_date).getTime(),
  )

  const groupEventsByDay = () => {
    const groups: Record<string, CalendarEvent[]> = {}
    sortedEvents.forEach((ev) => {
      const date = ev.start_date.split('T')[0] || ev.start_date.split(' ')[0]
      if (!groups[date]) groups[date] = []
      groups[date].push(ev)
    })
    return groups
  }

  const weeklyGroups = groupEventsByDay()

  return (
    <div className="space-y-6 animate-fade-in pb-8">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-3 bg-rose-100 rounded-full">
          <Heart className="w-6 h-6 text-rose-600" />
        </div>
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">Spa & Wellness</h1>
          <p className="text-sm text-slate-500">Agendas Dinâmicas</p>
        </div>
      </div>

      {/* MOBILE VIEW: Linear Hourly Agenda */}
      <div className="block md:hidden">
        <div className="relative border-l-2 border-rose-200 ml-3 space-y-6 pb-4">
          {sortedEvents.map((ev, i) => (
            <div key={ev.id} className="relative pl-6">
              <div className="absolute -left-[9px] top-1 w-4 h-4 bg-white border-2 border-rose-400 rounded-full" />
              <Card className="border-none shadow-sm bg-white">
                <CardContent className="p-3">
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-xs font-bold text-rose-600 flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {new Date(ev.start_date).toLocaleTimeString([], {
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </span>
                    <Badge variant="outline" className="text-[10px]">
                      {ev.type}
                    </Badge>
                  </div>
                  <h4 className="font-bold text-slate-800">{ev.title}</h4>
                  <p className="text-xs text-slate-500 mt-1">{ev.description}</p>
                </CardContent>
              </Card>
            </div>
          ))}
          {sortedEvents.length === 0 && <p className="pl-6 text-slate-500">Agenda livre.</p>}
        </div>
      </div>

      {/* TABLET VIEW: Card-based Weekly Layout */}
      <div className="hidden md:grid lg:hidden grid-cols-2 gap-4">
        {Object.entries(weeklyGroups).map(([date, dayEvents]) => (
          <Card key={date} className="border-slate-200 shadow-sm flex flex-col">
            <CardHeader className="bg-slate-50 pb-3 py-3 border-b">
              <CardTitle className="text-base flex items-center gap-2 text-slate-700">
                <CalendarIcon className="w-4 h-4" />
                {new Date(date).toLocaleDateString('pt-BR', {
                  weekday: 'long',
                  day: 'numeric',
                  month: 'short',
                })}
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4 flex-1 space-y-3">
              {dayEvents.map((ev) => (
                <div
                  key={ev.id}
                  className="p-3 bg-white border rounded-md shadow-sm border-slate-100"
                >
                  <div className="flex justify-between items-start">
                    <div className="font-medium text-slate-800">{ev.title}</div>
                    <Badge variant="secondary" className="bg-rose-50 text-rose-700">
                      {new Date(ev.start_date).toLocaleTimeString([], {
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </Badge>
                  </div>
                  <p className="text-sm text-slate-500 mt-1 line-clamp-1">{ev.description}</p>
                </div>
              ))}
            </CardContent>
          </Card>
        ))}
      </div>

      {/* DESKTOP VIEW: Full Calendar */}
      <div className="hidden lg:block">
        <ModuleCalendar sector="spa" title="Calendário Geral de Terapias" />
      </div>
    </div>
  )
}
