import { useState, useEffect } from 'react'
import { LineChart, Activity, TrendingUp, Plus } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { useAccess } from '@/hooks/use-access'
import { RestrictedAccess } from '@/components/RestrictedAccess'
import { getGuestInteractions, GuestInteraction, createGuestInteraction } from '@/services/crm'
import { getLoyalty, GuestLoyalty } from '@/services/guest_loyalty'
import { useRealtime } from '@/hooks/use-realtime'
import pb from '@/lib/pocketbase/client'
import { toast } from '@/components/ui/use-toast'

import { SpaAgenda } from '@/components/spa/SpaAgenda'
import { FnBReservations } from '@/components/fnb/FnBReservations'
import { FnBRoomService } from '@/components/fnb/FnBRoomService'

export default function SalesCRM() {
  const { hasAccess, effectiveRoleLevel } = useAccess()
  const [interactions, setInteractions] = useState<GuestInteraction[]>([])
  const [guests, setGuests] = useState<GuestLoyalty[]>([])

  // Quick Log State
  const [selGuest, setSelGuest] = useState('')
  const [logType, setLogType] = useState('note')
  const [logDetails, setLogDetails] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const hasOpAccess = [
    'Responsavel_Equipa',
    'Gerente_Area',
    'Administrativo',
    'Administrativo_Geral',
    'Director_Geral',
    'Gerente_Geral',
  ].includes(effectiveRoleLevel)

  const loadData = async () => {
    try {
      const data = await getGuestInteractions()
      setInteractions(data)
    } catch (e) {
      console.error(e)
    }
  }

  const loadGuests = async () => {
    try {
      const gs = await getLoyalty()
      setGuests(gs)
    } catch (e) {
      console.error(e)
    }
  }

  useEffect(() => {
    loadData()
    loadGuests()
  }, [])

  useRealtime('guest_interactions', loadData)

  const handleQuickLog = async () => {
    if (!selGuest || !logDetails)
      return toast({ title: 'Preencha os campos obrigatórios', variant: 'destructive' })
    setIsSubmitting(true)
    try {
      await createGuestInteraction({
        guest_id: selGuest,
        type: logType as any,
        details: logDetails,
        staff_id: pb.authStore.record?.id,
      })
      toast({ title: 'Interação registrada com sucesso!' })
      setSelGuest('')
      setLogDetails('')
    } catch (e) {
      toast({ title: 'Erro ao registrar interação', variant: 'destructive' })
    } finally {
      setIsSubmitting(false)
    }
  }

  if (
    !hasAccess(['Rececao_FrontOffice', 'Direcao_Admin', 'Front_Desk'], 'Vendas & Distribuição') &&
    !hasOpAccess
  ) {
    return (
      <RestrictedAccess requiredRoles={['Rececao_FrontOffice', 'Direcao_Admin', 'Front_Desk']} />
    )
  }

  return (
    <div className="space-y-6 animate-fade-in pb-8">
      <Tabs defaultValue="crm" className="w-full">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-6">
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <LineChart className="text-indigo-600" /> Central Operacional & CRM
          </h1>
          <TabsList className="bg-slate-100/80 p-1 border shadow-sm flex-wrap h-auto">
            <TabsTrigger value="crm">CRM & Distribuição</TabsTrigger>
            {hasOpAccess && (
              <>
                <TabsTrigger value="spa">Agenda SPA</TabsTrigger>
                <TabsTrigger value="fnb">Reservas F&B</TabsTrigger>
                <TabsTrigger value="roomservice">Room Service</TabsTrigger>
              </>
            )}
          </TabsList>
        </div>

        <TabsContent value="crm" className="m-0 space-y-6 outline-none">
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

          <div className="grid lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              <Card className="h-full">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Activity className="w-5 h-5 text-slate-500" /> Timeline Global de Interações
                    (Guest Relations)
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
                              {int.expand?.guest_id?.guest_name || 'Hóspede Removido'}
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

            <div>
              <Card className="sticky top-6">
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Plus className="w-5 h-5 text-indigo-600" /> Registro Rápido
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label>Hóspede</Label>
                    <Select value={selGuest} onValueChange={setSelGuest}>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione o hóspede" />
                      </SelectTrigger>
                      <SelectContent>
                        {guests.map((g) => (
                          <SelectItem key={g.id} value={g.id}>
                            {g.guest_name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Tipo de Interação</Label>
                    <Select value={logType} onValueChange={setLogType}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="note">Nota / Observação</SelectItem>
                        <SelectItem value="preference">Preferência</SelectItem>
                        <SelectItem value="incident">Incidente</SelectItem>
                        <SelectItem value="interaction">Interação Direta</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Detalhes</Label>
                    <Textarea
                      placeholder="Descreva a interação..."
                      value={logDetails}
                      onChange={(e) => setLogDetails(e.target.value)}
                      className="h-32"
                    />
                  </div>
                  <Button
                    onClick={handleQuickLog}
                    disabled={isSubmitting}
                    className="w-full bg-indigo-600 hover:bg-indigo-700"
                  >
                    {isSubmitting ? 'Salvando...' : 'Salvar Interação'}
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>

        {hasOpAccess && (
          <>
            <TabsContent value="spa" className="m-0 mt-4 outline-none">
              <SpaAgenda />
            </TabsContent>
            <TabsContent value="fnb" className="m-0 mt-4 outline-none">
              <FnBReservations />
            </TabsContent>
            <TabsContent value="roomservice" className="m-0 mt-4 outline-none">
              <FnBRoomService />
            </TabsContent>
          </>
        )}
      </Tabs>
    </div>
  )
}
