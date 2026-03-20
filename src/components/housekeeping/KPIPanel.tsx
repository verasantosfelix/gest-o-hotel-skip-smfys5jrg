import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { RoomRecord } from '@/services/rooms'
import { CheckCircle2, Clock, XCircle, Wrench } from 'lucide-react'

export function KPIPanel({ rooms }: { rooms: RoomRecord[] }) {
  const total = rooms.length
  const ready = rooms.filter(
    (r) => r.status === 'vago_pronto' || r.status === 'ocupado_pronto',
  ).length
  const dirty = rooms.filter((r) => r.status === 'sujo').length
  const maint = rooms.filter((r) => r.status === 'manutencao').length
  const dnd = rooms.filter((r) => r.status === 'nao_perturbar').length

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="bg-emerald-50 border-emerald-200">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-emerald-800 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4" /> Quartos Prontos
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-black text-emerald-900">
              {ready} <span className="text-sm font-medium text-emerald-600">/ {total}</span>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-rose-50 border-rose-200">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-rose-800 flex items-center gap-2">
              <XCircle className="w-4 h-4" /> Pendentes Limpeza
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-black text-rose-900">{dirty}</div>
          </CardContent>
        </Card>

        <Card className="bg-slate-100 border-slate-200">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-slate-800 flex items-center gap-2">
              <Wrench className="w-4 h-4" /> Em Manutenção
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-black text-slate-900">{maint}</div>
          </CardContent>
        </Card>

        <Card className="bg-purple-50 border-purple-200">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-purple-800 flex items-center gap-2">
              <Clock className="w-4 h-4" /> Não Perturbe (DND)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-black text-purple-900">{dnd}</div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Performance de Limpeza (Estimado)</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between items-center border-b pb-2">
              <span className="text-slate-600">Tempo Médio (Checkout)</span>
              <span className="font-bold text-slate-900">42 min</span>
            </div>
            <div className="flex justify-between items-center border-b pb-2">
              <span className="text-slate-600">Tempo Médio (Stayover)</span>
              <span className="font-bold text-slate-900">25 min</span>
            </div>
            <div className="flex justify-between items-center border-b pb-2">
              <span className="text-slate-600">Quartos Reprovados na Inspeção</span>
              <span className="font-bold text-rose-600">2%</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Comunicações Integradas</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="bg-blue-50 p-4 rounded-lg border border-blue-100 flex gap-4 items-start">
              <div className="bg-blue-100 p-2 rounded-full">
                <Clock className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <p className="text-sm font-bold text-blue-900">SLA de Entrega FO</p>
                <p className="text-xs text-blue-700 mt-1">
                  94% dos quartos entregues antes das 14h para check-in.
                </p>
              </div>
            </div>
            <div className="bg-amber-50 p-4 rounded-lg border border-amber-100 flex gap-4 items-start">
              <div className="bg-amber-100 p-2 rounded-full">
                <Wrench className="w-5 h-5 text-amber-600" />
              </div>
              <div>
                <p className="text-sm font-bold text-amber-900">Resolução Manutenção</p>
                <p className="text-xs text-amber-700 mt-1">
                  Tempo médio de resposta a OS urgentes geradas pela Governança: 18min.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
