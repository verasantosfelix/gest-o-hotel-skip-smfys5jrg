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
import { FinancialContract } from '@/services/financial'
import { formatCurrency } from '@/lib/utils'
import { FileSignature, Plus, RefreshCw, FileText } from 'lucide-react'

export function ContractsManager({ contracts }: { contracts: FinancialContract[] }) {
  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center bg-white p-3 border rounded-md shadow-sm">
        <h2 className="font-bold text-slate-800 flex items-center gap-2">
          <FileSignature className="w-5 h-5 text-primary" /> Gestão de Contratos
        </h2>
        <Button size="sm" className="gap-2">
          <Plus className="w-4 h-4" /> Novo Contrato
        </Button>
      </div>
      <div className="border rounded-md bg-white overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nome do Contrato</TableHead>
              <TableHead>Entidade</TableHead>
              <TableHead>Tipo</TableHead>
              <TableHead>Vigência</TableHead>
              <TableHead>Valor Mensal</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {contracts.map((c) => (
              <TableRow key={c.id} className="hover:bg-slate-50/50">
                <TableCell className="font-medium">{c.name}</TableCell>
                <TableCell>{c.entity_name}</TableCell>
                <TableCell className="capitalize text-slate-500">{c.type}</TableCell>
                <TableCell className="text-sm text-slate-600">
                  {c.start_date} a {c.end_date}
                </TableCell>
                <TableCell className="font-mono font-medium">
                  {c.value ? formatCurrency(c.value, c.currency || 'AOA') : '-'}
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <Badge
                      variant={c.status === 'active' ? 'default' : 'secondary'}
                      className={c.status === 'active' ? 'bg-emerald-500 hover:bg-emerald-600' : ''}
                    >
                      {c.status}
                    </Badge>
                    {c.status === 'active' && c.end_date === '2024-12-31' && (
                      <Badge
                        variant="destructive"
                        className="text-[10px] uppercase font-bold animate-pulse"
                      >
                        Expira em breve
                      </Badge>
                    )}
                  </div>
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-1">
                    <Button
                      size="icon"
                      variant="ghost"
                      className="h-8 w-8 text-blue-600"
                      title="Renovar ou Encerrar"
                    >
                      <RefreshCw className="w-4 h-4" />
                    </Button>
                    <Button
                      size="icon"
                      variant="ghost"
                      className="h-8 w-8 text-slate-600"
                      title="Anexar Documento"
                    >
                      <FileText className="w-4 h-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
            {contracts.length === 0 && (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-8 text-slate-500">
                  Nenhum contrato cadastrado.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
