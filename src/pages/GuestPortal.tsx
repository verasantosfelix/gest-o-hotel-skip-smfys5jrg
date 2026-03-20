import { useParams } from 'react-router-dom'
import useReservationStore from '@/stores/useReservationStore'
import useAuditStore from '@/stores/useAuditStore'
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { CheckCircle2, ShieldCheck, User } from 'lucide-react'
import { toast } from '@/components/ui/use-toast'

export default function GuestPortal() {
  const { reserva_id } = useParams()
  const { reservations, getConsumptionsByReservation, validateConsumption } = useReservationStore()
  const { addLog } = useAuditStore()

  const reserva = reservations.find((r) => r.id === reserva_id)
  const consumptions = reserva ? getConsumptionsByReservation(reserva.id) : []
  const unvalidated = consumptions.filter((c) => !c.validacao_hospede)

  const handleValidate = (id: string, desc: string) => {
    validateConsumption(id)
    addLog('GUEST_VALIDATION', `Guest validated item ${desc} for reservation ${reserva_id}`)
    toast({
      title: 'Autorização Concluída',
      description: 'O item foi validado digitalmente com sucesso.',
    })
  }

  if (!reserva) {
    return (
      <div className="min-h-screen bg-slate-50 p-8 flex items-center justify-center font-sans">
        <div className="text-center text-slate-500 bg-white p-8 rounded-lg shadow-sm border border-slate-200">
          <p className="font-medium text-lg">Reserva não encontrada.</p>
          <p className="text-sm mt-2">Verifique o link acessado ou contate a recepção.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col p-4 sm:p-8 font-sans items-center pb-20">
      <div className="w-full max-w-md space-y-6 animate-fade-in-up">
        <div className="text-center space-y-2 mt-4 sm:mt-8">
          <div className="inline-flex items-center justify-center p-3 bg-emerald-100 rounded-full mb-2">
            <ShieldCheck className="w-8 h-8 text-emerald-700" />
          </div>
          <h1 className="text-2xl font-bold text-slate-900">Portal do Hóspede</h1>
          <p className="text-slate-500 text-sm">Validação Digital de Consumo</p>
        </div>

        <Card className="border-slate-200 shadow-sm overflow-hidden">
          <div className="bg-slate-800 h-2 w-full" />
          <CardContent className="p-5 flex items-center gap-4">
            <div className="bg-slate-100 p-3 rounded-full shrink-0">
              <User className="w-6 h-6 text-slate-600" />
            </div>
            <div>
              <p className="text-sm text-slate-500 mb-0.5">Bem-vindo(a),</p>
              <p className="text-lg font-bold text-slate-900 leading-tight">{reserva.guestName}</p>
              <div className="flex items-center gap-2 mt-1">
                <span className="text-xs font-medium bg-slate-100 px-2 py-0.5 rounded text-slate-600">
                  Quarto {reserva.room}
                </span>
                <span className="text-xs text-slate-400">ID: {reserva.id}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="space-y-4">
          <h2 className="text-sm font-bold text-slate-800 uppercase tracking-wider pl-1">
            Itens Pendentes
          </h2>

          {unvalidated.length === 0 ? (
            <div className="text-center p-8 bg-white rounded-lg border border-slate-200 border-dashed shadow-sm">
              <CheckCircle2 className="w-10 h-10 text-emerald-500 mx-auto mb-3" />
              <p className="text-slate-800 font-medium">Tudo certo!</p>
              <p className="text-slate-500 text-sm mt-1">Nenhum consumo pendente de validação.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {unvalidated.map((item) => (
                <Card
                  key={item.id}
                  className="border-slate-200 shadow-sm overflow-hidden transition-all hover:shadow-md"
                >
                  <CardHeader className="p-4 pb-0">
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle className="text-base text-slate-800 font-medium">
                          {item.quantidade}x {item.descricao}
                        </CardTitle>
                        <p className="text-xs text-slate-500 mt-1 uppercase tracking-wider">
                          {item.categoria}
                        </p>
                      </div>
                      <span className="font-bold text-slate-900 text-lg">
                        R$ {item.valor.toFixed(2)}
                      </span>
                    </div>
                  </CardHeader>
                  <CardFooter className="p-4 pt-4 border-t border-slate-50 mt-3">
                    <Button
                      className="w-full bg-slate-800 hover:bg-slate-900 text-white flex items-center gap-2 shadow-sm"
                      onClick={() => handleValidate(item.id, item.descricao)}
                    >
                      <ShieldCheck className="w-4 h-4" />
                      Assinar e Autorizar
                    </Button>
                  </CardFooter>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
