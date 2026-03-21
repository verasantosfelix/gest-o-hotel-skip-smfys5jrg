import { useState, useEffect } from 'react'
import { Package, Plus, Clock, CheckCircle2 } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { useAccess } from '@/hooks/use-access'
import { RestrictedAccess } from '@/components/RestrictedAccess'
import useAuthStore from '@/stores/useAuthStore'
import { getAmenityRequests, updateAmenityRequest, AmenityRequest } from '@/services/amenities'
import { useRealtime } from '@/hooks/use-realtime'
import { NewAmenityRequestDialog } from '@/components/housekeeping/NewAmenityRequestDialog'
import { format } from 'date-fns'

export default function MinibarAmenities() {
  const { hasAccess } = useAccess()
  const { userRole } = useAuthStore()
  const isFrontDesk = userRole === 'Front_Desk'

  const [requests, setRequests] = useState<AmenityRequest[]>([])
  const [isNewOpen, setIsNewOpen] = useState(false)

  const loadData = async () => {
    try {
      setRequests(await getAmenityRequests())
    } catch (e) {
      console.error(e)
    }
  }

  useEffect(() => {
    loadData()
  }, [])
  useRealtime('amenity_requests', loadData)

  if (
    !hasAccess(
      ['Lavanderia_Limpeza', 'Rececao_FrontOffice', 'Direcao_Admin', 'Front_Desk'],
      'Amenities',
    )
  ) {
    return (
      <RestrictedAccess
        requiredRoles={['Lavanderia_Limpeza', 'Rececao_FrontOffice', 'Direcao_Admin', 'Front_Desk']}
      />
    )
  }

  const toggleStatus = async (req: AmenityRequest) => {
    if (isFrontDesk) return
    const nextStatus =
      req.status === 'pending'
        ? 'in_transit'
        : req.status === 'in_transit'
          ? 'delivered'
          : 'pending'
    try {
      await updateAmenityRequest(req.id, { status: nextStatus })
    } catch (e) {
      console.error(e)
    }
  }

  return (
    <div className="space-y-6 animate-fade-in pb-8">
      <div className="flex justify-between items-center gap-4">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-purple-100 rounded-lg shadow-sm border border-purple-200">
            <Package className="w-6 h-6 text-purple-700" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-900">
              Amenities & Reposições
            </h1>
            <p className="text-sm text-slate-500">Gestão de pedidos de amenities e itens extras</p>
          </div>
        </div>
        <Button onClick={() => setIsNewOpen(true)} className="gap-2">
          <Plus className="w-4 h-4" /> Novo Pedido
        </Button>
      </div>

      <Card className="border-slate-200 shadow-sm overflow-hidden">
        <Table>
          <TableHeader className="bg-slate-50">
            <TableRow>
              <TableHead>Data / Hora</TableHead>
              <TableHead>Quarto</TableHead>
              <TableHead>Hóspede</TableHead>
              <TableHead>Item Solicitado</TableHead>
              <TableHead className="text-center">Qtd</TableHead>
              <TableHead>Prioridade</TableHead>
              <TableHead>Status</TableHead>
              {!isFrontDesk && <TableHead className="text-right">Ação</TableHead>}
            </TableRow>
          </TableHeader>
          <TableBody>
            {requests.map((req) => (
              <TableRow key={req.id} className="hover:bg-slate-50/50">
                <TableCell className="text-sm font-mono text-slate-500">
                  {format(new Date(req.created), 'dd/MM HH:mm')}
                </TableCell>
                <TableCell className="font-bold">
                  {req.expand?.room_id?.room_number || '-'}
                </TableCell>
                <TableCell>{req.guest_name}</TableCell>
                <TableCell>
                  <div className="font-medium text-slate-900 capitalize">
                    {req.item.replace('_', ' ')}
                  </div>
                  {req.description && (
                    <div className="text-xs text-slate-500">{req.description}</div>
                  )}
                </TableCell>
                <TableCell className="text-center font-mono font-bold">{req.quantity}</TableCell>
                <TableCell>
                  <Badge
                    variant={req.priority === 'urgente' ? 'destructive' : 'secondary'}
                    className="uppercase text-[10px]"
                  >
                    {req.priority}
                  </Badge>
                </TableCell>
                <TableCell>
                  <Badge
                    variant="outline"
                    className={
                      req.status === 'delivered'
                        ? 'bg-emerald-100 text-emerald-800'
                        : req.status === 'in_transit'
                          ? 'bg-blue-100 text-blue-800'
                          : 'bg-amber-100 text-amber-800'
                    }
                  >
                    {req.status.replace('_', ' ').toUpperCase()}
                  </Badge>
                </TableCell>
                {!isFrontDesk && (
                  <TableCell className="text-right">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => toggleStatus(req)}
                      disabled={req.status === 'delivered'}
                    >
                      Avançar Status
                    </Button>
                  </TableCell>
                )}
              </TableRow>
            ))}
            {requests.length === 0 && (
              <TableRow>
                <TableCell
                  colSpan={isFrontDesk ? 7 : 8}
                  className="text-center py-8 text-slate-500"
                >
                  Nenhum pedido de amenity encontrado.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </Card>

      <NewAmenityRequestDialog open={isNewOpen} onOpenChange={setIsNewOpen} onSuccess={loadData} />
    </div>
  )
}
