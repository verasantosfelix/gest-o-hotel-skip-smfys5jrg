import { useState, useEffect } from 'react'
import { Plus, Edit, Trash2, LayoutTemplate } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Switch } from '@/components/ui/switch'
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
  getFBPdfTemplates,
  createFBPdfTemplate,
  updateFBPdfTemplate,
  deleteFBPdfTemplate,
  FBPdfTemplate,
} from '@/services/fnb_pdf'
import { toast } from '@/components/ui/use-toast'
import { useRealtime } from '@/hooks/use-realtime'

export function MenuPDFTemplates() {
  const [templates, setTemplates] = useState<FBPdfTemplate[]>([])
  const [isModalOpen, setIsModalOpen] = useState(false)

  const [form, setForm] = useState<Partial<FBPdfTemplate>>({
    name: '',
    layout: 'layout1',
    format: 'A4',
    orientation: 'vertical',
    primary_color: '#000000',
    secondary_color: '#888888',
    font_family: 'Montserrat',
    base_font_size: 12,
    show_logo: true,
    show_images: false,
    language: 'PT',
    mode: 'full',
  })

  const loadData = async () => {
    try {
      setTemplates(await getFBPdfTemplates())
    } catch (e) {
      console.error(e)
    }
  }

  useEffect(() => {
    loadData()
  }, [])
  useRealtime('fb_pdf_templates', loadData)

  const openModal = (t?: FBPdfTemplate) => {
    if (t) setForm(t)
    else
      setForm({
        name: '',
        layout: 'layout1',
        format: 'A4',
        orientation: 'vertical',
        primary_color: '#000000',
        secondary_color: '#888888',
        font_family: 'Montserrat',
        base_font_size: 12,
        show_logo: true,
        show_images: false,
        language: 'PT',
        mode: 'full',
      })
    setIsModalOpen(true)
  }

  const handleSave = async () => {
    if (!form.name) return toast({ title: 'Nome é obrigatório', variant: 'destructive' })
    try {
      if (form.id) await updateFBPdfTemplate(form.id, form)
      else await createFBPdfTemplate(form)
      toast({ title: 'Template salvo com sucesso' })
      setIsModalOpen(false)
      loadData()
    } catch (e) {
      toast({ title: 'Erro ao salvar', variant: 'destructive' })
    }
  }

  const handleDelete = async (id: string) => {
    if (!window.confirm('Apagar template? Isso pode quebrar agendamentos ativos.')) return
    try {
      await deleteFBPdfTemplate(id)
      toast({ title: 'Template removido' })
      loadData()
    } catch (e) {
      toast({ title: 'Erro ao apagar', variant: 'destructive' })
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <p className="text-slate-500 text-sm">
          Crie layouts visuais para a geração automática dos menus físicos.
        </p>
        <Button onClick={() => openModal()} className="gap-2">
          <Plus className="w-4 h-4" /> Novo Template
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {templates.map((t) => (
          <Card key={t.id} className="border-slate-200 overflow-hidden shadow-sm">
            <div
              className="h-24 bg-slate-100 border-b flex items-center justify-center relative"
              style={{ backgroundColor: `${t.primary_color}10` }}
            >
              <LayoutTemplate className="w-10 h-10" style={{ color: t.primary_color }} />
              <div className="absolute top-2 right-2 flex gap-1">
                <span className="text-[10px] font-bold bg-white px-2 py-0.5 rounded shadow-sm uppercase">
                  {t.format}
                </span>
                <span className="text-[10px] font-bold bg-white px-2 py-0.5 rounded shadow-sm uppercase">
                  {t.language}
                </span>
              </div>
            </div>
            <CardContent className="p-4">
              <h3 className="font-bold text-slate-800 text-lg mb-1">{t.name}</h3>
              <p className="text-xs text-slate-500 mb-4">
                {t.layout.replace('layout', 'Layout ')} •{' '}
                {t.mode === 'full' ? 'Menu Completo' : 'Room Service'}
              </p>
              <div className="flex gap-2 pt-3 border-t border-slate-100">
                <Button variant="outline" size="sm" className="flex-1" onClick={() => openModal(t)}>
                  <Edit className="w-4 h-4 mr-2" /> Editar
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="text-rose-600 hover:text-rose-700"
                  onClick={() => handleDelete(t.id)}
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>{form.id ? 'Editar Template PDF' : 'Novo Template PDF'}</DialogTitle>
          </DialogHeader>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 py-4">
            <div className="space-y-2 col-span-2">
              <label className="text-xs font-bold text-slate-500 uppercase">Nome do Template</label>
              <Input
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-500 uppercase">Layout Visual</label>
              <Select
                value={form.layout}
                onValueChange={(v: any) => setForm({ ...form, layout: v })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="layout1">Layout 1: Título Central + 2 Colunas</SelectItem>
                  <SelectItem value="layout2">Layout 2: Alinhado à Esquerda + 1 Coluna</SelectItem>
                  <SelectItem value="layout3">Layout 3: Imagem de Fundo + Cards</SelectItem>
                  <SelectItem value="layout4">
                    Layout 4: Minimalista com QR Code Destaque
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-500 uppercase">Formato do Papel</label>
              <Select
                value={form.format}
                onValueChange={(v: any) => setForm({ ...form, format: v })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="A4">A4 (Padrão)</SelectItem>
                  <SelectItem value="A5">A5 (Compacto)</SelectItem>
                  <SelectItem value="Letter">Letter / Carta</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-500 uppercase">Orientação</label>
              <Select
                value={form.orientation}
                onValueChange={(v: any) => setForm({ ...form, orientation: v })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="vertical">Vertical (Retrato)</SelectItem>
                  <SelectItem value="horizontal">Horizontal (Paisagem)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-500 uppercase">Idioma</label>
              <Select
                value={form.language}
                onValueChange={(v: any) => setForm({ ...form, language: v })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="PT">Português (PT)</SelectItem>
                  <SelectItem value="EN">English (EN)</SelectItem>
                  <SelectItem value="ES">Español (ES)</SelectItem>
                  <SelectItem value="FR">Français (FR)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-500 uppercase">
                Cor Primária (HEX)
              </label>
              <div className="flex gap-2">
                <Input
                  type="color"
                  className="w-12 p-1"
                  value={form.primary_color}
                  onChange={(e) => setForm({ ...form, primary_color: e.target.value })}
                />
                <Input
                  value={form.primary_color}
                  onChange={(e) => setForm({ ...form, primary_color: e.target.value })}
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-500 uppercase">
                Cor Secundária (HEX)
              </label>
              <div className="flex gap-2">
                <Input
                  type="color"
                  className="w-12 p-1"
                  value={form.secondary_color}
                  onChange={(e) => setForm({ ...form, secondary_color: e.target.value })}
                />
                <Input
                  value={form.secondary_color}
                  onChange={(e) => setForm({ ...form, secondary_color: e.target.value })}
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-500 uppercase">Fonte (Família)</label>
              <Select
                value={form.font_family}
                onValueChange={(v: any) => setForm({ ...form, font_family: v })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Montserrat">Montserrat</SelectItem>
                  <SelectItem value="Inter">Inter</SelectItem>
                  <SelectItem value="Merriweather">Merriweather</SelectItem>
                  <SelectItem value="Playfair Display">Playfair Display (Serif)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-500 uppercase">Modo do Menu</label>
              <Select value={form.mode} onValueChange={(v: any) => setForm({ ...form, mode: v })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="full">Menu Completo (Restaurante)</SelectItem>
                  <SelectItem value="room_service">Room Service / In-Room</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="col-span-2 flex items-center justify-between p-3 bg-slate-50 rounded border mt-2">
              <div>
                <p className="font-bold text-sm">Exibir Logo</p>
                <p className="text-xs text-slate-500">Imprime a logo do hotel no cabeçalho</p>
              </div>
              <Switch
                checked={form.show_logo}
                onCheckedChange={(v) => setForm({ ...form, show_logo: v })}
              />
            </div>

            <div className="col-span-2 flex items-center justify-between p-3 bg-slate-50 rounded border">
              <div>
                <p className="font-bold text-sm">Exibir Imagens dos Pratos</p>
                <p className="text-xs text-slate-500">Apenas recomendado para layouts em cartão</p>
              </div>
              <Switch
                checked={form.show_images}
                onCheckedChange={(v) => setForm({ ...form, show_images: v })}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsModalOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={handleSave}>Salvar Template</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
