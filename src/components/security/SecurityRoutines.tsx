import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Checkbox } from '@/components/ui/checkbox'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'

const ROUTINES = {
  morning: [
    { id: 'm1', label: 'Verificar livro de ocorrências da noite' },
    { id: 'm2', label: 'Testar comunicação via rádio com Front-Desk' },
    { id: 'm3', label: 'Auditar logs do servidor CFTV' },
    { id: 'm4', label: 'Ronda perimetral diurna (Estacionamento/Jardins)' },
  ],
  afternoon: [
    { id: 'a1', label: 'Acompanhar setup de eventos e controle de acesso externo' },
    { id: 'a2', label: 'Verificação visual dos extintores no 1º andar' },
    { id: 'a3', label: 'Ronda áreas de lazer (Piscina/Spa)' },
  ],
  night: [
    { id: 'n1', label: 'Trancar acessos secundários às 22:00' },
    { id: 'n2', label: 'Ronda interna em todos os andares (00:00)' },
    { id: 'n3', label: 'Verificar fechamento de caixas F&B' },
    { id: 'n4', label: 'Monitoramento contínuo CFTV saguão principal' },
  ],
}

export function SecurityRoutines() {
  const [checked, setChecked] = useState<Record<string, boolean>>({})

  const toggle = (id: string) => setChecked((prev) => ({ ...prev, [id]: !prev[id] }))

  const renderChecklist = (items: { id: string; label: string }[]) => (
    <Card className="border-slate-200 shadow-sm mt-4">
      <CardHeader className="bg-slate-50 border-b pb-4">
        <CardTitle className="text-base">Tarefas do Turno</CardTitle>
      </CardHeader>
      <CardContent className="p-4 space-y-4">
        {items.map((item) => (
          <div key={item.id} className="flex items-start gap-3">
            <Checkbox
              checked={!!checked[item.id]}
              onCheckedChange={() => toggle(item.id)}
              className="mt-0.5"
            />
            <span
              className={`text-sm ${checked[item.id] ? 'text-slate-400 line-through' : 'text-slate-700'}`}
            >
              {item.label}
            </span>
          </div>
        ))}
      </CardContent>
    </Card>
  )

  return (
    <div className="max-w-3xl mx-auto space-y-4">
      <Tabs defaultValue="morning" className="w-full">
        <TabsList className="w-full flex">
          <TabsTrigger value="morning" className="flex-1">
            Turno Manhã (06h - 14h)
          </TabsTrigger>
          <TabsTrigger value="afternoon" className="flex-1">
            Turno Tarde (14h - 22h)
          </TabsTrigger>
          <TabsTrigger value="night" className="flex-1">
            Turno Noite (22h - 06h)
          </TabsTrigger>
        </TabsList>
        <TabsContent value="morning" className="outline-none">
          {renderChecklist(ROUTINES.morning)}
        </TabsContent>
        <TabsContent value="afternoon" className="outline-none">
          {renderChecklist(ROUTINES.afternoon)}
        </TabsContent>
        <TabsContent value="night" className="outline-none">
          {renderChecklist(ROUTINES.night)}
        </TabsContent>
      </Tabs>
    </div>
  )
}
