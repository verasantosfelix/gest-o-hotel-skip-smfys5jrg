import { useState, useEffect } from 'react'
import { CheckCircle2, XCircle, Clock, ShieldCheck } from 'lucide-react'
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
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { useAccess } from '@/hooks/use-access'
import { RestrictedAccess } from '@/components/RestrictedAccess'
import { getPendingApprovals, updateApprovalStatus, PendingItem } from '@/services/alcadas'
import { useRealtime } from '@/hooks/use-realtime'
import { toast } from '@/components/ui/use-toast'
import { format } from 'date-fns'

export default function Alcadas() {
  const { hasAccess, isManager } = useAccess()
  const [items, setItems] = useState<PendingItem[]>([])

  const loadData = async () => {
    try {
      const data = await getPendingApprovals()
      setItems(data)
    } catch (e) {
      console.error(e)
    }
  }

  useEffect(() => {
    if (isManager() || hasAccess(['Direcao_Admin'])) {
      loadData()
    }
  }, [isManager, hasAccess])

  useRealtime('financial_docs', loadData)
  useRealtime('security_incidents', loadData)
  useRealtime('hr_candidates', loadData)
  useRealtime('maintenance_tickets', loadData)

  if (!isManager() && !hasAccess(['Direcao_Admin'])) {
    return <RestrictedAccess requiredRoles={['Direcao_Admin']} />
  }

  const handleApprove = async (item: PendingItem) => {
    let newStatus = 'approved'
    if (item.collectionName === 'security_incidents') newStatus = 'resolved'
    if (item.collectionName === 'maintenance_tickets') newStatus = 'resolved'

    try {
      await updateApprovalStatus(item.collectionName, item.id, newStatus)
      toast({ title: 'Aprovado com sucesso!' })
      loadData()
    } catch (e) {
      toast({ title: 'Erro ao aprovar', variant: 'destructive' })
    }
  }

  const handleReject = async (item: PendingItem) => {
    let newStatus = 'rejected'
    if (item.collectionName === 'security_incidents') newStatus = 'closed'
    if (item.collectionName === 'maintenance_tickets') {
      toast({ title: 'Tickets de manutenção não podem ser rejeitados.', variant: 'destructive' })
      return
    }

    try {
      await updateApprovalStatus(item.collectionName, item.id, newStatus)
      toast({ title: 'Solicitação rejeitada.' })
      loadData()
    } catch (e) {
      toast({ title: 'Erro ao rejeitar', variant: 'destructive' })
    }
  }

  const stats = items.reduce(
    (acc, curr) => {
      acc[curr.module] = (acc[curr.module] || 0) + 1
      return acc
    },
    {} as Record<string, number>,
  )

  return (
    <div className="space-y-6 animate-fade-in pb-8">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-3 bg-indigo-100 rounded-lg shadow-sm border border-indigo-200">
          <ShieldCheck className="w-6 h-6 text-indigo-700" />
        </div>
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">Alçadas e Aprovações</h1>
          <p className="text-sm text-slate-500">
            Gestão centralizada de solicitações pendentes interdepartamentais
          </p>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {Object.entries(stats).map(([module, count]) => (
          <Card key={module} className="border-slate-200 shadow-sm">
            <CardContent className="p-4 flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-500">{module}</p>
                <p className="text-2xl font-bold text-slate-900">{count}</p>
              </div>
              <Clock className="w-8 h-8 text-amber-500/50" />
            </CardContent>
          </Card>
        ))}
        {items.length === 0 && (
          <div className="col-span-full p-8 text-center text-slate-500 bg-slate-50 rounded-lg border border-dashed">
            Nenhuma aprovação pendente no momento. Bom trabalho!
          </div>
        )}
      </div>

      {items.length > 0 && (
        <Card className="border-slate-200 shadow-sm">
          <CardHeader className="bg-slate-50 border-b">
            <CardTitle className="text-lg">Fila de Solicitações ({items.length})</CardTitle>
          </CardHeader>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Data</TableHead>
                  <TableHead>Módulo</TableHead>
                  <TableHead>Solicitante</TableHead>
                  <TableHead>Descrição</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {items.map((item) => (
                  <TableRow key={`${item.collectionName}-${item.id}`} className="hover:bg-slate-50">
                    <TableCell className="text-sm text-slate-500 whitespace-nowrap">
                      {format(new Date(item.date), 'dd/MM/yyyy HH:mm')}
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className="bg-white">
                        {item.module}
                      </Badge>
                    </TableCell>
                    <TableCell className="font-medium text-slate-900">
                      {item.requesterName}
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">{item.description}</div>
                      {item.amount !== undefined && item.amount > 0 && (
                        <div className="text-xs font-mono font-bold mt-1 text-slate-700">
                          Valor: R$ {item.amount.toFixed(2)}
                        </div>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-2">
                        {item.collectionName !== 'maintenance_tickets' && (
                          <Button
                            size="sm"
                            variant="outline"
                            className="text-rose-600 hover:text-rose-700 border-rose-200 hover:bg-rose-50 px-2"
                            onClick={() => handleReject(item)}
                          >
                            <XCircle className="w-4 h-4 mr-1.5" /> Rejeitar
                          </Button>
                        )}
                        <Button
                          size="sm"
                          className="bg-emerald-600 hover:bg-emerald-700 text-white px-2"
                          onClick={() => handleApprove(item)}
                        >
                          <CheckCircle2 className="w-4 h-4 mr-1.5" /> Aprovar
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </Card>
      )}
    </div>
  )
}
