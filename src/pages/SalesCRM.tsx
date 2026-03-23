import { useState, useEffect } from 'react'
import { LineChart, Activity, TrendingUp } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { useAccess } from '@/hooks/use-access'
import { RestrictedAccess } from '@/components/RestrictedAccess'
import { getGuestInteractions, GuestInteraction } from '@/services/crm'
import { useRealtime } from '@/hooks/use-realtime'

export default function SalesCRM() {
  const { hasAccess } = useAccess()
  const [interactions, setInteractions] = useState<GuestInteraction[]>([])

  const loadData = async () => {
    try {
      const data = await getGuestInteractions()
      setInteractions(data)
    } catch (e) {
      console.error(e)
    }
  }

  useEffect(() => {
    loadData()
  }, [])
  useRealtime('guest_interactions', loadData)

  if (!hasAccess(['Rececao_FrontOffice', 'Direcao_Admin', 'Front_Desk'], 'Vendas & Distribuição')) {
    return (
      <RestrictedAccess requiredRoles={['Rececao_FrontOffice', 'Direcao_Admin', 'Front_Desk']} />
    )
  }

  return (
    <div className="space-y-6 animate-fade-in pb-8">
      <h1 className="text-2xl font-bold flex items-center gap-2">
        <LineChart className="text-indigo-600" /> Vendas, Distribuição & Atividade CRM
      </h1>

      <div className="grid md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-slate-500">
              Taxa de Conversão (OTAs)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-slate-900">68%</div>
            <p className="text-xs text-emerald-600 flex items-center mt-1">
              <TrendingUp className="w-3 h-3 mr-1" /> +5% este mês
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-slate-500">
              Novos Leads Corporativos
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-slate-900">14</div>
            <p className="text-xs text-slate-500 mt-1">Aguardando contato</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-slate-500">
              Interações Recentes
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-slate-900">{interactions.length}</div>
            <p className="text-xs text-slate-500 mt-1">Registradas no sistema</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="w-5 h-5 text-slate-500" /> Timeline Global de Interações (Guest
            Relations)
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {interactions.slice(0, 15).map((int) => (
              <div
                key={int.id}
                className="flex gap-4 items-start p-3 hover:bg-slate-50 rounded-lg transition-colors border border-transparent hover:border-slate-100"
              >
                <div className="w-10 h-10 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold shrink-0 uppercase">
                  {int.expand?.guest_id?.guest_name?.charAt(0) || '?'}
                </div>
                <div className="flex-1">
                  <div className="flex justify-between items-center">
                    <p className="font-semibold text-slate-800">
                      {int.expand?.guest_id?.guest_name}
                    </p>
                    <time className="text-xs text-slate-400 font-mono">
                      {new Date(int.created).toLocaleString()}
                    </time>
                  </div>
                  <div className="flex items-center gap-2 mt-1 mb-2">
                    <Badge variant="secondary" className="text-xs">
                      {int.type.toUpperCase()}
                    </Badge>
                    <span className="text-xs text-slate-500">
                      Staff: {int.expand?.staff_id?.name || 'Sistema'}
                    </span>
                  </div>
                  <p className="text-sm text-slate-700">{int.details}</p>
                </div>
              </div>
            ))}
            {interactions.length === 0 && (
              <p className="text-center text-slate-500 py-8">
                Nenhuma interação recente registrada no CRM.
              </p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
