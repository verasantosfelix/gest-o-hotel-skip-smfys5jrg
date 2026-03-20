import { useState } from 'react'
import { TrendingUp, Search } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import useAuthStore from '@/stores/useAuthStore'

export default function Revenue() {
  const { userRole } = useAuthStore()
  const [output, setOutput] = useState('')
  const [step, setStep] = useState(1)
  const [search, setSearch] = useState('')

  const handleRecommend = (e: React.FormEvent) => {
    e.preventDefault()
    setStep(2)
    setOutput(
      `<OUTPUT>\n  <status>Análise concluída</status>\n  <recomendacao>Aumento sugerido de 12% baseado na demanda para as datas selecionadas.</recomendacao>\n  <nova_tarifa_sugerida>R$ 450,00</nova_tarifa_sugerida>\n</OUTPUT>`,
    )
  }

  const handleConfirmTariff = () => {
    setStep(1)
    setOutput(
      `<OUTPUT>\n  <status>Tarifa aplicada com sucesso.</status>\n  <acao>Sistema atualizado para R$ 450,00</acao>\n</OUTPUT>`,
    )
  }

  const handleForecasting = () => {
    setOutput(
      `<OUTPUT>\n  <analise>Previsão de Demanda (Forecasting)</analise>\n  <ocupacao_prevista>88% para o próximo mês</ocupacao_prevista>\n  <receita_projetada>R$ 420.000,00</receita_projetada>\n</OUTPUT>`,
    )
  }

  const handleYield = () => {
    setOutput(
      `<OUTPUT>\n  <analise>Yield Management</analise>\n  <yield_ideal>82.5%</yield_ideal>\n  <capacidade_estrategica>Recomendado overbooking de 3% em quartos Standard.</capacidade_estrategica>\n</OUTPUT>`,
    )
  }

  const handleSearch = () => {
    const s = search.toLowerCase()
    if (
      s.includes('preco') ||
      s.includes('preço') ||
      s.includes('dinamico') ||
      s.includes('dinâmico')
    ) {
      setOutput(
        '<OUTPUT>\n  <info>Ajuste de preço dinâmico ativo. Utilize a aba "Tarifário" para simulações.</info>\n</OUTPUT>',
      )
    } else if (s.includes('previsao') || s.includes('previsão') || s.includes('demanda')) {
      handleForecasting()
    } else if (s.includes('capacidade') || s.includes('estrategica') || s.includes('estratégica')) {
      handleYield()
    } else {
      setOutput('<OUTPUT>\n  <erro>Termo não reconhecido no motor de revenue.</erro>\n</OUTPUT>')
    }
  }

  if (userRole !== 'Admin' && userRole !== 'Administrativa') return null

  return (
    <div className="space-y-6 animate-fade-in pb-8">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900 flex items-center gap-2">
          <TrendingUp className="w-6 h-6 text-primary" />
          Pricing & Revenue Management
        </h1>
        <p className="text-muted-foreground text-sm">
          Gestão de tarifas dinâmicas, forecasting e capacidade estratégica.
        </p>
      </div>

      <div className="flex gap-2 max-w-md">
        <Input
          placeholder="Ex: preco dinamico, previsao demanda..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <Button onClick={handleSearch}>
          <Search className="w-4 h-4 mr-2" /> Buscar
        </Button>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card className="border-slate-200 shadow-sm">
          <CardHeader>
            <CardTitle>Painel Financeiro Estratégico</CardTitle>
            <CardDescription>Simulações e ajustes tarifários.</CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="tarifario" className="w-full">
              <TabsList className="mb-4 bg-slate-100 flex flex-wrap h-auto p-1">
                <TabsTrigger value="tarifario">Ajuste Tarifário</TabsTrigger>
                <TabsTrigger value="forecasting">Forecasting</TabsTrigger>
                <TabsTrigger value="yield">Yield Mgmt</TabsTrigger>
              </TabsList>

              <TabsContent value="tarifario">
                {step === 1 ? (
                  <form onSubmit={handleRecommend} className="space-y-4">
                    <div className="space-y-2">
                      <Label>Categoria de Quarto</Label>
                      <Select defaultValue="standard">
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="standard">Standard</SelectItem>
                          <SelectItem value="luxo">Luxo</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label>Período (Datas)</Label>
                      <Input type="text" placeholder="Ex: 15/10/2024 até 20/10/2024" required />
                    </div>
                    <Button type="submit" className="w-full">
                      Gerar Recomendação Dinâmica
                    </Button>
                  </form>
                ) : (
                  <div className="space-y-4">
                    <div className="bg-amber-50 p-4 rounded-lg border border-amber-200">
                      <p className="font-semibold text-amber-800">Ação Requerida</p>
                      <p className="text-sm text-amber-700 mt-1">
                        O sistema recomenda atualizar a tarifa para R$ 450,00. Aplicar nova tarifa?
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <Button variant="outline" onClick={() => setStep(1)} className="w-full">
                        Cancelar
                      </Button>
                      <Button
                        onClick={handleConfirmTariff}
                        className="w-full bg-emerald-600 hover:bg-emerald-700 text-white"
                      >
                        Confirmar Aplicação
                      </Button>
                    </div>
                  </div>
                )}
              </TabsContent>

              <TabsContent value="forecasting" className="space-y-4">
                <p className="text-sm text-slate-600">
                  Analisa dados históricos e gera previsão de demanda futura (Ocupação e Receita).
                </p>
                <Button onClick={handleForecasting} className="w-full">
                  Processar Forecasting
                </Button>
              </TabsContent>

              <TabsContent value="yield" className="space-y-4">
                <p className="text-sm text-slate-600">
                  Calcula o Yield ideal e gerencia a capacidade estratégica, incluindo políticas de
                  Overbooking calculadas.
                </p>
                <Button onClick={handleYield} className="w-full">
                  Calcular Yield Management
                </Button>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>

        <div>
          {output && (
            <Card className="border-slate-800 bg-slate-900 shadow-sm animate-fade-in-up">
              <CardHeader>
                <CardTitle className="text-emerald-400 font-mono text-base flex items-center gap-2">
                  <TrendingUp className="w-4 h-4" />
                  Saída Analítica (Output)
                </CardTitle>
              </CardHeader>
              <CardContent>
                <pre className="text-emerald-400 font-mono text-sm whitespace-pre-wrap">
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
