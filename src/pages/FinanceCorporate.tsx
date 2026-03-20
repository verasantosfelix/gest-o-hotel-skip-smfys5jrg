import { useState, useEffect } from 'react'
import { Landmark } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { getFinancialDocs, createFinancialDoc } from '@/services/financial'
import { getBudgetEntries, createBudgetEntry } from '@/services/budget'
import { toast } from '@/components/ui/use-toast'
import { formatCurrency } from '@/lib/utils'

export default function FinanceCorporate() {
  const [docs, setDocs] = useState<any[]>([])
  const [budgets, setBudgets] = useState<any[]>([])
  const [docForm, setDocForm] = useState({
    type: 'Fatura',
    entity: '',
    amount: '',
    currency: 'AOA',
  })
  const [bgForm, setBgForm] = useState({
    year: new Date().getFullYear(),
    center: '',
    category: 'OPEX',
    amount: '',
    currency: 'AOA',
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
        currency: docForm.currency,
        status: 'Pendente',
      })
      toast({ title: 'Sucesso', description: 'Documento Financeiro criado.' })
      setDocForm((prev) => ({ ...prev, amount: '' }))
      loadData()
    } catch (e) {
      console.error(e)
    }
  }

  const handleBudget = async () => {
    const val = parseFloat(bgForm.amount)
    if (val <= 0 || isNaN(val)) {
      toast({
        title: 'Erro',
        description: 'O valor deve ser maior que zero.',
        variant: 'destructive',
      })
      return
    }
    try {
      await createBudgetEntry({
        year: bgForm.year,
        cost_center: bgForm.center,
        category: bgForm.category,
        amount: val,
        currency: bgForm.currency,
      })
      toast({ title: 'Sucesso', description: 'Orçamento definido.' })
      setBgForm((prev) => ({ ...prev, amount: '' }))
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
              <Select
                value={docForm.type}
                onValueChange={(v) => setDocForm({ ...docForm, type: v })}
              >
                <SelectTrigger className="w-40">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Fatura">Fatura</SelectItem>
                  <SelectItem value="Nota Proforma">Nota Proforma</SelectItem>
                  <SelectItem value="AP (Fornecedor)">AP (Fornecedor)</SelectItem>
                </SelectContent>
              </Select>
              <Input
                placeholder="Empresa"
                value={docForm.entity}
                className="flex-1"
                onChange={(e) => setDocForm({ ...docForm, entity: e.target.value })}
              />
            </div>
            <div className="flex gap-2">
              <Select
                value={docForm.currency}
                onValueChange={(v) => setDocForm({ ...docForm, currency: v })}
              >
                <SelectTrigger className="w-24">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="AOA">AOA</SelectItem>
                  <SelectItem value="EUR">EUR</SelectItem>
                  <SelectItem value="USD">USD</SelectItem>
                </SelectContent>
              </Select>
              <Input
                type="number"
                placeholder="Valor"
                className="flex-1"
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
                  <span className="font-bold">{formatCurrency(d.amount, d.currency)}</span>
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
                className="flex-1"
                value={bgForm.center}
                onChange={(e) => setBgForm({ ...bgForm, center: e.target.value })}
              />
              <Select
                value={bgForm.category}
                onValueChange={(v) => setBgForm({ ...bgForm, category: v })}
              >
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="OPEX">OPEX</SelectItem>
                  <SelectItem value="CAPEX">CAPEX</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex gap-2">
              <Select
                value={bgForm.currency}
                onValueChange={(v) => setBgForm({ ...bgForm, currency: v })}
              >
                <SelectTrigger className="w-24">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="AOA">AOA</SelectItem>
                  <SelectItem value="EUR">EUR</SelectItem>
                  <SelectItem value="USD">USD</SelectItem>
                </SelectContent>
              </Select>
              <Input
                type="number"
                placeholder="Valor"
                className="flex-1"
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
                  <span className="font-bold">{formatCurrency(b.amount, b.currency)}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
