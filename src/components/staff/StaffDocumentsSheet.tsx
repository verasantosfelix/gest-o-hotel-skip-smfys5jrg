import { useState, useRef, useEffect } from 'react'
import { FileText, Upload, Trash2, Download, Loader2, Plus, Calendar } from 'lucide-react'

import { Button } from '@/components/ui/button'
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { toast } from '@/components/ui/use-toast'
import { getStaffDocuments, uploadStaffDocument, deleteStaffDocument } from '@/services/staff'
import { useRealtime } from '@/hooks/use-realtime'
import pb from '@/lib/pocketbase/client'
import { useAccess } from '@/hooks/use-access'

export function StaffDocumentsSheet({ user }: { user: any }) {
  const [open, setOpen] = useState(false)
  const [documents, setDocuments] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isUploading, setIsUploading] = useState(false)

  const [title, setTitle] = useState('')
  const [category, setCategory] = useState<string>('')
  const [file, setFile] = useState<File | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const { hasAccess } = useAccess()
  const canManage = hasAccess(['Direcao_Admin']) || pb.authStore.record?.role === 'manager'

  const loadDocuments = async () => {
    if (!user?.id) return
    setIsLoading(true)
    try {
      const docs = await getStaffDocuments(user.id)
      setDocuments(docs)
    } catch (e) {
      console.error(e)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    if (open) loadDocuments()
  }, [open, user.id])

  useRealtime('staff_documents', () => {
    if (open) loadDocuments()
  })

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!title || !category || !file) {
      toast({
        title: 'Atenção',
        description: 'Preencha todos os campos e selecione um arquivo.',
        variant: 'destructive',
      })
      return
    }

    if (file.size > 10 * 1024 * 1024) {
      toast({
        title: 'Erro',
        description: 'O arquivo não pode exceder 10MB.',
        variant: 'destructive',
      })
      return
    }

    setIsUploading(true)
    try {
      await uploadStaffDocument({ staff_id: user.id, title, category }, file)
      toast({ title: 'Sucesso', description: 'Documento enviado com sucesso.' })
      setTitle('')
      setCategory('')
      setFile(null)
      if (fileInputRef.current) fileInputRef.current.value = ''
    } catch (error) {
      toast({ title: 'Erro', description: 'Falha ao enviar documento.', variant: 'destructive' })
    } finally {
      setIsUploading(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (
      !window.confirm(
        'Tem certeza que deseja apagar este documento? Esta ação não pode ser desfeita.',
      )
    )
      return
    try {
      await deleteStaffDocument(id)
      toast({ title: 'Sucesso', description: 'Documento apagado.' })
    } catch (error) {
      toast({ title: 'Erro', description: 'Falha ao apagar documento.', variant: 'destructive' })
    }
  }

  const categoryColors: Record<string, string> = {
    contract: 'bg-blue-100 text-blue-800',
    certificate: 'bg-amber-100 text-amber-800',
    identification: 'bg-purple-100 text-purple-800',
    training: 'bg-emerald-100 text-emerald-800',
    other: 'bg-slate-100 text-slate-800',
  }

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className="h-8 gap-2 font-medium bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100"
        >
          <FileText className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Docs</span>
        </Button>
      </SheetTrigger>
      <SheetContent className="sm:max-w-md w-full overflow-y-auto bg-slate-50/50">
        <SheetHeader className="mb-6">
          <SheetTitle className="flex items-center gap-2">
            <FileText className="w-5 h-5 text-blue-600" />
            Documentos Profissionais
          </SheetTitle>
          <SheetDescription>
            Gerencie o dossier de <strong>{user.name || user.email}</strong>.
          </SheetDescription>
        </SheetHeader>

        {canManage && (
          <div className="bg-white p-4 rounded-lg border border-slate-200 shadow-sm mb-6">
            <h3 className="text-sm font-semibold mb-3 flex items-center gap-2">
              <Upload className="w-4 h-4 text-slate-500" />
              Novo Documento
            </h3>
            <form onSubmit={handleUpload} className="space-y-3">
              <Input
                placeholder="Título do Documento"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="bg-slate-50"
              />
              <Select value={category} onValueChange={setCategory}>
                <SelectTrigger className="bg-slate-50">
                  <SelectValue placeholder="Categoria" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="contract">Contrato</SelectItem>
                  <SelectItem value="certificate">Certificado</SelectItem>
                  <SelectItem value="identification">Identificação</SelectItem>
                  <SelectItem value="training">Formação</SelectItem>
                  <SelectItem value="other">Outro</SelectItem>
                </SelectContent>
              </Select>
              <Input
                type="file"
                ref={fileInputRef}
                onChange={(e) => setFile(e.target.files?.[0] || null)}
                className="bg-slate-50 file:mr-4 file:py-1 file:px-3 file:rounded-md file:border-0 file:text-xs file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
              />
              <Button
                type="submit"
                disabled={isUploading || !title || !category || !file}
                className="w-full"
              >
                {isUploading ? (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <Plus className="w-4 h-4 mr-2" />
                )}
                Salvar Documento
              </Button>
            </form>
          </div>
        )}

        <div className="space-y-3">
          <h3 className="text-sm font-semibold text-slate-700">Dossier Arquivado</h3>

          {isLoading ? (
            <div className="py-8 flex justify-center">
              <Loader2 className="w-6 h-6 animate-spin text-slate-300" />
            </div>
          ) : documents.length === 0 ? (
            <div className="py-8 text-center text-slate-400 text-sm border-2 border-dashed border-slate-200 rounded-lg bg-white">
              Nenhum documento encontrado.
            </div>
          ) : (
            documents.map((doc) => (
              <div
                key={doc.id}
                className="bg-white p-3 rounded-lg border border-slate-200 shadow-sm flex items-start justify-between group transition-colors hover:border-blue-200"
              >
                <div className="space-y-1 overflow-hidden pr-2">
                  <div className="flex items-center gap-2">
                    <h4 className="font-medium text-sm text-slate-800 truncate" title={doc.title}>
                      {doc.title}
                    </h4>
                    <Badge
                      variant="secondary"
                      className={`text-[10px] uppercase font-bold py-0 h-4 border-transparent ${categoryColors[doc.category]}`}
                    >
                      {doc.category}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-1 text-xs text-slate-500">
                    <Calendar className="w-3 h-3" />
                    {new Date(doc.created).toLocaleDateString('pt-PT')}
                  </div>
                </div>

                <div className="flex items-center gap-1 shrink-0">
                  <a
                    href={pb.files.getUrl(doc, doc.document_file)}
                    target="_blank"
                    rel="noreferrer"
                    download
                    className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-md transition-colors"
                    title="Baixar Documento"
                  >
                    <Download className="w-4 h-4" />
                  </a>
                  {canManage && (
                    <button
                      onClick={() => handleDelete(doc.id)}
                      className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-md transition-colors"
                      title="Apagar Documento"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </SheetContent>
    </Sheet>
  )
}
