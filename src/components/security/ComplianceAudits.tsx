import { useState, useEffect } from 'react'
import { getAudits, SecurityAudit } from '@/services/security'
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
import { FileCheck } from 'lucide-react'
import { format } from 'date-fns'

export function ComplianceAudits() {
  const [audits, setAudits] = useState<SecurityAudit[]>([])

  const loadData = async () => {
    try {
      setAudits(await getAudits())
    } catch (e) {
      console.error(e)
    }
  }

  useEffect(() => {
    loadData()
  }, [])

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center bg-white p-4 rounded-lg shadow-sm border">
        <div>
          <h2 className="text-lg font-bold text-slate-800">Auditorias & Compliance</h2>
          <p className="text-sm text-slate-500">
            Histórico de verificações e relatórios de conformidade.
          </p>
        </div>
        <Button className="gap-2">
          <FileCheck className="w-4 h-4" /> Nova Auditoria
        </Button>
      </div>

      <div className="bg-white rounded-lg border shadow-sm overflow-hidden">
        <Table>
          <TableHeader className="bg-slate-50">
            <TableRow>
              <TableHead>Data</TableHead>
              <TableHead>Título</TableHead>
              <TableHead>Tipo</TableHead>
              <TableHead>Resultado</TableHead>
              <TableHead className="text-right">Ação</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {audits.map((a) => (
              <TableRow key={a.id}>
                <TableCell className="font-mono text-xs">
                  {format(new Date(a.created), 'dd/MM/yyyy')}
                </TableCell>
                <TableCell className="font-medium text-slate-800">{a.title}</TableCell>
                <TableCell>
                  <Badge variant="outline" className="uppercase text-[10px]">
                    {a.type}
                  </Badge>
                </TableCell>
                <TableCell>
                  {a.anomalies_detected ? (
                    <span className="text-rose-600 font-medium text-sm">Anomalias Encontradas</span>
                  ) : (
                    <span className="text-emerald-600 font-medium text-sm">Conforme</span>
                  )}
                </TableCell>
                <TableCell className="text-right">
                  <Button variant="ghost" size="sm">
                    Ver Relatório
                  </Button>
                </TableCell>
              </TableRow>
            ))}
            {audits.length === 0 && (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-6 text-slate-500">
                  Nenhuma auditoria registrada.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
