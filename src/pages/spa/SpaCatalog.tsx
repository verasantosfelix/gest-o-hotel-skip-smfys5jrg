import { useState, useEffect } from 'react'
import { BookOpen, Plus, Edit, Image as ImageIcon } from 'lucide-react'
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
import { Switch } from '@/components/ui/switch'
import { Textarea } from '@/components/ui/textarea'
import { useAccess } from '@/hooks/use-access'
import { RestrictedAccess } from '@/components/RestrictedAccess'
import { getSpaServices, createSpaService, updateSpaService, SpaService } from '@/services/spa'
import { formatCurrency } from '@/lib/utils'
import { toast } from '@/components/ui/use-toast'
import pb from '@/lib/pocketbase/client'

const CATEGORIES = ['Massagens', 'Rosto', 'Corpo', 'Estética', 'Pacotes Especiais', 'Bem-Estar']

export default function SpaCatalog() {
  const { hasAccess, isManager } = useAccess()
  const [services, setServices] = useState<SpaService[]>([])
  const [open, setOpen] = useState(false)
  const [editItem, setEditItem] = useState<SpaService | null>(null)

  // Form State
  const [name, setName] = useState('')
  const [desc, setDesc] = useState('')
  const [price, setPrice] = useState('')
  const [duration, setDuration] = useState('')
  const [category, setCategory] = useState('')
  const [available, setAvailable] = useState(true)
  const [status, setStatus] = useState<'draft' | 'published'>('draft')
  const [imageFile, setImageFile] = useState<File | null>(null)

  const loadData = async () => {
    try {
      setServices(await getSpaServices())
    } catch (e) {
      console.error(e)
    }
  }

  useEffect(() => {
    loadData()
  }, [])

  if (
    !hasAccess(
      ['Spa_Wellness', 'Rececao_FrontOffice', 'Direcao_Admin', 'Front_Desk'],
      'Catálogo de Serviços',
    )
  ) {
    return <RestrictedAccess requiredRoles={['Spa_Wellness', 'Direcao_Admin']} />
  }

  const handleOpen = (item?: SpaService) => {
    if (item) {
      setEditItem(item)
      setName(item.name)
      setDesc(item.description || '')
      setPrice(item.price.toString())
      setDuration(item.duration_minutes.toString())
      setCategory(item.category || '')
      setAvailable(item.available ?? true)
      setStatus(item.status || 'draft')
    } else {
      setEditItem(null)
      setName('')
      setDesc('')
      setPrice('')
      setDuration('')
      setCategory('')
      setAvailable(true)
      setStatus('draft')
    }
    setImageFile(null)
    setOpen(true)
  }

  const handleSave = async () => {
    if (!name || !price || !duration || !category)
      return toast({ title: 'Preencha os campos obrigatórios' })

    const fd = new FormData()
    fd.append('name', name)
    fd.append('description', desc)
    fd.append('price', price)
    fd.append('duration_minutes', duration)
    fd.append('category', category)
    fd.append('available', String(available))
    fd.append('status', status)
    if (imageFile) fd.append('image', imageFile)

    try {
      if (editItem) {
        await updateSpaService(editItem.id, fd)
        toast({ title: 'Serviço atualizado' })
      } else {
        await createSpaService(fd)
        toast({ title: 'Serviço criado' })
      }
      setOpen(false)
      loadData()
    } catch (e) {
      toast({ title: 'Erro ao salvar', variant: 'destructive' })
    }
  }

  return (
    <div className="space-y-6 animate-fade-in pb-8">
      <div className="flex justify-between items-center gap-4">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-indigo-100 rounded-lg shadow-sm border border-indigo-200">
            <BookOpen className="w-6 h-6 text-indigo-700" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-900">Catálogo Digital</h1>
            <p className="text-sm text-slate-500">Gestão de serviços e menu público</p>
          </div>
        </div>
        {isManager() && (
          <Button onClick={() => handleOpen()} className="gap-2">
            <Plus className="w-4 h-4" /> Novo Serviço
          </Button>
        )}
      </div>

      <Card className="border-slate-200 shadow-sm overflow-hidden">
        <Table>
          <TableHeader className="bg-slate-50">
            <TableRow>
              <TableHead>Serviço</TableHead>
              <TableHead>Categoria</TableHead>
              <TableHead className="text-center">Duração</TableHead>
              <TableHead className="text-right">Valor</TableHead>
              <TableHead className="text-center">Status</TableHead>
              {isManager() && <TableHead className="text-right">Ações</TableHead>}
            </TableRow>
          </TableHeader>
          <TableBody>
            {services.map((s) => (
              <TableRow key={s.id}>
                <TableCell>
                  <div className="flex items-center gap-3">
                    {s.image ? (
                      <img
                        src={pb.files.getUrl(s, s.image, { thumb: '100x100' })}
                        className="w-10 h-10 rounded object-cover border"
                        alt=""
                      />
                    ) : (
                      <div className="w-10 h-10 rounded bg-slate-100 flex items-center justify-center border">
                        <ImageIcon className="w-4 h-4 text-slate-300" />
                      </div>
                    )}
                    <div>
                      <p className="font-semibold text-slate-900">{s.name}</p>
                      <p className="text-xs text-slate-500 line-clamp-1 max-w-xs">
                        {s.description || 'Sem descrição'}
                      </p>
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  <Badge variant="outline">{s.category}</Badge>
                </TableCell>
                <TableCell className="text-center text-slate-600">
                  {s.duration_minutes} min
                </TableCell>
                <TableCell className="text-right font-medium">{formatCurrency(s.price)}</TableCell>
                <TableCell className="text-center">
                  <Badge
                    variant={s.status === 'published' ? 'default' : 'secondary'}
                    className={
                      s.status === 'published' ? 'bg-emerald-500 hover:bg-emerald-600' : ''
                    }
                  >
                    {s.status === 'published' ? 'Publicado' : 'Rascunho'}
                  </Badge>
                  {!s.available && (
                    <Badge variant="destructive" className="ml-1 text-[10px]">
                      Indisponível
                    </Badge>
                  )}
                </TableCell>
                {isManager() && (
                  <TableCell className="text-right">
                    <Button variant="ghost" size="sm" onClick={() => handleOpen(s)}>
                      <Edit className="w-4 h-4" />
                    </Button>
                  </TableCell>
                )}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>{editItem ? 'Editar Serviço' : 'Novo Serviço'}</DialogTitle>
          </DialogHeader>
          <div className="grid grid-cols-2 gap-4 py-4">
            <div className="space-y-2 col-span-2">
              <Label>Nome do Serviço</Label>
              <Input value={name} onChange={(e) => setName(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>Categoria</Label>
              <Select value={category} onValueChange={setCategory}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione..." />
                </SelectTrigger>
                <SelectContent>
                  {CATEGORIES.map((c) => (
                    <SelectItem key={c} value={c}>
                      {c}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Preço Base (KZ)</Label>
              <Input type="number" value={price} onChange={(e) => setPrice(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>Duração (Minutos)</Label>
              <Input type="number" value={duration} onChange={(e) => setDuration(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>Status do Workflow</Label>
              <Select value={status} onValueChange={(v: any) => setStatus(v)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="draft">Rascunho</SelectItem>
                  <SelectItem value="published">Publicado</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2 col-span-2">
              <Label>Descrição Pública</Label>
              <Textarea value={desc} onChange={(e) => setDesc(e.target.value)} />
            </div>
            <div className="space-y-2 col-span-2">
              <Label>Imagem Ilustrativa</Label>
              <Input
                type="file"
                accept="image/*"
                onChange={(e) => setImageFile(e.target.files?.[0] || null)}
              />
            </div>
            <div className="flex items-center gap-3 pt-2">
              <Switch checked={available} onCheckedChange={setAvailable} />
              <Label>Disponível para Agendamento</Label>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={handleSave}>Salvar Catálogo</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
