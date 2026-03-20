import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Checkbox } from '@/components/ui/checkbox'
import { Label } from '@/components/ui/label'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'

const MORNING_TASKS = [
  'Validar check-outs pendentes do dia anterior',
  'Verificar overnights não planejados no PMS',
  'Analisar e resolver pendências financeiras e de caixa',
  'Rever rooming lists para grupos matinais',
  'Integrar com equipe de F&B (Pequeno-almoço)',
]
const AFTERNOON_TASKS = [
  'Validar lista de check-ins pendentes',
  'Monitorar a liberação de quartos pela Governança',
  'Confirmar transfers e serviços agendados',
  'Verificar solicitações VIP pendentes',
  'Passagem de turno e caixa para a equipe da noite',
]
const NIGHT_TASKS = [
  'Auditoria Noturna (Night Audit) preliminar',
  'Validação de entradas financeiras e faturação do dia',
  'Reconciliação de contas e TPA (POS)',
  'Geração do relatório noturno operacional',
  'Mudança de data no PMS',
]

export function ShiftRoutines() {
  const [checked, setChecked] = useState<Record<string, boolean>>({})

  const toggle = (task: string) => setChecked((p) => ({ ...p, [task]: !p[task] }))

  const renderTasks = (tasks: string[]) => (
    <div className="space-y-3 mt-4">
      {tasks.map((t) => (
        <div
          key={t}
          className="flex items-start space-x-3 p-4 border border-slate-200 rounded-md hover:bg-slate-50 transition-colors shadow-sm bg-white"
        >
          <Checkbox
            id={t}
            checked={!!checked[t]}
            onCheckedChange={() => toggle(t)}
            className="w-5 h-5 mt-0.5 data-[state=checked]:bg-emerald-600 data-[state=checked]:border-emerald-600"
          />
          <Label
            htmlFor={t}
            className="flex-1 cursor-pointer text-sm font-medium leading-relaxed text-slate-700"
          >
            {t}
          </Label>
        </div>
      ))}
    </div>
  )

  return (
    <Card className="max-w-3xl mx-auto shadow-sm animate-fade-in border-slate-200">
      <CardHeader className="bg-slate-50 border-b pb-4">
        <CardTitle className="text-xl text-slate-800">Rotinas de Turno (Checklist)</CardTitle>
        <CardDescription>
          Gerencie as tarefas obrigatórias para continuidade operacional e auditoria.
        </CardDescription>
      </CardHeader>
      <CardContent className="pt-6">
        <Tabs defaultValue="morning" className="w-full">
          <TabsList className="grid w-full grid-cols-3 bg-slate-100 p-1">
            <TabsTrigger value="morning">Turno da Manhã</TabsTrigger>
            <TabsTrigger value="afternoon">Turno da Tarde</TabsTrigger>
            <TabsTrigger value="night">Auditoria Noturna</TabsTrigger>
          </TabsList>
          <TabsContent value="morning" className="outline-none">
            {renderTasks(MORNING_TASKS)}
          </TabsContent>
          <TabsContent value="afternoon" className="outline-none">
            {renderTasks(AFTERNOON_TASKS)}
          </TabsContent>
          <TabsContent value="night" className="outline-none">
            {renderTasks(NIGHT_TASKS)}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  )
}
