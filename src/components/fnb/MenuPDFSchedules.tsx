import { useState, useEffect } from 'react'
import { CalendarClock, Plus, Edit, Trash2 } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Switch } from '@/components/ui/switch'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  getFBPdfSchedules,
  getFBPdfTemplates,
  createFBPdfSchedule,
  updateFBPdfSchedule,
  deleteFBPdfSchedule,
  FBPdfSchedule,
  FBPdfTemplate,
} from '@/services/fnb_pdf'
import { toast } from '@/components/ui/use-toast'
import { useRealtime } from '@/hooks/use-realtime'

export function MenuPDFSchedules() {
  const [schedules, setSchedules] = useState<FBPdfSchedule[]>([])
  const [templates, setTemplates] = useState<FBPdfTemplate[]>([])
  const [isModalOpen, setIsModalOpen] = useState(false)

  const [form, setForm] = useState<Partial<FBPdfSchedule>>({
    name: '',
    frequency: 'weekly',
    time: '07:00',
    day_value: 'Monday',
    template_id: '',
    target_printers: ['impressora_salao'],
    is_active: true,
  })

  const loadData = async () => {
    try {
      setSchedules(await getFBPdfSchedules())
      setTemplates(await getFBPdfTemplates())
    } catch (e) {
      console.error(e)
    }
  }

  useEffect(() => {
    loadData()
  }, [])
  useRealtime('fb_pdf_schedules', loadData)

  const openModal = (s?: FBPdfSchedule) => {
    if (s) setForm(s)
    else
      setForm({
        name: '',
        frequency: 'weekly',
        time: '07:00',
        day_value: 'Monday',
        template_id: templates[0]?.id || '',
        target_printers: ['impressora_salao'],
        is_active: true,
      })
    setIsModalOpen(true)
  }

  const handleSave = async () => {
    if (!form.name || !form.template_id)
      return toast({ title: 'Preencha os campos', variant: 'destructive' })
    try {
      if (form.id) await updateFBPdfSchedule(form.id, form)
      else await createFBPdfSchedule(form)
      toast({ title: 'Agendamento salvo' })
      setIsModalOpen(false)
      loadData()
    } catch (e) {
      toast({ title: 'Erro ao salvar', variant: 'destructive' })
    }
  }

  const handleDelete = async (id: string) => {
    if (!window.confirm('Apagar agendamento?')) return
    try {
      await deleteFBPdfSchedule(id)
      toast({ title: 'Removido' })
      loadData()
    } catch (e) {
      toast({ title: 'Erro ao apagar', variant: 'destructive' })
    }
  }

  const toggleStatus = async (id: string, current: boolean) => {
    try {
      await updateFBPdfSchedule(id, { is_active: !current })
      loadData()
    } catch (e) {
      toast({ title: 'Erro ao alterar status', variant: 'destructive' })
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <p className="text-slate-500 text-sm">Agende a geração e impressão automática de PDFs.</p>
        <Button onClick={() => openModal()} className="gap-2">
          <Plus className="w-4 h-4" /> Novo Agendamento
        </Button>
      </div>

      <div className="bg-white rounded-lg border shadow-sm">
        <Table>
          <TableHeader className="bg-slate-50">
            <TableRow>
              <TableHead className="pl-6">Rotina</TableHead>
              <TableHead>Template Base</TableHead>
              <TableHead>Frequência / Gatilho</TableHead>
              <TableHead className="text-center">Ativo</TableHead>
              <TableHead className="text-right pr-6">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {schedules.map((s) => (
              <TableRow key={s.id}>
                <TableCell className="pl-6 font-medium text-slate-900">{s.name}</TableCell>
                <TableCell className="text-slate-500">
                  {s.expand?.template_id?.name || '-'}
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-2 text-sm text-slate-700">
                    <CalendarClock className="w-4 h-4 text-blue-500" />
                    <span className="capitalize">{s.frequency}</span>
                    {s.frequency === 'weekly' && (
                      <span className="font-mono text-xs">({s.day_value})</span>
                    )}
                    <span className="font-mono text-xs bg-slate-100 px-1 rounded">{s.time}</span>
                  </div>
                </TableCell>
                <TableCell className="text-center">
                  <Switch
                    checked={s.is_active}
                    onCheckedChange={() => toggleStatus(s.id, s.is_active)}
                  />
                </TableCell>
                <TableCell className="text-right pr-6">
                  <Button variant="ghost" size="sm" onClick={() => openModal(s)}>
                    <Edit className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-rose-600"
                    onClick={() => handleDelete(s.id)}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
            {schedules.length === 0 && (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-8 text-slate-500">
                  Nenhum agendamento configurado.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{form.id ? 'Editar Agendamento' : 'Novo Agendamento'}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-500 uppercase">Nome da Rotina</label>
              <Input
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                placeholder="Ex: Update Semanal"
              />
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-500 uppercase">Template</label>
              <Select
                value={form.template_id}
                onValueChange={(v) => setForm({ ...form, template_id: v })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione um template..." />
                </SelectTrigger>
                <SelectContent>
                  {templates.map((t) => (
                    <SelectItem key={t.id} value={t.id}>
                      {t.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-500 uppercase">Frequência</label>
                <Select
                  value={form.frequency}
                  onValueChange={(v: any) => setForm({ ...form, frequency: v })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="daily">Diário</SelectItem>
                    <SelectItem value="weekly">Semanal</SelectItem>
                    <SelectItem value="monthly">Mensal</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-500 uppercase">
                  Horário de Execução
                </label>
                <Input
                  type="time"
                  value={form.time}
                  onChange={(e) => setForm({ ...form, time: e.target.value })}
                />
              </div>
            </div>

            {form.frequency === 'weekly' && (
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-500 uppercase">Dia da Semana</label>
                <Select
                  value={form.day_value}
                  onValueChange={(v) => setForm({ ...form, day_value: v })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Monday">Segunda-feira</SelectItem>
                    <SelectItem value="Wednesday">Quarta-feira</SelectItem>
                    <SelectItem value="Friday">Sexta-feira</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}

            <div className="flex items-center justify-between p-3 bg-slate-50 border rounded">
              <span className="text-sm font-bold text-slate-700">Ativar Automção</span>
              <Switch
                checked={form.is_active}
                onCheckedChange={(v) => setForm({ ...form, is_active: v })}
              />
            </div>
            <p className="text-[10px] text-slate-400 mt-2">
              Nota: Rotinas automáticas criam "Rascunhos" que exigirão aprovação da Direção antes da
              impressão final, conforme regras de compliance.
            </p>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsModalOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={handleSave}>Salvar Rotina</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
