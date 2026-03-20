import { Checkbox } from '@/components/ui/checkbox'
import { Sun, Sunset, Moon } from 'lucide-react'

export function FnBRoutines() {
  const morning = [
    'Pequeno Almoço (Montagem Geral)',
    'Preparação Cafeteiras e Sumos',
    'Repor Estoque Diário Bar',
    'Mise en Place para Almoço',
    'Verificar Status de Reservas',
  ]
  const afternoon = [
    'Início de Serviço de Almoço',
    'Limpeza Geral Pós-Almoço',
    'Preparação para Jantar (Mise en Place)',
    'Organizar Layout do Salão',
  ]
  const night = [
    'Serviço de Jantar',
    'Atendimento de Room Service Extra',
    'Limpeza Final e Inventário Cego',
    'Fechamento de Caixa POS',
    'Conferência de Lançamentos PMS',
  ]

  return (
    <div className="grid md:grid-cols-3 gap-6 animate-fade-in-up">
      <RoutineList
        title="Turno da Manhã"
        icon={<Sun className="w-5 h-5 text-amber-500" />}
        tasks={morning}
      />
      <RoutineList
        title="Turno da Tarde"
        icon={<Sunset className="w-5 h-5 text-orange-500" />}
        tasks={afternoon}
      />
      <RoutineList
        title="Turno da Noite"
        icon={<Moon className="w-5 h-5 text-indigo-500" />}
        tasks={night}
      />
    </div>
  )
}

function RoutineList({
  title,
  icon,
  tasks,
}: {
  title: string
  icon: React.ReactNode
  tasks: string[]
}) {
  return (
    <div className="bg-white p-6 rounded-lg border border-slate-200 shadow-sm flex flex-col h-full">
      <h4 className="font-black text-lg mb-6 text-slate-800 flex items-center gap-2 border-b pb-3">
        {icon} {title}
      </h4>
      <div className="space-y-4 flex-1">
        {tasks.map((t) => (
          <div key={t} className="flex items-start gap-3">
            <Checkbox id={t} className="mt-0.5" />
            <label
              htmlFor={t}
              className="text-sm font-medium leading-tight text-slate-700 cursor-pointer"
            >
              {t}
            </label>
          </div>
        ))}
      </div>
    </div>
  )
}
