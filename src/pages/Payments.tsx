import { useState } from 'react'
import { Navigate } from 'react-router-dom'
import { CreditCard, Repeat, Undo2, GitBranch, AlertTriangle, CheckCircle } from 'lucide-react'
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
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import useAuthStore from '@/stores/useAuthStore'
import { formatCurrency } from '@/lib/utils'

export default function Payments() {
  const { userRole } = useAuthStore()
  const [output, setOutput] = useState('')
  const [error, setError] = useState('')

  // Simples
  const [valSimples, setValSimples] = useState('')
  const [currencySimples, setCurrencySimples] = useState('AOA')
  const [method, setMethod] = useState('credito')
  const [confirmingSimples, setConfirmingSimples] = useState(false)

  // Recorrente
  const [valRecorrente, setValRecorrente] = useState('')
  const [currencyRecorrente, setCurrencyRecorrente] = useState('AOA')
  const [periodicity, setPeriodicity] = useState('mensal')

  // Estorno
  const [valEstorno, setValEstorno] = useState('')
  const [currencyEstorno, setCurrencyEstorno] = useState('AOA')
  const [transactionId, setTransactionId] = useState('')

  // Split
  const [valSplit, setValSplit] = useState('')
  const [currencySplit, setCurrencySplit] = useState('AOA')
  const [splitDetails, setSplitDetails] = useState('')

  if (userRole !== 'Admin' && userRole !== 'Administrativa') {
    return <Navigate to="/" replace />
  }

  const validateValue = (valStr: string) => {
    const v = parseFloat(valStr)
    if (isNaN(v) || v <= 0) {
      setError('<erro tipo="valor-invalido">O valor deve ser maior que zero.</erro>')
      setOutput('')
      return false
    }
    setError('')
    return true
  }

  const handleSimples = (e: React.FormEvent) => {
    e.preventDefault()
    if (!validateValue(valSimples)) return
    setConfirmingSimples(true)
  }

  const confirmSimples = () => {
    setConfirmingSimples(false)
    setOutput(
      `<OUTPUT>\n  <status>Pagamento realizado</status>\n  <recibo>REC-${Math.floor(
        Math.random() * 90000,
      )}</recibo>\n  <metodo>${method}</metodo>\n  <valor>${formatCurrency(parseFloat(valSimples), currencySimples)}</valor>\n</OUTPUT>`,
    )
  }

  const handleRecorrente = (e: React.FormEvent) => {
    e.preventDefault()
    if (!validateValue(valRecorrente)) return
    setOutput(
      `<OUTPUT>\n  <status>Pagamento recorrente ativado</status>\n  <periodicidade>${periodicity}</periodicidade>\n  <valor>${formatCurrency(parseFloat(valRecorrente), currencyRecorrente)}</valor>\n</OUTPUT>`,
    )
  }

  const handleEstorno = (e: React.FormEvent) => {
    e.preventDefault()
    if (!validateValue(valEstorno)) return
    if (!transactionId) {
      setError('<erro>Informe o ID da Transação.</erro>')
      setOutput('')
      return
    }
    setOutput(
      `<OUTPUT>\n  <status>Estorno processado</status>\n  <transacao>${transactionId}</transacao>\n  <valor_estornado>${formatCurrency(parseFloat(valEstorno), currencyEstorno)}</valor_estornado>\n</OUTPUT>`,
    )
  }

  const handleSplit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!validateValue(valSplit)) return
    if (!splitDetails) {
      setError('<erro>Informe os detalhes do split.</erro>')
      setOutput('')
      return
    }
    setOutput(
      `<OUTPUT>\n  <status>Split registrado</status>\n  <detalhes>${splitDetails}</detalhes>\n  <valor_total>${formatCurrency(parseFloat(valSplit), currencySplit)}</valor_total>\n</OUTPUT>`,
    )
  }

  return (
    <div className="space-y-6 animate-fade-in pb-8">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900 flex items-center gap-2">
          <CreditCard className="w-6 h-6 text-primary" />
          Gateway Avançado & Pagamentos
        </h1>
        <p className="text-muted-foreground text-sm">
          Gerenciamento financeiro centralizado para processamentos diretos, estornos e split em
          múltiplas moedas.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card className="border-slate-200 shadow-sm">
          <CardHeader>
            <CardTitle>Painel Transacional</CardTitle>
            <CardDescription>Selecione a operação financeira a ser executada.</CardDescription>
          </CardHeader>
          <CardContent>
            {error && (
              <div className="mb-4 text-sm text-rose-600 bg-rose-50 p-3 rounded-md flex items-center gap-2 border border-rose-200 font-mono">
                <AlertTriangle className="w-4 h-4 shrink-0" />
                {error}
              </div>
            )}

            <Tabs defaultValue="simples" className="w-full">
              <TabsList className="mb-4 bg-slate-100 flex flex-wrap h-auto p-1">
                <TabsTrigger value="simples" className="flex-1">
                  Pagamento Simples
                </TabsTrigger>
                <TabsTrigger value="recorrente" className="flex-1">
                  Recorrente
                </TabsTrigger>
                <TabsTrigger value="estorno" className="flex-1">
                  Estorno
                </TabsTrigger>
                <TabsTrigger value="split" className="flex-1">
                  Split
                </TabsTrigger>
              </TabsList>

              <TabsContent value="simples">
                {!confirmingSimples ? (
                  <form onSubmit={handleSimples} className="space-y-4">
                    <div className="space-y-2">
                      <Label>Valor da Transação</Label>
                      <div className="flex gap-2">
                        <Input
                          type="number"
                          step="0.01"
                          placeholder="Ex: 150.00"
                          value={valSimples}
                          onChange={(e) => setValSimples(e.target.value)}
                          required
                          className="flex-1"
                        />
                        <Select value={currencySimples} onValueChange={setCurrencySimples}>
                          <SelectTrigger className="w-24">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="AOA">AOA</SelectItem>
                            <SelectItem value="EUR">EUR</SelectItem>
                            <SelectItem value="USD">USD</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label>Método de Pagamento</Label>
                      <Select value={method} onValueChange={setMethod}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="credito">Cartão de Crédito</SelectItem>
                          <SelectItem value="debito">Cartão de Débito</SelectItem>
                          <SelectItem value="pix">PIX / Transferência</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <Button type="submit" className="w-full">
                      Processar
                    </Button>
                  </form>
                ) : (
                  <div className="space-y-4 animate-fade-in">
                    <Alert className="bg-amber-50 border-amber-200">
                      <AlertTriangle className="w-4 h-4 text-amber-600" />
                      <AlertTitle className="text-amber-800 font-bold">
                        Confirmação de Transação
                      </AlertTitle>
                      <AlertDescription className="text-amber-700 mt-2">
                        Confirmar pagamento? O valor de{' '}
                        <strong>{formatCurrency(parseFloat(valSimples), currencySimples)}</strong>{' '}
                        será processado via <strong>{method}</strong>.
                      </AlertDescription>
                    </Alert>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        onClick={() => setConfirmingSimples(false)}
                        className="w-full"
                      >
                        Cancelar
                      </Button>
                      <Button
                        onClick={confirmSimples}
                        className="w-full bg-slate-900 text-white hover:bg-slate-800"
                      >
                        Confirmar e Pagar
                      </Button>
                    </div>
                  </div>
                )}
              </TabsContent>

              <TabsContent value="recorrente">
                <form onSubmit={handleRecorrente} className="space-y-4">
                  <div className="space-y-2">
                    <Label>Valor por Ciclo</Label>
                    <div className="flex gap-2">
                      <Input
                        type="number"
                        step="0.01"
                        placeholder="Ex: 50.00"
                        value={valRecorrente}
                        onChange={(e) => setValRecorrente(e.target.value)}
                        required
                        className="flex-1"
                      />
                      <Select value={currencyRecorrente} onValueChange={setCurrencyRecorrente}>
                        <SelectTrigger className="w-24">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="AOA">AOA</SelectItem>
                          <SelectItem value="EUR">EUR</SelectItem>
                          <SelectItem value="USD">USD</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label>Periodicidade</Label>
                    <Select value={periodicity} onValueChange={setPeriodicity}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="mensal">Mensal</SelectItem>
                        <SelectItem value="semanal">Semanal</SelectItem>
                        <SelectItem value="anual">Anual</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <Button type="submit" className="w-full gap-2">
                    <Repeat className="w-4 h-4" /> Ativar Cobrança Automática
                  </Button>
                </form>
              </TabsContent>

              <TabsContent value="estorno">
                <form onSubmit={handleEstorno} className="space-y-4">
                  <div className="space-y-2">
                    <Label>ID da Transação Original</Label>
                    <Input
                      placeholder="Ex: TRX-84920"
                      value={transactionId}
                      onChange={(e) => setTransactionId(e.target.value)}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Valor do Estorno</Label>
                    <div className="flex gap-2">
                      <Input
                        type="number"
                        step="0.01"
                        placeholder="Ex: 150.00"
                        value={valEstorno}
                        onChange={(e) => setValEstorno(e.target.value)}
                        required
                        className="flex-1"
                      />
                      <Select value={currencyEstorno} onValueChange={setCurrencyEstorno}>
                        <SelectTrigger className="w-24">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="AOA">AOA</SelectItem>
                          <SelectItem value="EUR">EUR</SelectItem>
                          <SelectItem value="USD">USD</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <Button type="submit" className="w-full gap-2" variant="destructive">
                    <Undo2 className="w-4 h-4" /> Processar Refund
                  </Button>
                </form>
              </TabsContent>

              <TabsContent value="split">
                <form onSubmit={handleSplit} className="space-y-4">
                  <div className="space-y-2">
                    <Label>Valor Total</Label>
                    <div className="flex gap-2">
                      <Input
                        type="number"
                        step="0.01"
                        placeholder="Ex: 1000.00"
                        value={valSplit}
                        onChange={(e) => setValSplit(e.target.value)}
                        required
                        className="flex-1"
                      />
                      <Select value={currencySplit} onValueChange={setCurrencySplit}>
                        <SelectTrigger className="w-24">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="AOA">AOA</SelectItem>
                          <SelectItem value="EUR">EUR</SelectItem>
                          <SelectItem value="USD">USD</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label>Detalhes da Distribuição (Contas / %)</Label>
                    <Input
                      placeholder="Ex: 60% Conta A, 40% Conta B"
                      value={splitDetails}
                      onChange={(e) => setSplitDetails(e.target.value)}
                      required
                    />
                  </div>
                  <Button
                    type="submit"
                    className="w-full gap-2 bg-emerald-600 hover:bg-emerald-700 text-white"
                  >
                    <GitBranch className="w-4 h-4" /> Configurar Divisão
                  </Button>
                </form>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>

        <div>
          {output && (
            <Card className="border-slate-800 bg-slate-900 shadow-sm animate-fade-in-up">
              <CardHeader>
                <CardTitle className="text-emerald-400 font-mono text-base flex items-center gap-2">
                  <CheckCircle className="w-4 h-4" /> Output da Operação
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
