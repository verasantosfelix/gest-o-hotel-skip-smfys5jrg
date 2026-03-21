import { useState, useEffect } from 'react'
import { Server, ShieldAlert, Cpu, Activity } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import { useAccess } from '@/hooks/use-access'
import { RestrictedAccess } from '@/components/RestrictedAccess'
import { getTickets, getAssets } from '@/services/it'
import { useRealtime } from '@/hooks/use-realtime'

export default function ITAdmin() {
  const { hasAccess } = useAccess()
  const [tickets, setTickets] = useState<any[]>([])
  const [assets, setAssets] = useState<any[]>([])

  const loadData = async () => {
    try {
      const [t, a] = await Promise.all([getTickets(), getAssets()])
      setTickets(t)
      setAssets(a)
    } catch (e) {
      console.error(e)
    }
  }

  useEffect(() => {
    loadData()
  }, [])

  useRealtime('it_tickets', loadData)
  useRealtime('it_assets', loadData)

  if (!hasAccess(['Tecnologia_TI', 'Direcao_Admin'], 'IT Admin')) {
    return <RestrictedAccess requiredRoles={['Tecnologia_TI', 'Direcao_Admin']} />
  }

  const activeTickets = tickets.filter((t) => t.status !== 'closed' && t.status !== 'Resolvido')

  return (
    <div className="space-y-6 animate-fade-in pb-8">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-3 bg-slate-900 rounded-full">
          <Server className="w-6 h-6 text-white" />
        </div>
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">Infraestrutura TI</h1>
          <p className="text-sm text-slate-500">Monitoramento e Suporte Responsivo</p>
        </div>
      </div>

      {/* MOBILE VIEW: Prioritized list of alerts/tickets */}
      <div className="block md:hidden space-y-4">
        <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
          <ShieldAlert className="w-5 h-5 text-rose-500" /> Alertas Ativos ({activeTickets.length})
        </h2>
        {activeTickets.map((t) => (
          <Card key={t.id} className="border-l-4 border-l-rose-500 bg-slate-50">
            <CardContent className="p-4">
              <div className="flex justify-between items-start mb-2">
                <Badge variant="destructive" className="text-[10px]">
                  {t.category}
                </Badge>
                <span className="text-xs font-mono text-slate-500">{t.sla_deadline}</span>
              </div>
              <p className="font-bold text-slate-800 text-sm mb-1">{t.requester_name}</p>
              <p className="text-slate-600 text-sm line-clamp-2">{t.description}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* TABLET VIEW: Equipment Inventory Table */}
      <div className="hidden md:block lg:hidden space-y-6">
        <Card className="border-slate-200 shadow-sm">
          <CardHeader className="bg-slate-50 border-b pb-4">
            <CardTitle className="text-lg flex items-center gap-2">
              <Cpu className="w-5 h-5" /> Inventário de Ativos Críticos
            </CardTitle>
          </CardHeader>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Ativo</TableHead>
                <TableHead>Tipo</TableHead>
                <TableHead>Nº Série</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {assets.map((a) => (
                <TableRow key={a.id}>
                  <TableCell className="font-semibold">{a.name}</TableCell>
                  <TableCell className="text-slate-500">{a.type}</TableCell>
                  <TableCell className="font-mono text-xs">{a.serial}</TableCell>
                  <TableCell>
                    <Badge
                      variant={a.status === 'online' ? 'default' : 'secondary'}
                      className={a.status === 'online' ? 'bg-emerald-500' : ''}
                    >
                      {a.status}
                    </Badge>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Card>
      </div>

      {/* DESKTOP VIEW: Advanced Logs & Full Management */}
      <div className="hidden lg:grid grid-cols-12 gap-6">
        <div className="col-span-7 space-y-6">
          <Card className="border-slate-200 shadow-sm h-full">
            <CardHeader className="bg-slate-50 border-b pb-4">
              <CardTitle className="text-lg flex items-center gap-2">
                <Activity className="w-5 h-5 text-blue-600" /> Central de Chamados (Helpdesk)
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="pl-6">Solicitante</TableHead>
                    <TableHead>Categoria</TableHead>
                    <TableHead>Descrição</TableHead>
                    <TableHead>SLA</TableHead>
                    <TableHead className="text-right pr-6">Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {tickets.map((t) => (
                    <TableRow key={`desk-${t.id}`} className="hover:bg-slate-50">
                      <TableCell className="pl-6 font-medium">{t.requester_name}</TableCell>
                      <TableCell>
                        <Badge variant="outline">{t.category}</Badge>
                      </TableCell>
                      <TableCell className="text-sm text-slate-500 max-w-[200px] truncate">
                        {t.description}
                      </TableCell>
                      <TableCell className="font-mono text-xs">{t.sla_deadline || '-'}</TableCell>
                      <TableCell className="text-right pr-6">
                        <Badge
                          className={
                            t.status === 'open'
                              ? 'bg-rose-500'
                              : t.status === 'in_progress'
                                ? 'bg-blue-500'
                                : 'bg-slate-300 text-slate-700'
                          }
                        >
                          {t.status}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </div>

        <div className="col-span-5 space-y-6">
          <Card className="bg-slate-900 text-slate-100 border-slate-800 shadow-lg font-mono">
            <CardHeader className="border-b border-slate-800 pb-3">
              <CardTitle className="text-sm flex items-center gap-2 text-emerald-400">
                <Server className="w-4 h-4" /> System Logs (Live)
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4 h-[300px] overflow-y-auto space-y-2 text-xs opacity-90">
              <div className="flex gap-2">
                <span className="text-blue-400">[INFO]</span>{' '}
                <span>System booted successfully</span>
              </div>
              <div className="flex gap-2">
                <span className="text-blue-400">[INFO]</span>{' '}
                <span>Database connection established</span>
              </div>
              <div className="flex gap-2">
                <span className="text-amber-400">[WARN]</span>{' '}
                <span>High memory usage detected on Node 2</span>
              </div>
              {assets
                .filter((a) => a.status !== 'online')
                .map((a) => (
                  <div key={`log-${a.id}`} className="flex gap-2 text-rose-400">
                    <span>[ERROR]</span>{' '}
                    <span>
                      Asset offline: {a.name} ({a.serial})
                    </span>
                  </div>
                ))}
              <div className="flex gap-2">
                <span className="text-emerald-400">[OK]</span> <span>Sync with PMS completed</span>
              </div>
              <div className="animate-pulse flex gap-2">
                <span className="text-slate-500">_</span> <span>Aguardando novos eventos...</span>
              </div>
            </CardContent>
          </Card>

          <Card className="border-slate-200 shadow-sm">
            <CardHeader className="bg-slate-50 border-b pb-3">
              <CardTitle className="text-sm">Ações Rápidas IT</CardTitle>
            </CardHeader>
            <CardContent className="p-4 grid grid-cols-2 gap-3">
              <Button variant="outline" className="w-full justify-start text-xs h-9">
                Gerar Relatório SLA
              </Button>
              <Button variant="outline" className="w-full justify-start text-xs h-9">
                Verificar Backups
              </Button>
              <Button variant="outline" className="w-full justify-start text-xs h-9 text-rose-600">
                Reiniciar Serviço
              </Button>
              <Button variant="outline" className="w-full justify-start text-xs h-9">
                Gerenciar Acessos
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
