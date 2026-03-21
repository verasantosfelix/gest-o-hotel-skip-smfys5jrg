import { useState, useEffect } from 'react'
import { SearchX, Plus, Trash2, Calendar } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
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
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { useAccess } from '@/hooks/use-access'
import { RestrictedAccess } from '@/components/RestrictedAccess'
import useAuthStore from '@/stores/useAuthStore'
import {
  getLostFoundItems,
  createLostFoundItem,
  deleteLostFoundItem,
  LostFoundItem,
} from '@/services/lost_found'
import { useRealtime } from '@/hooks/use-realtime'
import { toast } from '@/components/ui/use-toast'

export default function LostAndFound() {
  const { hasAccess } = useAccess()
  const { userRole } = useAuthStore()
  const isFrontDesk = userRole === 'Front_Desk'

  const [items, setItems] = useState<LostFoundItem[]>([])
  const [open, setOpen] = useState(false)
  const [form, setForm] = useState({
    description: '',
    location: '',
    status: 'Registrado',
    guest_data: '',
  })

  const loadData = async () => {
    try {
      setItems(await getLostFoundItems())
    } catch (e) {
      console.error(e)
    }
  }

  useEffect(() => {
    loadData()
  }, [])
  useRealtime('lost_found_items', loadData)

  if (
    !hasAccess(
      ['Lavanderia_Limpeza', 'Rececao_FrontOffice', 'Direcao_Admin', 'Front_Desk'],
      'Achados e Perdidos',
    )
  ) {
    return (
      <RestrictedAccess
        requiredRoles={['Lavanderia_Limpeza', 'Rececao_FrontOffice', 'Direcao_Admin', 'Front_Desk']}
      />
    )
  }

  const handleSubmit = async () => {
    if (!form.description || !form.location) {
      return toast({ title: 'Preencha a descrição e o local', variant: 'destructive' })
    }
    try {
      await createLostFoundItem({
        ...form,
        date_found: new Date().toISOString(),
      })
      toast({ title: 'Item registrado com sucesso' })
      setOpen(false)
      setForm({ description: '', location: '', status: 'Registrado', guest_data: '' })
    } catch (e) {
      toast({ title: 'Erro ao registrar item', variant: 'destructive' })
    }
  }

  const handleDelete = async (id: string) => {
    if (confirm('Tem certeza que deseja remover este item?')) {
      try {
        await deleteLostFoundItem(id)
        toast({ title: 'Item removido' })
      } catch (e) {
        toast({ title: 'Erro ao remover', variant: 'destructive' })
      }
    }
  }

  return (
    <div className="space-y-6 animate-fade-in pb-8">
      <div className="flex justify-between items-center gap-4">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-slate-100 rounded-lg shadow-sm border border-slate-200">
            <SearchX className="w-6 h-6 text-slate-700" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-900">Achados e Perdidos</h1>
            <p className="text-sm text-slate-500">Registro de itens esquecidos nas dependências</p>
          </div>
        </div>
        <Button onClick={() => setOpen(true)} className="gap-2">
          <Plus className="w-4 h-4" /> Novo Registro
        </Button>
      </div>

      <Card className="border-slate-200 shadow-sm overflow-hidden">
        <Table>
          <TableHeader className="bg-slate-50">
            <TableRow>
              <TableHead>Data</TableHead>
              <TableHead>Descrição do Item</TableHead>
              <TableHead>Local Encontrado</TableHead>
              <TableHead>Hóspede (Possível)</TableHead>
              <TableHead>Status</TableHead>
              {!isFrontDesk && <TableHead className="text-right">Ações</TableHead>}
            </TableRow>
          </TableHeader>
          <TableBody>
            {items.map((item) => (
              <TableRow key={item.id} className="hover:bg-slate-50">
                <TableCell className="font-mono text-sm text-slate-500">
                  <div className="flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5" />
                    {new Date(item.date_found).toLocaleDateString()}
                  </div>
                </TableCell>
                <TableCell className="font-medium text-slate-900">{item.description}</TableCell>
                <TableCell>{item.location}</TableCell>
                <TableCell className="text-slate-600">{item.guest_data || '-'}</TableCell>
                <TableCell>
                  <Badge
                    variant="outline"
                    className={
                      item.status === 'Devolvido'
                        ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                        : ''
                    }
                  >
                    {item.status}
                  </Badge>
                </TableCell>
                {!isFrontDesk && (
                  <TableCell className="text-right">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-rose-500 hover:bg-rose-50"
                      onClick={() => handleDelete(item.id)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </TableCell>
                )}
              </TableRow>
            ))}
            {items.length === 0 && (
              <TableRow>
                <TableCell
                  colSpan={isFrontDesk ? 5 : 6}
                  className="text-center py-8 text-slate-500"
                >
                  Nenhum item registrado.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </Card>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Registrar Item Encontrado</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Descrição do Item</Label>
              <Input
                placeholder="Ex: Casaco de lã preto"
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label>Local onde foi encontrado</Label>
              <Input
                placeholder="Ex: Lobby / Quarto 302"
                value={form.location}
                onChange={(e) => setForm({ ...form, location: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label>Informação do Hóspede (Opcional)</Label>
              <Input
                placeholder="Nome do hóspede associado ao quarto"
                value={form.guest_data}
                onChange={(e) => setForm({ ...form, guest_data: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label>Status Inicial</Label>
              <Select value={form.status} onValueChange={(v) => setForm({ ...form, status: v })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Registrado">Registrado na Governança</SelectItem>
                  <SelectItem value="Devolvido">Devolvido ao Hóspede</SelectItem>
                  <SelectItem value="Descartado">Descartado</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button onClick={handleSubmit}>Salvar Registro</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
