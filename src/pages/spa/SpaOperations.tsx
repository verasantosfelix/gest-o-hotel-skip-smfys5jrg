import { useState, useEffect } from 'react'
import { DoorOpen, CalendarOff, Plus } from 'lucide-react'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import { useAccess } from '@/hooks/use-access'
import { RestrictedAccess } from '@/components/RestrictedAccess'
import {
  getSpaRooms,
  updateSpaRoom,
  SpaRoom,
  getUsers,
  getSpaBlockouts,
  createSpaBlockout,
  deleteSpaBlockout,
} from '@/services/spa'
import { toast } from '@/components/ui/use-toast'
import { format } from 'date-fns'
import { SpaAuditTab } from '@/components/spa/SpaAuditTab'

export default function SpaOperations() {
  const { hasAccess, canWrite } = useAccess()
  const hasAccessToOps = hasAccess([], 'Operações & Salas')

  const [rooms, setRooms] = useState<SpaRoom[]>([])
  const [therapists, setTherapists] = useState<any[]>([])
  const [blockouts, setBlockouts] = useState<any[]>([])

  const [roomOpen, setRoomOpen] = useState<SpaRoom | null>(null)
  const [newStatus, setNewStatus] = useState<any>('')

  const [blockoutOpen, setBlockoutOpen] = useState(false)
  const [boForm, setBoForm] = useState({ user_id: '', start: '', end: '', desc: '' })

  const loadData = async () => {
    if (!hasAccessToOps) return
    try {
      setRooms(await getSpaRooms())
      setTherapists(await getUsers())
      setBlockouts(await getSpaBlockouts())
    } catch (e) {
      console.error(e)
    }
  }

  useEffect(() => {
    loadData()
  }, [hasAccessToOps])

  if (!hasAccessToOps) {
    return <RestrictedAccess />
  }

  const handleRoomSave = async () => {
    if (!roomOpen || !newStatus) return
    try {
      await updateSpaRoom(roomOpen.id, { status: newStatus })
      toast({ title: 'Sala atualizada' })
      setRoomOpen(null)
      loadData()
    } catch (e) {
      toast({ variant: 'destructive', title: 'Erro' })
    }
  }

  const handleBoSave = async () => {
    if (!boForm.user_id || !boForm.start || !boForm.end) return
    try {
      await createSpaBlockout({
        title: 'Bloqueio SPA',
        description: boForm.desc,
        start_date: boForm.start,
        end_date: boForm.end,
        type: 'blockout',
        sector: 'spa',
        user_id: boForm.user_id,
      })
      toast({ title: 'Bloqueio adicionado' })
      setBlockoutOpen(false)
      loadData()
    } catch (e) {
      toast({ variant: 'destructive', title: 'Erro' })
    }
  }

  const handleDelBo = async (id: string) => {
    try {
      await deleteSpaBlockout(id)
      toast({ title: 'Removido' })
      loadData()
    } catch (e) {
      console.error(e)
    }
  }

  const roomColors: Record<string, string> = {
    free: 'bg-emerald-100 text-emerald-800 border-emerald-300',
    occupied: 'bg-rose-100 text-rose-800 border-rose-300',
    cleaning: 'bg-amber-100 text-amber-800 border-amber-300',
    maintenance: 'bg-slate-200 text-slate-800 border-slate-400',
  }

  return (
    <div className="space-y-8 animate-fade-in pb-8">
      <div className="flex items-center gap-4 mb-6 bg-white p-4 rounded-xl shadow-sm border border-slate-100">
        <img
          src="https://framerusercontent.com/images/kC6yO9N1R5iW3Y8D9m0i7E9gT0.png"
          alt="Complexo Agroturístico"
          className="h-14 object-contain"
        />
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            Operações e Infraestrutura SPA
          </h1>
          <p className="text-sm text-slate-500">Gestão de Salas, Escalas e Auditoria</p>
        </div>
      </div>

      <Tabs defaultValue="operations" className="space-y-6">
        <TabsList>
          <TabsTrigger value="operations">Salas e Escalas</TabsTrigger>
          <TabsTrigger value="audit">Auditoria de Aprovações</TabsTrigger>
        </TabsList>

        <TabsContent value="operations" className="space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
            <section className="space-y-4">
              <h2 className="text-lg font-bold flex items-center gap-2">
                <DoorOpen className="w-5 h-5" /> Salas de Tratamento
              </h2>
              <div className="grid grid-cols-2 gap-4">
                {rooms.map((r) => (
                  <Card
                    key={r.id}
                    className="transition-all cursor-pointer hover:shadow-md hover:-translate-y-1"
                    onClick={() => {
                      if (canWrite('Operações & Salas')) {
                        setRoomOpen(r)
                        setNewStatus(r.status)
                      }
                    }}
                  >
                    <CardContent className="p-4 flex flex-col items-center justify-center text-center gap-2">
                      <span className="font-bold text-slate-800">{r.name}</span>
                      <Badge
                        variant="outline"
                        className={`uppercase text-[10px] w-full justify-center ${roomColors[r.status]}`}
                      >
                        {r.status}
                      </Badge>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </section>

            <section className="space-y-4">
              <div className="flex justify-between items-center">
                <h2 className="text-lg font-bold flex items-center gap-2">
                  <CalendarOff className="w-5 h-5" /> Bloqueios & Escalas
                </h2>
                {canWrite('Operações & Salas') && (
                  <Button size="sm" onClick={() => setBlockoutOpen(true)}>
                    <Plus className="w-4 h-4 mr-1" /> Novo Bloqueio
                  </Button>
                )}
              </div>
              <div className="space-y-2">
                {blockouts.map((b) => (
                  <Card key={b.id} className="border-l-4 border-l-rose-400">
                    <CardContent className="p-3 flex justify-between items-center">
                      <div>
                        <p className="font-bold text-sm text-slate-800">
                          {b.expand?.user_id?.name || 'Terapeuta'}
                        </p>
                        <p className="text-xs text-slate-500">
                          {format(new Date(b.start_date), 'dd/MM HH:mm')} até{' '}
                          {format(new Date(b.end_date), 'dd/MM HH:mm')}
                        </p>
                      </div>
                      {canWrite('Operações & Salas') && (
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDelBo(b.id)}
                          className="text-rose-500 h-8 w-8"
                        >
                          &times;
                        </Button>
                      )}
                    </CardContent>
                  </Card>
                ))}
                {blockouts.length === 0 && (
                  <p className="text-slate-400 text-sm text-center py-4">Nenhum bloqueio ativo.</p>
                )}
              </div>
            </section>
          </div>
        </TabsContent>

        <TabsContent value="audit">
          <SpaAuditTab />
        </TabsContent>
      </Tabs>

      <Dialog open={!!roomOpen} onOpenChange={(o) => !o && setRoomOpen(null)}>
        <DialogContent className="sm:max-w-xs">
          <DialogHeader>
            <DialogTitle>Status: {roomOpen?.name}</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <Label className="mb-2 block">Novo Status</Label>
            <Select value={newStatus} onValueChange={setNewStatus}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="free">Livre</SelectItem>
                <SelectItem value="occupied">Ocupada</SelectItem>
                <SelectItem value="cleaning">Em Limpeza</SelectItem>
                <SelectItem value="maintenance">Manutenção (Bloqueia Agenda)</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <DialogFooter>
            <Button onClick={handleRoomSave}>Salvar Alteração</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={blockoutOpen} onOpenChange={setBlockoutOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Novo Bloqueio de Terapeuta</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Terapeuta</Label>
              <Select
                value={boForm.user_id}
                onValueChange={(v) => setBoForm({ ...boForm, user_id: v })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {therapists.map((t) => (
                    <SelectItem key={t.id} value={t.id}>
                      {t.name || t.email}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Início</Label>
                <Input
                  type="datetime-local"
                  value={boForm.start}
                  onChange={(e) => setBoForm({ ...boForm, start: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>Fim</Label>
                <Input
                  type="datetime-local"
                  value={boForm.end}
                  onChange={(e) => setBoForm({ ...boForm, end: e.target.value })}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Motivo</Label>
              <Input
                value={boForm.desc}
                onChange={(e) => setBoForm({ ...boForm, desc: e.target.value })}
                placeholder="Ex: Folga, Almoço, Reunião"
              />
            </div>
          </div>
          <DialogFooter>
            <Button onClick={handleBoSave}>Adicionar Bloqueio</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
