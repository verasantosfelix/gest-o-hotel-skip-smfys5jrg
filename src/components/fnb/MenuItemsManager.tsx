import { useState, useEffect, useRef } from 'react'
import { Plus, Edit, Trash2, Image as ImageIcon, Search } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Switch } from '@/components/ui/switch'
import { Badge } from '@/components/ui/badge'
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
import {
  getFBProducts,
  deleteFBProduct,
  getFBMenuCategories,
  FBProduct,
  FBMenuCategory,
} from '@/services/fnb'
import { logAuditAction } from '@/services/audit'
import { useRealtime } from '@/hooks/use-realtime'
import { toast } from '@/components/ui/use-toast'
import useAuthStore from '@/stores/useAuthStore'
import pb from '@/lib/pocketbase/client'
import { formatCurrency } from '@/lib/utils'

export function MenuItemsManager() {
  const { userRole } = useAuthStore()
  const isDirector = userRole === 'Direcao_Admin'
  const isFrontDesk = userRole === 'Front_Desk'

  const [products, setProducts] = useState<FBProduct[]>([])
  const [categories, setCategories] = useState<FBMenuCategory[]>([])
  const [search, setSearch] = useState('')
  const [isModalOpen, setIsModalOpen] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const [form, setForm] = useState({
    id: '',
    name: '',
    category: 'Food',
    price: '',
    description: '',
    tags: '',
    restrictions: '',
    is_available: true,
    status: 'draft',
    category_id: '',
  })
  const [selectedFile, setSelectedFile] = useState<File | null>(null)

  const loadData = async () => {
    try {
      const [p, c] = await Promise.all([getFBProducts(), getFBMenuCategories()])
      setProducts(p)
      setCategories(c)
    } catch (e) {
      console.error(e)
    }
  }

  useEffect(() => {
    loadData()
  }, [])
  useRealtime('fb_products', loadData)
  useRealtime('fb_menu_categories', loadData)

  const openModal = (p?: FBProduct) => {
    if (p) {
      setForm({
        id: p.id,
        name: p.name,
        category: p.category,
        price: p.price.toString(),
        description: p.description || '',
        tags: p.tags?.join(', ') || '',
        restrictions: p.restrictions || '',
        is_available: p.is_available,
        status: p.status || 'draft',
        category_id: p.category_id || '',
      })
    } else {
      setForm({
        id: '',
        name: '',
        category: 'Food',
        price: '',
        description: '',
        tags: '',
        restrictions: '',
        is_available: true,
        status: 'draft',
        category_id: categories[0]?.id || '',
      })
    }
    setSelectedFile(null)
    setIsModalOpen(true)
  }

  const handleSave = async () => {
    if (!form.name || !form.price || !form.category_id)
      return toast({ title: 'Preencha os campos obrigatórios', variant: 'destructive' })

    try {
      const formData = new FormData()
      formData.append('name', form.name)
      formData.append('category', form.category)
      formData.append('price', form.price)
      formData.append('description', form.description)
      formData.append(
        'tags',
        JSON.stringify(
          form.tags
            .split(',')
            .map((t) => t.trim())
            .filter(Boolean),
        ),
      )
      formData.append('restrictions', form.restrictions)
      formData.append('is_available', form.is_available ? 'True' : 'False')
      formData.append('category_id', form.category_id)

      const targetStatus = isDirector ? form.status : 'draft'
      formData.append('status', targetStatus)

      if (selectedFile) formData.append('image', selectedFile)

      if (form.id) {
        await pb.collection('fb_products').update(form.id, formData)
        logAuditAction('UPDATE_MENU_ITEM', 'Menu Digital', { item: form.name, targetStatus })
        toast({ title: 'Item atualizado com sucesso' })
      } else {
        await pb.collection('fb_products').create(formData)
        logAuditAction('CREATE_MENU_ITEM', 'Menu Digital', { item: form.name })
        toast({ title: 'Item criado com sucesso' })
      }
      setIsModalOpen(false)
      loadData()
    } catch (e) {
      toast({ title: 'Erro ao salvar', variant: 'destructive' })
    }
  }

  const handleDelete = async (p: FBProduct) => {
    if (!window.confirm(`Apagar item ${p.name}?`)) return
    try {
      await deleteFBProduct(p.id)
      logAuditAction('DELETE_MENU_ITEM', 'Menu Digital', { item: p.name })
      toast({ title: 'Item apagado' })
      loadData()
    } catch (e) {
      toast({ title: 'Erro ao apagar', variant: 'destructive' })
    }
  }

  const filtered = products.filter(
    (p) =>
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.expand?.category_id?.name.toLowerCase().includes(search.toLowerCase()),
  )

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center bg-white p-3 rounded-lg border shadow-sm">
        <div className="relative w-full max-w-sm">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-slate-400" />
          <Input
            placeholder="Buscar prato ou categoria..."
            className="pl-9 bg-slate-50 border-none"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        {!isFrontDesk && (
          <Button onClick={() => openModal()} className="gap-2 bg-slate-900 text-white">
            <Plus className="w-4 h-4" /> Novo Item
          </Button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {filtered.map((p) => (
          <Card
            key={p.id}
            className="overflow-hidden shadow-sm hover:shadow-md transition-all border-slate-200"
          >
            <div className="h-40 bg-slate-100 relative">
              {p.image ? (
                <img
                  src={pb.files.getUrl(p, p.image, { thumb: '300x200' })}
                  className="w-full h-full object-cover"
                  alt={p.name}
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-slate-300">
                  <ImageIcon className="w-10 h-10" />
                </div>
              )}
              <div className="absolute top-2 right-2 flex flex-col gap-1 items-end">
                <Badge
                  variant="secondary"
                  className="bg-white/90 backdrop-blur shadow-sm text-[10px] uppercase font-bold"
                >
                  {p.status === 'published' ? (
                    <span className="text-emerald-600">Publicado</span>
                  ) : (
                    <span className="text-amber-600">Rascunho</span>
                  )}
                </Badge>
                {!p.is_available && (
                  <Badge variant="destructive" className="text-[10px] uppercase shadow-sm">
                    Esgotado
                  </Badge>
                )}
              </div>
            </div>
            <CardContent className="p-4">
              <div className="flex justify-between items-start mb-1">
                <h3 className="font-bold text-slate-800 line-clamp-1 flex-1 pr-2">{p.name}</h3>
                <span className="font-black text-slate-900">{formatCurrency(p.price)}</span>
              </div>
              <p className="text-xs text-slate-500 mb-3">
                {p.expand?.category_id?.name || 'Sem Categoria'}
              </p>

              {!isFrontDesk && (
                <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-8 px-2"
                    onClick={() => openModal(p)}
                  >
                    <Edit className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-8 px-2 text-rose-600 hover:text-rose-700"
                    onClick={() => handleDelete(p)}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>{form.id ? 'Editar Item' : 'Novo Item do Menu'}</DialogTitle>
          </DialogHeader>
          <div className="grid grid-cols-2 gap-4 py-4">
            <div className="space-y-2 col-span-2 sm:col-span-1">
              <label className="text-xs font-bold text-slate-500 uppercase">
                Nome do Prato/Bebida
              </label>
              <Input
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
              />
            </div>
            <div className="space-y-2 col-span-2 sm:col-span-1">
              <label className="text-xs font-bold text-slate-500 uppercase">Categoria</label>
              <Select
                value={form.category_id}
                onValueChange={(v) => setForm({ ...form, category_id: v })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione..." />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((c) => (
                    <SelectItem key={c.id} value={c.id}>
                      {c.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2 col-span-2 sm:col-span-1">
              <label className="text-xs font-bold text-slate-500 uppercase">Preço</label>
              <Input
                type="number"
                step="0.01"
                value={form.price}
                onChange={(e) => setForm({ ...form, price: e.target.value })}
              />
            </div>
            <div className="space-y-2 col-span-2 sm:col-span-1">
              <label className="text-xs font-bold text-slate-500 uppercase">Imagem</label>
              <Input
                type="file"
                ref={fileInputRef}
                onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
                accept="image/*"
              />
            </div>
            <div className="space-y-2 col-span-2">
              <label className="text-xs font-bold text-slate-500 uppercase">
                Descrição Pública
              </label>
              <Textarea
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                className="resize-none"
              />
            </div>
            <div className="space-y-2 col-span-2 sm:col-span-1">
              <label className="text-xs font-bold text-slate-500 uppercase">
                Tags (separadas por vírgula)
              </label>
              <Input
                placeholder="ex: vegetariano, sem_gluten"
                value={form.tags}
                onChange={(e) => setForm({ ...form, tags: e.target.value })}
              />
            </div>
            <div className="space-y-2 col-span-2 sm:col-span-1">
              <label className="text-xs font-bold text-slate-500 uppercase">Restrições</label>
              <Input
                placeholder="ex: 18+"
                value={form.restrictions}
                onChange={(e) => setForm({ ...form, restrictions: e.target.value })}
              />
            </div>

            <div className="col-span-2 flex items-center justify-between p-4 bg-slate-50 rounded-lg border mt-2">
              <div>
                <p className="font-bold text-slate-800 text-sm">Disponível para Venda</p>
                <p className="text-xs text-slate-500">
                  Se desativado, aparece como esgotado no menu.
                </p>
              </div>
              <Switch
                checked={form.is_available}
                onCheckedChange={(v) => setForm({ ...form, is_available: v })}
              />
            </div>

            {isDirector && (
              <div className="space-y-2 col-span-2 mt-2">
                <label className="text-xs font-bold text-indigo-600 uppercase">
                  Status de Publicação (Admin)
                </label>
                <Select value={form.status} onValueChange={(v) => setForm({ ...form, status: v })}>
                  <SelectTrigger className="border-indigo-200 bg-indigo-50/50">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="draft">Rascunho (Não visível)</SelectItem>
                    <SelectItem value="published">Publicado (Visível no Menu)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}
            {!isDirector && form.id && (
              <div className="col-span-2 text-xs text-amber-600 bg-amber-50 p-3 rounded mt-2 border border-amber-200">
                Qualquer alteração feita retornará o item para o status de <strong>Rascunho</strong>
                , exigindo nova aprovação da Direção.
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsModalOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={handleSave}>Salvar Alterações</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
