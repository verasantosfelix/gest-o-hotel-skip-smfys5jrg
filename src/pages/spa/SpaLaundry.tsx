import { useState, useEffect } from 'react'
import { Shirt, Plus, Clock } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import { useAccess } from '@/hooks/use-access'
import { RestrictedAccess } from '@/components/RestrictedAccess'
import { getLaundryLogs, createLaundryLog, LaundryLog } from '@/services/laundry'
import { useRealtime } from '@/hooks/use-realtime'
import { toast } from '@/components/ui/use-toast'
import useAuthStore from '@/stores/useAuthStore'
import { format } from 'date-fns'

const ITEMS = [
  'Toalhas Grandes',
  'Toalhas Rosto',
  'Roupões',
  'Lençóis de Maca',
  'Kits SPA',
  'Uniformes',
]

export default function SpaLaundry() {
  const { hasAccess } = useAccess()
  const { userName } = useAuthStore()
  const [logs, setLogs] = useState<LaundryLog[]>([])
  const [open, setOpen] = useState(false)
  const [form, setForm] = useState({ item: '', quantity: '', urgency: 'normal' })

  const loadData = async () => {
    try {
      setLogs(await getLaundryLogs("location='SPA'"))
    } catch (e) {
      console.error(e)
    }
  }

  useEffect(() => {
    loadData()
  }, [])
  useRealtime('laundry_logs', loadData)

  if (
    !hasAccess(
      ['Spa_Wellness', 'Lavanderia_Limpeza', 'Direcao_Admin', 'Front_Desk'],
      'Lavanderia SPA',
    )
  ) {
    return <RestrictedAccess requiredRoles={['Spa_Wellness', 'Lavanderia_Limpeza']} />
  }

  const handleSubmit = async () => {
    if (!form.item || !form.quantity)
      return toast({ title: 'Preencha os campos', variant: 'destructive' })
    try {
      await createLaundryLog({
        type: 'Pedido SPA',
        item: form.item,
        quantity: parseInt(form.quantity),
        urgency: form.urgency as 'normal' | 'high',
        location: 'SPA',
        status: 'Recebido',
        staff_member: userName,
      })
      toast({ title: 'Pedido enviado à lavanderia.' })
      setOpen(false)
    } catch (e) {
      toast({ title: 'Erro ao pedir', variant: 'destructive' })
    }
  }

  const statusColors: Record<string, string> = {
    Recebido: 'bg-amber-100 text-amber-800',
    'Em Lavagem': 'bg-blue-100 text-blue-800 animate-pulse',
    Pronto: 'bg-indigo-100 text-indigo-800',
    Entregue: 'bg-emerald-100 text-emerald-800',
  }

  return (
    <div className="space-y-6 animate-fade-in pb-8">
      <div className="flex justify-between items-center gap-4">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-blue-100 rounded-lg shadow-sm border border-blue-200">
            <Shirt className="w-6 h-6 text-blue-700" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-900">
              Enxoval & Lavanderia SPA
            </h1>
            <p className="text-sm text-slate-500">Pipeline direto com a governança</p>
          </div>
        </div>
        <Button
          onClick={() => setOpen(true)}
          className="gap-2 bg-blue-600 hover:bg-blue-700 text-white"
        >
          <Plus className="w-4 h-4" /> Solicitar Enxoval
        </Button>
      </div>

      <Card className="border-slate-200 shadow-sm overflow-hidden">
        <Table>
          <TableHeader className="bg-slate-50">
            <TableRow>
              <TableHead>Data / Hora</TableHead>
              <TableHead>Item Solicitado</TableHead>
              <TableHead className="text-center">Qtd</TableHead>
              <TableHead>Urgência</TableHead>
              <TableHead>Status Lavanderia</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {logs.map((log) => (
              <TableRow key={log.id}>
                <TableCell className="text-sm text-slate-500 font-mono">
                  <div className="flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5" /> {format(new Date(log.created), 'dd/MM HH:mm')}
                  </div>
                </TableCell>
                <TableCell className="font-semibold text-slate-800">{log.item}</TableCell>
                <TableCell className="text-center font-mono font-bold">{log.quantity}</TableCell>
                <TableCell>
                  {log.urgency === 'high' ? (
                    <Badge variant="destructive" className="text-[10px]">
                      Alta Urgência
                    </Badge>
                  ) : (
                    <Badge variant="outline" className="text-[10px]">
                      Normal
                    </Badge>
                  )}
                </TableCell>
                <TableCell>
                  <Badge variant="outline" className={statusColors[log.status] || ''}>
                    {log.status}
                  </Badge>
                </TableCell>
              </TableRow>
            ))}
            {logs.length === 0 && (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-8 text-slate-400">
                  Nenhum pedido ativo.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </Card>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>Nova Solicitação</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Tipo de Peça</Label>
              <Select onValueChange={(v) => setForm({ ...form, item: v })}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione..." />
                </SelectTrigger>
                <SelectContent>
                  {ITEMS.map((i) => (
                    <SelectItem key={i} value={i}>
                      {i}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Quantidade</Label>
              <Input
                type="number"
                min="1"
                value={form.quantity}
                onChange={(e) => setForm({ ...form, quantity: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label>Prioridade</Label>
              <Select defaultValue="normal" onValueChange={(v) => setForm({ ...form, urgency: v })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="normal">Normal (Padrão)</SelectItem>
                  <SelectItem value="high">Alta Urgência (Falta de Estoque)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button onClick={handleSubmit} className="w-full">
              Enviar Pedido
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
