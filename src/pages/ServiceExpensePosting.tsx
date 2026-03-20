import { useState, useEffect } from 'react'
import { useSearchParams, useNavigate, Navigate } from 'react-router-dom'
import { Receipt, Paperclip, CheckCircle, ShieldCheck, AlertCircle } from 'lucide-react'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
  CardFooter,
} from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { toast } from '@/components/ui/use-toast'
import useReservationStore, { Consumption as IConsumption } from '@/stores/useReservationStore'
import useAuthStore from '@/stores/useAuthStore'
import useAuditStore from '@/stores/useAuditStore'

export default function ServiceExpensePosting() {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const { reservations, addConsumption } = useReservationStore()
  const { userRole, userName } = useAuthStore()
  const { addLog } = useAuditStore()

  if (userRole === 'Admin') {
    return <Navigate to="/" replace />
  }

  const defaultReservaId = searchParams.get('reserva_id') || ''

  const [reservaId, setReservaId] = useState(defaultReservaId)
  const [descricao, setDescricao] = useState('')
  const [valor, setValor] = useState('')
  const [attachment, setAttachment] = useState<File | null>(null)
  const [assinatura, setAssinatura] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)
  const [error, setError] = useState('')

  const inHouse = reservations.filter((r) => r.status === 'checked-in')
  const selectedReserva = inHouse.find((r) => r.id === reservaId)

  useEffect(() => {
    setIsSuccess(false)
  }, [])

  const handleSubmit = () => {
    setError('')
    if (!reservaId) {
      setError('Selecione um hóspede/quarto.')
      return
    }
    if (!selectedReserva) {
      setError('Hóspede inválido ou não está mais hospedado.')
      return
    }
    if (!descricao.trim()) {
      setError('A descrição do consumo é obrigatória.')
      return
    }
    const numValor = parseFloat(valor.replace(',', '.'))
    if (isNaN(numValor) || numValor <= 0) {
      setError('O valor deve ser numérico e maior que zero.')
      return
    }
    if (!attachment) {
      setError('É obrigatório anexar o comprovante (comanda ou recibo).')
      return
    }
    if (!assinatura) {
      setError('A validação com a assinatura do hóspede é obrigatória.')
      return
    }

    const cons: IConsumption = {
      id: `SRV-${Math.floor(Math.random() * 10000)}`,
      reserva_id: reservaId,
      categoria:
        userRole === 'Restaurante' || userRole === 'Bar' ? 'Restaurante' : 'Serviços Extras',
      descricao,
      quantidade: 1,
      preco_unitario: numValor,
      desconto: 0,
      valor: numValor,
      validacao_hospede: true,
      data_registro: new Date().toISOString(),
      attachment: attachment.name,
      createdByRole: userRole,
      createdBy: userName,
    }

    addConsumption(cons)
    addLog(
      'EXPENSE_POSTED',
      `[${userRole}] ${userName} posted R$ ${numValor.toFixed(2)} to reservation ${reservaId}. Attached: ${attachment.name}`,
    )

    toast({
      title: 'Lançamento Concluído',
      description: 'O consumo e o comprovante foram registrados na conta do hóspede.',
    })

    setIsSuccess(true)
  }

  const handleReset = () => {
    setReservaId('')
    setDescricao('')
    setValor('')
    setAttachment(null)
    setAssinatura(false)
    setIsSuccess(false)
    navigate('/lancamento-servicos', { replace: true })
  }

  if (isSuccess) {
    return (
      <div className="space-y-6 animate-fade-in max-w-2xl mx-auto pb-8 pt-4">
        <Card className="border-emerald-500/20 bg-emerald-50/50 shadow-sm overflow-hidden">
          <div className="bg-emerald-500 h-2 w-full" />
          <CardHeader className="pb-4">
            <CardTitle className="text-emerald-800 font-display flex items-center gap-2">
              <CheckCircle className="w-6 h-6 text-emerald-600" />
              Lançamento Realizado
            </CardTitle>
            <CardDescription className="text-emerald-700/80">
              Despesa vinculada com sucesso à conta do quarto {selectedReserva?.room}.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3 text-sm text-slate-700 bg-white mx-6 p-4 rounded-md border border-emerald-100 shadow-sm mb-6">
            <div className="flex justify-between border-b border-slate-100 pb-2">
              <span className="text-slate-500">Hóspede</span>
              <span className="font-medium text-slate-900">{selectedReserva?.guestName}</span>
            </div>
            <div className="flex justify-between border-b border-slate-100 pb-2">
              <span className="text-slate-500">Descrição</span>
              <span className="font-medium text-slate-900">{descricao}</span>
            </div>
            <div className="flex justify-between border-b border-slate-100 pb-2">
              <span className="text-slate-500">Valor</span>
              <span className="font-bold text-slate-900">
                R$ {parseFloat(valor.replace(',', '.')).toFixed(2)}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Comprovante</span>
              <span className="text-slate-900 text-xs font-mono">{attachment?.name}</span>
            </div>
          </CardContent>
          <CardFooter className="bg-emerald-100/50 pt-4 pb-4">
            <Button
              onClick={handleReset}
              className="w-full bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm"
            >
              Fazer Novo Lançamento
            </Button>
          </CardFooter>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-6 animate-fade-in max-w-2xl mx-auto pb-8">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900 flex items-center gap-2">
          <Receipt className="w-6 h-6 text-primary" />
          Lançamento de Despesas
        </h1>
        <p className="text-muted-foreground text-sm">
          Setor: {userRole}. Anexe o comprovante com assinatura do hóspede.
        </p>
      </div>

      <Card className="border-slate-200 shadow-sm">
        <CardContent className="p-6 space-y-6">
          <div className="space-y-2">
            <Label className="text-slate-800 font-semibold">
              1. Identificação do Hóspede (Quarto)
            </Label>
            <Select value={reservaId} onValueChange={setReservaId}>
              <SelectTrigger className="w-full bg-slate-50 border-slate-200 h-11">
                <SelectValue placeholder="Selecione o hóspede hospedado..." />
              </SelectTrigger>
              <SelectContent>
                {inHouse.map((r) => (
                  <SelectItem key={r.id} value={r.id} className="py-2">
                    <span className="font-mono text-slate-500 mr-2">Q.{r.room || '-'}</span>
                    <span className="font-medium text-slate-900">{r.guestName}</span>
                  </SelectItem>
                ))}
                {inHouse.length === 0 && (
                  <SelectItem value="none" disabled>
                    Nenhum hóspede in-house
                  </SelectItem>
                )}
              </SelectContent>
            </Select>
            {selectedReserva && (
              <p className="text-xs text-emerald-600 mt-1.5 flex items-center gap-1.5 font-medium">
                <CheckCircle className="w-3.5 h-3.5" /> Quarto {selectedReserva.room} - Ocupado
              </p>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 border-t border-slate-100 pt-5">
            <div className="sm:col-span-2 space-y-2">
              <Label className="text-slate-800 font-semibold">2. Serviço ou Item</Label>
              <Input
                placeholder="Ex: Rodízio de Carnes, Massagem 1h..."
                value={descricao}
                onChange={(e) => setDescricao(e.target.value)}
                className="bg-slate-50 border-slate-200 h-11"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-slate-800 font-semibold">3. Valor (R$)</Label>
              <Input
                placeholder="0.00"
                value={valor}
                onChange={(e) => setValor(e.target.value)}
                className="bg-slate-50 border-slate-200 h-11 font-medium"
              />
            </div>
          </div>

          <div className="space-y-2 border-t border-slate-100 pt-5">
            <Label className="text-slate-800 font-semibold">4. Anexo do Comprovante</Label>
            <div className="flex items-center gap-3 bg-slate-50 border border-slate-200 p-3 rounded-lg border-dashed">
              <div className="bg-slate-200 p-2 rounded-md">
                <Paperclip className="w-5 h-5 text-slate-500" />
              </div>
              <div className="flex-1">
                <Input
                  type="file"
                  className="file:bg-slate-800 file:text-white file:border-0 file:rounded-md file:px-4 file:py-1 file:mr-4 file:cursor-pointer file:font-medium file:text-sm text-sm border-0 bg-transparent p-0 h-auto w-full cursor-pointer text-slate-600 focus-visible:ring-0"
                  accept="image/*,.pdf"
                  onChange={(e) => setAttachment(e.target.files?.[0] || null)}
                />
              </div>
            </div>
            <p className="text-xs text-slate-500 pl-1">
              Capture ou anexe a imagem da comanda/recibo (JPEG, PNG, PDF).
            </p>
          </div>

          <div className="bg-slate-50 p-5 rounded-lg border border-slate-200 shadow-inner text-center space-y-4 mt-2">
            <div className="flex justify-center mb-1">
              <div className="bg-white p-2.5 rounded-full border border-slate-200 shadow-sm text-emerald-600">
                <ShieldCheck className="w-6 h-6" />
              </div>
            </div>
            <div>
              <h3 className="font-semibold text-slate-800">5. Validação com o Hóspede</h3>
              <p className="text-sm text-slate-500 mt-1 max-w-sm mx-auto">
                O hóspede deve confirmar o valor da despesa na tela ou você deve confirmar que ele
                assinou a via física.
              </p>
            </div>

            <div
              className="max-w-xs mx-auto p-4 bg-white border-2 border-slate-300 rounded-md shadow-sm transition-colors data-[checked=true]:border-emerald-500 data-[checked=true]:bg-emerald-50/50"
              data-checked={assinatura}
            >
              <div className="flex items-center space-x-3 justify-center">
                <Checkbox
                  id="assinatura-srv"
                  checked={assinatura}
                  onCheckedChange={(c) => setAssinatura(!!c)}
                  className="w-5 h-5 data-[state=checked]:bg-emerald-600 data-[state=checked]:border-emerald-600"
                />
                <Label
                  htmlFor="assinatura-srv"
                  className="text-slate-800 font-bold cursor-pointer select-none"
                >
                  Hóspede confirma
                </Label>
              </div>
            </div>
          </div>

          {error && (
            <Alert variant="destructive" className="bg-rose-50 text-rose-800 border-rose-200">
              <AlertCircle className="h-4 w-4 text-rose-600" />
              <AlertDescription className="font-medium ml-2">{error}</AlertDescription>
            </Alert>
          )}
        </CardContent>
        <CardFooter className="bg-slate-50/80 border-t border-slate-100 p-6 flex justify-between items-center rounded-b-xl">
          <p className="text-xs text-slate-500 hidden sm:block">
            Todos os lançamentos são auditados e gravam o seu usuário.
          </p>
          <Button
            onClick={handleSubmit}
            className="bg-slate-900 hover:bg-slate-800 text-white px-8 h-11 w-full sm:w-auto shadow-md"
          >
            Lançar e Anexar
          </Button>
        </CardFooter>
      </Card>
    </div>
  )
}
