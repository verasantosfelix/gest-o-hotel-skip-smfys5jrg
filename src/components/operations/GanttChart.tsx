import React from 'react'
import { addDays, differenceInDays, format, isSameDay, startOfDay } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { Badge } from '@/components/ui/badge'
import { PBReservation } from '@/services/reservations'
import { RoomRecord } from '@/services/rooms'
import { cn } from '@/lib/utils'
import { toast } from '@/components/ui/use-toast'
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet'
import { useState } from 'react'

export function GanttChart({
  reservations,
  rooms,
  onMove,
}: {
  reservations: (PBReservation & { expand?: { guest_id?: any }; total_value?: number })[]
  rooms: RoomRecord[]
  onMove: (id: string, roomId: string, checkIn: string, checkOut: string) => void
}) {
  const [selectedRes, setSelectedRes] = useState<
    (PBReservation & { expand?: { guest_id?: any }; total_value?: number }) | null
  >(null)
  const today = startOfDay(new Date())
  const startDate = addDays(today, -3)
  const daysCount = 30
  const days = Array.from({ length: daysCount }).map((_, i) => addDays(startDate, i))

  const handleDragStart = (e: React.DragEvent, res: PBReservation) => {
    e.dataTransfer.setData('resId', res.id)
  }

  const handleDrop = (e: React.DragEvent, roomId: string, dropDate: Date) => {
    e.preventDefault()
    const resId = e.dataTransfer.getData('resId')
    if (!resId) return

    const res = reservations.find((r) => r.id === resId)
    if (!res) return

    const duration = Math.max(
      1,
      differenceInDays(startOfDay(new Date(res.check_out)), startOfDay(new Date(res.check_in))),
    )
    const newCheckIn = dropDate
    const newCheckOut = addDays(newCheckIn, duration)

    // Conflict detection
    const conflict = reservations.find(
      (r) =>
        r.id !== res.id &&
        r.room_id === roomId &&
        r.status !== 'cancelado' &&
        r.status !== 'checked_out' &&
        startOfDay(new Date(r.check_in)) < newCheckOut &&
        startOfDay(new Date(r.check_out)) > newCheckIn,
    )

    if (conflict) {
      toast({
        title: 'Conflito de Reserva',
        description: 'O quarto já está ocupado neste período.',
        variant: 'destructive',
      })
      return
    }

    onMove(resId, roomId, format(newCheckIn, 'yyyy-MM-dd'), format(newCheckOut, 'yyyy-MM-dd'))
  }

  return (
    <div className="overflow-x-auto bg-white border border-slate-200 rounded-lg shadow-sm">
      <div className="inline-block min-w-full">
        {/* Header */}
        <div className="flex border-b border-slate-200 bg-slate-50 sticky top-0 z-10">
          <div className="w-48 shrink-0 border-r border-slate-200 p-3 font-semibold text-sm text-slate-700 flex items-center sticky left-0 bg-slate-50 z-20 shadow-[2px_0_5px_-2px_rgba(0,0,0,0.05)]">
            Acomodações
          </div>
          <div className="flex">
            {days.map((d, i) => (
              <div
                key={i}
                className={cn(
                  'w-16 shrink-0 border-r border-slate-200 p-2 text-center text-xs flex flex-col items-center justify-center text-slate-500',
                  isSameDay(d, today) && 'bg-blue-50 text-blue-700 font-bold border-blue-200',
                )}
              >
                <span className="uppercase text-[10px]">{format(d, 'EEE', { locale: ptBR })}</span>
                <span className="text-sm font-mono mt-0.5">{format(d, 'dd/MM')}</span>
              </div>
            ))}
          </div>
        </div>
        {/* Body */}
        <div className="relative">
          {rooms.map((room) => (
            <div
              key={room.id}
              className="flex border-b border-slate-100 group hover:bg-slate-50/50 h-16 transition-colors"
            >
              <div className="w-48 shrink-0 border-r border-slate-200 p-3 text-sm font-medium sticky left-0 bg-white group-hover:bg-slate-50/50 z-10 flex flex-col justify-center shadow-[2px_0_5px_-2px_rgba(0,0,0,0.05)]">
                <div className="flex items-center justify-between">
                  <span className="text-slate-900 font-bold">{room.room_number}</span>
                  <Badge variant="secondary" className="text-[9px] uppercase tracking-wider">
                    {room.room_type || 'STD'}
                  </Badge>
                </div>
              </div>
              <div className="flex relative">
                {days.map((d, i) => (
                  <div
                    key={i}
                    className={cn(
                      'w-16 shrink-0 border-r border-slate-100 border-dashed h-full',
                      isSameDay(d, today) && 'bg-blue-50/20 border-blue-100',
                    )}
                    onDragOver={(e) => e.preventDefault()}
                    onDrop={(e) => handleDrop(e, room.id, d)}
                  />
                ))}
                {/* Reservations */}
                {reservations
                  .filter((r) => r.room_id === room.id && r.status !== 'cancelado')
                  .map((res) => {
                    const checkIn = startOfDay(new Date(res.check_in))
                    const checkOut = startOfDay(new Date(res.check_out))
                    if (checkOut <= startDate || checkIn >= addDays(startDate, daysCount))
                      return null

                    const startOffset = Math.max(0, differenceInDays(checkIn, startDate))
                    const endOffset = Math.min(daysCount, differenceInDays(checkOut, startDate))
                    const width = endOffset - startOffset

                    if (width <= 0) return null

                    return (
                      <div
                        key={res.id}
                        draggable
                        onDragStart={(e) => handleDragStart(e, res)}
                        onClick={() => setSelectedRes(res)}
                        className={cn(
                          'absolute top-2 bottom-2 rounded-md border shadow-sm p-2 text-xs overflow-hidden cursor-grab active:cursor-grabbing hover:brightness-95 transition-all',
                          res.status === 'in_house'
                            ? 'bg-emerald-100 border-emerald-300 text-emerald-900'
                            : res.status === 'previsto'
                              ? 'bg-blue-100 border-blue-300 text-blue-900'
                              : 'bg-slate-100 border-slate-300 text-slate-800',
                        )}
                        style={{
                          left: `${startOffset * 4}rem`,
                          width: `${width * 4}rem`,
                          zIndex: 5,
                        }}
                        title={`${res.guest_name} (${res.check_in} a ${res.check_out})`}
                      >
                        <div className="font-semibold truncate">{res.guest_name}</div>
                        <div className="text-[10px] uppercase font-bold tracking-wider opacity-80 mt-0.5">
                          {res.status.replace('_', ' ')}
                        </div>
                      </div>
                    )
                  })}
              </div>
            </div>
          ))}
          {rooms.length === 0 && (
            <div className="p-8 text-center text-slate-500">Nenhum quarto disponível.</div>
          )}
        </div>
      </div>

      <Sheet open={!!selectedRes} onOpenChange={(open) => !open && setSelectedRes(null)}>
        <SheetContent>
          <SheetHeader>
            <SheetTitle>Detalhes da Reserva</SheetTitle>
          </SheetHeader>
          {selectedRes && (
            <div className="space-y-6 mt-6">
              <div className="space-y-4 text-sm">
                <div>
                  <span className="text-slate-500 block text-xs mb-1 uppercase tracking-wider">
                    Hóspede
                  </span>
                  <span className="font-medium text-slate-900 text-base">
                    {selectedRes.expand?.guest_id?.guest_name || selectedRes.guest_name}
                  </span>
                </div>
                <div>
                  <span className="text-slate-500 block text-xs mb-1 uppercase tracking-wider">
                    Status
                  </span>
                  <Badge variant={selectedRes.status === 'in_house' ? 'default' : 'secondary'}>
                    {selectedRes.status.replace('_', ' ')}
                  </Badge>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <span className="text-slate-500 block text-xs mb-1 uppercase tracking-wider">
                      Check-in
                    </span>
                    <span className="font-medium text-slate-900">{selectedRes.check_in}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block text-xs mb-1 uppercase tracking-wider">
                      Check-out
                    </span>
                    <span className="font-medium text-slate-900">{selectedRes.check_out}</span>
                  </div>
                </div>
                {selectedRes.expand?.guest_id && (
                  <div className="p-4 bg-slate-50 rounded-lg space-y-3 mt-2 border border-slate-100">
                    <h4 className="font-semibold text-slate-700 text-xs uppercase tracking-wider mb-2">
                      Informações do Hóspede
                    </h4>
                    {selectedRes.expand.guest_id.email && (
                      <div>
                        <span className="text-slate-500 block text-xs">Email</span>
                        <span className="font-medium text-slate-900">
                          {selectedRes.expand.guest_id.email}
                        </span>
                      </div>
                    )}
                    {selectedRes.expand.guest_id.phone && (
                      <div>
                        <span className="text-slate-500 block text-xs">Telefone</span>
                        <span className="font-medium text-slate-900">
                          {selectedRes.expand.guest_id.phone}
                        </span>
                      </div>
                    )}
                    {selectedRes.expand.guest_id.document_id && (
                      <div>
                        <span className="text-slate-500 block text-xs">Documento</span>
                        <span className="font-medium text-slate-900">
                          {selectedRes.expand.guest_id.document_id}
                        </span>
                      </div>
                    )}
                    {selectedRes.expand.guest_id.tier && (
                      <div>
                        <span className="text-slate-500 block text-xs">Nível (Fidelidade)</span>
                        <Badge variant="outline" className="mt-0.5">
                          {selectedRes.expand.guest_id.tier}
                        </Badge>
                      </div>
                    )}
                  </div>
                )}
                {selectedRes.total_value !== undefined && (
                  <div className="pt-2 border-t border-slate-100 mt-4">
                    <span className="text-slate-500 block text-xs mb-1 uppercase tracking-wider">
                      Valor Total
                    </span>
                    <span className="font-bold text-slate-900 text-lg">
                      R$ {selectedRes.total_value.toFixed(2)}
                    </span>
                  </div>
                )}
              </div>
            </div>
          )}
        </SheetContent>
      </Sheet>
    </div>
  )
}
