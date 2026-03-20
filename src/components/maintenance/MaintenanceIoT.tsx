import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Activity, Thermometer, Droplet, Zap, Volume2, Server } from 'lucide-react'

export function MaintenanceIoT({ sensors }: { sensors: any[] }) {
  const getIcon = (type: string) => {
    switch (type) {
      case 'temperature':
        return <Thermometer className="w-5 h-5 text-orange-500" />
      case 'leak':
        return <Droplet className="w-5 h-5 text-blue-500" />
      case 'power':
        return <Zap className="w-5 h-5 text-amber-500" />
      case 'noise':
        return <Volume2 className="w-5 h-5 text-purple-500" />
      default:
        return <Activity className="w-5 h-5 text-slate-500" />
    }
  }

  return (
    <div className="space-y-4 animate-fade-in-up">
      <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
        <Server className="w-5 h-5 text-primary" /> Monitoramento IoT e Sensores
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {sensors.map((s) => (
          <Card
            key={s.id}
            className={`border-l-4 shadow-sm ${s.status === 'alert' ? 'border-l-rose-500 bg-rose-50/30' : 'border-l-emerald-500 bg-white'}`}
          >
            <CardContent className="p-5 flex items-start gap-4">
              <div
                className={`p-3 rounded-full shrink-0 ${s.status === 'alert' ? 'bg-rose-100' : 'bg-slate-100'}`}
              >
                {getIcon(s.type)}
              </div>
              <div className="flex-1 w-full">
                <div className="flex justify-between items-start mb-1">
                  <h3 className="font-bold text-slate-800 leading-tight pr-2">{s.name}</h3>
                  <Badge
                    variant={s.status === 'alert' ? 'destructive' : 'outline'}
                    className={
                      s.status !== 'alert'
                        ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                        : ''
                    }
                  >
                    {s.status === 'alert' ? 'Alerta' : 'Normal'}
                  </Badge>
                </div>
                <div className="mt-3 flex justify-between items-end">
                  <div>
                    <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider mb-0.5">
                      Leitura Atual
                    </p>
                    <p
                      className={`text-2xl font-black font-mono ${s.status === 'alert' ? 'text-rose-600' : 'text-emerald-600'}`}
                    >
                      {s.current_value}{' '}
                      <span className="text-sm font-medium text-slate-500">{s.unit}</span>
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mb-0.5">
                      Limite Seg.
                    </p>
                    <p className="text-sm font-mono text-slate-600">
                      {s.threshold} {s.unit}
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
        {sensors.length === 0 && (
          <p className="text-slate-500 col-span-full p-8 text-center bg-slate-50 rounded-lg border border-dashed border-slate-200">
            Nenhum sensor registrado no sistema.
          </p>
        )}
      </div>
    </div>
  )
}
