import { useState } from 'react'
import { FileSignature, Upload, Search, CheckCircle, FileText } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import useAuthStore from '@/stores/useAuthStore'

export default function DocumentsContracts() {
  const { userRole } = useAuthStore()
  const [output, setOutput] = useState('')

  const handleCreateContract = (e: React.FormEvent) => {
    e.preventDefault()
    setOutput(
      `<OUTPUT>\n  <status>Contrato criado</status>\n  <contrato_id>CTR-${Math.floor(Math.random() * 9000) + 1000}</contrato_id>\n  <acao>Minuta gerada com base no template selecionado.</acao>\n</OUTPUT>`,
    )
  }

  const handleAttachDocument = (e: React.FormEvent) => {
    e.preventDefault()
    setOutput(
      `<OUTPUT>\n  <status>Documento anexado com sucesso</status>\n  <arquivo>documento_assinado.pdf</arquivo>\n</OUTPUT>`,
    )
  }

  const handleOCR = () => {
    setOutput(
      `<OUTPUT>\n  <status>OCR Processado com Sucesso</status>\n  <dados_extraidos>\n    <empresa>Tech Corp S.A.</empresa>\n    <cnpj>12.345.678/0001-99</cnpj>\n    <valor_global>R$ 150.000,00</valor_global>\n    <assinado>Sim</assinado>\n  </dados_extraidos>\n</OUTPUT>`,
    )
  }

  if (userRole !== 'Admin' && userRole !== 'Administrativa') return null

  return (
    <div className="space-y-6 animate-fade-in pb-8">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900 flex items-center gap-2">
          <FileSignature className="w-6 h-6 text-primary" />
          Documentos & Contratos
        </h1>
        <p className="text-muted-foreground text-sm">
          Gestão de contratos corporativos, OCR de documentos e fluxos de aprovação.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card className="border-slate-200 shadow-sm">
          <CardHeader>
            <CardTitle>Operações Documentais</CardTitle>
            <CardDescription>Crie, anexe e valide arquivos legais.</CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="novo-contrato" className="w-full">
              <TabsList className="mb-4 bg-slate-100 flex flex-wrap h-auto p-1">
                <TabsTrigger value="novo-contrato">Novo Contrato</TabsTrigger>
                <TabsTrigger value="anexar">Anexar Doc</TabsTrigger>
                <TabsTrigger value="ocr">Processamento OCR</TabsTrigger>
                <TabsTrigger value="versoes">Aprovação & Versões</TabsTrigger>
              </TabsList>

              <TabsContent value="novo-contrato">
                <form onSubmit={handleCreateContract} className="space-y-4">
                  <div className="space-y-2">
                    <Label>Tipo de Contrato</Label>
                    <Select defaultValue="group" required>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione o tipo" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="group">Hospedagem em Grupo</SelectItem>
                        <SelectItem value="event">Espaço para Eventos</SelectItem>
                        <SelectItem value="corporate">Acordo Corporativo (Tarifa)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Nome do Cliente / Empresa</Label>
                    <Input placeholder="Ex: Tech Corp S.A." required />
                  </div>
                  <Button type="submit" className="w-full">
                    Gerar Minuta (Draft)
                  </Button>
                </form>
              </TabsContent>

              <TabsContent value="anexar">
                <form onSubmit={handleAttachDocument} className="space-y-4">
                  <div className="space-y-2">
                    <Label>ID do Contrato ou Cliente</Label>
                    <Input placeholder="Ex: CTR-1234" required />
                  </div>
                  <div className="space-y-2">
                    <Label>Tipo de Documento</Label>
                    <Select defaultValue="identificacao" required>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="identificacao">Identificação (CNPJ/RG)</SelectItem>
                        <SelectItem value="assinado">Contrato Assinado (Físico)</SelectItem>
                        <SelectItem value="comprovante">Comprovante de Pagamento</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="border-2 border-dashed border-slate-300 rounded-lg p-6 text-center bg-slate-50">
                    <Upload className="w-8 h-8 text-slate-400 mx-auto mb-2" />
                    <p className="text-sm text-slate-600 font-medium">Clique para fazer upload</p>
                  </div>
                  <Button type="submit" className="w-full">
                    Salvar e Anexar
                  </Button>
                </form>
              </TabsContent>

              <TabsContent value="ocr" className="space-y-4">
                <p className="text-sm text-slate-600">
                  Extraia informações automaticamente de documentos físicos escaneados utilizando
                  Visão Computacional.
                </p>
                <div className="border border-slate-200 p-4 rounded-md flex items-center justify-between bg-slate-50">
                  <div className="flex items-center gap-3">
                    <FileText className="w-5 h-5 text-slate-500" />
                    <span className="text-sm font-medium">scan_contrato_001.pdf</span>
                  </div>
                  <Button variant="secondary" size="sm" onClick={handleOCR}>
                    Extrair Dados
                  </Button>
                </div>
              </TabsContent>

              <TabsContent value="versoes" className="space-y-4">
                <div className="space-y-3">
                  <div className="p-4 border rounded-lg bg-slate-50 flex flex-col gap-3">
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="font-bold text-slate-900">CTR-8492 (Tech Corp)</p>
                        <p className="text-xs text-slate-500">
                          Versão Atual: v1.2 (Aguardando Assinatura)
                        </p>
                      </div>
                      <span className="text-xs font-medium bg-amber-100 text-amber-800 px-2 py-1 rounded">
                        Pendente
                      </span>
                    </div>
                    <Button variant="outline" className="w-full border-slate-300 gap-2">
                      <CheckCircle className="w-4 h-4 text-emerald-600" /> Assinar Digitalmente
                    </Button>
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>

        <div>
          {output && (
            <Card className="border-emerald-500/20 bg-emerald-50 shadow-sm animate-fade-in-up">
              <CardHeader>
                <CardTitle className="text-emerald-700 font-display text-base">
                  Terminal de Output
                </CardTitle>
              </CardHeader>
              <CardContent>
                <pre className="bg-slate-900 text-emerald-400 p-4 rounded-md font-mono text-sm overflow-x-auto shadow-inner whitespace-pre-wrap">
                  {output}
                </pre>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}
