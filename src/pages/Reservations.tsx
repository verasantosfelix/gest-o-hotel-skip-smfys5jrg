import { useState } from 'react'
import { Link } from 'react-router-dom'
import {
  Search,
  Filter,
  MoreHorizontal,
  Eye,
  CheckSquare,
  DoorOpen,
  BedDouble,
  AlertCircle,
  CalendarCheck,
  Terminal,
  Plus,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerFooter,
} from '@/components/ui/drawer'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { ReservationAssistant } from '@/components/ReservationAssistant'
import useReservationStore, { Reservation } from '@/stores/useReservationStore'
import { useAccess } from '@/hooks/use-access'
import { RestrictedAccess } from '@/components/RestrictedAccess'
import { CreateReservationDialog } from '@/components/operations/CreateReservationDialog'

export default function Reservations() {
  const { hasAccess, canWrite } = useAccess()
  const { reservations, getConsumptionsByReservation } = useReservationStore()
  const [selected, setSelected] = useState<Reservation | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [isCreateOpen, setIsCreateOpen] = useState(false)

  if (!hasAccess([], 'Reservas')) {
    return <RestrictedAccess />
  }

  const today = new Date().toISOString().split('T')[0]
  const arrivals = reservations.filter(
    (r) => r.checkInDate === today && (r.status === 'confirmed' || r.status === 'pending'),
  ).length
  const departures = reservations.filter(
    (r) => r.checkOutDate === today && r.status === 'checked-in',
  ).length
  const inHouse = reservations.filter((r) => r.status === 'checked-in').length

  const allConsumptions = reservations.flatMap((r) => getConsumptionsByReservation(r.id))
  const pendingValidations = allConsumptions.filter((c) => !c.validacao_hospede).length

  const filtered = reservations.filter(
    (r) =>
      r.guestName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (r.guestDoc && r.guestDoc.includes(searchTerm)),
  )

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'checked-in':
        return <Badge className="bg-emerald-100 text-emerald-800">In-House</Badge>
      case 'confirmed':
        return <Badge className="bg-blue-100 text-blue-800">Confirmada</Badge>
      case 'checked-out':
        return <Badge className="bg-slate-100 text-slate-800">Check-out</Badge>
      case 'canceled':
        return <Badge className="bg-rose-100 text-rose-800">Cancelada</Badge>
      default:
        return <Badge variant="outline">Pendente</Badge>
    }
  }

  const formatDate = (dateStr: string) => {
    if (!dateStr) return '-'
    const [y, m, d] = dateStr.split('-')
    return `${d}/${m}/${y}`
  }

  return (
    <div className="space-y-6 animate-fade-in pb-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">Gestão de Reservas</h1>
          <p className="text-muted-foreground text-sm">Controle de estadias e assistente PMS.</p>
        </div>
        {canWrite('Reservas') && (
          <Button onClick={() => setIsCreateOpen(true)} className="gap-2 bg-primary">
            <Plus className="w-4 h-4" /> Nova Reserva
          </Button>
        )}
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <Card className="border-slate-200 shadow-sm">
          <CardContent className="p-4 flex items-center gap-4">
            <div className="bg-blue-100 p-3 rounded-full">
              <CalendarCheck className="w-5 h-5 text-blue-700" />
            </div>
            <div>
              <p className="text-sm font-medium text-slate-500">Check-ins Hoje</p>
              <h3 className="text-2xl font-bold text-slate-900">{arrivals}</h3>
            </div>
          </CardContent>
        </Card>
        <Card className="border-slate-200 shadow-sm">
          <CardContent className="p-4 flex items-center gap-4">
            <div className="bg-amber-100 p-3 rounded-full">
              <DoorOpen className="w-5 h-5 text-amber-700" />
            </div>
            <div>
              <p className="text-sm font-medium text-slate-500">Check-outs Hoje</p>
              <h3 className="text-2xl font-bold text-slate-900">{departures}</h3>
            </div>
          </CardContent>
        </Card>
        <Card className="border-slate-200 shadow-sm">
          <CardContent className="p-4 flex items-center gap-4">
            <div className="bg-emerald-100 p-3 rounded-full">
              <BedDouble className="w-5 h-5 text-emerald-700" />
            </div>
            <div>
              <p className="text-sm font-medium text-slate-500">In-House</p>
              <h3 className="text-2xl font-bold text-slate-900">{inHouse}</h3>
            </div>
          </CardContent>
        </Card>
        <Card className="border-slate-200 shadow-sm">
          <CardContent className="p-4 flex items-center gap-4">
            <div className="bg-rose-100 p-3 rounded-full">
              <AlertCircle className="w-5 h-5 text-rose-700" />
            </div>
            <div>
              <p className="text-sm font-medium text-slate-500">Validações</p>
              <h3 className="text-2xl font-bold text-slate-900">{pendingValidations}</h3>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 grid-cols-1 xl:grid-cols-3">
        <div className="xl:col-span-2 space-y-4">
          <div className="flex justify-between items-center gap-4 bg-white p-3 rounded-lg border shadow-sm">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar hóspede, documento ou reserva..."
                className="pl-9 h-9 border-slate-200 bg-slate-50"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <Button variant="outline" size="sm" className="h-9 gap-2">
              <Filter className="h-4 w-4" /> Filtros
            </Button>
          </div>

          <div className="rounded-md border bg-card shadow-sm overflow-hidden">
            <Table>
              <TableHeader className="bg-slate-50/80">
                <TableRow>
                  <TableHead className="w-[100px]">ID</TableHead>
                  <TableHead>Hóspede</TableHead>
                  <TableHead>Período</TableHead>
                  <TableHead>Acomodação</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map((res) => (
                  <TableRow key={res.id} className="hover:bg-slate-50/50">
                    <TableCell className="font-medium font-mono text-xs">{res.id}</TableCell>
                    <TableCell>
                      <div className="font-medium text-slate-900">{res.guestName}</div>
                    </TableCell>
                    <TableCell className="text-sm text-slate-600">
                      <div>{formatDate(res.checkInDate)}</div>
                      <div className="text-xs text-slate-400">
                        até {formatDate(res.checkOutDate)}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm font-medium">{res.room || '-'}</div>
                      <div className="text-xs text-slate-500">{res.roomType}</div>
                    </TableCell>
                    <TableCell>{getStatusBadge(res.status)}</TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" className="h-8 w-8 p-0">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => setSelected(res)}>
                            <Eye className="mr-2 h-4 w-4" /> Ver Detalhes e Conta
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </div>

        <div className="xl:col-span-1">
          <Card className="border-primary/20 shadow-md h-full flex flex-col">
            <CardHeader className="bg-primary/5 border-b">
              <CardTitle className="text-lg flex items-center gap-2 font-mono">
                <Terminal className="h-5 w-5 text-primary" /> Assistente SKIP
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0 flex-1">
              <ReservationAssistant />
            </CardContent>
          </Card>
        </div>
      </div>

      <Drawer open={!!selected} onOpenChange={(o) => !o && setSelected(null)}>
        <DrawerContent className="max-w-4xl mx-auto h-[85vh]">
          <DrawerHeader className="border-b pb-4 px-6 flex justify-between items-center">
            <DrawerTitle className="text-xl">
              Reserva {selected?.id} - {selected?.guestName}
            </DrawerTitle>
            {selected?.status === 'checked-in' && (
              <Badge className="bg-emerald-100 text-emerald-800">In-House</Badge>
            )}
          </DrawerHeader>
          <div className="p-6 flex flex-col gap-6 overflow-y-auto">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Card className="shadow-sm border-slate-200">
                <CardContent className="p-4">
                  <p className="text-xs font-bold text-slate-500 uppercase">Acomodação</p>
                  <p className="font-bold text-lg mt-1">{selected?.room || 'N/A'}</p>
                  <p className="text-xs text-slate-400">{selected?.roomType}</p>
                </CardContent>
              </Card>
              <Card className="shadow-sm border-slate-200">
                <CardContent className="p-4">
                  <p className="text-xs font-bold text-slate-500 uppercase">Check-in</p>
                  <p className="font-bold text-lg mt-1">
                    {formatDate(selected?.checkInDate || '')}
                  </p>
                </CardContent>
              </Card>
              <Card className="shadow-sm border-slate-200">
                <CardContent className="p-4">
                  <p className="text-xs font-bold text-slate-500 uppercase">Check-out</p>
                  <p className="font-bold text-lg mt-1">
                    {formatDate(selected?.checkOutDate || '')}
                  </p>
                </CardContent>
              </Card>
              <Card className="shadow-sm border-slate-200">
                <CardContent className="p-4">
                  <p className="text-xs font-bold text-slate-500 uppercase">Documento</p>
                  <p className="font-bold text-lg mt-1">{selected?.guestDoc || 'Não Info'}</p>
                </CardContent>
              </Card>
            </div>

            <div className="space-y-3">
              <h3 className="font-bold text-lg text-slate-800 flex items-center gap-2 border-b pb-2">
                Comandas & Extrato de Consumos
              </h3>
              {selected && (
                <div className="border border-slate-200 rounded-md overflow-hidden bg-white shadow-sm">
                  <Table>
                    <TableHeader className="bg-slate-50">
                      <TableRow>
                        <TableHead>Data / Hora</TableHead>
                        <TableHead>Descrição</TableHead>
                        <TableHead>Categoria</TableHead>
                        <TableHead className="text-right">Valor</TableHead>
                        <TableHead className="text-center">Status Pagamento</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {getConsumptionsByReservation(selected.id).map((c) => (
                        <TableRow key={c.id}>
                          <TableCell className="font-mono text-sm text-slate-500">
                            {new Date(c.data_registro).toLocaleString()}
                          </TableCell>
                          <TableCell className="font-medium text-slate-900">
                            {c.quantidade}x {c.descricao}
                          </TableCell>
                          <TableCell>{c.categoria}</TableCell>
                          <TableCell className="text-right font-mono text-slate-700">
                            R$ {c.valor.toFixed(2)}
                          </TableCell>
                          <TableCell className="text-center">
                            <Badge
                              variant={c.validacao_hospede ? 'default' : 'outline'}
                              className={c.validacao_hospede ? 'bg-emerald-500' : 'text-slate-500'}
                            >
                              {c.validacao_hospede ? 'Autorizado' : 'Pendente'}
                            </Badge>
                          </TableCell>
                        </TableRow>
                      ))}
                      {getConsumptionsByReservation(selected.id).length === 0 && (
                        <TableRow>
                          <TableCell colSpan={5} className="text-center text-slate-500 py-8">
                            Nenhum consumo registrado na conta.
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </div>
              )}
            </div>
          </div>
          <DrawerFooter className="border-t bg-slate-50/80 px-6 py-4 flex flex-row justify-between w-full">
            {canWrite('Reservas') ? (
              <div className="flex gap-2">
                <Button variant="outline">Alterar Pagamento</Button>
                <Button className="bg-emerald-600 hover:bg-emerald-700 text-white">
                  Emitir Fatura
                </Button>
              </div>
            ) : (
              <div />
            )}
            <Button variant="secondary" onClick={() => setSelected(null)}>
              Fechar Visualização
            </Button>
          </DrawerFooter>
        </DrawerContent>
      </Drawer>

      <CreateReservationDialog open={isCreateOpen} onOpenChange={setIsCreateOpen} />
    </div>
  )
}
