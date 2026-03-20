import { useState } from 'react'
import { Bot, Activity, FileCode2, History } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import useAuthStore from '@/stores/useAuthStore'

export default function AIGovernance() {
  const { userRole } = useAuthStore()
  const [output, setOutput] = useState('')

  const handleLogs = () => {
    setOutput(
      `<OUTPUT>\n  <logs_cognitivos>\n    [10:45] Módulo: Assistente de Reservas - Ação: NLP Parse (Intenção: Nova Reserva) - Status: Sucesso\n    [11:02] Módulo: Pricing Automático - Ação: Process Forecasting Data - Status: Anomalia Menor (Aviso)\n    [11:15] Módulo: Concierge Virtual - Ação: Intent Match (Dúvida Hóspede) - Status: Sucesso\n  </logs_cognitivos>\n</OUTPUT>`,
    )
  }

  const handleVersions = () => {
    setOutput(
      `<OUTPUT>\n  <historico_prompts>\n    <versao id="v2.4">Ativa - Refinada para maior assertividade em regras de cancelamento.</versao>\n    <versao id="v2.3">Anterior - Rollback disponível.</versao>\n    <versao id="v1.0">Original - Base de conhecimento inicial.</versao>\n  </historico_prompts>\n</OUTPUT>`,
    )
  }

  const handleMonitoring = () => {
    setOutput(
      `<OUTPUT>\n  <metricas_ia>\n    <latencia_media>120ms</latencia_media>\n    <taxa_acerto_nlp>98.4%</taxa_acerto_nlp>\n    <anomalias_detectadas>0</anomalias_detectadas>\n    <status_motor>Operacional</status_motor>\n  </metricas_ia>\n</OUTPUT>`,
    )
  }

  if (userRole !== 'Admin' && userRole !== 'Administrativa') return null

  return (
    <div className="space-y-6 animate-fade-in pb-8">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900 flex items-center gap-2">
          <Bot className="w-6 h-6 text-primary" />
          Governança de IA & Controle
        </h1>
        <p className="text-muted-foreground text-sm">
          Administração de logs cognitivos, prompts de base e monitoramento do motor de IA.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card className="border-slate-200 shadow-sm">
          <CardHeader>
            <CardTitle>Painel de Controle Cognitivo</CardTitle>
            <CardDescription>Ferramentas de auditoria para o módulo inteligente.</CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="logs" className="w-full">
              <TabsList className="mb-4 bg-slate-100 flex flex-wrap h-auto p-1">
                <TabsTrigger value="logs">Logs Cognitivos</TabsTrigger>
                <TabsTrigger value="versionamento">Versionamento</TabsTrigger>
                <TabsTrigger value="monitoramento">Monitoramento</TabsTrigger>
              </TabsList>

              <TabsContent value="logs" className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Filtrar por Módulo</label>
                  <Select defaultValue="todos">
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="todos">Todos os Módulos</SelectItem>
                      <SelectItem value="reservas">Assistente de Reservas</SelectItem>
                      <SelectItem value="pricing">Motor de Pricing</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <Button onClick={handleLogs} className="w-full gap-2">
                  <History className="w-4 h-4" /> Consultar Logs de Processamento
                </Button>
              </TabsContent>

              <TabsContent value="versionamento" className="space-y-4">
                <p className="text-sm text-slate-600">
                  Verifique o histórico de instruções base (prompts) que controlam o comportamento
                  da IA no sistema.
                </p>
                <Button onClick={handleVersions} className="w-full gap-2">
                  <FileCode2 className="w-4 h-4" /> Exibir Versões de Prompt
                </Button>
              </TabsContent>

              <TabsContent value="monitoramento" className="space-y-4">
                <p className="text-sm text-slate-600">
                  Acompanhe métricas em tempo real e detecção de anomalias nas requisições da
                  plataforma de IA.
                </p>
                <Button onClick={handleMonitoring} className="w-full gap-2">
                  <Activity className="w-4 h-4" /> Verificar Métricas / Anomalias
                </Button>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>

        <div>
          {output && (
            <Card className="border-slate-800 bg-slate-900 shadow-sm animate-fade-in-up h-full">
              <CardHeader className="pb-2">
                <CardTitle className="text-emerald-400 font-mono text-base">
                  Console Terminal
                </CardTitle>
              </CardHeader>
              <CardContent>
                <pre className="text-emerald-400 font-mono text-sm whitespace-pre-wrap leading-relaxed">
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
