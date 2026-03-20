import { useState } from 'react'
import { Link, Navigate } from 'react-router-dom'
import { Search, Receipt, UserCheck } from 'lucide-react'
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
import useAuthStore from '@/stores/useAuthStore'

export default function ServiceGuestLookup() {
  const [searchTerm, setSearchTerm] = useState('')
  const { reservations } = useReservationStore()
  const { userRole } = useAuthStore()

  if (userRole === 'Limpeza') return <Navigate to="/governanca" replace />
  if (userRole === 'Admin') return <Navigate to="/" replace />

  const inHouse = reservations.filter((r) => r.status === 'checked-in')

  const filtered = inHouse.filter(
    (r) =>
      r.guestName.toLowerCase().includes(searchTerm.toLowerCase()) || r.room?.includes(searchTerm),
  )

  const formatDate = (dateStr: string) => {
    if (!dateStr) return '-'
    const [y, m, d] = dateStr.split('-')
    return `${d}/${m}/${y}`
  }

  return (
    <div className="space-y-6 animate-fade-in pb-8">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900 flex items-center gap-2">
          <UserCheck className="w-6 h-6 text-primary" />
          Busca de Hóspedes (In-House)
        </h1>
        <p className="text-muted-foreground text-sm">
          Acesso restrito ({userRole}). Identifique o hóspede para lançar consumos.
        </p>
      </div>

      <div className="bg-white rounded-lg border shadow-sm overflow-hidden p-4 space-y-4">
        <div className="relative w-full max-w-md">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
          <Input
            placeholder="Buscar por nome ou número do quarto..."
            className="pl-9 bg-slate-50 border-slate-200 focus-visible:ring-slate-300"
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
                <TableHead>Check-in</TableHead>
                <TableHead>Check-out</TableHead>
                <TableHead className="text-right">Ação</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((res) => (
                <TableRow key={res.id} className="hover:bg-slate-50/50">
                  <TableCell>
                    <Badge
                      variant="outline"
                      className="font-mono bg-white border-slate-300 text-slate-700"
                    >
                      {res.room || '-'}
                    </Badge>
                  </TableCell>
                  <TableCell className="font-medium text-slate-900">{res.guestName}</TableCell>
                  <TableCell className="text-sm text-slate-600">
                    {formatDate(res.checkInDate)}
                  </TableCell>
                  <TableCell className="text-sm text-slate-600">
                    {formatDate(res.checkOutDate)}
                  </TableCell>
                  <TableCell className="text-right">
                    <Button
                      size="sm"
                      asChild
                      className="gap-2 bg-slate-900 text-white hover:bg-slate-800 shadow-sm"
                    >
                      <Link to={`/lancamento-servicos?reserva_id=${res.id}`}>
                        <Receipt className="w-4 h-4" /> Lançar Consumo
                      </Link>
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
              {filtered.length === 0 && (
                <TableRow>
                  <TableCell colSpan={5} className="h-32 text-center text-slate-500">
                    <div className="flex flex-col items-center justify-center gap-2">
                      <Search className="w-6 h-6 text-slate-300" />
                      <p>Nenhum hóspede hospedado encontrado com a busca.</p>
                    </div>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  )
}
