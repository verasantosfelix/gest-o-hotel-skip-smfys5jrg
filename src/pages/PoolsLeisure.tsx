import { useState } from 'react'
import { Umbrella, Activity, CheckSquare, Users } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Progress } from '@/components/ui/progress'

export default function PoolsLeisure() {
  const [output, setOutput] = useState('')

  const handleLend = (e: React.FormEvent) => {
    e.preventDefault()
    setOutput(
      `<OUTPUT>\n  <status>Reserva de Equipamento Concluída</status>\n  <item>Kit Raquetes de Tênis</item>\n  <horario>14:00 às 15:00</horario>\n</OUTPUT>`,
    )
  }

  return (
    <div className="space-y-6 animate-fade-in pb-8">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900 flex items-center gap-2">
          <Umbrella className="w-6 h-6 text-primary" />
          Lazer & Piscinas
        </h1>
        <p className="text-muted-foreground text-sm">
          Controle de empréstimos recreativos e lotação de áreas comuns.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card className="border-slate-200 shadow-sm">
          <CardHeader>
            <CardTitle>Controle de Área</CardTitle>
            <CardDescription>Gerencie equipamentos e fluxo de pessoas.</CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="emprestimos" className="w-full">
              <TabsList className="mb-4 bg-slate-100 flex flex-wrap h-auto p-1">
                <TabsTrigger value="emprestimos" className="flex-1">
                  Empréstimos
                </TabsTrigger>
                <TabsTrigger value="monitoramento" className="flex-1">
                  Capacidade
                </TabsTrigger>
              </TabsList>

              <TabsContent value="emprestimos">
                <form onSubmit={handleLend} className="space-y-4">
                  <div className="space-y-2">
                    <Label>Reserva ou Hóspede</Label>
                    <Input placeholder="Ex: Quarto 204" required />
                  </div>
                  <div className="space-y-2">
                    <Label>Item Solicitado</Label>
                    <Input placeholder="Ex: Raquetes de Tênis, Toalha Extra" required />
                  </div>
                  <div className="space-y-2">
                    <Label>Tempo Previsto (Horas)</Label>
                    <Input type="number" min="1" placeholder="1" required />
                  </div>
                  <Button type="submit" className="w-full gap-2">
                    <CheckSquare className="w-4 h-4" /> Registrar Retirada
                  </Button>
                </form>
              </TabsContent>

              <TabsContent value="monitoramento" className="space-y-6">
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="font-medium text-slate-700 flex items-center gap-2">
                      <Users className="w-4 h-4" /> Piscina Principal
                    </span>
                    <span className="text-slate-500 font-mono">45 / 60 pessoas (75%)</span>
                  </div>
                  <Progress value={75} className="h-2 bg-slate-100 [&>div]:bg-amber-500" />
                  <p className="text-xs text-amber-600 mt-1">
                    Aproximando-se da capacidade máxima recomendada.
                  </p>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="font-medium text-slate-700 flex items-center gap-2">
                      <Users className="w-4 h-4" /> Academia
                    </span>
                    <span className="text-slate-500 font-mono">5 / 20 pessoas (25%)</span>
                  </div>
                  <Progress value={25} className="h-2 bg-slate-100 [&>div]:bg-emerald-500" />
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>

        <div>
          {output && (
            <Card className="border-emerald-500/20 bg-emerald-50 shadow-sm animate-fade-in-up">
              <CardHeader>
                <CardTitle className="text-emerald-700 font-display text-base flex items-center gap-2">
                  <Activity className="w-4 h-4" /> Log de Empréstimos
                </CardTitle>
              </CardHeader>
              <CardContent>
                <pre className="bg-slate-900 text-emerald-400 p-4 rounded-md font-mono text-sm overflow-x-auto shadow-inner whitespace-pre-wrap">
                  {output}
                </pre>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}
