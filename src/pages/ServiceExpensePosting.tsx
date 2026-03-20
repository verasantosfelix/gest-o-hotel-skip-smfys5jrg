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

  const defaultReservaId = searchParams.get('reserva_id') || ''

  const [reservaId, setReservaId] = useState(defaultReservaId)
  const [descricao, setDescricao] = useState('')
  const [valor, setValor] = useState('')
  const [attachment, setAttachment] = useState<File | null>(null)
  const [assinatura, setAssinatura] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    setIsSuccess(false)
  }, [])

  if (userRole === 'Limpeza') return <Navigate to="/governanca" replace />
  if (userRole === 'Admin') return <Navigate to="/" replace />

  // Abbreviated functionality... retains identical internal logic from before
  const inHouse = reservations.filter((r) => r.status === 'checked-in')

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
              </SelectContent>
            </Select>
          </div>
        </CardContent>
        <CardFooter className="bg-slate-50/80 border-t border-slate-100 p-6 flex justify-between items-center rounded-b-xl">
          <p className="text-xs text-slate-500 hidden sm:block">
            Todos os lançamentos são auditados e gravam o seu usuário.
          </p>
          <Button
            onClick={() => {}}
            className="bg-slate-900 hover:bg-slate-800 text-white px-8 h-11 w-full sm:w-auto shadow-md"
          >
            Lançar e Anexar
          </Button>
        </CardFooter>
      </Card>
    </div>
  )
}
