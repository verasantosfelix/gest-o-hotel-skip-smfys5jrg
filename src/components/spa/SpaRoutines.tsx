import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Checkbox } from '@/components/ui/checkbox'

export function SpaRoutines() {
  const routines = [
    {
      title: 'Abertura (Manhã)',
      tasks: [
        'Ligar difusores e música ambiente',
        'Verificar temperatura da piscina/sauna',
        'Imprimir agenda do dia',
        'Revisar stock de toalhas limpas',
      ],
    },
    {
      title: 'Transição (Tarde)',
      tasks: [
        'Recolher toalhas usadas',
        'Verificar nível de chás e águas na recepção',
        'Ajustar climatização',
      ],
    },
    {
      title: 'Fecho (Noite)',
      tasks: [
        'Desligar saunas e equipamentos',
        'Limpeza profunda das macas',
        'Contagem de estoque rápido',
        'Fecho do caixa',
      ],
    },
  ]

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 animate-fade-in">
      {routines.map((r, i) => (
        <Card key={i} className="border-slate-200 shadow-sm">
          <CardHeader className="bg-slate-50 border-b pb-3">
            <CardTitle className="text-base">{r.title}</CardTitle>
          </CardHeader>
          <CardContent className="pt-4 space-y-3">
            {r.tasks.map((t, idx) => (
              <div key={idx} className="flex items-start gap-3">
                <Checkbox id={`task-${i}-${idx}`} className="mt-1" />
                <label
                  htmlFor={`task-${i}-${idx}`}
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 text-slate-700"
                >
                  {t}
                </label>
              </div>
            ))}
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
