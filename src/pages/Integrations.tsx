import { useEffect, useState } from 'react'
import { Plug, RefreshCw, AlertCircle, CheckCircle2, Globe } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { useAccess } from '@/hooks/use-access'
import { RestrictedAccess } from '@/components/RestrictedAccess'
import { getOTAConnections, syncOTAConnection, OTAConnection } from '@/services/ota_connections'
import { useRealtime } from '@/hooks/use-realtime'
import { toast } from '@/components/ui/use-toast'

export default function Integrations() {
  const { hasAccess } = useAccess()
  const [connections, setConnections] = useState<OTAConnection[]>([])
  const [isSyncing, setIsSyncing] = useState<string | null>(null)

  const loadConnections = async () => {
    try {
      const data = await getOTAConnections()
      setConnections(data)
    } catch (error) {
      console.error('Failed to load OTA connections', error)
    }
  }

  useEffect(() => {
    loadConnections()
  }, [])

  useRealtime('ota_connections', loadConnections)

  if (!hasAccess(['Tecnologia_TI', 'Direcao_Admin'], 'Integrações')) {
    return <RestrictedAccess requiredRoles={['Tecnologia_TI', 'Direcao_Admin']} />
  }

  const handleSync = async (channelId?: string) => {
    setIsSyncing(channelId || 'all')
    try {
      await syncOTAConnection(channelId)
      toast({ title: 'Sincronização concluída com sucesso!' })
      await loadConnections()
    } catch (error) {
      toast({ title: 'Erro na sincronização', variant: 'destructive' })
    } finally {
      setIsSyncing(null)
    }
  }

  return (
    <div className="space-y-6 animate-fade-in pb-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h1 className="text-2xl font-bold flex items-center gap-2 text-slate-900">
          <Plug className="w-6 h-6 text-primary" /> Hub de Integrações
        </h1>
        <Button onClick={() => handleSync()} disabled={isSyncing === 'all'} className="gap-2">
          <RefreshCw className={`w-4 h-4 ${isSyncing === 'all' ? 'animate-spin' : ''}`} />
          Sincronizar Todos os Canais
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Globe className="w-5 h-5 text-blue-600" /> Channel Manager (OTA)
          </CardTitle>
          <CardDescription>
            Gerencie e monitore as conexões ativas com plataformas de reservas externas para evitar
            overbooking.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border border-slate-200 overflow-hidden">
            <Table>
              <TableHeader className="bg-slate-50">
                <TableRow>
                  <TableHead>Canal</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Última Sincronização</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {connections.map((conn) => (
                  <TableRow key={conn.id}>
                    <TableCell className="font-medium text-slate-800">
                      {conn.channel_name}
                    </TableCell>
                    <TableCell>
                      {conn.sync_status === 'Active' ? (
                        <Badge
                          variant="outline"
                          className="bg-emerald-50 text-emerald-700 border-emerald-200 gap-1"
                        >
                          <CheckCircle2 className="w-3 h-3" /> Ativo
                        </Badge>
                      ) : (
                        <Badge
                          variant="outline"
                          className="bg-rose-50 text-rose-700 border-rose-200 gap-1"
                        >
                          <AlertCircle className="w-3 h-3" /> Erro
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell className="text-sm text-slate-600">
                      {new Date(conn.last_sync).toLocaleString()}
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        size="sm"
                        variant="outline"
                        disabled={isSyncing === conn.id || isSyncing === 'all'}
                        onClick={() => handleSync(conn.id)}
                        className="gap-2"
                      >
                        <RefreshCw
                          className={`w-3 h-3 ${isSyncing === conn.id ? 'animate-spin' : ''}`}
                        />
                        Sync Now
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
                {connections.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center py-6 text-slate-500">
                      Nenhuma conexão configurada.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
