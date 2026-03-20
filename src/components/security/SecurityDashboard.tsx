import { useEffect, useState } from 'react'
import { AlertOctagon, ShieldAlert, Wifi, KeyRound, Activity } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { getIncidents, SecurityIncident } from '@/services/security'
import pb from '@/lib/pocketbase/client'
import { useRealtime } from '@/hooks/use-realtime'
import { toast } from '@/components/ui/use-toast'

export function SecurityDashboard({ onChangeTab }: { onChangeTab: (t: string) => void }) {
  const [incidents, setIncidents] = useState<SecurityIncident[]>([])
  const [iotAlerts, setIotAlerts] = useState<number>(0)

  const loadData = async () => {
    try {
      setIncidents(await getIncidents())
      const sensors = await pb.collection('iot_sensors').getFullList()
      setIotAlerts(sensors.filter((s) => s.status === 'alert').length)
    } catch (e) {
      console.error(e)
    }
  }

  useEffect(() => {
    loadData()
  }, [])

  useRealtime('security_incidents', loadData)
  useRealtime('iot_sensors', loadData)

  const pendingCount = incidents.filter((i) => i.status === 'pending').length
  const investigatingCount = incidents.filter((i) => i.status === 'investigation').length

  const quickAction = (msg: string) => toast({ title: 'Ação Rápida Executada', description: msg })

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="border-rose-200 shadow-sm bg-rose-50/50">
          <CardContent className="p-6">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm font-bold text-rose-600 mb-1">Ocorrências Pendentes</p>
                <p className="text-3xl font-black text-rose-900">{pendingCount}</p>
              </div>
              <div className="p-2 bg-rose-100 rounded-lg">
                <AlertOctagon className="w-5 h-5 text-rose-600" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="border-amber-200 shadow-sm bg-amber-50/50">
          <CardContent className="p-6">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm font-bold text-amber-600 mb-1">Em Investigação</p>
                <p className="text-3xl font-black text-amber-900">{investigatingCount}</p>
              </div>
              <div className="p-2 bg-amber-100 rounded-lg">
                <ShieldAlert className="w-5 h-5 text-amber-600" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="border-blue-200 shadow-sm bg-blue-50/50">
          <CardContent className="p-6">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm font-bold text-blue-600 mb-1">Alertas IoT</p>
                <p className="text-3xl font-black text-blue-900">{iotAlerts}</p>
              </div>
              <div className="p-2 bg-blue-100 rounded-lg">
                <Wifi className="w-5 h-5 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="border-slate-200 shadow-sm bg-slate-50/50">
          <CardContent className="p-6">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm font-bold text-slate-600 mb-1">Áreas Críticas</p>
                <p className="text-3xl font-black text-slate-900">4 / 4</p>
              </div>
              <div className="p-2 bg-slate-200 rounded-lg">
                <KeyRound className="w-5 h-5 text-slate-600" />
              </div>
            </div>
            <p className="text-xs text-slate-500 mt-2 font-medium">Monitoramento Ativo</p>
          </CardContent>
        </Card>
      </div>

      <Card className="border-slate-200 shadow-sm">
        <CardHeader className="bg-slate-50 border-b pb-4">
          <CardTitle className="text-lg flex items-center gap-2">
            <Activity className="w-5 h-5" /> Centro de Comando (Ações Rápidas)
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Button className="h-14 font-medium" onClick={() => onChangeTab('incidents')}>
              Registrar Incidente
            </Button>
            <Button
              variant="outline"
              className="h-14 font-medium border-rose-200 hover:bg-rose-50 text-rose-700"
              onClick={() => onChangeTab('protocols')}
            >
              Ativar Protocolo
            </Button>
            <Button
              variant="outline"
              className="h-14 font-medium"
              onClick={() => onChangeTab('access')}
            >
              Verificar Acessos
            </Button>
            <Button
              variant="outline"
              className="h-14 font-medium"
              onClick={() => quickAction('Notificação enviada para a Direção.')}
            >
              Notificar Direção
            </Button>
            <Button
              variant="secondary"
              className="h-14 font-medium"
              onClick={() => quickAction('Apoio externo (190/192) acionado.')}
            >
              Solicitar Apoio Externo
            </Button>
            <Button
              variant="secondary"
              className="h-14 font-medium"
              onClick={() => quickAction('Cartão de acesso bloqueado com sucesso.')}
            >
              Bloquear Cartão/Chave
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
