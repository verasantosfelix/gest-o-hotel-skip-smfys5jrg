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
import { Input } from '@/components/ui/input'
import { FinancialDoc } from '@/services/financial'
import { formatCurrency } from '@/lib/utils'
import { Filter, Send, PhoneCall, CheckCircle, Receipt } from 'lucide-react'

export function ARWorkflow({ docs }: { docs: FinancialDoc[] }) {
  const arDocs = docs.filter((d) => d.category === 'A/R' || d.doc_type === 'Receita')

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center bg-white p-4 border rounded-md shadow-sm gap-4">
        <h2 className="font-bold text-slate-800">Contas a Receber (A/R)</h2>
        <div className="flex flex-wrap gap-2">
          <Input placeholder="Cliente / Empresa..." className="w-48 h-9" />
          <Button variant="outline" size="sm" className="gap-2">
            <Filter className="w-4 h-4" /> Filtros
          </Button>
          <Button size="sm">Nova Fatura</Button>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
        <div className="border p-3 rounded-md bg-white shadow-sm flex flex-col items-center">
          <p className="text-[10px] text-slate-500 uppercase font-bold text-center">
            Vencimentos (7d)
          </p>
          <p className="text-xl font-black text-rose-600 mt-1">3</p>
        </div>
        <div className="border p-3 rounded-md bg-white shadow-sm flex flex-col items-center">
          <p className="text-[10px] text-slate-500 uppercase font-bold text-center">Disputas</p>
          <p className="text-xl font-black text-amber-500 mt-1">1</p>
        </div>
        <div className="border p-3 rounded-md bg-white shadow-sm flex flex-col items-center">
          <p className="text-[10px] text-slate-500 uppercase font-bold text-center">
            Notas de Crédito
          </p>
          <p className="text-xl font-black text-blue-600 mt-1">2</p>
        </div>
        <div className="border p-3 rounded-md bg-white shadow-sm flex flex-col items-center">
          <p className="text-[10px] text-slate-500 uppercase font-bold text-center">
            Pagamentos Parciais
          </p>
          <p className="text-xl font-black text-emerald-600 mt-1">4</p>
        </div>
      </div>

      <div className="border rounded-md bg-white overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Cliente / Empresa</TableHead>
              <TableHead>Vencimento</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Valor</TableHead>
              <TableHead className="text-center">Cobrança</TableHead>
              <TableHead className="text-center">Conciliação</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {arDocs.map((doc) => (
              <TableRow key={doc.id} className="hover:bg-slate-50/50">
                <TableCell className="font-medium">
                  {doc.entity_name || 'Diversos'}
                  <p className="text-[10px] text-slate-400">Fat: #{doc.id.substring(0, 6)}</p>
                </TableCell>
                <TableCell className="text-sm">{doc.due_date || '-'}</TableCell>
                <TableCell>
                  <Badge variant={doc.status === 'Pendente' ? 'outline' : 'default'}>
                    {doc.status}
                  </Badge>
                </TableCell>
                <TableCell className="text-right font-mono font-bold text-emerald-600">
                  {formatCurrency(doc.amount, doc.currency)}
                </TableCell>
                <TableCell className="text-center">
                  <div className="flex justify-center gap-1">
                    <Button
                      size="icon"
                      variant="ghost"
                      className="h-8 w-8 text-blue-600"
                      title="Envio Automático (Lembrete)"
                    >
                      <Send className="w-4 h-4" />
                    </Button>
                    <Button
                      size="icon"
                      variant="ghost"
                      className="h-8 w-8 text-slate-600"
                      title="Registro de Contato"
                    >
                      <PhoneCall className="w-4 h-4" />
                    </Button>
                  </div>
                </TableCell>
                <TableCell className="text-center">
                  <div className="flex justify-center gap-1">
                    <Button
                      size="icon"
                      variant="ghost"
                      className="h-8 w-8 text-emerald-600"
                      title="Confirmar Pagamento"
                    >
                      <CheckCircle className="w-4 h-4" />
                    </Button>
                    <Button
                      size="icon"
                      variant="ghost"
                      className="h-8 w-8 text-slate-600"
                      title="Emitir Recibo"
                    >
                      <Receipt className="w-4 h-4" />
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
