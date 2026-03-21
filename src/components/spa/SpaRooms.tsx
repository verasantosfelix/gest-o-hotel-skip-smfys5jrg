import { useState, useEffect } from 'react'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import { Checkbox } from '@/components/ui/checkbox'
import { getSpaRooms, updateSpaRoom, SpaRoom } from '@/services/spa'
import { useRealtime } from '@/hooks/use-realtime'
import { DoorOpen, Sparkles, AlertTriangle } from 'lucide-react'
import { toast } from '@/components/ui/use-toast'
import useAuthStore from '@/stores/useAuthStore'

export function SpaRooms() {
  const { userRole } = useAuthStore()
  const isFrontDesk = userRole === 'Front_Desk'

  const [rooms, setRooms] = useState<SpaRoom[]>([])
  const [checklistRoom, setChecklistRoom] = useState<SpaRoom | null>(null)
  const [checks, setChecks] = useState({ c1: false, c2: false, c3: false, c4: false })

  const loadData = async () => {
    if (isFrontDesk) return
    try {
      const data = await getSpaRooms()
      setRooms(data)
    } catch (e) {
      setRooms([])
    }
  }

  useEffect(() => {
    loadData()
  }, [isFrontDesk])

  useRealtime('spa_rooms', loadData, !isFrontDesk)

  if (isFrontDesk) return null

  const handleChecklistSubmit = async () => {
    if (checklistRoom) {
      await updateSpaRoom(checklistRoom.id, { status: 'free' })
      toast({ title: 'Sala liberada para uso.' })
      setChecklistRoom(null)
      setChecks({ c1: false, c2: false, c3: false, c4: false })
    }
  }

  const statusColors: Record<string, string> = {
    free: 'bg-emerald-100 text-emerald-800 border-emerald-200',
    occupied: 'bg-rose-100 text-rose-800 border-rose-200',
    cleaning: 'bg-amber-100 text-amber-800 border-amber-200',
    maintenance: 'bg-slate-100 text-slate-800 border-slate-200',
  }

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
        <DoorOpen className="w-5 h-5" /> Salas de Tratamento
      </h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
        {rooms.map((r) => (
          <Card key={r.id} className={`border ${statusColors[r.status]}`}>
            <CardHeader className="pb-2">
              <CardTitle className="text-base flex justify-between items-center">
                {r.name}
                <Badge variant="outline" className="uppercase text-[10px] bg-white/50">
                  {r.status}
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {r.status === 'occupied' && (
                <div className="flex items-center gap-1.5 text-xs font-bold text-rose-800 mb-2">
                  <AlertTriangle className="w-4 h-4" /> DND ATIVO (Em Sessão)
                </div>
              )}
              {r.status === 'cleaning' && (
                <Button
                  size="sm"
                  className="w-full mt-2 gap-2 bg-amber-600 hover:bg-amber-700"
                  onClick={() => setChecklistRoom(r)}
                >
                  <Sparkles className="w-4 h-4" /> Realizar Checklist
                </Button>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      <Dialog open={!!checklistRoom} onOpenChange={(o) => !o && setChecklistRoom(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Checklist de Preparação - {checklistRoom?.name}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="flex items-center gap-3">
              <Checkbox
                checked={checks.c1}
                onCheckedChange={(c) => setChecks({ ...checks, c1: !!c })}
              />
              <label className="text-sm font-medium">Higienizar superfícies e maca</label>
            </div>
            <div className="flex items-center gap-3">
              <Checkbox
                checked={checks.c2}
                onCheckedChange={(c) => setChecks({ ...checks, c2: !!c })}
              />
              <label className="text-sm font-medium">Trocar toalhas e lençóis</label>
            </div>
            <div className="flex items-center gap-3">
              <Checkbox
                checked={checks.c3}
                onCheckedChange={(c) => setChecks({ ...checks, c3: !!c })}
              />
              <label className="text-sm font-medium">Ajustar Clima / Iluminação / Som</label>
            </div>
            <div className="flex items-center gap-3">
              <Checkbox
                checked={checks.c4}
                onCheckedChange={(c) => setChecks({ ...checks, c4: !!c })}
              />
              <label className="text-sm font-medium">Separar produtos próxima sessão</label>
            </div>
          </div>
          <DialogFooter>
            <Button
              disabled={!checks.c1 || !checks.c2 || !checks.c3 || !checks.c4}
              onClick={handleChecklistSubmit}
            >
              Confirmar Sala Pronta
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
