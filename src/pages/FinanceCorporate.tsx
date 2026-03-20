import { useState, useEffect } from 'react'
import { Landmark, TrendingUp, DollarSign, PieChart } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer } from 'recharts'
import { useAccess } from '@/hooks/use-access'
import { RestrictedAccess } from '@/components/RestrictedAccess'
import { getFinancialDocs, getBudgetEntries, FinancialDoc, BudgetEntry } from '@/services/financial'
import { useRealtime } from '@/hooks/use-realtime'
import { formatCurrency } from '@/lib/utils'

export default function FinanceCorporate() {
  const { hasAccess } = useAccess()
  const [docs, setDocs] = useState<FinancialDoc[]>([])
  const [budgets, setBudgets] = useState<BudgetEntry[]>([])

  const loadData = async () => {
    try {
      const [d, b] = await Promise.all([getFinancialDocs(), getBudgetEntries()])
      setDocs(d)
      setBudgets(b)
    } catch (e) {
      console.error(e)
    }
  }

  useEffect(() => {
    loadData()
  }, [])

  useRealtime('financial_docs', loadData)
  useRealtime('budget_entries', loadData)

  if (!hasAccess(['Administrativo_Financeiro', 'Direcao_Admin'])) {
    return <RestrictedAccess requiredRoles={['Administrativo_Financeiro', 'Direcao_Admin']} />
  }

  const totalReceivables = docs
    .filter((d) => d.doc_type === 'Receita')
    .reduce((a, b) => a + b.amount, 0)
  const totalPayables = docs
    .filter((d) => d.doc_type === 'Despesa')
    .reduce((a, b) => a + b.amount, 0)

  const chartData = [
    { name: 'Receitas', valor: totalReceivables },
    { name: 'Despesas', valor: totalPayables },
  ]

  const chartConfig = {
    valor: {
      label: 'Valor Total',
      color: 'hsl(var(--primary))',
    },
  }

  return (
    <div className="space-y-6 animate-fade-in pb-8">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-3 bg-emerald-100 rounded-full">
          <Landmark className="w-6 h-6 text-emerald-700" />
        </div>
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">Financeiro B2B</h1>
          <p className="text-sm text-slate-500">Visão Adaptativa de Finanças e Orçamentos</p>
        </div>
      </div>

      {/* MOBILE VIEW: High-level summary cards */}
      <div className="block md:hidden space-y-4">
        <div className="grid grid-cols-2 gap-3">
          <Card className="bg-emerald-50 border-emerald-200">
            <CardContent className="p-4 flex flex-col items-center justify-center text-center">
              <TrendingUp className="w-6 h-6 text-emerald-600 mb-2" />
              <p className="text-xs text-slate-500 uppercase font-bold tracking-wider">Receitas</p>
              <p className="text-lg font-bold text-emerald-700 mt-1">
                {formatCurrency(totalReceivables, 'AOA')}
              </p>
            </CardContent>
          </Card>
          <Card className="bg-rose-50 border-rose-200">
            <CardContent className="p-4 flex flex-col items-center justify-center text-center">
              <DollarSign className="w-6 h-6 text-rose-600 mb-2" />
              <p className="text-xs text-slate-500 uppercase font-bold tracking-wider">Despesas</p>
              <p className="text-lg font-bold text-rose-700 mt-1">
                {formatCurrency(totalPayables, 'AOA')}
              </p>
            </CardContent>
          </Card>
        </div>
        <Card>
          <CardHeader className="py-3 px-4 bg-slate-50 border-b">
            <CardTitle className="text-sm font-bold">Últimos Lançamentos</CardTitle>
          </CardHeader>
          <CardContent className="p-0 divide-y">
            {docs.slice(0, 5).map((doc) => (
              <div key={doc.id} className="p-4 flex justify-between items-center">
                <div>
                  <p className="font-semibold text-sm">{doc.entity_name || 'Diversos'}</p>
                  <p className="text-xs text-slate-500">{doc.due_date}</p>
                </div>
                <div className="text-right">
                  <p
                    className={`font-mono font-bold text-sm ${doc.doc_type === 'Despesa' ? 'text-rose-600' : 'text-emerald-600'}`}
                  >
                    {doc.doc_type === 'Despesa' ? '-' : '+'}
                    {formatCurrency(doc.amount, doc.currency)}
                  </p>
                  <Badge variant="outline" className="text-[10px] mt-1">
                    {doc.status}
                  </Badge>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      {/* TABLET VIEW: Detailed Tables (docs and budgets stacked) */}
      <div className="hidden md:block lg:hidden space-y-6">
        <Card className="border-slate-200 shadow-sm">
          <CardHeader className="bg-slate-50 pb-4 border-b">
            <CardTitle className="text-lg">Documentos Financeiros</CardTitle>
          </CardHeader>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Tipo</TableHead>
                <TableHead>Entidade</TableHead>
                <TableHead>Vencimento</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Valor</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {docs.slice(0, 8).map((doc) => (
                <TableRow key={doc.id}>
                  <TableCell>
                    <Badge
                      variant={doc.doc_type === 'Despesa' ? 'destructive' : 'default'}
                      className={doc.doc_type === 'Receita' ? 'bg-emerald-500' : ''}
                    >
                      {doc.doc_type}
                    </Badge>
                  </TableCell>
                  <TableCell className="font-medium">{doc.entity_name}</TableCell>
                  <TableCell>{doc.due_date}</TableCell>
                  <TableCell>{doc.status}</TableCell>
                  <TableCell className="text-right font-mono font-bold">
                    {formatCurrency(doc.amount, doc.currency)}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Card>

        <Card className="border-slate-200 shadow-sm">
          <CardHeader className="bg-slate-50 pb-4 border-b">
            <CardTitle className="text-lg">Dotação Orçamentária</CardTitle>
          </CardHeader>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Ano</TableHead>
                <TableHead>Centro de Custo</TableHead>
                <TableHead>Categoria</TableHead>
                <TableHead className="text-right">Orçamento</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {budgets.map((b) => (
                <TableRow key={b.id}>
                  <TableCell>{b.year}</TableCell>
                  <TableCell className="font-medium">{b.cost_center}</TableCell>
                  <TableCell>{b.category}</TableCell>
                  <TableCell className="text-right font-mono font-bold">
                    {formatCurrency(b.amount, b.currency)}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Card>
      </div>

      {/* DESKTOP VIEW: Dashboard Panel (Tables + Charts side by side) */}
      <div className="hidden lg:grid grid-cols-12 gap-6">
        <div className="col-span-8 space-y-6">
          <Card className="border-slate-200 shadow-sm">
            <CardHeader className="bg-slate-50 border-b flex flex-row items-center justify-between">
              <CardTitle className="text-lg font-bold">Fluxo Documental</CardTitle>
              <Badge variant="secondary">Tempo Real</Badge>
            </CardHeader>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="pl-6">Documento / Entidade</TableHead>
                    <TableHead>Tipo</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Vencimento</TableHead>
                    <TableHead className="text-right pr-6">Valor Nominal</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {docs.map((doc) => (
                    <TableRow key={doc.id} className="hover:bg-slate-50/50">
                      <TableCell className="pl-6 font-medium text-slate-800">
                        {doc.entity_name || 'Registro Interno'}
                      </TableCell>
                      <TableCell>
                        <span
                          className={`px-2 py-1 rounded text-xs font-bold ${doc.doc_type === 'Despesa' ? 'bg-rose-100 text-rose-700' : 'bg-emerald-100 text-emerald-700'}`}
                        >
                          {doc.doc_type}
                        </span>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">{doc.status}</Badge>
                      </TableCell>
                      <TableCell className="text-slate-500">{doc.due_date || '-'}</TableCell>
                      <TableCell className="text-right pr-6 font-mono font-bold text-slate-900">
                        {formatCurrency(doc.amount, doc.currency)}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </div>

        <div className="col-span-4 space-y-6">
          <Card className="border-slate-200 shadow-sm">
            <CardHeader className="bg-slate-50 border-b">
              <CardTitle className="text-lg flex items-center gap-2">
                <PieChart className="w-5 h-5 text-primary" /> Análise de Saldos
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-6">
              <ChartContainer config={chartConfig} className="h-[250px] w-full">
                <BarChart data={chartData} margin={{ top: 20, right: 0, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                  <XAxis dataKey="name" tickLine={false} axisLine={false} />
                  <YAxis hide />
                  <ChartTooltip
                    content={
                      <ChartTooltipContent formatter={(v: number) => formatCurrency(v, 'AOA')} />
                    }
                  />
                  <Bar dataKey="valor" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ChartContainer>
            </CardContent>
          </Card>

          <Card className="border-slate-200 shadow-sm bg-slate-900 text-white">
            <CardHeader>
              <CardTitle className="text-lg font-medium text-slate-300">
                Orçamentos Ativos (YTD)
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {budgets.slice(0, 4).map((b) => (
                <div
                  key={b.id}
                  className="flex justify-between items-center border-b border-slate-800 pb-2"
                >
                  <div>
                    <p className="text-sm font-bold text-slate-100">{b.cost_center}</p>
                    <p className="text-xs text-slate-400">{b.category}</p>
                  </div>
                  <p className="font-mono font-semibold text-emerald-400">
                    {formatCurrency(b.amount, b.currency)}
                  </p>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
