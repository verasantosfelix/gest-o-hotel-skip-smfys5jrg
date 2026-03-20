import { useState, useEffect } from 'react'
import { Landmark, FileText, DollarSign } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { getFinancialDocs, createFinancialDoc } from '@/services/financial'
import { getBudgetEntries, createBudgetEntry } from '@/services/budget'
import { toast } from '@/components/ui/use-toast'

export default function FinanceCorporate() {
  const [docs, setDocs] = useState<any[]>([])
  const [budgets, setBudgets] = useState<any[]>([])
  const [docForm, setDocForm] = useState({ type: 'Fatura', entity: '', amount: '' })
  const [bgForm, setBgForm] = useState({
    year: new Date().getFullYear(),
    center: '',
    category: 'OPEX',
    amount: '',
  })

  const loadData = async () => {
    try {
      setDocs(await getFinancialDocs())
      setBudgets(await getBudgetEntries())
    } catch (e) {
      console.error(e)
    }
  }

  useEffect(() => {
    loadData()
  }, [])

  const handleDoc = async () => {
    const val = parseFloat(docForm.amount)
    if (val <= 0 || isNaN(val)) {
      toast({
        title: 'Erro',
        description: 'O valor deve ser maior que zero.',
        variant: 'destructive',
      })
      return
    }
    try {
      await createFinancialDoc({
        doc_type: docForm.type,
        entity_name: docForm.entity,
        amount: val,
        status: 'Pendente',
      })
      toast({ title: 'Sucesso', description: 'Documento Financeiro criado.' })
      loadData()
    } catch (e) {
      console.error(e)
    }
  }

  const handleBudget = async () => {
    const val = parseFloat(bgForm.amount)
    try {
      await createBudgetEntry({
        year: bgForm.year,
        cost_center: bgForm.center,
        category: bgForm.category,
        amount: val,
      })
      toast({ title: 'Sucesso', description: 'Orçamento definido.' })
      loadData()
    } catch (e) {
      console.error(e)
    }
  }

  return (
    <div className="space-y-6 animate-fade-in pb-8">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900 flex items-center gap-2">
          <Landmark className="w-6 h-6 text-primary" /> Financeiro B2B & AP/AR
        </h1>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Gestão de Contas (AR/AP)</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex gap-2">
              <select
                className="border rounded px-2"
                value={docForm.type}
                onChange={(e) => setDocForm({ ...docForm, type: e.target.value })}
              >
                <option>Fatura</option>
                <option>Nota Proforma</option>
                <option>AP (Fornecedor)</option>
              </select>
              <Input
                placeholder="Empresa"
                value={docForm.entity}
                onChange={(e) => setDocForm({ ...docForm, entity: e.target.value })}
              />
              <Input
                type="number"
                placeholder="Valor"
                className="w-32"
                value={docForm.amount}
                onChange={(e) => setDocForm({ ...docForm, amount: e.target.value })}
              />
              <Button onClick={handleDoc}>Criar</Button>
            </div>
            <div className="space-y-2 mt-4">
              {docs.map((d) => (
                <div key={d.id} className="flex justify-between border-b pb-2 text-sm">
                  <span>
                    {d.doc_type} - {d.entity_name}
                  </span>
                  <span className="font-bold">R$ {d.amount.toFixed(2)}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Orçamento Hotel (CAPEX/OPEX)</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex gap-2">
              <Input
                placeholder="Centro Custo"
                value={bgForm.center}
                onChange={(e) => setBgForm({ ...bgForm, center: e.target.value })}
              />
              <select
                className="border rounded px-2"
                value={bgForm.category}
                onChange={(e) => setBgForm({ ...bgForm, category: e.target.value })}
              >
                <option>OPEX</option>
                <option>CAPEX</option>
              </select>
              <Input
                type="number"
                placeholder="Valor"
                className="w-32"
                value={bgForm.amount}
                onChange={(e) => setBgForm({ ...bgForm, amount: e.target.value })}
              />
              <Button onClick={handleBudget}>Salvar</Button>
            </div>
            <div className="space-y-2 mt-4">
              {budgets.map((b) => (
                <div key={b.id} className="flex justify-between border-b pb-2 text-sm">
                  <span>
                    {b.year} | {b.cost_center} ({b.category})
                  </span>
                  <span className="font-bold">R$ {b.amount.toFixed(2)}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
