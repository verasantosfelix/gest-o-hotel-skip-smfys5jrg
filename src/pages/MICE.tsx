import { useState } from 'react'
import { Building, Users, Briefcase, Percent, UserPlus } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'

export default function MICE() {
  const [output, setOutput] = useState('')

  const handleBlock = (e: React.FormEvent) => {
    e.preventDefault()
    setOutput(
      `<OUTPUT>\n  <status>Bloqueio criado</status>\n  <detalhes>\n    <grupo>Grupo Corporativo XYZ</grupo>\n    <quartos_bloqueados>25</quartos_bloqueados>\n    <periodo>10/11 a 15/11</periodo>\n  </detalhes>\n</OUTPUT>`,
    )
  }

  const handleRoomingList = (e: React.FormEvent) => {
    e.preventDefault()
    setOutput(
      `<OUTPUT>\n  <status>Rooming List Atualizada</status>\n  <acao>Hóspede adicionado ao Grupo XYZ e quarto atribuído temporariamente.</acao>\n</OUTPUT>`,
    )
  }

  const handleRates = (e: React.FormEvent) => {
    e.preventDefault()
    setOutput(
      `<OUTPUT>\n  <status>Tarifa Acordo Registrada</status>\n  <empresa>Tech Corp</empresa>\n  <desconto_aplicado>20% na tarifa Bar (Best Available Rate)</desconto_aplicado>\n</OUTPUT>`,
    )
  }

  return (
    <div className="space-y-6 animate-fade-in pb-8">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900 flex items-center gap-2">
          <Building className="w-6 h-6 text-primary" />
          MICE (Grupos & Eventos Corporativos)
        </h1>
        <p className="text-muted-foreground text-sm">
          Gestão de rooming lists, bloqueios de inventário e acordos corporativos.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card className="border-slate-200 shadow-sm">
          <CardHeader>
            <CardTitle>Gestão de Inventário e Grupos</CardTitle>
            <CardDescription>
              Coordene grandes volumes de acomodação de forma unificada.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="bloqueios" className="w-full">
              <TabsList className="mb-4 bg-slate-100 flex flex-wrap h-auto p-1">
                <TabsTrigger value="bloqueios">Bloqueios</TabsTrigger>
                <TabsTrigger value="rooming">Rooming List</TabsTrigger>
                <TabsTrigger value="tarifas">Tarifas Acordo</TabsTrigger>
              </TabsList>

              <TabsContent value="bloqueios">
                <form onSubmit={handleBlock} className="space-y-4">
                  <div className="space-y-2">
                    <Label>Nome do Grupo / Evento</Label>
                    <Input placeholder="Ex: Convenção de Vendas 2024" required />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Nº de Quartos</Label>
                      <Input type="number" min="1" placeholder="20" required />
                    </div>
                    <div className="space-y-2">
                      <Label>Data de Início</Label>
                      <Input type="date" required />
                    </div>
                  </div>
                  <Button type="submit" className="w-full gap-2">
                    <Briefcase className="w-4 h-4" /> Criar Bloqueio de Inventário
                  </Button>
                </form>
              </TabsContent>

              <TabsContent value="rooming">
                <form onSubmit={handleRoomingList} className="space-y-4">
                  <div className="space-y-2">
                    <Label>Selecione o Grupo</Label>
                    <Input placeholder="Ex: Grupo XYZ" required />
                  </div>
                  <div className="space-y-2">
                    <Label>Nome do Hóspede Principal</Label>
                    <Input placeholder="Ex: Carlos Eduardo" required />
                  </div>
                  <div className="space-y-2">
                    <Label>Acomodação (Opcional)</Label>
                    <Input placeholder="Ex: Duplo Solteiro" />
                  </div>
                  <Button
                    type="submit"
                    className="w-full gap-2 bg-slate-900 text-white hover:bg-slate-800"
                  >
                    <UserPlus className="w-4 h-4" /> Adicionar à Rooming List
                  </Button>
                </form>
              </TabsContent>

              <TabsContent value="tarifas">
                <form onSubmit={handleRates} className="space-y-4">
                  <div className="space-y-2">
                    <Label>Empresa Parceira</Label>
                    <Input placeholder="Ex: Tech Corp S.A." required />
                  </div>
                  <div className="space-y-2">
                    <Label>Desconto ou Tarifa Fixa</Label>
                    <Input placeholder="Ex: 20% OFF" required />
                  </div>
                  <Button
                    type="submit"
                    className="w-full gap-2 bg-emerald-600 hover:bg-emerald-700 text-white"
                  >
                    <Percent className="w-4 h-4" /> Registrar Acordo Corporativo
                  </Button>
                </form>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>

        <div>
          {output && (
            <Card className="border-emerald-500/20 bg-emerald-50 shadow-sm animate-fade-in-up">
              <CardHeader>
                <CardTitle className="text-emerald-700 font-display text-base">
                  Log da Operação MICE
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
