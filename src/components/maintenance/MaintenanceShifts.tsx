import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Sun, Sunset, Moon, CheckCircle } from 'lucide-react'

export function MaintenanceShifts() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 animate-fade-in-up">
      <Card className="border-t-4 border-t-amber-400">
        <CardHeader className="bg-slate-50/50 pb-4 border-b border-slate-100">
          <CardTitle className="flex items-center gap-2 text-amber-600">
            <Sun className="w-5 h-5" /> Turno da Manhã (07h - 15h)
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-4 space-y-4">
          <ul className="space-y-3 text-sm text-slate-700">
            <li className="flex items-start gap-2">
              <CheckCircle className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
              Revisar OS pendentes do turno anterior e organizar fila de trabalho diária.
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
              Verificar logs de sensores IoT e painéis de controle das áreas críticas (Boiler,
              Bombas).
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
              Acompanhar governança na liberação de quartos bloqueados por manutenção.
            </li>
          </ul>
        </CardContent>
      </Card>

      <Card className="border-t-4 border-t-orange-500">
        <CardHeader className="bg-slate-50/50 pb-4 border-b border-slate-100">
          <CardTitle className="flex items-center gap-2 text-orange-600">
            <Sunset className="w-5 h-5" /> Turno da Tarde (14h - 22h)
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-4 space-y-4">
          <ul className="space-y-3 text-sm text-slate-700">
            <li className="flex items-start gap-2">
              <CheckCircle className="w-4 h-4 text-orange-500 shrink-0 mt-0.5" />
              Executar manutenções preventivas programadas no cronograma.
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle className="w-4 h-4 text-orange-500 shrink-0 mt-0.5" />
              Atender chamados reativos de média complexidade em áreas comuns e lazer.
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle className="w-4 h-4 text-orange-500 shrink-0 mt-0.5" />
              Verificação visual da casa de máquinas, chillers e níveis de produtos químicos.
            </li>
          </ul>
        </CardContent>
      </Card>

      <Card className="border-t-4 border-t-indigo-500">
        <CardHeader className="bg-slate-50/50 pb-4 border-b border-slate-100">
          <CardTitle className="flex items-center gap-2 text-indigo-600">
            <Moon className="w-5 h-5" /> Turno da Noite (22h - 06h)
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-4 space-y-4">
          <ul className="space-y-3 text-sm text-slate-700">
            <li className="flex items-start gap-2">
              <CheckCircle className="w-4 h-4 text-indigo-500 shrink-0 mt-0.5" />
              Inspeção geral de iluminação externa e reparos leves de áreas públicas sem fluxo.
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle className="w-4 h-4 text-indigo-500 shrink-0 mt-0.5" />
              Leitura final e anotação dos medidores de consumo (Água, Luz, Gás).
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle className="w-4 h-4 text-indigo-500 shrink-0 mt-0.5" />
              Gerar Relatório de Turno (Passagem de serviço) para a equipe da manhã.
            </li>
          </ul>
        </CardContent>
      </Card>
    </div>
  )
}
