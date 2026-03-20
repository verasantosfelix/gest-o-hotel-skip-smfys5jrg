import { useState } from 'react'
import { FileText, Search } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Input } from '@/components/ui/input'
import useAuthStore from '@/stores/useAuthStore'

export default function Reports() {
  const { userRole } = useAuthStore()
  const [output, setOutput] = useState('')
  const [search, setSearch] = useState('')

  const handleGenerate = (type: string) => {
    let result = ''
    switch (type) {
      case 'daily':
        result = `<OUTPUT>\n  <relatorio>Diário</relatorio>\n  <ocupacao>82%</ocupacao>\n  <checkins>12</checkins>\n  <checkouts>8</checkouts>\n  <cancelamentos>2</cancelamentos>\n  <receita_total>R$ 15.420,00</receita_total>\n  <revpar>R$ 385,50</revpar>\n  <adr>R$ 470,12</adr>\n  <eventos>Nenhum</eventos>\n</OUTPUT>`
        break
      case 'weekly':
        result = `<OUTPUT>\n  <relatorio>Semanal</relatorio>\n  <ocupacao_media>78%</ocupacao_media>\n  <receita_total>R$ 98.450,00</receita_total>\n  <cancelamentos>5</cancelamentos>\n  <performance_equipa>Atingiu meta de SLAs em 94%</performance_equipa>\n  <indicadores>Crescimento de 5% YoY</indicadores>\n</OUTPUT>`
        break
      case 'monthly':
        result = `<OUTPUT>\n  <relatorio>Mensal</relatorio>\n  <ocupacao_media>85%</ocupacao_media>\n  <revpar>R$ 410,00</revpar>\n  <adr>R$ 482,00</adr>\n  <receita_mensal>R$ 415.000,00</receita_mensal>\n  <custos_operacionais>R$ 210.500,00</custos_operacionais>\n</OUTPUT>`
        break
      case 'kpi':
        result = `<OUTPUT>\n  <relatorio>KPIs Consolidados</relatorio>\n  <ocupacao>85%</ocupacao>\n  <revpar>R$ 410,00</revpar>\n  <adr>R$ 482,00</adr>\n  <taxa_cancelamento>4.2%</taxa_cancelamento>\n  <nps>74</nps>\n  <lucro_operacional>R$ 204.500,00</lucro_operacional>\n</OUTPUT>`
        break
    }
    setOutput(result)
  }

  const handleSearch = () => {
    const s = search.toLowerCase()
    if (s.includes('diário')) handleGenerate('daily')
    else if (s.includes('weekly') || s.includes('semanal')) handleGenerate('weekly')
    else if (s.includes('indicadores') || s.includes('kpi') || s.includes('balanço'))
      handleGenerate('kpi')
    else if (s.includes('performance equipa')) handleGenerate('weekly')
    else handleGenerate('monthly')
  }

  if (userRole !== 'Admin' && userRole !== 'Administrativa') return null

  return (
    <div className="space-y-6 animate-fade-in pb-8">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900 flex items-center gap-2">
          <FileText className="w-6 h-6 text-primary" />
          Relatórios & Analytics Avançados
        </h1>
        <p className="text-muted-foreground text-sm">
          Geração de relatórios operacionais, financeiros e de performance.
        </p>
      </div>

      <div className="flex gap-2 max-w-md">
        <Input
          placeholder="Busca natural (ex: relatório diário, indicadores)..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <Button onClick={handleSearch}>
          <Search className="w-4 h-4 mr-2" /> Buscar
        </Button>
      </div>

      <Card className="border-slate-200 shadow-sm">
        <CardHeader>
          <CardTitle className="text-lg">Motor de Geração de Relatórios</CardTitle>
          <CardDescription>Selecione o período ou métrica desejada.</CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="diario" className="w-full">
            <TabsList className="mb-4 bg-slate-100 flex flex-wrap h-auto p-1">
              <TabsTrigger value="diario">Relatório Diário</TabsTrigger>
              <TabsTrigger value="semanal">Weekly Report</TabsTrigger>
              <TabsTrigger value="mensal">Balanço Mensal</TabsTrigger>
              <TabsTrigger value="kpi">Indicadores / KPIs</TabsTrigger>
            </TabsList>

            <TabsContent value="diario" className="space-y-4">
              <Button onClick={() => handleGenerate('daily')}>Consultar Movimento Diário</Button>
            </TabsContent>
            <TabsContent value="semanal" className="space-y-4">
              <Button onClick={() => handleGenerate('weekly')}>Consolidar Dados Semanais</Button>
            </TabsContent>
            <TabsContent value="mensal" className="space-y-4">
              <Button onClick={() => handleGenerate('monthly')}>Analisar Período Mensal</Button>
            </TabsContent>
            <TabsContent value="kpi" className="space-y-4">
              <Button onClick={() => handleGenerate('kpi')}>Extrair KPIs Críticos</Button>
            </TabsContent>
          </Tabs>

          {output && (
            <div className="mt-6 animate-fade-in-up">
              <h3 className="text-sm font-semibold mb-2 text-slate-800">
                Saída de Dados (Output):
              </h3>
              <pre className="bg-slate-900 text-emerald-400 p-4 rounded-md font-mono text-sm overflow-x-auto shadow-inner">
                {output}
              </pre>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
