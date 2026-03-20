import { useState, useEffect, useMemo } from 'react'
import { Calendar } from '@/components/ui/calendar'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { CalendarDays, AlertCircle } from 'lucide-react'
import pb from '@/lib/pocketbase/client'
import { useRealtime } from '@/hooks/use-realtime'
import { CalendarEvent, getCalendarEvents, createCalendarEvent } from '@/services/calendar'
import { useToast } from '@/components/ui/use-toast'

interface ModuleCalendarProps {
  sector: string
  title?: string
}

type UnifiedEvent = {
  id: string
  title: string
  description: string
  dateStr: string
  type: string
  source: 'internal' | 'external'
}

const typeColors: Record<string, string> = {
  task: 'bg-blue-100 text-blue-800 border-blue-200',
  training: 'bg-purple-100 text-purple-800 border-purple-200',
  blockout: 'bg-rose-100 text-rose-800 border-rose-200',
  maintenance: 'bg-orange-100 text-orange-800 border-orange-200',
  urgent: 'bg-amber-100 text-amber-900 border-amber-300 font-bold',
}

export function ModuleCalendar({ sector, title = 'Calendário de Operações' }: ModuleCalendarProps) {
  const [date, setDate] = useState<Date | undefined>(new Date())
  const [events, setEvents] = useState<CalendarEvent[]>([])
  const [extData, setExtData] = useState<any[]>([])
  const [open, setOpen] = useState(false)
  const { toast } = useToast()

  const [form, setForm] = useState({
    title: '',
    description: '',
    date: new Date().toISOString().split('T')[0],
    type: 'task',
  })

  const fetchAll = async () => {
    try {
      const res = await getCalendarEvents(sector)
      setEvents(res)

      if (sector === 'maintenance') {
        const rooms = await pb.collection('rooms').getFullList({ filter: "status='maintenance'" })
        setExtData(rooms)
      } else if (sector === 'it') {
        const tickets = await pb
          .collection('it_tickets')
          .getFullList({ filter: "status!='closed'" })
        setExtData(tickets)
      } else if (sector === 'hr') {
        const trainings = await pb.collection('hr_trainings').getFullList()
        setExtData(trainings)
      }
    } catch (e) {
      console.error(e)
    }
  }

  useEffect(() => {
    fetchAll()
  }, [sector])

  useRealtime('calendar_events', fetchAll)
  useRealtime('rooms', fetchAll, sector === 'maintenance')
  useRealtime('it_tickets', fetchAll, sector === 'it')
  useRealtime('hr_trainings', fetchAll, sector === 'hr')

  const unifiedEvents = useMemo<UnifiedEvent[]>(() => {
    const list: UnifiedEvent[] = events.map((e) => ({
      id: e.id,
      title: e.title,
      description: e.description,
      dateStr: e.start_date.substring(0, 10),
      type: e.type,
      source: 'internal',
    }))

    extData.forEach((e) => {
      if (sector === 'maintenance') {
        list.push({
          id: e.id,
          title: `Quarto ${e.room_number} - Manutenção`,
          description: e.maintenance_description || 'Requer atenção',
          dateStr: e.updated.split(' ')[0],
          type: 'urgent',
          source: 'external',
        })
      } else if (sector === 'it') {
        list.push({
          id: e.id,
          title: `Ticket: ${e.category}`,
          description: e.description,
          dateStr: e.created.split(' ')[0],
          type: 'urgent',
          source: 'external',
        })
      } else if (sector === 'hr') {
        list.push({
          id: e.id,
          title: `Treinamento: ${e.title}`,
          description: e.description,
          dateStr: e.created.split(' ')[0],
          type: 'training',
          source: 'external',
        })
      }
    })
    return list.sort((a, b) => a.dateStr.localeCompare(b.dateStr))
  }, [events, extData, sector])

  const datesWithEvents = useMemo(() => {
    return unifiedEvents.map((e) => {
      const [y, m, d] = e.dateStr.split('-').map(Number)
      return new Date(y, m - 1, d)
    })
  }, [unifiedEvents])

  const toISODate = (d?: Date) => {
    if (!d) return ''
    return new Date(d.getTime() - d.getTimezoneOffset() * 60000).toISOString().split('T')[0]
  }

  const selectedDateStr = toISODate(date)
  const dayEvents = unifiedEvents.filter((e) => e.dateStr === selectedDateStr)

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      await createCalendarEvent({
        title: form.title,
        description: form.description,
        start_date: form.date,
        end_date: form.date,
        type: form.type as any,
        sector,
      })
      setOpen(false)
      setForm({ ...form, title: '', description: '' })
      toast({ title: 'Evento criado com sucesso!' })
    } catch (err) {
      toast({ title: 'Erro ao criar evento', variant: 'destructive' })
    }
  }

  return (
    <div className="grid gap-6 md:grid-cols-12 animate-fade-in">
      <Card className="md:col-span-4 lg:col-span-3 border-slate-200 shadow-sm flex flex-col items-center p-4">
        <Calendar
          mode="single"
          selected={date}
          onSelect={setDate}
          modifiers={{ hasEvent: datesWithEvents }}
          modifiersClassNames={{
            hasEvent: 'bg-slate-100 font-bold text-primary border-b-2 border-primary rounded-none',
          }}
          className="rounded-md"
        />
      </Card>

      <Card className="md:col-span-8 lg:col-span-9 border-slate-200 shadow-sm flex flex-col">
        <CardHeader className="flex flex-row items-center justify-between pb-4 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <CalendarDays className="w-5 h-5 text-slate-500" />
            <CardTitle className="text-lg text-slate-800">
              {title} - {date?.toLocaleDateString('pt-BR')}
            </CardTitle>
          </div>
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button size="sm" className="bg-slate-800 hover:bg-slate-900 text-white">
                Agendar Evento
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Novo Agendamento ({sector.toUpperCase()})</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleCreate} className="space-y-4 pt-4">
                <div className="space-y-2">
                  <Label>Título do Evento</Label>
                  <Input
                    required
                    value={form.title}
                    onChange={(e) => setForm({ ...form, title: e.target.value })}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Data</Label>
                    <Input
                      type="date"
                      required
                      value={form.date}
                      onChange={(e) => setForm({ ...form, date: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Categoria</Label>
                    <Select value={form.type} onValueChange={(v) => setForm({ ...form, type: v })}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="task">Tarefa Agendada</SelectItem>
                        <SelectItem value="training">Treinamento</SelectItem>
                        <SelectItem value="maintenance">Manutenção Rotineira</SelectItem>
                        <SelectItem value="blockout">Data Bloqueada / Indisponível</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Descrição</Label>
                  <Textarea
                    value={form.description}
                    onChange={(e) => setForm({ ...form, description: e.target.value })}
                  />
                </div>
                <Button type="submit" className="w-full">
                  Salvar Evento
                </Button>
              </form>
            </DialogContent>
          </Dialog>
        </CardHeader>
        <CardContent className="p-0 flex-1 bg-slate-50/50">
          {dayEvents.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-48 text-slate-400 space-y-2">
              <CalendarDays className="w-8 h-8 opacity-20" />
              <p className="text-sm">Nenhum evento agendado para esta data.</p>
            </div>
          ) : (
            <div className="divide-y divide-slate-100">
              {dayEvents.map((event) => (
                <div key={event.id} className="p-4 hover:bg-white transition-colors flex gap-4">
                  <div className="pt-1">
                    {event.type === 'urgent' ? (
                      <AlertCircle className="w-5 h-5 text-amber-500" />
                    ) : (
                      <div className="w-2 h-2 rounded-full bg-slate-400 mt-1.5" />
                    )}
                  </div>
                  <div className="flex-1 space-y-1">
                    <div className="flex items-start justify-between gap-2">
                      <h4 className="font-medium text-slate-800">{event.title}</h4>
                      <Badge
                        variant="outline"
                        className={`capitalize text-[10px] ${typeColors[event.type] || typeColors.task}`}
                      >
                        {event.type}
                      </Badge>
                    </div>
                    {event.description && (
                      <p className="text-sm text-slate-500 line-clamp-2">{event.description}</p>
                    )}
                    {event.source === 'external' && (
                      <span className="text-[10px] font-mono text-slate-400 bg-slate-100 px-1.5 py-0.5 rounded">
                        Sistema Externo (Log Urgente)
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
