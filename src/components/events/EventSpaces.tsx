import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { getEventSpaces, EventSpace, updateEventSpace } from '@/services/events'
import { useRealtime } from '@/hooks/use-realtime'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Building, Users } from 'lucide-react'
import { toast } from '@/components/ui/use-toast'

export function EventSpaces() {
  const [spaces, setSpaces] = useState<EventSpace[]>([])

  const loadData = async () => {
    try {
      setSpaces(await getEventSpaces())
    } catch (e) {
      console.error(e)
    }
  }

  useEffect(() => {
    loadData()
  }, [])
  useRealtime('event_spaces', loadData)

  const changeLayout = async (id: string, layout: string) => {
    try {
      await updateEventSpace(id, { current_layout: layout })
      toast({
        title: 'Layout Atualizado',
        description: 'O formato da sala foi alterado com sucesso.',
      })
    } catch (e) {
      toast({ title: 'Erro ao atualizar layout', variant: 'destructive' })
    }
  }

  return (
    <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3">
      {spaces.map((space) => {
        const capacities = space.capacity_formats || {}
        const currentCapacity = capacities[space.current_layout] || 0

        return (
          <Card key={space.id} className="border-slate-200 shadow-sm flex flex-col">
            <CardHeader className="pb-3 border-b bg-slate-50/50">
              <CardTitle className="text-lg flex justify-between items-start gap-2">
                <span className="flex items-center gap-2">
                  <Building className="w-5 h-5 text-slate-500" />
                  <span className="line-clamp-1">{space.name}</span>
                </span>
                <Badge
                  variant={space.status === 'available' ? 'default' : 'secondary'}
                  className="uppercase text-[10px]"
                >
                  {space.status}
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4 flex-1 flex flex-col justify-between">
              <div className="mb-4">
                <p className="text-sm font-medium text-slate-500 uppercase tracking-wider mb-1">
                  Tipo
                </p>
                <p className="text-slate-900 font-semibold">{space.type.replace('_', ' ')}</p>
              </div>

              <div className="space-y-2">
                <p className="text-sm font-medium text-slate-500 uppercase tracking-wider">
                  Layout Atual
                </p>
                <Select
                  value={space.current_layout}
                  onValueChange={(val) => changeLayout(space.id, val)}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Selecione um layout" />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.keys(capacities).map((k) => (
                      <SelectItem key={k} value={k}>
                        {k.toUpperCase()} ({capacities[k]} pax)
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="mt-4 pt-4 border-t flex justify-between items-center text-sm text-slate-500">
                <span className="flex items-center gap-1">
                  <Users className="w-4 h-4" /> Capacidade Atual
                </span>
                <span className="font-bold text-slate-900">{currentCapacity} PAX</span>
              </div>
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
}
