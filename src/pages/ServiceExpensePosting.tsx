import { useState, useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'
import { Receipt, CheckCircle } from 'lucide-react'
import { Card, CardContent, CardFooter } from '@/components/ui/card'
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
import { toast } from '@/components/ui/use-toast'
import useReservationStore from '@/stores/useReservationStore'
import useAuthStore from '@/stores/useAuthStore'
import useAuditStore from '@/stores/useAuditStore'
import useApprovalStore from '@/stores/useApprovalStore'
import { useAccess } from '@/hooks/use-access'
import { RestrictedAccess } from '@/components/RestrictedAccess'

export default function ServiceExpensePosting() {
  const { hasAccess } = useAccess()
  const [searchParams] = useSearchParams()
  const { reservations, addConsumption } = useReservationStore()
  const { userRole, userName } = useAuthStore()
  const { addLog } = useAuditStore()
  const { addRequest } = useApprovalStore()

  const [reservaId, setReservaId] = useState(searchParams.get('reserva_id') || '')
  const [descricao, setDescricao] = useState('')
  const [valor, setValor] = useState('')
  const [desconto, setDesconto] = useState('')
  const [assinatura, setAssinatura] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)

  if (
    !hasAccess(
      [
        'Restaurante_Bar',
        'Spa_Wellness',
        'Lavanderia_Limpeza',
        'Rececao_FrontOffice',
        'Direcao_Admin',
        'Front_Desk',
      ],
      'Lançamentos Rápidos',
    )
  ) {
    return (
      <RestrictedAccess
        requiredRoles={[
          'Restaurante_Bar',
          'Spa_Wellness',
          'Lavanderia_Limpeza',
          'Rececao_FrontOffice',
          'Direcao_Admin',
          'Front_Desk',
        ]}
      />
    )
  }

  const inHouse = reservations.filter((r) => r.status === 'checked-in')

  const handleSubmit = () => {
    const valNum = parseFloat(valor || '0')
    const descNum = parseFloat(desconto || '0')
    if (!reservaId || !descricao || valNum <= 0) return toast({ title: 'Preencha os campos' })

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
      toast({ title: 'Aprovação solicitada' })
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
      addLog('EXPENSE_POSTING', `${userName} lançou R${valNum} na reserva ${reservaId}`)
    }
    setIsSuccess(true)
  }

  if (isSuccess)
    return (
      <div className="flex flex-col items-center py-20">
        <CheckCircle className="w-12 h-12 text-emerald-600" />
      </div>
    )

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <h1 className="text-2xl font-bold flex items-center gap-2">
        <Receipt /> Lançamento
      </h1>
      <Card>
        <CardContent className="p-6 space-y-6">
          <Select value={reservaId} onValueChange={setReservaId}>
            <SelectTrigger>
              <SelectValue placeholder="Selecione o hóspede..." />
            </SelectTrigger>
            <SelectContent>
              {inHouse.map((r) => (
                <SelectItem key={r.id} value={r.id}>
                  {r.room} - {r.guestName}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Input
            placeholder="Descrição"
            value={descricao}
            onChange={(e) => setDescricao(e.target.value)}
          />
          <div className="grid grid-cols-2 gap-4">
            <Input
              type="number"
              placeholder="Valor"
              value={valor}
              onChange={(e) => setValor(e.target.value)}
            />
            <Input
              type="number"
              placeholder="Desconto (%)"
              value={desconto}
              onChange={(e) => setDesconto(e.target.value)}
            />
          </div>
        </CardContent>
        <CardFooter>
          <Button onClick={handleSubmit} className="w-full">
            Lançar
          </Button>
        </CardFooter>
      </Card>
    </div>
  )
}
