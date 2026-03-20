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
import useReservationStore from '@/stores/useReservationStore'
import useAuthStore from '@/stores/useAuthStore'
import useAuditStore from '@/stores/useAuditStore'
import useApprovalStore from '@/stores/useApprovalStore'

export default function ServiceExpensePosting() {
  const [searchParams] = useSearchParams()
  const { reservations, addConsumption } = useReservationStore()
  const { userRole, userName } = useAuthStore()
  const { addLog } = useAuditStore()
  const { addRequest } = useApprovalStore()

  const defaultReservaId = searchParams.get('reserva_id') || ''

  const [reservaId, setReservaId] = useState(defaultReservaId)
  const [descricao, setDescricao] = useState('')
  const [valor, setValor] = useState('')
  const [desconto, setDesconto] = useState('')
  const [attachment, setAttachment] = useState<File | null>(null)
  const [assinatura, setAssinatura] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)

  useEffect(() => {
    setIsSuccess(false)
  }, [])

  if (userRole === 'Limpeza') return <Navigate to="/governanca" replace />
  if (userRole === 'Admin') return <Navigate to="/" replace />

  const inHouse = reservations.filter((r) => r.status === 'checked-in')

  const handleSubmit = () => {
    const valNum = parseFloat(valor || '0')
    const descNum = parseFloat(desconto || '0')

    if (!reservaId || !descricao || valNum <= 0) {
      toast({
        title: 'Atenção',
        description: 'Preencha a identificação, descrição e o valor do consumo.',
        variant: 'destructive',
      })
      return
    }

    if (descNum > 0) {
      addRequest({
        type: 'Reservation',
        description: descricao,
        originalAmount: valNum,
        discountPercent: descNum,
        discountAmount: valNum * (descNum / 100),
        finalAmount: valNum - valNum * (descNum / 100),
        requesterName: userName,
        requesterRole: userRole,
      })
      toast({
        title: 'Pendente de Aprovação',
        description: `O desconto de ${descNum}% foi enviado à gerência para validação.`,
      })
      setIsSuccess(true)
    } else {
      addConsumption({
        id: Math.random().toString(36).substring(2, 9),
        reserva_id: reservaId,
        categoria: 'Serviços Extras',
        descricao,
        quantidade: 1,
        preco_unitario: valNum,
        desconto: 0,
        valor: valNum,
        validacao_hospede: assinatura,
        data_registro: new Date().toISOString(),
        createdByRole: userRole,
        createdBy: userName,
      })
      addLog(
        'EXPENSE_POSTING',
        `${userName} lançou ${descricao} (R$ ${valNum}) na reserva ${reservaId}`,
      )
      setIsSuccess(true)
    }
  }

  if (isSuccess) {
    return (
      <div className="flex flex-col items-center justify-center py-20 space-y-4 animate-fade-in">
        <div className="bg-emerald-100 p-4 rounded-full">
          <CheckCircle className="w-12 h-12 text-emerald-600" />
        </div>
        <h2 className="text-2xl font-bold text-slate-900">Operação Concluída</h2>
        <p className="text-slate-500 max-w-sm text-center">
          O registro foi processado. Se continha um desconto, aguarda aprovação gerencial.
        </p>
        <Button
          variant="outline"
          className="mt-4"
          onClick={() => {
            setIsSuccess(false)
            setDescricao('')
            setValor('')
            setDesconto('')
            setAssinatura(false)
          }}
        >
          Novo Lançamento
        </Button>
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
          Setor: {userRole}. Preencha o consumo ou solicite aprovação de descontos.
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
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-4 pt-4 border-t border-slate-100">
            <div className="space-y-2">
              <Label className="text-slate-800 font-semibold">2. Detalhes do Consumo</Label>
              <Input
                placeholder="Descrição do item ou serviço..."
                className="bg-slate-50"
                value={descricao}
                onChange={(e) => setDescricao(e.target.value)}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-slate-800 font-semibold">Valor Bruto (R$)</Label>
                <Input
                  type="number"
                  placeholder="0.00"
                  className="bg-slate-50"
                  value={valor}
                  onChange={(e) => setValor(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label className="text-slate-800 font-semibold">Desconto (%)</Label>
                <Input
                  type="number"
                  placeholder="0"
                  className="bg-slate-50"
                  value={desconto}
                  onChange={(e) => setDesconto(e.target.value)}
                />
                <p className="text-xs text-amber-600 font-medium mt-1">
                  Valores &gt; 0% requerem aprovação
                </p>
              </div>
            </div>
          </div>

          <div className="space-y-4 pt-4 border-t border-slate-100">
            <Label className="text-slate-800 font-semibold">3. Validação</Label>
            <div className="flex items-center space-x-3 bg-slate-50 p-4 rounded-lg border border-slate-200">
              <Checkbox
                id="assinatura"
                checked={assinatura}
                onCheckedChange={(c) => setAssinatura(!!c)}
              />
              <div className="grid gap-1.5 leading-none">
                <label
                  htmlFor="assinatura"
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer text-slate-800"
                >
                  Hóspede assinou a comanda
                </label>
                <p className="text-sm text-slate-500">
                  Marque se a via física foi assinada no momento do consumo.
                </p>
              </div>
            </div>
          </div>
        </CardContent>
        <CardFooter className="bg-slate-50/80 border-t border-slate-100 p-6 flex justify-between items-center rounded-b-xl">
          <p className="text-xs text-slate-500 hidden sm:block">
            Todos os lançamentos são auditados e gravam o seu usuário.
          </p>
          <Button
            onClick={handleSubmit}
            className="bg-slate-900 hover:bg-slate-800 text-white px-8 h-11 w-full sm:w-auto shadow-md"
          >
            Confirmar e Lançar
          </Button>
        </CardFooter>
      </Card>
    </div>
  )
}
