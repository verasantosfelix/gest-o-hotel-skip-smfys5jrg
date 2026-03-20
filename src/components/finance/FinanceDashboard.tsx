import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { formatCurrency } from '@/lib/utils'
import { Activity, Landmark, Server, CheckCircle2 } from 'lucide-react'
import { FinancialDoc, FinancialAuditLog } from '@/services/financial'
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts'

export function FinanceDashboard({
  docs,
  auditLogs,
}: {
  docs: FinancialDoc[]
  auditLogs: FinancialAuditLog[]
}) {
  const arDocs = docs.filter((d) => d.category === 'A/R' || d.doc_type === 'Receita')
  const apDocs = docs.filter((d) => d.category === 'A/P' || d.doc_type === 'Despesa')

  const pendingAR = arDocs
    .filter((d) => d.status === 'Pendente')
    .reduce((acc, curr) => acc + curr.amount, 0)
  const pendingAP = apDocs
    .filter((d) => d.status === 'Pendente')
    .reduce((acc, curr) => acc + curr.amount, 0)
  const totalRev = arDocs.reduce((acc, curr) => acc + curr.amount, 0)

  const recentAudit = auditLogs.find((a) => a.type === 'night_audit')

  const chartData = [
    { name: 'Jan', receita: 1500000, despesa: 1200000 },
    { name: 'Fev', receita: 1800000, despesa: 1300000 },
    { name: 'Mar', receita: 2200000, despesa: 1400000 },
    { name: 'Abr', receita: 2450000, despesa: 1500000 },
  ]

  const chartConfig = {
    receita: { label: 'Receitas', color: 'hsl(var(--primary))' },
    despesa: { label: 'Despesas', color: 'hsl(var(--destructive))' },
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
        <Card className="border-slate-200">
          <CardContent className="p-4">
            <p className="text-[10px] font-bold text-slate-500 uppercase">Receita Hoje</p>
            <p className="text-xl font-black text-emerald-700 mt-1">
              {formatCurrency(totalRev || 2450000, 'AOA')}
            </p>
          </CardContent>
        </Card>
        <Card className="border-slate-200">
          <CardContent className="p-4">
            <p className="text-[10px] font-bold text-slate-500 uppercase">ADR / RevPAR</p>
            <p className="text-xl font-black text-slate-800 mt-1">
              {formatCurrency(45000, 'AOA')} / {formatCurrency(38000, 'AOA')}
            </p>
          </CardContent>
        </Card>
        <Card className="border-slate-200">
          <CardContent className="p-4">
            <p className="text-[10px] font-bold text-slate-500 uppercase">Ocupação</p>
            <p className="text-xl font-black text-blue-700 mt-1">84%</p>
          </CardContent>
        </Card>
        <Card className="border-slate-200">
          <CardContent className="p-4">
            <p className="text-[10px] font-bold text-slate-500 uppercase">A Receber (A/R)</p>
            <p className="text-xl font-black text-emerald-600 mt-1">
              {formatCurrency(pendingAR, 'AOA')}
            </p>
          </CardContent>
        </Card>
        <Card className="border-slate-200">
          <CardContent className="p-4">
            <p className="text-[10px] font-bold text-slate-500 uppercase">A Pagar (A/P)</p>
            <p className="text-xl font-black text-rose-600 mt-1">
              {formatCurrency(pendingAP, 'AOA')}
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="border-slate-200">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">GOPPAR</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-lg font-bold">{formatCurrency(18500, 'AOA')}</p>
            <p className="text-xs text-emerald-600">+5% vs last month</p>
          </CardContent>
        </Card>
        <Card className="border-slate-200">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Performance vs Budget</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-lg font-bold text-emerald-600">+12%</p>
            <p className="text-xs text-slate-500">Acima da meta projetada</p>
          </CardContent>
        </Card>
        <Card className="border-slate-200">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Receita por C. Custo</CardTitle>
          </CardHeader>
          <CardContent className="space-y-1">
            <div className="flex justify-between text-xs">
              <span className="text-slate-500">Alojamento</span>
              <span className="font-medium">60%</span>
            </div>
            <div className="flex justify-between text-xs">
              <span className="text-slate-500">F&B</span>
              <span className="font-medium">30%</span>
            </div>
            <div className="flex justify-between text-xs">
              <span className="text-slate-500">Spa/Outros</span>
              <span className="font-medium">10%</span>
            </div>
          </CardContent>
        </Card>
        <Card className="border-slate-200">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Receita por Segmento</CardTitle>
          </CardHeader>
          <CardContent className="space-y-1">
            <div className="flex justify-between text-xs">
              <span className="text-slate-500">Corporativo</span>
              <span className="font-medium">45%</span>
            </div>
            <div className="flex justify-between text-xs">
              <span className="text-slate-500">Lazer</span>
              <span className="font-medium">35%</span>
            </div>
            <div className="flex justify-between text-xs">
              <span className="text-slate-500">Eventos</span>
              <span className="font-medium">20%</span>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2">
          <CardHeader className="pb-3 border-b">
            <CardTitle className="text-base flex items-center gap-2">
              Evolução Financeira vs Budget
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-4">
            <ChartContainer config={chartConfig} className="h-[200px] w-full">
              <BarChart data={chartData} margin={{ top: 0, right: 0, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="name" tickLine={false} axisLine={false} />
                <YAxis hide />
                <ChartTooltip
                  content={
                    <ChartTooltipContent formatter={(v: number) => formatCurrency(v, 'AOA')} />
                  }
                />
                <Bar dataKey="receita" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                <Bar dataKey="despesa" fill="hsl(var(--destructive))" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ChartContainer>
          </CardContent>
        </Card>

        <div className="space-y-6">
          <Card>
            <CardHeader className="pb-3 border-b">
              <CardTitle className="text-base flex items-center gap-2">
                <Landmark className="w-4 h-4" /> Backoffice Summary
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4 space-y-4 text-sm">
              <div className="flex justify-between items-center">
                <span className="text-slate-600">Faturas em Emissão</span>
                <Badge variant="outline">12</Badge>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-600">Faturas p/ Validar</span>
                <Badge variant="secondary">5</Badge>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-600">Reembolsos Pendentes</span>
                <Badge variant="outline">2</Badge>
              </div>
              <div className="flex justify-between items-center text-rose-600 font-medium">
                <span>Disputas Ativas</span>
                <Badge variant="destructive">1</Badge>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3 border-b">
              <CardTitle className="text-base flex items-center gap-2">
                <Activity className="w-4 h-4 text-amber-500" /> Auditoria & Integrações
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4 space-y-3 text-sm">
              <div className="flex justify-between items-center">
                <span className="text-slate-600">Night Audit</span>
                <Badge
                  className={
                    recentAudit?.status.includes('warning')
                      ? 'bg-amber-100 text-amber-800'
                      : 'bg-emerald-100 text-emerald-800'
                  }
                >
                  {recentAudit?.status || 'Pendente'}
                </Badge>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-600">Lanç. Inconsistentes</span>
                <span className="font-mono font-bold text-rose-600">
                  {recentAudit?.error_count || 0}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-600">Integração Bancária</span>
                <span className="flex items-center gap-1 text-emerald-600 text-xs">
                  <CheckCircle2 className="w-3 h-3" /> OK
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-600">Sincronização PMS</span>
                <span className="flex items-center gap-1 text-emerald-600 text-xs">
                  <CheckCircle2 className="w-3 h-3" /> OK
                </span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
