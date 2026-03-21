import { useState } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Plus, Check, Eye, Play } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { toast } from '@/components/ui/use-toast'
import { createMaintenanceTicket, updateMaintenanceTicket } from '@/services/maintenance'
import { RoomRecord } from '@/services/rooms'
import useAuthStore from '@/stores/useAuthStore'

export function MaintenanceOS({ tickets, rooms }: { tickets: any[]; rooms: RoomRecord[] }) {
  const { userRole } = useAuthStore()
  const isFrontDesk = userRole === 'Front_Desk'

  const [isNewOSOpen, setIsNewOSOpen] = useState(false)
  const [selectedTicket, setSelectedTicket] = useState<any>(null)
  const [usedMaterials, setUsedMaterials] = useState('')

  const [formData, setFormData] = useState({
    room_id: '',
    location_details: '',
    problem_type: '',
    origin: 'Recepção',
    description: '',
    priority: 'medium' as any,
  })

  const handleCreate = async () => {
    try {
      if (!formData.room_id || !formData.description) {
        return toast({ title: 'Acomodação e Descrição são obrigatórios', variant: 'destructive' })
      }
      await createMaintenanceTicket({ ...formData, status: 'open' })
      toast({ title: 'OS criada com sucesso' })
      setIsNewOSOpen(false)
      setFormData({
        room_id: '',
        location_details: '',
        problem_type: '',
        origin: 'Recepção',
        description: '',
        priority: 'medium',
      })
    } catch (e) {
      toast({ title: 'Erro ao criar OS', variant: 'destructive' })
    }
  }

  const handleStatusChange = async (id: string, status: string, extraData: any = {}) => {
    try {
      await updateMaintenanceTicket(id, {
        status,
        ...(status === 'in_progress' ? { response_start_at: new Date().toISOString() } : {}),
        ...(status === 'resolved' ? { resolved_at: new Date().toISOString() } : {}),
        ...extraData,
      })
      toast({ title: `Status atualizado para ${status}` })
      setSelectedTicket(null)
      setUsedMaterials('')
    } catch (e) {
      toast({ title: 'Erro ao atualizar OS', variant: 'destructive' })
    }
  }

  return (
    <div className="space-y-4 animate-fade-in-up">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold text-slate-800">Ordens de Serviço</h2>
        <Button onClick={() => setIsNewOSOpen(true)} className="gap-2">
          <Plus className="w-4 h-4" /> Abrir OS
        </Button>
      </div>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader className="bg-slate-50">
              <TableRow>
                <TableHead>Prioridade</TableHead>
                <TableHead>Local</TableHead>
                <TableHead>Descrição</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {tickets.map((t) => (
                <TableRow key={t.id}>
                  <TableCell>
                    <Badge
                      className={
                        t.priority === 'urgent'
                          ? 'bg-rose-500 hover:bg-rose-600'
                          : t.priority === 'high'
                            ? 'bg-orange-500 hover:bg-orange-600'
                            : t.priority === 'medium'
                              ? 'bg-amber-500 hover:bg-amber-600'
                              : 'bg-slate-500 hover:bg-slate-600'
                      }
                    >
                      {t.priority.toUpperCase()}
                    </Badge>
                  </TableCell>
                  <TableCell className="font-medium">
                    {t.expand?.room_id?.room_number ? `Q. ${t.expand.room_id.room_number}` : ''}{' '}
                    {t.location_details && `(${t.location_details})`}
                  </TableCell>
                  <TableCell className="max-w-[250px] truncate" title={t.description}>
                    {t.description}
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant="outline"
                      className={
                        t.status === 'open'
                          ? 'border-amber-200 text-amber-700 bg-amber-50'
                          : t.status === 'in_progress'
                            ? 'border-blue-200 text-blue-700 bg-blue-50'
                            : 'border-emerald-200 text-emerald-700 bg-emerald-50'
                      }
                    >
                      {t.status === 'open'
                        ? 'Aguardando'
                        : t.status === 'in_progress'
                          ? 'Execução'
                          : 'Resolvida'}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="sm" onClick={() => setSelectedTicket(t)}>
                      <Eye className="w-4 h-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
              {tickets.length === 0 && (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-6 text-slate-500">
                    Nenhuma OS encontrada.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Dialog open={isNewOSOpen} onOpenChange={setIsNewOSOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Abertura de Nova OS</DialogTitle>
          </DialogHeader>
          <div className="space-y-3 py-2">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label>Acomodação/Local Base *</Label>
                <Select
                  value={formData.room_id}
                  onValueChange={(v) => setFormData({ ...formData, room_id: v })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione" />
                  </SelectTrigger>
                  <SelectContent>
                    {rooms.map((r) => (
                      <SelectItem key={r.id} value={r.id}>
                        Quarto {r.room_number}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1">
                <Label>Detalhes do Local</Label>
                <Input
                  placeholder="Ex: Banheiro"
                  value={formData.location_details}
                  onChange={(e) => setFormData({ ...formData, location_details: e.target.value })}
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label>Tipo de Problema</Label>
                <Input
                  placeholder="Ex: Elétrica"
                  value={formData.problem_type}
                  onChange={(e) => setFormData({ ...formData, problem_type: e.target.value })}
                />
              </div>
              <div className="space-y-1">
                <Label>Prioridade</Label>
                <Select
                  value={formData.priority}
                  onValueChange={(v) => setFormData({ ...formData, priority: v })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Prioridade" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">Baixa</SelectItem>
                    <SelectItem value="medium">Média</SelectItem>
                    <SelectItem value="high">Alta</SelectItem>
                    <SelectItem value="urgent">Urgente</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-1">
              <Label>Descrição *</Label>
              <Input
                placeholder="Descreva o problema..."
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsNewOSOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={handleCreate}>Criar OS</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={!!selectedTicket} onOpenChange={(o) => !o && setSelectedTicket(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Detalhes da OS</DialogTitle>
          </DialogHeader>
          {selectedTicket && (
            <div className="space-y-4 py-2">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-slate-500 font-bold block mb-1">Acomodação/Local</span>
                  {selectedTicket.expand?.room_id?.room_number
                    ? `Q. ${selectedTicket.expand.room_id.room_number}`
                    : ''}{' '}
                  {selectedTicket.location_details && `(${selectedTicket.location_details})`}
                </div>
                <div>
                  <span className="text-slate-500 font-bold block mb-1">Status</span>
                  <Badge variant="outline">{selectedTicket.status}</Badge>
                </div>
                <div className="col-span-2">
                  <span className="text-slate-500 font-bold block mb-1">Descrição</span>
                  <p className="bg-slate-50 p-2 rounded border border-slate-100">
                    {selectedTicket.description}
                  </p>
                </div>
              </div>

              {!isFrontDesk && selectedTicket.status === 'in_progress' && (
                <div className="space-y-2 pt-4 border-t border-slate-100">
                  <Label>Registro de Intervenção e Peças Usadas</Label>
                  <Input
                    value={usedMaterials}
                    onChange={(e) => setUsedMaterials(e.target.value)}
                    placeholder="Ex: 1x Lâmpada LED, Fita Isolante"
                  />
                </div>
              )}
            </div>
          )}
          <DialogFooter>
            {!isFrontDesk && selectedTicket?.status === 'open' && (
              <Button
                onClick={() => handleStatusChange(selectedTicket.id, 'in_progress')}
                className="bg-blue-600 hover:bg-blue-700 w-full"
              >
                <Play className="w-4 h-4 mr-2" /> Iniciar Execução
              </Button>
            )}
            {!isFrontDesk && selectedTicket?.status === 'in_progress' && (
              <Button
                onClick={() =>
                  handleStatusChange(selectedTicket.id, 'resolved', {
                    used_materials: usedMaterials,
                  })
                }
                className="bg-emerald-600 hover:bg-emerald-700 w-full"
              >
                <Check className="w-4 h-4 mr-2" /> Concluir Manutenção
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
