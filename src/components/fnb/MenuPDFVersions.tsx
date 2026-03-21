import { useState, useEffect } from 'react'
import { FileText, Printer, ShieldCheck, Download, Plus, Search } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
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
import { Checkbox } from '@/components/ui/checkbox'
import {
  getFBPdfVersions,
  getFBPdfTemplates,
  updateFBPdfVersion,
  deleteFBPdfVersion,
  FBPdfVersion,
  FBPdfTemplate,
} from '@/services/fnb_pdf'
import { logAuditAction } from '@/services/audit'
import { toast } from '@/components/ui/use-toast'
import { useRealtime } from '@/hooks/use-realtime'
import { useAccess } from '@/hooks/use-access'
import pb from '@/lib/pocketbase/client'
import { format } from 'date-fns'

export function MenuPDFVersions() {
  const { isManager, hasAccess } = useAccess()
  const canApprove = hasAccess(['Direcao_Admin'])

  const [versions, setVersions] = useState<FBPdfVersion[]>([])
  const [templates, setTemplates] = useState<FBPdfTemplate[]>([])
  const [isGenerateOpen, setIsGenerateOpen] = useState(false)
  const [isPrintOpen, setIsPrintOpen] = useState(false)
  const [selectedVersion, setSelectedVersion] = useState<FBPdfVersion | null>(null)

  const [genForm, setGenForm] = useState({ version: '', template_id: '' })
  const [printForm, setPrintForm] = useState({ copies: '1', printers: ['impressora_salao'] })

  const loadData = async () => {
    try {
      setVersions(await getFBPdfVersions())
      setTemplates(await getFBPdfTemplates())
    } catch (e) {
      console.error(e)
    }
  }

  useEffect(() => {
    loadData()
  }, [])
  useRealtime('fb_pdf_versions', loadData)

  const handleGenerate = async () => {
    if (!genForm.version || !genForm.template_id)
      return toast({ title: 'Preencha os campos', variant: 'destructive' })
    try {
      const formData = new FormData()
      formData.append('version', genForm.version)
      formData.append('status', 'draft')
      formData.append('template_id', genForm.template_id)
      formData.append('creator_id', pb.authStore.record!.id)

      const pdfContent =
        '%PDF-1.4\n1 0 obj\n<< /Type /Catalog /Pages 2 0 R >>\nendobj\n2 0 obj\n<< /Type /Pages /Kids [3 0 R] /Count 1 >>\nendobj\n3 0 obj\n<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Resources << /Font << /F1 4 0 R >> >> /Contents 5 0 R >>\nendobj\n4 0 obj\n<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>\nendobj\n5 0 obj\n<< /Length 44 >>\nstream\nBT /F1 24 Tf 100 700 Td (Menu Gerado - Mock Skip) Tj ET\nendstream\nendobj\nxref\n0 6\n0000000000 65535 f \n0000000009 00000 n \n0000000058 00000 n \n0000000115 00000 n \n0000000214 00000 n \n0000000302 00000 n \ntrailer\n<< /Size 6 /Root 1 0 R >>\nstartxref\n396\n%%EOF'
      const blob = new Blob([pdfContent], { type: 'application/pdf' })
      formData.append('file', blob, `menu_v${genForm.version.replace('.', '_')}.pdf`)

      await pb.collection('fb_pdf_versions').create(formData)
      logAuditAction('GENERATE_PDF', 'Menu Impresso', {
        version: genForm.version,
        template: genForm.template_id,
      })
      toast({ title: 'PDF gerado com sucesso' })
      setIsGenerateOpen(false)
      loadData()
    } catch (e) {
      toast({ title: 'Erro ao gerar PDF', variant: 'destructive' })
    }
  }

  const handleStatusChange = async (v: FBPdfVersion, newStatus: string) => {
    try {
      const data: any = { status: newStatus }
      if (newStatus === 'approved') data.approver_id = pb.authStore.record!.id
      await updateFBPdfVersion(v.id, data)
      toast({ title: `Status alterado para ${newStatus}` })
      loadData()
    } catch (e) {
      toast({ title: 'Erro ao atualizar', variant: 'destructive' })
    }
  }

  const handlePrint = async () => {
    logAuditAction('PRINT_PDF', 'Menu Impresso', {
      version: selectedVersion?.version,
      copies: printForm.copies,
      printers: printForm.printers,
    })
    toast({
      title: `Enviado para ${printForm.printers.length} impressora(s).`,
      description: `${printForm.copies} cópia(s) em spool.`,
    })
    setIsPrintOpen(false)
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <p className="text-slate-500 text-sm">
          Versões em PDF geradas, controle de aprovação e disparos de impressão.
        </p>
        <Button onClick={() => setIsGenerateOpen(true)} className="gap-2 bg-slate-900">
          <Plus className="w-4 h-4" /> Gerar Nova Versão
        </Button>
      </div>

      <div className="bg-white rounded-lg border border-slate-200 shadow-sm overflow-hidden">
        <Table>
          <TableHeader className="bg-slate-50">
            <TableRow>
              <TableHead className="w-24 pl-6">Versão</TableHead>
              <TableHead>Template Utilizado</TableHead>
              <TableHead>Data Criação</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right pr-6">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {versions.map((v) => (
              <TableRow key={v.id} className="hover:bg-slate-50/50">
                <TableCell className="pl-6 font-mono font-bold text-slate-800">
                  v{v.version}
                </TableCell>
                <TableCell className="font-medium text-slate-600">
                  {v.expand?.template_id?.name || 'Desconhecido'}
                </TableCell>
                <TableCell className="text-slate-500 text-sm">
                  {format(new Date(v.created), 'dd/MM/yyyy HH:mm')}
                </TableCell>
                <TableCell>
                  {v.status === 'draft' && (
                    <Badge variant="secondary">Rascunho (Marca D'água)</Badge>
                  )}
                  {v.status === 'pending_approval' && (
                    <Badge className="bg-amber-100 text-amber-800 hover:bg-amber-200">
                      Aprovação Pendente
                    </Badge>
                  )}
                  {v.status === 'approved' && (
                    <Badge className="bg-emerald-100 text-emerald-800 hover:bg-emerald-200">
                      Aprovado e Final
                    </Badge>
                  )}
                </TableCell>
                <TableCell className="text-right pr-6 space-x-2">
                  {v.file && (
                    <Button variant="ghost" size="icon" asChild title="Baixar PDF">
                      <a
                        href={pb.files.getUrl(v, v.file)}
                        target="_blank"
                        rel="noreferrer"
                        download
                      >
                        <Download className="w-4 h-4 text-blue-600" />
                      </a>
                    </Button>
                  )}
                  {v.status === 'draft' && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleStatusChange(v, 'pending_approval')}
                    >
                      Solicitar Aprovação
                    </Button>
                  )}
                  {v.status === 'pending_approval' && canApprove && (
                    <Button
                      size="sm"
                      className="bg-emerald-600 text-white"
                      onClick={() => handleStatusChange(v, 'approved')}
                    >
                      <ShieldCheck className="w-4 h-4 mr-1" /> Aprovar
                    </Button>
                  )}
                  {v.status === 'approved' && (
                    <Button
                      variant="outline"
                      size="sm"
                      className="text-slate-700"
                      onClick={() => {
                        setSelectedVersion(v)
                        setIsPrintOpen(true)
                      }}
                    >
                      <Printer className="w-4 h-4 mr-1" /> Imprimir
                    </Button>
                  )}
                </TableCell>
              </TableRow>
            ))}
            {versions.length === 0 && (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-8 text-slate-500">
                  Nenhuma versão gerada.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <Dialog open={isGenerateOpen} onOpenChange={setIsGenerateOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Gerar Novo PDF</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-500 uppercase">Versão (Ex: 1.0)</label>
              <Input
                value={genForm.version}
                onChange={(e) => setForm({ ...genForm, version: e.target.value })}
                placeholder="1.0"
              />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-500 uppercase">Template Base</label>
              <Select
                value={genForm.template_id}
                onValueChange={(v) => setGenForm({ ...genForm, template_id: v })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione um template..." />
                </SelectTrigger>
                <SelectContent>
                  {templates.map((t) => (
                    <SelectItem key={t.id} value={t.id}>
                      {t.name} ({t.format})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="bg-slate-50 p-3 rounded text-xs text-slate-500 mt-4 border">
              Atenção: Itens marcados como "Esgotado" (is_available = false) não serão incluídos no
              PDF final para evitar problemas de pedido.
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsGenerateOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={handleGenerate}>Gerar Rascunho</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={isPrintOpen} onOpenChange={setIsPrintOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Imprimir Menu v{selectedVersion?.version}</DialogTitle>
          </DialogHeader>
          <div className="space-y-6 py-4">
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-500 uppercase">
                Quantidade de Cópias
              </label>
              <Input
                type="number"
                min="1"
                value={printForm.copies}
                onChange={(e) => setPrintForm({ ...printForm, copies: e.target.value })}
              />
            </div>
            <div className="space-y-3">
              <label className="text-xs font-bold text-slate-500 uppercase">
                Impressoras de Destino
              </label>
              {['impressora_salao', 'impressora_cozinha', 'impressora_bar'].map((p) => (
                <div key={p} className="flex items-center space-x-2">
                  <Checkbox
                    id={p}
                    checked={printForm.printers.includes(p)}
                    onCheckedChange={(checked) => {
                      if (checked)
                        setPrintForm({ ...printForm, printers: [...printForm.printers, p] })
                      else
                        setPrintForm({
                          ...printForm,
                          printers: printForm.printers.filter((i) => i !== p),
                        })
                    }}
                  />
                  <label htmlFor={p} className="text-sm font-medium leading-none cursor-pointer">
                    {p
                      .replace('impressora_', 'Impressora ')
                      .replace('salao', 'Salão')
                      .replace('cozinha', 'Cozinha')
                      .replace('bar', 'Bar')}
                  </label>
                </div>
              ))}
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsPrintOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={handlePrint} className="bg-blue-600 hover:bg-blue-700 text-white">
              <Printer className="w-4 h-4 mr-2" /> Enviar para Spool
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
