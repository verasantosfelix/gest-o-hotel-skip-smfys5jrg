import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  TrendingUp,
  Clock,
  AlertTriangle,
  Users,
  DollarSign,
  Target,
  HeartHandshake,
  Zap,
} from 'lucide-react'

export function FrontOfficeKPIs() {
  const kpis = [
    {
      label: 'Taxa de No-Show',
      value: '2.4%',
      desc: 'vs 3.1% ontem',
      icon: AlertTriangle,
      color: 'text-rose-500',
      bg: 'bg-rose-100',
    },
    {
      label: 'T. Médio Check-in',
      value: '3m 45s',
      desc: 'Objetivo: < 4m',
      icon: Clock,
      color: 'text-blue-500',
      bg: 'bg-blue-100',
    },
    {
      label: 'T. Médio Check-out',
      value: '2m 10s',
      desc: 'Objetivo: < 3m',
      icon: Clock,
      color: 'text-blue-500',
      bg: 'bg-blue-100',
    },
    {
      label: 'Ocupação Diária',
      value: '88%',
      desc: 'Capacidade quase máx.',
      icon: Users,
      color: 'text-emerald-500',
      bg: 'bg-emerald-100',
    },
    {
      label: 'ADR (Diária Média)',
      value: 'R$ 450',
      desc: '+5% este mês',
      icon: DollarSign,
      color: 'text-indigo-500',
      bg: 'bg-indigo-100',
    },
    {
      label: 'RevPAR',
      value: 'R$ 396',
      desc: '+12% vs ano passado',
      icon: TrendingUp,
      color: 'text-purple-500',
      bg: 'bg-purple-100',
    },
    {
      label: 'Satisfação (NPS)',
      value: '4.8/5',
      desc: 'Base: 124 respostas',
      icon: Target,
      color: 'text-amber-500',
      bg: 'bg-amber-100',
    },
    {
      label: 'Receita de Upsell',
      value: 'R$ 1.250',
      desc: 'No balcão hoje',
      icon: Zap,
      color: 'text-emerald-500',
      bg: 'bg-emerald-100',
    },
  ]

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-slate-800">Operational KPIs & Analytics</h2>
          <p className="text-sm text-slate-500">
            Monitoramento de desempenho em tempo real do Front Office.
          </p>
        </div>
      </div>
      <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
        {kpis.map((k, i) => (
          <Card key={i} className="shadow-sm border-slate-200 hover:shadow-md transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
              <CardTitle className="text-sm font-bold text-slate-600">{k.label}</CardTitle>
              <div className={`p-1.5 rounded-md ${k.bg}`}>
                <k.icon className={`w-4 h-4 ${k.color}`} />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-black text-slate-800">{k.value}</div>
              <p className="text-xs text-slate-400 mt-1 font-medium">{k.desc}</p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
