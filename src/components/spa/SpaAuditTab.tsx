import { useState, useEffect } from 'react'
import { getSpaAuditLogs } from '@/services/spa'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { format } from 'date-fns'

export function SpaAuditTab() {
  const [logs, setLogs] = useState<any[]>([])

  useEffect(() => {
    getSpaAuditLogs().then(setLogs).catch(console.error)
  }, [])

  return (
    <div className="border rounded-md bg-white p-4 shadow-sm animate-fade-in">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Data/Hora</TableHead>
            <TableHead>Hóspede</TableHead>
            <TableHead>Serviço</TableHead>
            <TableHead>Ação</TableHead>
            <TableHead>Usuário</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {logs.map((log) => {
            const details = log.details || {}
            return (
              <TableRow key={log.id}>
                <TableCell>{format(new Date(log.created), 'dd/MM/yyyy HH:mm')}</TableCell>
                <TableCell className="font-medium">{details.guest_name || '-'}</TableCell>
                <TableCell>{details.service_name || '-'}</TableCell>
                <TableCell>
                  <Badge
                    variant={
                      log.action_type === 'approval'
                        ? 'default'
                        : log.action_type === 'rejection'
                          ? 'destructive'
                          : 'secondary'
                    }
                  >
                    {log.action_type === 'approval'
                      ? 'Aprovado'
                      : log.action_type === 'rejection'
                        ? 'Rejeitado'
                        : 'Criado/Editado'}
                  </Badge>
                </TableCell>
                <TableCell>{log.expand?.user_id?.name || 'Sistema'}</TableCell>
              </TableRow>
            )
          })}
          {logs.length === 0 && (
            <TableRow>
              <TableCell colSpan={5} className="text-center text-slate-500 py-6">
                Nenhum registro de auditoria encontrado.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  )
}
