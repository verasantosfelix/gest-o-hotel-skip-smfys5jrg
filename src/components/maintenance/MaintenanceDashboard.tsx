import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { AlertTriangle, Wrench, Clock, Server, CheckCircle2, ShieldAlert } from 'lucide-react'

export function MaintenanceDashboard({ tickets, sensors }: { tickets: any[]; sensors: any[] }) {
  const openOS = tickets.filter((t) => t.status === 'open').length
  const criticalOS = tickets.filter(
    (t) => t.priority === 'urgent' && t.status !== 'resolved',
  ).length
  const inProgressOS = tickets.filter((t) => t.status === 'in_progress').length
  const resolvedToday = tickets.filter(
    (t) =>
      t.status === 'resolved' && new Date(t.updated).toDateString() === new Date().toDateString(),
  ).length

  const alerts = sensors.filter((s) => s.status === 'alert').length

  return (
    <div className="space-y-6 animate-fade-in-up">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="border-l-4 border-l-rose-500 shadow-sm">
          <CardContent className="p-4 flex flex-col justify-center items-center text-center h-full">
            <ShieldAlert className="w-6 h-6 text-rose-500 mb-2" />
            <p className="text-sm font-bold text-slate-500">OS Críticas</p>
            <p className="text-3xl font-black text-rose-600">{criticalOS}</p>
          </CardContent>
        </Card>
        <Card className="border-l-4 border-l-amber-500 shadow-sm">
          <CardContent className="p-4 flex flex-col justify-center items-center text-center h-full">
            <Wrench className="w-6 h-6 text-amber-500 mb-2" />
            <p className="text-sm font-bold text-slate-500">OS Abertas</p>
            <p className="text-3xl font-black text-amber-600">{openOS}</p>
          </CardContent>
        </Card>
        <Card className="border-l-4 border-l-blue-500 shadow-sm">
          <CardContent className="p-4 flex flex-col justify-center items-center text-center h-full">
            <Clock className="w-6 h-6 text-blue-500 mb-2" />
            <p className="text-sm font-bold text-slate-500">Em Execução</p>
            <p className="text-3xl font-black text-blue-600">{inProgressOS}</p>
          </CardContent>
        </Card>
        <Card className="border-l-4 border-l-emerald-500 shadow-sm">
          <CardContent className="p-4 flex flex-col justify-center items-center text-center h-full">
            <CheckCircle2 className="w-6 h-6 text-emerald-500 mb-2" />
            <p className="text-sm font-bold text-slate-500">Resolvidas (Hoje)</p>
            <p className="text-3xl font-black text-emerald-600">{resolvedToday}</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-rose-500" /> Alertas IoT ({alerts})
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {sensors
              .filter((s) => s.status === 'alert')
              .map((s) => (
                <div
                  key={s.id}
                  className="flex justify-between items-center bg-rose-50 p-3 rounded border border-rose-100"
                >
                  <div className="flex items-center gap-3">
                    <Server className="w-5 h-5 text-rose-500" />
                    <div>
                      <p className="text-sm font-bold text-slate-800">{s.name}</p>
                      <p className="text-xs text-rose-600">
                        Leitura: {s.current_value} {s.unit} (Limite: {s.threshold})
                      </p>
                    </div>
                  </div>
                  <Badge variant="destructive">Crítico</Badge>
                </div>
              ))}
            {alerts === 0 && <p className="text-slate-500 text-sm">Nenhum alerta ativo.</p>}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Clock className="w-5 h-5 text-slate-500" /> Fila Operacional Recente
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {tickets.slice(0, 5).map((t) => (
              <div
                key={t.id}
                className="flex justify-between items-center bg-slate-50 p-3 rounded border border-slate-100"
              >
                <div>
                  <p className="text-sm font-bold text-slate-800 line-clamp-1">{t.description}</p>
                  <p className="text-xs text-slate-500">
                    Local: {t.location_details || t.expand?.room_id?.room_number || 'N/A'}
                  </p>
                </div>
                <Badge
                  className={
                    t.priority === 'urgent'
                      ? 'bg-rose-500'
                      : t.priority === 'high'
                        ? 'bg-orange-500'
                        : t.priority === 'medium'
                          ? 'bg-amber-500'
                          : 'bg-slate-500'
                  }
                >
                  {t.priority}
                </Badge>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
