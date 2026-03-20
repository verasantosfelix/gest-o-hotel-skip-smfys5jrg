import { useState, useEffect } from 'react'
import { getAccessLogs, SecurityAccessLog } from '@/services/security'
import { useRealtime } from '@/hooks/use-realtime'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Search } from 'lucide-react'
import { format } from 'date-fns'

export function AccessControl() {
  const [logs, setLogs] = useState<SecurityAccessLog[]>([])
  const [search, setSearch] = useState('')

  const loadData = async () => {
    try {
      setLogs(await getAccessLogs())
    } catch (e) {
      console.error(e)
    }
  }

  useEffect(() => {
    loadData()
  }, [])
  useRealtime('security_access_logs', loadData)

  const filtered = logs.filter(
    (l) =>
      l.staff_name?.toLowerCase().includes(search.toLowerCase()) ||
      l.location.toLowerCase().includes(search.toLowerCase()),
  )

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row justify-between gap-4 bg-white p-4 rounded-lg shadow-sm border">
        <h2 className="text-lg font-bold text-slate-800">Controle de Acesso Físico</h2>
        <div className="relative w-full sm:w-72">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar nome ou local..."
            className="pl-9 h-9"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      <div className="bg-white rounded-lg border shadow-sm overflow-hidden">
        <Table>
          <TableHeader className="bg-slate-50">
            <TableRow>
              <TableHead>Data/Hora</TableHead>
              <TableHead>Usuário / Identificação</TableHead>
              <TableHead>Local</TableHead>
              <TableHead>Método</TableHead>
              <TableHead>Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.map((log) => (
              <TableRow key={log.id}>
                <TableCell className="font-mono text-xs">
                  {format(new Date(log.timestamp), 'dd/MM/yy HH:mm:ss')}
                </TableCell>
                <TableCell className="font-medium text-slate-800">
                  {log.staff_name || 'Desconhecido'}
                </TableCell>
                <TableCell className="text-slate-600">{log.location}</TableCell>
                <TableCell>
                  <Badge variant="outline" className="uppercase text-[10px]">
                    {log.device_source}
                  </Badge>
                </TableCell>
                <TableCell>
                  <Badge variant={log.access_type === 'authorized' ? 'default' : 'destructive'}>
                    {log.access_type === 'authorized' ? 'Autorizado' : 'Negado'}
                  </Badge>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
