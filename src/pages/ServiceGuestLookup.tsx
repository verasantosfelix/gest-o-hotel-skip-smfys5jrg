import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Search, Receipt, UserCheck, FileText, Plus } from 'lucide-react'
import { Input } from '@/components/ui/input'
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
import useReservationStore from '@/stores/useReservationStore'
import { useAccess } from '@/hooks/use-access'
import { RestrictedAccess } from '@/components/RestrictedAccess'
import { CreateReservationDialog } from '@/components/operations/CreateReservationDialog'

export default function ServiceGuestLookup() {
  const [searchTerm, setSearchTerm] = useState('')
  const [isCreateOpen, setIsCreateOpen] = useState(false)
  const { reservations } = useReservationStore()
  const { hasAccess, canWrite } = useAccess()

  if (!hasAccess([], 'Busca Hóspedes')) {
    return <RestrictedAccess />
  }

  const inHouse = reservations.filter((r) => r.status === 'checked-in')
  const filtered = inHouse.filter(
    (r) =>
      r.guestName.toLowerCase().includes(searchTerm.toLowerCase()) || r.room?.includes(searchTerm),
  )

  return (
    <div className="space-y-6 animate-fade-in pb-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h1 className="text-2xl font-bold tracking-tight text-slate-900 flex items-center gap-2">
          <UserCheck className="w-6 h-6 text-primary" /> Busca de Hóspedes (In-House)
        </h1>
        {canWrite('Reservas') && (
          <Button onClick={() => setIsCreateOpen(true)} className="gap-2">
            <Plus className="w-4 h-4" /> Nova Reserva
          </Button>
        )}
      </div>

      <div className="bg-white rounded-lg border shadow-sm p-4 space-y-4">
        <div className="relative w-full max-w-md">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
          <Input
            placeholder="Buscar por nome ou quarto..."
            className="pl-9"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="rounded-md border border-slate-200 overflow-hidden">
          <Table>
            <TableHeader className="bg-slate-50">
              <TableRow>
                <TableHead className="w-24">Quarto</TableHead>
                <TableHead>Hóspede</TableHead>
                <TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((res) => (
                <TableRow key={res.id}>
                  <TableCell>
                    <Badge variant="outline">{res.room || '-'}</Badge>
                  </TableCell>
                  <TableCell className="font-medium">{res.guestName}</TableCell>
                  <TableCell className="text-right flex justify-end gap-2">
                    <Button size="sm" variant="outline" asChild className="gap-2">
                      <Link to="/extrato-hospede">
                        <FileText className="w-4 h-4" /> Extrato
                      </Link>
                    </Button>
                    {canWrite('Lançamentos Rápidos') && (
                      <Button size="sm" asChild className="gap-2">
                        <Link to={`/lancamento-servicos?reserva_id=${res.id}`}>
                          <Receipt className="w-4 h-4" /> Lançar Consumo
                        </Link>
                      </Button>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>

      <CreateReservationDialog open={isCreateOpen} onOpenChange={setIsCreateOpen} />
    </div>
  )
}
