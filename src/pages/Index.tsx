import { ArrowRight, BedDouble, CalendarCheck, Clock, Users } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import useHotelStore from '@/stores/useHotelStore'

export default function Index() {
  const { selectedHotel } = useHotelStore()

  const kpis = [
    {
      title: 'Taxa de Ocupação',
      value: '82%',
      desc: '14 quartos disp.',
      icon: BedDouble,
      color: 'text-primary',
    },
    {
      title: 'Check-ins Hoje',
      value: '12',
      desc: '4 pendentes',
      icon: CalendarCheck,
      color: 'text-accent',
    },
    {
      title: 'Check-outs Hoje',
      value: '8',
      desc: 'Todos finalizados',
      icon: ArrowRight,
      color: 'text-muted-foreground',
    },
    {
      title: 'Validações Pend.',
      value: '3',
      desc: 'Requer atenção',
      icon: Clock,
      color: 'text-warning',
    },
  ]

  const feed = [
    { time: '10:42', msg: 'Quarto 304 alterado para "Limpo" por Maria Silva.', type: 'info' },
    {
      time: '10:30',
      msg: 'Check-in rápido concluído: Reserva #8492 (João Pedro).',
      type: 'success',
    },
    { time: '09:15', msg: 'Aviso: Overbooking detectado na data 15/05.', type: 'warning' },
  ]

  return (
    <div className="space-y-6 animate-fade-in-up">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Visão Geral</h1>
          <p className="text-muted-foreground">Operação atual: {selectedHotel.name}</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">Novo Hóspede</Button>
          <Button className="bg-primary hover:bg-primary/90">Nova Reserva</Button>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {kpis.map((kpi, i) => (
          <Card key={i} className={`stagger-${i + 1}`}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{kpi.title}</CardTitle>
              <kpi.icon className={`h-4 w-4 ${kpi.color}`} />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{kpi.value}</div>
              <p className="text-xs text-muted-foreground">{kpi.desc}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card className="stagger-3">
          <CardHeader>
            <CardTitle>Log de Operações</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {feed.map((item, i) => (
              <div
                key={i}
                className="flex items-start gap-3 border-b border-border/50 pb-3 last:border-0 last:pb-0"
              >
                <span className="text-xs font-mono text-muted-foreground pt-0.5">{item.time}</span>
                <div className="flex-1">
                  <p className="text-sm">{item.msg}</p>
                </div>
                {item.type === 'warning' && (
                  <Badge variant="destructive" className="bg-warning">
                    Atenção
                  </Badge>
                )}
                {item.type === 'success' && <Badge className="bg-accent">OK</Badge>}
              </div>
            ))}
            <Button variant="ghost" className="w-full text-xs">
              Ver histórico completo
            </Button>
          </CardContent>
        </Card>

        <Card className="stagger-4 border-primary/20 bg-primary/5">
          <CardHeader>
            <CardTitle className="text-sm font-mono flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-accent inline-block"></span>
              Assistente SKIP: Resumo de Estado
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="bg-slate-900 text-slate-50 p-4 rounded-md font-mono text-sm overflow-x-auto shadow-inner">
              <span className="text-accent">&lt;OUTPUT&gt;</span>
              <div className="pl-4 mt-2 space-y-2 opacity-90">
                <p>
                  <span className="text-blue-400">Resumo:</span> Operação nominal. 82% de ocupação.
                  3 pendências de limpeza.
                </p>
                <p>
                  <span className="text-blue-400">Dados:</span> [Check-ins: 12], [Check-outs: 8],
                  [Alertas: 1]
                </p>
                <p>
                  <span className="text-warning">Perguntas:</span> O quarto 304 precisa de
                  manutenção preventiva?
                </p>
                <p>
                  <span className="text-accent">Próximos Passos:</span> Finalizar check-ins
                  pendentes antes das 14h.
                </p>
              </div>
              <span className="text-accent mt-2 block">&lt;/OUTPUT&gt;</span>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
