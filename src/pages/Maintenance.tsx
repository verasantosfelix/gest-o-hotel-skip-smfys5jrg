import { useState } from 'react'
import { Wrench } from 'lucide-react'
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

export default function Maintenance() {
  const { userRole } = useAuthStore()
  const [output, setOutput] = useState('')

  const handleAvaria = (e: React.FormEvent) => {
    e.preventDefault()
    setOutput(
      `<OUTPUT>\n  <status>Avaria registrada</status>\n  <ticket_id>TKT-${Math.floor(Math.random() * 9000) + 1000}</ticket_id>\n</OUTPUT>`,
    )
  }

  const handleOS = (e: React.FormEvent) => {
    e.preventDefault()
    setOutput(
      `<OUTPUT>\n  <status>OS criada</status>\n  <os_id>OS-${Math.floor(Math.random() * 9000) + 1000}</os_id>\n</OUTPUT>`,
    )
  }

  const handlePreventiva = (e: React.FormEvent) => {
    e.preventDefault()
    const futureDate = new Date()
    futureDate.setDate(futureDate.getDate() + 15)
    setOutput(
      `<OUTPUT>\n  <status>Preventiva agendada</status>\n  <data>${futureDate.toLocaleDateString('pt-BR')}</data>\n</OUTPUT>`,
    )
  }

  const handleFornecedor = (e: React.FormEvent) => {
    e.preventDefault()
    setOutput(
      `<OUTPUT>\n  <status>Fornecedor acionado</status>\n  <notificacao>Enviada com sucesso</notificacao>\n</OUTPUT>`,
    )
  }

  if (userRole !== 'Admin' && userRole !== 'Administrativa') return null

  return (
    <div className="space-y-6 animate-fade-in pb-8">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900 flex items-center gap-2">
          <Wrench className="w-6 h-6 text-primary" />
          Manutenção & Facilities
        </h1>
        <p className="text-muted-foreground text-sm">
          Gestão de avarias, ordens de serviço (OS) e manutenções preventivas.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card className="border-slate-200 shadow-sm">
          <CardHeader>
            <CardTitle>Painel Operacional</CardTitle>
            <CardDescription>Selecione o fluxo de manutenção.</CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="avaria" className="w-full">
              <TabsList className="mb-4 bg-slate-100 flex flex-wrap h-auto p-1">
                <TabsTrigger value="avaria">Reg. Avaria</TabsTrigger>
                <TabsTrigger value="os">Ordem (OS)</TabsTrigger>
                <TabsTrigger value="preventiva">Preventiva</TabsTrigger>
                <TabsTrigger value="fornecedor">Fornecedor</TabsTrigger>
              </TabsList>

              <TabsContent value="avaria">
                <form onSubmit={handleAvaria} className="space-y-4">
                  <div className="space-y-2">
                    <Label>Localização</Label>
                    <Input placeholder="Ex: Quarto 204" required />
                  </div>
                  <div className="space-y-2">
                    <Label>Descrição do Problema</Label>
                    <Input placeholder="Ex: Ar condicionado vazando água" required />
                  </div>
                  <div className="space-y-2">
                    <Label>Prioridade</Label>
                    <Select defaultValue="alta">
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="alta">Alta</SelectItem>
                        <SelectItem value="media">Média</SelectItem>
                        <SelectItem value="baixa">Baixa</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <Button type="submit" className="w-full">
                    Registrar Avaria
                  </Button>
                </form>
              </TabsContent>

              <TabsContent value="os">
                <form onSubmit={handleOS} className="space-y-4">
                  <div className="space-y-2">
                    <Label>Tipo de Problema</Label>
                    <Input placeholder="Ex: Elétrico" required />
                  </div>
                  <div className="space-y-2">
                    <Label>Técnico Interno (Atribuição)</Label>
                    <Select defaultValue="carlos">
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="carlos">Carlos (Manutenção)</SelectItem>
                        <SelectItem value="joao">João (Manutenção)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <Button type="submit" className="w-full">
                    Criar Ordem de Serviço
                  </Button>
                </form>
              </TabsContent>

              <TabsContent value="preventiva">
                <form onSubmit={handlePreventiva} className="space-y-4">
                  <div className="space-y-2">
                    <Label>Equipamento ou Área</Label>
                    <Input placeholder="Ex: Caldeira Principal" required />
                  </div>
                  <Button type="submit" className="w-full">
                    Agendar Preventiva
                  </Button>
                </form>
              </TabsContent>

              <TabsContent value="fornecedor">
                <form onSubmit={handleFornecedor} className="space-y-4">
                  <div className="space-y-2">
                    <Label>Fornecedor Externo</Label>
                    <Input placeholder="Ex: Elevadores XYZ" required />
                  </div>
                  <div className="space-y-2">
                    <Label>Detalhes da Solicitação</Label>
                    <Input placeholder="Ex: Revisão anual obrigatória" required />
                  </div>
                  <Button type="submit" className="w-full">
                    Acionar Fornecedor
                  </Button>
                </form>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>

        <div>
          {output && (
            <Card className="border-emerald-500/20 bg-emerald-50 shadow-sm animate-fade-in-up">
              <CardHeader>
                <CardTitle className="text-emerald-700 font-display">Status do Sistema</CardTitle>
              </CardHeader>
              <CardContent>
                <pre className="bg-slate-900 text-emerald-400 p-4 rounded-md font-mono text-sm overflow-x-auto shadow-inner">
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
