import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Check, X, ShieldCheck, Clock } from 'lucide-react'
import { useRealtime } from '@/hooks/use-realtime'
import { useAccess } from '@/hooks/use-access'
import pb from '@/lib/pocketbase/client'
import { updateMaintenanceTicket } from '@/services/maintenance'
import { updateAmenityRequest } from '@/services/amenities'
import { updateLaundryLog } from '@/services/laundry'
import { toast } from '@/components/ui/use-toast'
import useApprovalStore from '@/stores/useApprovalStore'

export default function Alcadas() {
  const { effectiveRoleLevel, isManager } = useAccess()
  const { approvals, resolveRequest } = useApprovalStore()
  const [opTickets, setOpTickets] = useState<any[]>([])
  const [loading, setLoading] = useState(false)

  const loadOperationalTickets = async () => {
    if (!pb.authStore.isValid) return
    setLoading(true)
    try {
      const [maint, amen, laund] = await Promise.all([
        pb.collection('maintenance_tickets').getFullList({
          filter: 'status="pending_approval"',
          expand: 'created_by,created_by.profile,room_id',
        }),
        pb.collection('amenity_requests').getFullList({
          filter: 'status="pending_approval"',
          expand: 'created_by,created_by.profile,room_id',
        }),
        pb.collection('laundry_logs').getFullList({
          filter: 'status="pending_approval"',
          expand: 'created_by,created_by.profile',
        }),
      ])

      const mappedM = maint.map((t) => ({
        ...t,
        _type: 'maintenance',
        _label: 'Manutenção',
        _desc: t.description,
        _req: t.expand?.created_by?.name || 'Desconhecido',
        _date: t.created,
      }))
      const mappedA = amen.map((t) => ({
        ...t,
        _type: 'amenities',
        _label: 'Governança',
        _desc: `${t.quantity}x ${t.item.replace('_', ' ')}`,
        _req: t.expand?.created_by?.name || 'Desconhecido',
        _date: t.created,
      }))
      const mappedL = laund.map((t) => ({
        ...t,
        _type: 'laundry',
        _label: 'Lavanderia',
        _desc: `${t.quantity}x ${t.item} (${t.type})`,
        _req: t.expand?.created_by?.name || 'Desconhecido',
        _date: t.created,
      }))

      let all = [...mappedM, ...mappedA, ...mappedL]

      // Filter by manager if not top level executive
      if (
        !['Gerente_Geral', 'Director_Geral', 'Administrativo_Geral'].includes(effectiveRoleLevel)
      ) {
        all = all.filter(
          (t) => t.expand?.created_by?.expand?.profile?.manager_id === pb.authStore.record?.id,
        )
      }

      all.sort((a, b) => new Date(b._date).getTime() - new Date(a._date).getTime())
      setOpTickets(all)
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadOperationalTickets()
  }, [effectiveRoleLevel])

  useRealtime('maintenance_tickets', loadOperationalTickets)
  useRealtime('amenity_requests', loadOperationalTickets)
  useRealtime('laundry_logs', loadOperationalTickets)

  const handleOpAction = async (ticket: any, action: 'approve' | 'reject') => {
    const newStatus =
      action === 'approve' ? (ticket._type === 'maintenance' ? 'open' : 'pending') : 'rejected'

    try {
      if (ticket._type === 'maintenance')
        await updateMaintenanceTicket(ticket.id, { status: newStatus as any })
      if (ticket._type === 'amenities')
        await updateAmenityRequest(ticket.id, { status: newStatus as any })
      if (ticket._type === 'laundry') await updateLaundryLog(ticket.id, { status: newStatus })

      if (ticket.created_by) {
        await pb.collection('notifications').create({
          recipient_id: ticket.created_by,
          sender_id: pb.authStore.record?.id,
          title: `Solicitação ${action === 'approve' ? 'Aprovada' : 'Rejeitada'}`,
          message: `Sua solicitação operacional para ${ticket._label} foi ${action === 'approve' ? 'aprovada e encaminhada' : 'rejeitada pelo seu gestor'}.`,
          type: 'info',
          status: 'unread',
        })
      }

      toast({
        title: `Solicitação ${action === 'approve' ? 'aprovada' : 'rejeitada'}.`,
      })
      loadOperationalTickets()
    } catch (e) {
      toast({ title: 'Erro ao processar.', variant: 'destructive' })
    }
  }

  if (!isManager()) {
    return (
      <div className="p-8 text-center">
        <ShieldCheck className="w-12 h-12 text-slate-300 mx-auto mb-4" />
        <h2 className="text-lg font-bold text-slate-600">Acesso Restrito</h2>
        <p className="text-slate-500">Você não possui perfil de gestor para acessar as alçadas.</p>
      </div>
    )
  }

  return (
    <div className="space-y-6 animate-fade-in-up pb-8">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">Alçadas (Aprovações)</h1>
        <p className="text-slate-500">
          Gestão e aprovação de requisições operacionais e financeiras.
        </p>
      </div>

      <Tabs defaultValue="operacional" className="w-full">
        <TabsList className="bg-slate-100 p-1 mb-6">
          <TabsTrigger value="operacional" className="px-6 relative">
            Operacional (Cross-Dept)
            {opTickets.length > 0 && (
              <span className="absolute top-1 right-1 w-2 h-2 bg-rose-500 rounded-full" />
            )}
          </TabsTrigger>
          <TabsTrigger value="financeiro" className="px-6 relative">
            Descontos F&B (Mock)
            {approvals.filter((a) => a.status === 'pending').length > 0 && (
              <span className="absolute top-1 right-1 w-2 h-2 bg-rose-500 rounded-full" />
            )}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="operacional" className="outline-none mt-0">
          <Card className="border-slate-200 shadow-sm">
            <CardHeader className="bg-slate-50/50 border-b">
              <CardTitle className="text-lg">Validação de Tickets de Serviço</CardTitle>
              <CardDescription>
                Aprove solicitações de manutenção, governança e lavanderia abertas pela sua equipe.
              </CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              <Table>
                <TableHeader className="bg-slate-50">
                  <TableRow>
                    <TableHead>Data</TableHead>
                    <TableHead>Solicitante</TableHead>
                    <TableHead>Departamento</TableHead>
                    <TableHead>Detalhes</TableHead>
                    <TableHead className="text-right">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {opTickets.map((t) => (
                    <TableRow key={t.id}>
                      <TableCell className="text-xs text-slate-500">
                        {new Date(t._date).toLocaleString('pt-AO')}
                      </TableCell>
                      <TableCell className="font-medium">{t._req}</TableCell>
                      <TableCell>
                        <Badge variant="outline" className="bg-slate-50">
                          {t._label}
                        </Badge>
                      </TableCell>
                      <TableCell className="max-w-[250px] truncate" title={t._desc}>
                        {t._desc}
                      </TableCell>
                      <TableCell className="text-right space-x-2">
                        <Button
                          size="sm"
                          variant="outline"
                          className="h-8 border-rose-200 text-rose-600 hover:bg-rose-50"
                          onClick={() => handleOpAction(t, 'reject')}
                        >
                          <X className="w-4 h-4" />
                        </Button>
                        <Button
                          size="sm"
                          className="h-8 bg-emerald-600 hover:bg-emerald-700"
                          onClick={() => handleOpAction(t, 'approve')}
                        >
                          <Check className="w-4 h-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                  {opTickets.length === 0 && !loading && (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center py-10 text-slate-500">
                        <Clock className="w-8 h-8 text-slate-300 mx-auto mb-3" />
                        Nenhuma aprovação operacional pendente.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="financeiro" className="outline-none mt-0">
          <Card className="border-slate-200 shadow-sm">
            <CardHeader className="bg-slate-50/50 border-b">
              <CardTitle className="text-lg">Aprovações Financeiras / F&B</CardTitle>
              <CardDescription>Análise de isenções e cortesias.</CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              <Table>
                <TableHeader className="bg-slate-50">
                  <TableRow>
                    <TableHead>Data</TableHead>
                    <TableHead>Solicitante</TableHead>
                    <TableHead>Descrição</TableHead>
                    <TableHead>Valor Desc.</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {approvals.map((a) => (
                    <TableRow key={a.id}>
                      <TableCell className="text-xs text-slate-500">
                        {new Date(a.timestamp).toLocaleString('pt-AO')}
                      </TableCell>
                      <TableCell>
                        <div className="font-medium">{a.requesterName}</div>
                        <div className="text-[10px] text-slate-400">{a.requesterRole}</div>
                      </TableCell>
                      <TableCell>{a.description}</TableCell>
                      <TableCell className="font-mono text-rose-600">
                        -R$ {a.discountAmount.toFixed(2)}
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant="outline"
                          className={
                            a.status === 'pending'
                              ? 'bg-amber-50 text-amber-700 border-amber-200'
                              : a.status === 'approved'
                                ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                                : 'bg-rose-50 text-rose-700 border-rose-200'
                          }
                        >
                          {a.status === 'pending'
                            ? 'Pendente'
                            : a.status === 'approved'
                              ? 'Aprovado'
                              : 'Rejeitado'}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        {a.status === 'pending' ? (
                          <div className="space-x-2">
                            <Button
                              size="sm"
                              variant="outline"
                              className="h-8 border-rose-200 text-rose-600 hover:bg-rose-50"
                              onClick={() => {
                                resolveRequest(
                                  a.id,
                                  'denied',
                                  pb.authStore.record?.name || 'Gestor',
                                )
                                toast({ title: 'Rejeitado.' })
                              }}
                            >
                              <X className="w-4 h-4" />
                            </Button>
                            <Button
                              size="sm"
                              className="h-8 bg-emerald-600 hover:bg-emerald-700"
                              onClick={() => {
                                resolveRequest(
                                  a.id,
                                  'approved',
                                  pb.authStore.record?.name || 'Gestor',
                                )
                                toast({ title: 'Aprovado com sucesso.' })
                              }}
                            >
                              <Check className="w-4 h-4" />
                            </Button>
                          </div>
                        ) : (
                          <span className="text-xs text-slate-400">Resolvido</span>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                  {approvals.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-10 text-slate-500">
                        Nenhuma alçada financeira registrada.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
