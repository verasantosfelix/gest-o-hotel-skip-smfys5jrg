import { useState, useEffect } from 'react'
import { Shirt, CheckCircle2, Clock, Plus } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Checkbox } from '@/components/ui/checkbox'
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
import { useAccess } from '@/hooks/use-access'
import { RestrictedAccess } from '@/components/RestrictedAccess'
import { getLaundryLogs, updateLaundryLog, LaundryLog } from '@/services/laundry'
import { useRealtime } from '@/hooks/use-realtime'
import { toast } from '@/components/ui/use-toast'
import useAuthStore from '@/stores/useAuthStore'
import { NewLaundryRequestSheet } from '@/components/laundry/NewLaundryRequestSheet'

export default function Laundry() {
  const { hasAccess } = useAccess()
  const { userRole } = useAuthStore()
  const isFrontDesk = userRole === 'Front_Desk'
  const [logs, setLogs] = useState<LaundryLog[]>([])
  const [isNewOpen, setIsNewOpen] = useState(false)

  const loadData = async () => {
    try {
      const data = await getLaundryLogs()
      setLogs(data)
    } catch (e) {
      console.error(e)
    }
  }

  useEffect(() => {
    loadData()
  }, [])

  useRealtime('laundry_logs', loadData)

  if (!hasAccess(['Lavanderia_Limpeza', 'Direcao_Admin', 'Front_Desk'], 'Lavanderia')) {
    return (
      <RestrictedAccess requiredRoles={['Lavanderia_Limpeza', 'Direcao_Admin', 'Front_Desk']} />
    )
  }

  const toggleStatus = async (id: string, currentStatus: string) => {
    if (isFrontDesk) return
    const newStatus = currentStatus === 'Concluído' ? 'Pendente' : 'Concluído'
    try {
      await updateLaundryLog(id, { status: newStatus })
      toast({ title: `Status alterado para ${newStatus}` })
    } catch (e) {
      toast({ title: 'Erro ao atualizar', variant: 'destructive' })
    }
  }

  return (
    <div className="space-y-6 animate-fade-in pb-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-blue-100 rounded-full">
            <Shirt className="w-6 h-6 text-blue-700" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-900">Lavanderia Diária</h1>
            <p className="text-sm text-slate-500">Visualização adaptativa e painel de pedidos</p>
          </div>
        </div>
        <Button onClick={() => setIsNewOpen(true)}>
          <Plus className="w-4 h-4 mr-2" />
          Novo Pedido
        </Button>
      </div>

      <NewLaundryRequestSheet open={isNewOpen} onOpenChange={setIsNewOpen} onSuccess={loadData} />

      {/* MOBILE VIEW */}
      <div className="block md:hidden space-y-3">
        {logs.map((log) => (
          <Card key={log.id} className="border-slate-200 shadow-sm">
            <CardContent className="p-4 flex items-start gap-4">
              <Checkbox
                checked={log.status === 'Concluído'}
                onCheckedChange={() => toggleStatus(log.id, log.status)}
                className="mt-1 h-5 w-5"
                disabled={isFrontDesk}
              />
              <div className="flex-1">
                <div className="flex justify-between items-start">
                  <p className="font-semibold text-slate-900">{log.item}</p>
                  <div className="flex flex-col items-end gap-1">
                    <Badge variant={log.status === 'Concluído' ? 'default' : 'secondary'}>
                      {log.status}
                    </Badge>
                    {log.urgency === 'high' && (
                      <Badge variant="destructive" className="text-[10px]">
                        Expresso
                      </Badge>
                    )}
                  </div>
                </div>
                <p className="text-sm text-slate-500 mt-1">
                  Qtd: {log.quantity} | {log.type}
                </p>
                <p className="text-sm text-slate-600 mt-1">
                  Quarto: <span className="font-mono">{log.location || '-'}</span>
                </p>
                <p className="text-xs text-slate-400 mt-2 font-mono">
                  {new Date(log.created).toLocaleString()}
                </p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* TABLET VIEW */}
      <div className="hidden md:grid lg:hidden grid-cols-2 gap-4">
        {logs.map((log) => (
          <Card key={log.id} className="border-slate-200 shadow-sm hover:shadow-md transition-all">
            <CardContent className="p-5">
              <div className="flex justify-between items-center mb-3">
                <div className="flex items-center gap-2">
                  <Badge variant={log.status === 'Concluído' ? 'default' : 'outline'}>
                    {log.status}
                  </Badge>
                  {log.urgency === 'high' && <Badge variant="destructive">Expresso</Badge>}
                </div>
                {log.status === 'Concluído' ? (
                  <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                ) : (
                  <Clock className="w-5 h-5 text-amber-500" />
                )}
              </div>
              <h3 className="text-lg font-bold text-slate-800">{log.item}</h3>
              <p className="text-slate-600 font-medium text-sm">
                {log.type} {log.location && `• Quarto: ${log.location}`}
              </p>
              <div className="flex justify-between items-end mt-4 pt-4 border-t border-slate-100">
                <div>
                  <p className="text-xs text-slate-400">Quantidade</p>
                  <p className="font-mono font-bold text-lg">{log.quantity}</p>
                </div>
                {!isFrontDesk && (
                  <button
                    onClick={() => toggleStatus(log.id, log.status)}
                    className="text-sm font-medium text-blue-600 hover:text-blue-800"
                  >
                    Alternar Status
                  </button>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* DESKTOP VIEW */}
      <div className="hidden lg:block bg-white rounded-lg border border-slate-200 shadow-sm overflow-hidden">
        <Table>
          <TableHeader className="bg-slate-50">
            <TableRow>
              <TableHead className="w-[80px]">Status</TableHead>
              <TableHead>Quarto</TableHead>
              <TableHead>Hóspede</TableHead>
              <TableHead>Item</TableHead>
              <TableHead>Tipo</TableHead>
              <TableHead className="text-center">Qtd</TableHead>
              <TableHead>Urgência</TableHead>
              <TableHead>Data</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {logs.map((log) => (
              <TableRow key={log.id} className="hover:bg-slate-50/50">
                <TableCell>
                  <Checkbox
                    checked={log.status === 'Concluído'}
                    onCheckedChange={() => toggleStatus(log.id, log.status)}
                    disabled={isFrontDesk}
                  />
                </TableCell>
                <TableCell className="font-mono">{log.location || '-'}</TableCell>
                <TableCell>{log.staff_member || '-'}</TableCell>
                <TableCell className="font-medium">{log.item}</TableCell>
                <TableCell>{log.type}</TableCell>
                <TableCell className="text-center font-mono">{log.quantity}</TableCell>
                <TableCell>
                  {log.urgency === 'high' ? (
                    <Badge variant="destructive">Expresso</Badge>
                  ) : (
                    <Badge variant="secondary">Normal</Badge>
                  )}
                </TableCell>
                <TableCell className="text-slate-500 font-mono text-sm">
                  {new Date(log.created).toLocaleDateString()}
                </TableCell>
              </TableRow>
            ))}
            {logs.length === 0 && (
              <TableRow>
                <TableCell colSpan={8} className="text-center py-8 text-slate-500">
                  Nenhum log encontrado.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
