import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { toast } from '@/components/ui/use-toast'
import { Loader2, Save, Mail, Info } from 'lucide-react'
import pb from '@/lib/pocketbase/client'

export function EmailTemplateEditor() {
  const [template, setTemplate] = useState<any>(null)
  const [subject, setSubject] = useState('')
  const [content, setContent] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [isFetching, setIsFetching] = useState(true)

  useEffect(() => {
    const load = async () => {
      try {
        const record = await pb
          .collection('email_templates')
          .getFirstListItem('slug="welcome-email"')
        setTemplate(record)
        setSubject(record.subject)
        setContent(record.content)
      } catch (e) {
        console.error('Template not found', e)
      } finally {
        setIsFetching(false)
      }
    }
    load()
  }, [])

  const handleSave = async () => {
    if (!template) return
    setIsLoading(true)
    try {
      await pb.collection('email_templates').update(template.id, {
        subject,
        content,
      })
      toast({ title: 'Sucesso', description: 'Template guardado com sucesso.' })
    } catch (e) {
      toast({ title: 'Erro', description: 'Falha ao guardar template.', variant: 'destructive' })
    } finally {
      setIsLoading(false)
    }
  }

  if (isFetching) {
    return (
      <div className="flex justify-center p-12">
        <Loader2 className="w-8 h-8 animate-spin text-slate-300" />
      </div>
    )
  }

  if (!template) {
    return (
      <Card>
        <CardContent className="p-8 text-center text-slate-500">
          Template de e-mail não encontrado na base de dados.
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="border-slate-200 shadow-sm max-w-4xl">
      <CardHeader className="border-b bg-slate-50 flex flex-row items-center justify-between">
        <div>
          <CardTitle className="text-lg font-bold flex items-center gap-2 text-slate-800">
            <Mail className="w-5 h-5 text-blue-600" />
            Template: E-mail de Boas-vindas
          </CardTitle>
          <CardDescription>
            Personalize a mensagem que os novos membros da equipa recebem ao serem cadastrados.
          </CardDescription>
        </div>
      </CardHeader>
      <CardContent className="p-6 space-y-6">
        <div className="bg-blue-50 border border-blue-100 rounded-lg p-4 flex items-start gap-3">
          <Info className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
          <div className="text-sm text-blue-800">
            <p className="font-semibold mb-1">Variáveis Dinâmicas Disponíveis:</p>
            <p>
              Pode usar as seguintes tags (copie e cole) no assunto ou no corpo do e-mail. Elas
              serão substituídas automaticamente:
            </p>
            <div className="mt-2 flex flex-wrap gap-2">
              <code className="bg-white px-2 py-1 rounded border border-blue-200 text-blue-700 font-mono text-xs">{`{{name}}`}</code>
              <code className="bg-white px-2 py-1 rounded border border-blue-200 text-blue-700 font-mono text-xs">{`{{email}}`}</code>
              <code className="bg-white px-2 py-1 rounded border border-blue-200 text-blue-700 font-mono text-xs">{`{{password}}`}</code>
              <code className="bg-white px-2 py-1 rounded border border-blue-200 text-blue-700 font-mono text-xs">{`{{login_url}}`}</code>
            </div>
            <p className="mt-2 text-xs opacity-80">Nota: O HTML é suportado no corpo do e-mail.</p>
          </div>
        </div>

        <div className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-semibold text-slate-700">Assunto do E-mail</label>
            <Input
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              placeholder="Ex: Bem-vindo à equipa, {{name}}!"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-semibold text-slate-700">
              Corpo do E-mail (HTML permitido)
            </label>
            <Textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              className="min-h-[300px] font-mono text-sm"
              placeholder="Escreva o conteúdo do e-mail..."
            />
          </div>
        </div>

        <div className="flex justify-end pt-2">
          <Button
            onClick={handleSave}
            disabled={isLoading || !subject || !content}
            className="gap-2"
          >
            {isLoading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Save className="w-4 h-4" />
            )}
            Salvar Template
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
