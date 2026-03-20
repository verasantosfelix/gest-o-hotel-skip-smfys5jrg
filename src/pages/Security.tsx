import { useState } from 'react'
import { ShieldAlert } from 'lucide-react'
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

export default function Security() {
  const { userRole } = useAuthStore()
  const [output, setOutput] = useState('')

  const handleIncidente = (e: React.FormEvent) => {
    e.preventDefault()
    setOutput(
      `<OUTPUT>\n  <status>Incidente registado</status>\n  <incidente_id>INC-${Math.floor(Math.random() * 9000) + 1000}</incidente_id>\n</OUTPUT>`,
    )
  }

  const handleProtocolo = (e: React.FormEvent) => {
    e.preventDefault()
    setOutput(
      `<OUTPUT>\n  <status>Protocolo recuperado</status>\n  <procedimentos>\n    1. Isolar a área.\n    2. Notificar gerência.\n    3. Acionar autoridades competentes se necessário.\n  </procedimentos>\n</OUTPUT>`,
    )
  }

  const handleAuditoria = (e: React.FormEvent) => {
    e.preventDefault()
    setOutput(
      `<OUTPUT>\n  <status>Checklist gerado</status>\n  <area>Piscina / Área de Lazer</area>\n  <itens>\n    [ ] Verificação de PH da água\n    [ ] Checagem de pisos antiderrapantes\n    [ ] Sinalização de profundidade visível\n  </itens>\n</OUTPUT>`,
    )
  }

  const handleConformidade = () => {
    setOutput(
      `<OUTPUT>\n  <status>Conformidade analisada</status>\n  <resultado>Padrões operacionais dentro da normalidade. Nenhuma violação detectada nos últimos 30 dias.</resultado>\n</OUTPUT>`,
    )
  }

  if (userRole !== 'Admin' && userRole !== 'Administrativa') return null

  return (
    <div className="space-y-6 animate-fade-in pb-8">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900 flex items-center gap-2">
          <ShieldAlert className="w-6 h-6 text-primary" />
          Segurança & Compliance
        </h1>
        <p className="text-muted-foreground text-sm">
          Registro de incidentes, consultas a protocolos e auditorias.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card className="border-slate-200 shadow-sm">
          <CardHeader>
            <CardTitle>Controle de Segurança</CardTitle>
            <CardDescription>Módulo de gestão de riscos e normas.</CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="incidente" className="w-full">
              <TabsList className="mb-4 bg-slate-100 flex flex-wrap h-auto p-1">
                <TabsTrigger value="incidente">Incidentes</TabsTrigger>
                <TabsTrigger value="protocolos">Protocolos</TabsTrigger>
                <TabsTrigger value="auditoria">Auditoria</TabsTrigger>
                <TabsTrigger value="conformidade">Conformidade</TabsTrigger>
              </TabsList>

              <TabsContent value="incidente">
                <form onSubmit={handleIncidente} className="space-y-4">
                  <div className="space-y-2">
                    <Label>Tipo de Incidente</Label>
                    <Select defaultValue="acidente" required>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="acidente">Acidente com hóspede/staff</SelectItem>
                        <SelectItem value="furto">Furto / Perda</SelectItem>
                        <SelectItem value="dano">Dano ao patrimônio</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Setor</Label>
                    <Input placeholder="Ex: Recepção" required />
                  </div>
                  <div className="space-y-2">
                    <Label>Gravidade</Label>
                    <Select defaultValue="alta" required>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="critica">Crítica (Imediata)</SelectItem>
                        <SelectItem value="alta">Alta</SelectItem>
                        <SelectItem value="media">Média</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <Button type="submit" className="w-full">
                    Registrar Incidente
                  </Button>
                </form>
              </TabsContent>

              <TabsContent value="protocolos">
                <form onSubmit={handleProtocolo} className="space-y-4">
                  <div className="space-y-2">
                    <Label>Buscar Norma Específica</Label>
                    <Input placeholder="Ex: Evacuação de Incêndio" required />
                  </div>
                  <Button type="submit" className="w-full">
                    Consultar Procedimentos
                  </Button>
                </form>
              </TabsContent>

              <TabsContent value="auditoria">
                <form onSubmit={handleAuditoria} className="space-y-4">
                  <div className="space-y-2">
                    <Label>Área a ser Auditada</Label>
                    <Input placeholder="Ex: Piscina" required />
                  </div>
                  <Button type="submit" className="w-full">
                    Gerar Checklist Específico
                  </Button>
                </form>
              </TabsContent>

              <TabsContent value="conformidade" className="space-y-4">
                <p className="text-sm text-slate-600">
                  Verifique padrões operacionais contra as normas vigentes do estabelecimento.
                </p>
                <Button onClick={handleConformidade} className="w-full">
                  Verificar Padrões (Conformidade)
                </Button>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>

        <div>
          {output && (
            <Card className="border-emerald-500/20 bg-emerald-50 shadow-sm animate-fade-in-up">
              <CardHeader>
                <CardTitle className="text-emerald-700 font-display">Retorno do Sistema</CardTitle>
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
