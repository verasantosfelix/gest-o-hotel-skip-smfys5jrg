import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { CheckCircle2, ChevronRight, FileText, Activity } from 'lucide-react'

export function NightAuditWizard() {
  return (
    <div className="grid md:grid-cols-2 gap-6">
      <Card className="border-slate-200 shadow-sm">
        <CardHeader className="bg-slate-50 border-b pb-4">
          <CardTitle>Auditoria Noturna (Night Audit)</CardTitle>
          <CardDescription>Fluxo de validação e virada de diária</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4 pt-6">
          <div className="flex items-center justify-between gap-3 p-3 bg-emerald-50 text-emerald-700 rounded-md border border-emerald-200">
            <div className="flex items-center gap-3">
              <CheckCircle2 className="w-5 h-5" />
              <div className="font-medium text-sm">1. Validar Contas Abertas</div>
            </div>
            <Button
              size="sm"
              variant="ghost"
              className="h-8 text-emerald-700 hover:text-emerald-800 hover:bg-emerald-100"
            >
              Ok
            </Button>
          </div>
          <div className="flex items-center justify-between gap-3 p-3 bg-emerald-50 text-emerald-700 rounded-md border border-emerald-200">
            <div className="flex items-center gap-3">
              <CheckCircle2 className="w-5 h-5" />
              <div className="font-medium text-sm">2. Conciliar Pagamentos PMS/POS</div>
            </div>
            <Button
              size="sm"
              variant="ghost"
              className="h-8 text-emerald-700 hover:text-emerald-800 hover:bg-emerald-100"
            >
              Ok
            </Button>
          </div>
          <div className="flex items-center justify-between gap-3 p-3 bg-slate-50 text-slate-700 rounded-md border border-slate-200">
            <div className="flex items-center gap-3">
              <div className="w-5 h-5 flex items-center justify-center rounded-full border border-slate-400 text-xs font-bold bg-white">
                3
              </div>
              <div className="font-medium text-sm">Verificar Discrepâncias</div>
            </div>
            <Button size="sm" variant="outline" className="h-8 bg-white">
              Verificar
            </Button>
          </div>
          <div className="flex items-center gap-3 p-3 bg-slate-50 text-slate-700 rounded-md border border-slate-200 opacity-60">
            <div className="w-5 h-5 flex items-center justify-center rounded-full border border-slate-400 text-xs font-bold bg-white">
              4
            </div>
            <div className="flex-1 font-medium text-sm">Atualizar Dia Fiscal</div>
          </div>
          <div className="flex items-center gap-3 p-3 bg-slate-50 text-slate-700 rounded-md border border-slate-200 opacity-60">
            <div className="w-5 h-5 flex items-center justify-center rounded-full border border-slate-400 text-xs font-bold bg-white">
              5
            </div>
            <div className="flex-1 font-medium text-sm">Gerar Relatórios (Distribuição)</div>
          </div>
        </CardContent>
      </Card>

      <Card className="border-slate-200 shadow-sm">
        <CardHeader className="bg-slate-50 border-b pb-4">
          <CardTitle>Fechamento Mensal</CardTitle>
          <CardDescription>Consolidação e relatórios (DRE, Forecast)</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4 pt-6">
          <Button
            variant="outline"
            className="w-full justify-between h-12 bg-slate-50 hover:bg-slate-100"
          >
            Consolidar Receitas e Despesas <ChevronRight className="w-4 h-4 text-slate-400" />
          </Button>
          <Button
            variant="outline"
            className="w-full justify-between h-12 bg-slate-50 hover:bg-slate-100"
          >
            Revisar Provisões e Amortizações <ChevronRight className="w-4 h-4 text-slate-400" />
          </Button>
          <Button
            variant="outline"
            className="w-full justify-between h-12 bg-slate-50 hover:bg-slate-100"
          >
            Conciliação Bancária (Import OFX/CNAB){' '}
            <ChevronRight className="w-4 h-4 text-slate-400" />
          </Button>
          <Button
            variant="outline"
            className="w-full justify-between h-12 bg-slate-50 hover:bg-slate-100"
          >
            Comparar Budget vs Realizado <Activity className="w-4 h-4 text-slate-400" />
          </Button>
          <Button className="w-full gap-2 h-12 bg-slate-900 text-white hover:bg-slate-800 shadow-md">
            <FileText className="w-4 h-4" /> Fechar Mês / Gerar DRE & Forecast
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
