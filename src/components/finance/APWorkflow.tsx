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
import { FinancialDoc } from '@/services/financial'
import { formatCurrency } from '@/lib/utils'
import { UploadCloud, CreditCard, CheckCircle } from 'lucide-react'

export function APWorkflow({ docs }: { docs: FinancialDoc[] }) {
  const apDocs = docs.filter((d) => d.category === 'A/P' || d.doc_type === 'Despesa')

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center bg-white p-4 border rounded-md shadow-sm gap-4">
        <h2 className="font-bold text-slate-800">Contas a Pagar (A/P)</h2>
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" size="sm" className="gap-2">
            <UploadCloud className="w-4 h-4" /> Upload Fatura
          </Button>
          <Button size="sm">Novo Lançamento</Button>
        </div>
      </div>

      <div className="border rounded-md bg-white overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Fornecedor</TableHead>
              <TableHead>Vencimento</TableHead>
              <TableHead>Aprovação (Fluxo)</TableHead>
              <TableHead>Impostos</TableHead>
              <TableHead className="text-right">Valor</TableHead>
              <TableHead className="text-center">Pagamento / Conciliação</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {apDocs.map((doc) => (
              <TableRow key={doc.id} className="hover:bg-slate-50/50">
                <TableCell className="font-medium">
                  {doc.entity_name || 'Diversos'}
                  <p className="text-[10px] text-slate-400">Ref: {doc.id.substring(0, 8)}</p>
                </TableCell>
                <TableCell className="text-sm">{doc.due_date || '-'}</TableCell>
                <TableCell>
                  <div className="flex items-center gap-1">
                    <Badge
                      variant="secondary"
                      className="text-[10px] bg-emerald-100 text-emerald-700 hover:bg-emerald-200"
                    >
                      Setor
                    </Badge>
                    <Badge
                      variant="secondary"
                      className="text-[10px] bg-slate-100 text-slate-700 hover:bg-slate-200"
                    >
                      Finanças
                    </Badge>
                    <Badge
                      variant="secondary"
                      className="text-[10px] bg-slate-100 text-slate-700 hover:bg-slate-200"
                    >
                      Serviço
                    </Badge>
                  </div>
                </TableCell>
                <TableCell>
                  <Badge variant="outline" className="text-[10px]">
                    Verificado
                  </Badge>
                </TableCell>
                <TableCell className="text-right font-mono font-bold text-rose-600">
                  {formatCurrency(doc.amount, doc.currency)}
                </TableCell>
                <TableCell className="text-center">
                  <div className="flex justify-center gap-1">
                    <Button
                      size="icon"
                      variant="ghost"
                      className="h-8 w-8 text-blue-600"
                      title="Método de Pagamento"
                    >
                      <CreditCard className="w-4 h-4" />
                    </Button>
                    <Button
                      size="icon"
                      variant="ghost"
                      className="h-8 w-8 text-emerald-600"
                      title="Confirmar Saída"
                    >
                      <CheckCircle className="w-4 h-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
