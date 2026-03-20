import { useState } from 'react'
import { Navigate } from 'react-router-dom'
import {
  Plug,
  Server,
  RefreshCw,
  AlertCircle,
  ArrowDownToLine,
  ArrowUpFromLine,
  Search,
  Webhook,
  Save,
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import { toast } from '@/components/ui/use-toast'
import useAuthStore from '@/stores/useAuthStore'

export default function Integrations() {
  const { userRole } = useAuthStore()
  const [search, setSearch] = useState('')
  const [searched, setSearched] = useState(false)
  const [webhooks, setWebhooks] = useState([
    { id: 1, name: 'Nova Reserva', url: 'https://api.marketing.com/hook', enabled: true },
    { id: 2, name: 'Guest Check-out', url: '', enabled: false },
    { id: 3, name: 'Novo Membro Loyalty', url: 'https://crm.hotel.com/webhook', enabled: true },
  ])

  if (userRole !== 'Admin' && userRole !== 'Administrativa') {
    return <Navigate to="/" replace />
  }

  const notFound = searched && !['booking', 'airbnb', 'expedia'].includes(search.toLowerCase())

  const integrations = [
    { name: 'Booking.com (OTA)', status: 'Online', latency: '45ms', error: 'Nenhum' },
    { name: 'Airbnb (OTA)', status: 'Online', latency: '60ms', error: 'Sync delay às 14:02' },
    { name: 'Expedia (OTA)', status: 'Offline', latency: '-', error: 'Timeout de Conexão' },
  ]

  const handleSaveWebhook = () => {
    toast({ title: 'Configuração Salva', description: 'O Webhook foi atualizado com sucesso.' })
  }

  return (
    <div className="space-y-6 animate-fade-in pb-8">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900 flex items-center gap-2">
          <Plug className="w-6 h-6 text-primary" />
          Hub de Integrações
        </h1>
        <p className="text-muted-foreground text-sm">
          Sincronização com OTAs, PMS e gateways de automação.
        </p>
      </div>

      <Tabs defaultValue="integracoes" className="w-full mt-4">
        <TabsList className="mb-4">
          <TabsTrigger value="integracoes">Plataformas Externas</TabsTrigger>
          <TabsTrigger value="webhooks">Automação & Webhooks</TabsTrigger>
        </TabsList>

        <TabsContent value="integracoes" className="space-y-6 outline-none">
          <div className="flex gap-2 w-full max-w-md">
            <Input
              placeholder="Buscar integração (ex: expedia, booking)..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            <Button onClick={() => setSearched(true)}>
              <Search className="w-4 h-4 mr-2" /> Buscar
            </Button>
          </div>

          {notFound && (
            <div className="bg-rose-50 text-rose-700 p-4 rounded-md border border-rose-200 flex items-center gap-2 max-w-md">
              <AlertCircle className="w-5 h-5" />
              <p className="font-medium">Plataforma não reconhecida.</p>
            </div>
          )}

          <div className="grid gap-4 md:grid-cols-3">
            {integrations.map((integ) => (
              <Card key={integ.name} className="shadow-sm border-slate-200">
                <CardHeader className="pb-3">
                  <CardTitle className="text-base flex justify-between items-center">
                    {integ.name}
                    <Badge
                      variant="outline"
                      className={
                        integ.status === 'Online'
                          ? 'bg-emerald-100 text-emerald-800 border-emerald-200'
                          : 'bg-rose-100 text-rose-800 border-rose-200'
                      }
                    >
                      {integ.status}
                    </Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3 text-sm">
                  <div className="flex justify-between text-slate-600 bg-slate-50 p-2 rounded">
                    <span>Latência:</span> <span className="font-mono">{integ.latency}</span>
                  </div>
                  <div className="flex justify-between text-slate-600 bg-slate-50 p-2 rounded">
                    <span>Último Erro:</span>{' '}
                    <span className="text-rose-600 font-medium">{integ.error}</span>
                  </div>
                  <Button variant="outline" className="w-full mt-2" size="sm">
                    <RefreshCw className="w-3 h-3 mr-2" /> Forçar Sync
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>

          <Card className="border-slate-200 shadow-sm">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Server className="w-5 h-5" /> Transferência de Dados
              </CardTitle>
            </CardHeader>
            <CardContent className="flex flex-wrap gap-4">
              <Button variant="secondary" className="gap-2">
                <ArrowDownToLine className="w-4 h-4" /> Importar PMS
              </Button>
              <Button variant="secondary" className="gap-2">
                <ArrowUpFromLine className="w-4 h-4" /> Exportar Relatórios
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="webhooks" className="space-y-4 outline-none">
          <Card className="border-slate-200 shadow-sm max-w-3xl">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <Webhook className="w-5 h-5 text-primary" />
                Gatilhos de Eventos Internos
              </CardTitle>
              <CardDescription>
                Configure endpoints de Webhook para disparar ações automáticas (ex: emails de
                marketing) quando ocorrerem eventos no sistema.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {webhooks.map((wh) => (
                <div
                  key={wh.id}
                  className="flex flex-col sm:flex-row sm:items-center gap-4 bg-slate-50 p-4 rounded-lg border border-slate-200"
                >
                  <div className="flex-1 space-y-1.5">
                    <Label className="text-sm font-bold text-slate-800 uppercase tracking-wider">
                      {wh.name}
                    </Label>
                    <div className="flex gap-2">
                      <Input
                        placeholder="https://..."
                        className="bg-white"
                        value={wh.url}
                        onChange={(e) =>
                          setWebhooks((ws) =>
                            ws.map((w) => (w.id === wh.id ? { ...w, url: e.target.value } : w)),
                          )
                        }
                      />
                      <Button
                        variant="secondary"
                        size="icon"
                        className="shrink-0 bg-slate-200 hover:bg-slate-300"
                        onClick={handleSaveWebhook}
                      >
                        <Save className="w-4 h-4 text-slate-700" />
                      </Button>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 sm:pt-6 shrink-0">
                    <Switch
                      checked={wh.enabled}
                      onCheckedChange={(c) =>
                        setWebhooks((ws) =>
                          ws.map((w) => (w.id === wh.id ? { ...w, enabled: c } : w)),
                        )
                      }
                    />
                    <span className="text-sm font-medium text-slate-600 w-12">
                      {wh.enabled ? 'Ativo' : 'Inativo'}
                    </span>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
