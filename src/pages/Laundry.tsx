import { useState, useEffect } from 'react'
import { Shirt, CheckCircle2, Clock } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
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
import { useAccess } from '@/hooks/use-access'
import { RestrictedAccess } from '@/components/RestrictedAccess'
import { getLaundryLogs, updateLaundryLog, LaundryLog } from '@/services/laundry'
import { useRealtime } from '@/hooks/use-realtime'
import { toast } from '@/components/ui/use-toast'

export default function Laundry() {
  const { hasAccess } = useAccess()
  const [logs, setLogs] = useState<LaundryLog[]>([])

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

  if (!hasAccess(['Lavanderia_Limpeza', 'Direcao_Admin', 'Front_Desk'])) {
    return (
      <RestrictedAccess requiredRoles={['Lavanderia_Limpeza', 'Direcao_Admin', 'Front_Desk']} />
    )
  }

  const toggleStatus = async (id: string, currentStatus: string) => {
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
      <div className="flex items-center gap-3 mb-6">
        <div className="p-3 bg-blue-100 rounded-full">
          <Shirt className="w-6 h-6 text-blue-700" />
        </div>
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">Lavanderia Dinâmica</h1>
          <p className="text-sm text-slate-500">Visualização adaptativa por dispositivo</p>
        </div>
      </div>

      {/* MOBILE VIEW: Vertical list with checkboxes */}
      <div className="block md:hidden space-y-3">
        {logs.map((log) => (
          <Card key={log.id} className="border-slate-200 shadow-sm">
            <CardContent className="p-4 flex items-start gap-4">
              <Checkbox
                checked={log.status === 'Concluído'}
                onCheckedChange={() => toggleStatus(log.id, log.status)}
                className="mt-1 h-5 w-5"
              />
              <div className="flex-1">
                <div className="flex justify-between items-start">
                  <p className="font-semibold text-slate-900">{log.item}</p>
                  <Badge variant={log.status === 'Concluído' ? 'default' : 'secondary'}>
                    {log.status}
                  </Badge>
                </div>
                <p className="text-sm text-slate-500 mt-1">
                  Qtd: {log.quantity} | {log.type}
                </p>
                <p className="text-xs text-slate-400 mt-2 font-mono">
                  {new Date(log.created).toLocaleString()}
                </p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* TABLET VIEW: Two-column grid list */}
      <div className="hidden md:grid lg:hidden grid-cols-2 gap-4">
        {logs.map((log) => (
          <Card key={log.id} className="border-slate-200 shadow-sm hover:shadow-md transition-all">
            <CardContent className="p-5">
              <div className="flex justify-between items-center mb-3">
                <Badge variant={log.status === 'Concluído' ? 'default' : 'outline'}>
                  {log.status}
                </Badge>
                {log.status === 'Concluído' ? (
                  <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                ) : (
                  <Clock className="w-5 h-5 text-amber-500" />
                )}
              </div>
              <h3 className="text-lg font-bold text-slate-800">{log.item}</h3>
              <p className="text-slate-600 font-medium">{log.type}</p>
              <div className="flex justify-between items-end mt-4 pt-4 border-t border-slate-100">
                <div>
                  <p className="text-xs text-slate-400">Quantidade</p>
                  <p className="font-mono font-bold text-lg">{log.quantity}</p>
                </div>
                <button
                  onClick={() => toggleStatus(log.id, log.status)}
                  className="text-sm font-medium text-blue-600 hover:text-blue-800"
                >
                  Alternar Status
                </button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* DESKTOP VIEW: Comprehensive Table */}
      <div className="hidden lg:block bg-white rounded-lg border border-slate-200 shadow-sm overflow-hidden">
        <Table>
          <TableHeader className="bg-slate-50">
            <TableRow>
              <TableHead className="w-[80px]">Status</TableHead>
              <TableHead>Item</TableHead>
              <TableHead>Tipo</TableHead>
              <TableHead className="text-center">Quantidade</TableHead>
              <TableHead>Responsável</TableHead>
              <TableHead>Data de Registro</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {logs.map((log) => (
              <TableRow key={log.id} className="hover:bg-slate-50/50">
                <TableCell>
                  <Checkbox
                    checked={log.status === 'Concluído'}
                    onCheckedChange={() => toggleStatus(log.id, log.status)}
                  />
                </TableCell>
                <TableCell className="font-medium">{log.item}</TableCell>
                <TableCell>{log.type}</TableCell>
                <TableCell className="text-center font-mono">{log.quantity}</TableCell>
                <TableCell>{log.staff_member || 'Não atribuído'}</TableCell>
                <TableCell className="text-slate-500 font-mono text-sm">
                  {new Date(log.created).toLocaleString()}
                </TableCell>
              </TableRow>
            ))}
            {logs.length === 0 && (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-8 text-slate-500">
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
