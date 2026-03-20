import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { toast } from '@/components/ui/use-toast'
import { Play, Check, Wrench } from 'lucide-react'
import { getEvents, updateEvent, updateEventSpace, HotelEvent } from '@/services/events'
import { createMaintenanceTicket } from '@/services/maintenance'
import { createHousekeepingLog } from '@/services/housekeeping'
import { createFinancialDoc } from '@/services/financial'
import { getRooms } from '@/services/rooms'
import { useRealtime } from '@/hooks/use-realtime'

export function EventOperations() {
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

  const handleStartSetup = async (evt: HotelEvent) => {
    try {
      await updateEvent(evt.id, { status: 'preparation' })
      if (evt.space_id) await updateEventSpace(evt.space_id, { status: 'setup' })
      const rooms = await getRooms()
      if (rooms.length > 0) {
        await createMaintenanceTicket({
          room_id: rooms[0].id,
          description: `Montagem AV para evento: ${evt.title}`,
          priority: 'high',
          status: 'open',
        })
      }
      toast({
        title: 'Setup Iniciado',
        description: 'Manutenção notificada via ticket de serviço.',
      })
    } catch (e) {
      toast({ title: 'Erro', variant: 'destructive' })
    }
  }

  const handleStartEvent = async (evt: HotelEvent) => {
    try {
      await updateEvent(evt.id, { status: 'ongoing' })
      if (evt.space_id) await updateEventSpace(evt.space_id, { status: 'occupied' })
      toast({ title: 'Evento em Execução', description: 'Status operacional atualizado.' })
    } catch (e) {}
  }

  const handleFinishEvent = async (evt: HotelEvent) => {
    try {
      await updateEvent(evt.id, { status: 'finished' })
      if (evt.space_id) await updateEventSpace(evt.space_id, { status: 'maintenance' })
      const rooms = await getRooms()
      if (rooms.length > 0) {
        await createHousekeepingLog({
          room_id: rooms[0].id,
          type: 'deep_cleaning',
          status: 'pending',
          checklist_progress: { note: `Limpeza pós evento: ${evt.title}` },
        })
      }
      await createFinancialDoc({
        doc_type: 'Receita',
        amount: evt.total_budget || 0,
        currency: 'AOA',
        status: 'Pendente',
        entity_name: evt.client_name,
        category: 'A/R',
        issue_date: new Date().toISOString().split('T')[0],
      })
      toast({
        title: 'Evento Encerrado',
        description: 'Faturamento emitido e Housekeeping notificado.',
      })
    } catch (e) {}
  }

  const renderColumn = (
    title: string,
    eventsList: HotelEvent[],
    actionFn: any,
    actionLabel: string,
    Icon: any,
    actionColor: string,
  ) => (
    <Card className="border-slate-200 shadow-sm bg-slate-50 h-full">
      <CardHeader className="pb-3 border-b">
        <CardTitle className="text-md font-bold text-slate-800">
          {title} ({eventsList.length})
        </CardTitle>
      </CardHeader>
      <CardContent className="p-3 space-y-3">
        {eventsList.map((evt) => (
          <Card key={evt.id} className="shadow-sm border-slate-200">
            <CardContent className="p-3">
              <div className="flex justify-between items-start mb-2">
                <p className="font-bold text-slate-900 leading-tight">{evt.title}</p>
                <Badge variant="outline" className="text-[10px]">
                  {evt.expand?.space_id?.name || 'Sem Sala'}
                </Badge>
              </div>
              <p className="text-xs text-slate-500 mb-3">
                {evt.participants_count} pax • {evt.client_name}
              </p>
              <Button
                size="sm"
                onClick={() => actionFn(evt)}
                className={`w-full gap-2 ${actionColor}`}
              >
                <Icon className="w-4 h-4" /> {actionLabel}
              </Button>
            </CardContent>
          </Card>
        ))}
        {eventsList.length === 0 && (
          <p className="text-xs text-center text-slate-400 py-4">Nenhum evento nesta fase.</p>
        )}
      </CardContent>
    </Card>
  )

  return (
    <div className="grid gap-4 md:grid-cols-3 items-start">
      {renderColumn(
        'Pendentes (Briefing)',
        events.filter((e) => e.status === 'pending'),
        handleStartSetup,
        'Iniciar Montagem',
        Wrench,
        'bg-amber-600 hover:bg-amber-700',
      )}
      {renderColumn(
        'Montagem (Setup)',
        events.filter((e) => e.status === 'preparation'),
        handleStartEvent,
        'Iniciar Evento',
        Play,
        'bg-blue-600 hover:bg-blue-700',
      )}
      {renderColumn(
        'Em Execução',
        events.filter((e) => e.status === 'ongoing'),
        handleFinishEvent,
        'Finalizar Evento',
        Check,
        'bg-emerald-600 hover:bg-emerald-700',
      )}
    </div>
  )
}
