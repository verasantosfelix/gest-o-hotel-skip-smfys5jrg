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
  Phone,
  Mail,
  Users as UsersIcon,
  CalendarCheck,
  Clock,
  Terminal,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
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
  DrawerDescription,
  DrawerFooter,
} from '@/components/ui/drawer'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { ReservationAssistant } from '@/components/ReservationAssistant'
import useReservationStore, { Reservation } from '@/stores/useReservationStore'

export default function Reservations() {
  const { reservations, getConsumptionsByReservation } = useReservationStore()
  const [selected, setSelected] = useState<Reservation | null>(null)
  const [searchTerm, setSearchTerm] = useState('')

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
        return (
          <Badge className="bg-emerald-100 text-emerald-800 hover:bg-emerald-200 border-emerald-200">
            In-House
          </Badge>
        )
      case 'confirmed':
        return (
          <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-200 border-blue-200">
            Confirmada
          </Badge>
        )
      case 'checked-out':
        return (
          <Badge className="bg-slate-100 text-slate-800 hover:bg-slate-200 border-slate-200">
            Check-out
          </Badge>
        )
      case 'canceled':
        return (
          <Badge className="bg-rose-100 text-rose-800 hover:bg-rose-200 border-rose-200">
            Cancelada
          </Badge>
        )
      default:
        return <Badge variant="outline">Pendente</Badge>
    }
  }

  const formatDate = (dateStr: string) => {
    if (!dateStr) return '-'
    const [y, m, d] = dateStr.split('-')
    return `${d}/${m}/${y}`
  }

  const getReservationTotal = (id: string) => {
    const cons = getConsumptionsByReservation(id)
    return cons.reduce((acc, c) => acc + c.valor, 0)
  }

  return (
    <div className="space-y-6 animate-fade-in pb-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">Gestão de Reservas</h1>
          <p className="text-muted-foreground text-sm">
            Controle de estadias, operações e assistente PMS.
          </p>
        </div>
      </div>

      {/* KPIs */}
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
              <p className="text-sm font-medium text-slate-500">Validações Pendentes</p>
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
                className="pl-9 h-9 border-slate-200 bg-slate-50 focus:bg-white transition-colors"
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
                {filtered.length > 0 ? (
                  filtered.map((res) => (
                    <TableRow key={res.id} className="hover:bg-slate-50/50">
                      <TableCell className="font-medium font-mono text-xs text-slate-600">
                        {res.id}
                      </TableCell>
                      <TableCell>
                        <div className="font-medium text-slate-900">{res.guestName}</div>
                        {res.guestDoc && (
                          <div className="text-xs text-slate-500">{res.guestDoc}</div>
                        )}
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
                          <DropdownMenuContent align="end" className="w-[200px]">
                            <DropdownMenuLabel>Ações da Reserva</DropdownMenuLabel>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              onClick={() => setSelected(res)}
                              className="cursor-pointer"
                            >
                              <Eye className="mr-2 h-4 w-4" /> Ver Detalhes
                            </DropdownMenuItem>
                            {res.status === 'confirmed' && (
                              <DropdownMenuItem className="cursor-pointer">
                                <DoorOpen className="mr-2 h-4 w-4" /> Iniciar Check-in
                              </DropdownMenuItem>
                            )}
                            {res.status === 'checked-in' && (
                              <>
                                <DropdownMenuItem className="cursor-pointer">
                                  <CheckSquare className="mr-2 h-4 w-4" /> Registrar Consumo
                                </DropdownMenuItem>
                                <DropdownMenuItem className="cursor-pointer text-amber-600 focus:text-amber-700">
                                  <DoorOpen className="mr-2 h-4 w-4" /> Realizar Check-out
                                </DropdownMenuItem>
                              </>
                            )}
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={6} className="h-24 text-center text-slate-500">
                      Nenhuma reserva encontrada.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </div>

        <div className="xl:col-span-1">
          <Card className="border-primary/20 shadow-md overflow-hidden h-full flex flex-col">
            <CardHeader className="bg-primary/5 pb-4 border-b">
              <CardTitle className="text-lg flex items-center gap-2 font-mono">
                <Terminal className="h-5 w-5 text-primary" />
                Assistente SKIP
              </CardTitle>
              <CardDescription>Motor de linguagem natural para gerenciar reservas.</CardDescription>
            </CardHeader>
            <CardContent className="p-0 flex-1">
              <ReservationAssistant />
            </CardContent>
          </Card>
        </div>
      </div>

      <Drawer open={!!selected} onOpenChange={(o) => !o && setSelected(null)}>
        <DrawerContent className="max-w-4xl mx-auto h-[85vh]">
          <DrawerHeader className="border-b pb-4 px-6">
            <div className="flex items-center justify-between">
              <div>
                <DrawerTitle className="text-xl flex items-center gap-3">
                  Reserva {selected?.id}
                  {selected && getStatusBadge(selected.status)}
                </DrawerTitle>
                <DrawerDescription className="mt-1">
                  Criada em {selected ? formatDate(selected.createdAt.split('T')[0]) : ''}
                </DrawerDescription>
              </div>
            </div>
          </DrawerHeader>
          <div className="p-6 space-y-8 overflow-y-auto">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <h3 className="text-sm font-semibold uppercase tracking-wider text-slate-500">
                  Dados do Hóspede
                </h3>
                <div className="bg-slate-50 p-5 rounded-xl border border-slate-100 shadow-sm space-y-4">
                  <div className="flex items-center gap-4">
                    <div className="bg-white p-3 rounded-full shadow-sm border border-slate-100">
                      <UsersIcon className="h-6 w-6 text-slate-600" />
                    </div>
                    <div>
                      <p className="text-lg font-bold text-slate-900 leading-none">
                        {selected?.guestName}
                      </p>
                      <p className="text-sm text-slate-500 mt-1">
                        Doc: {selected?.guestDoc || 'Não informado'}
                      </p>
                    </div>
                  </div>
                  <div className="grid grid-cols-1 gap-3 pt-3 border-t border-slate-200">
                    <div className="flex items-center gap-3 text-sm text-slate-600 bg-white p-2 rounded-md border border-slate-100">
                      <Mail className="h-4 w-4 text-slate-400" /> {selected?.guestEmail || '-'}
                    </div>
                    <div className="flex items-center gap-3 text-sm text-slate-600 bg-white p-2 rounded-md border border-slate-100">
                      <Phone className="h-4 w-4 text-slate-400" /> {selected?.guestPhone || '-'}
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="text-sm font-semibold uppercase tracking-wider text-slate-500">
                  Detalhes da Estadia
                </h3>
                <div className="bg-slate-50 p-5 rounded-xl border border-slate-100 shadow-sm space-y-4">
                  <div className="flex items-center justify-between bg-white p-3 rounded-lg border border-slate-100">
                    <div>
                      <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">
                        Check-in
                      </p>
                      <p className="font-medium text-slate-900">
                        {selected ? formatDate(selected.checkInDate) : ''}
                      </p>
                    </div>
                    <div className="h-px bg-slate-200 w-12 hidden sm:block"></div>
                    <div className="text-right">
                      <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">
                        Check-out
                      </p>
                      <p className="font-medium text-slate-900">
                        {selected ? formatDate(selected.checkOutDate) : ''}
                      </p>
                    </div>
                  </div>
                  <div className="pt-2 flex justify-between items-center px-1">
                    <div className="space-y-1">
                      <span className="text-xs text-slate-500 uppercase tracking-wider">
                        Acomodação
                      </span>
                      <p className="font-medium text-slate-900">
                        {selected?.roomType} {selected?.room ? `(${selected.room})` : ''}
                      </p>
                    </div>
                    <Badge variant="outline" className="bg-white">
                      Diária: R$ 400,00
                    </Badge>
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="text-sm font-semibold uppercase tracking-wider text-slate-500 flex items-center justify-between">
                <span>Extrato Operacional e Consumo</span>
                {selected && (
                  <Badge className="font-mono bg-slate-900 hover:bg-slate-800 text-white px-3 py-1 text-sm">
                    Consumo Total: R$ {getReservationTotal(selected.id).toFixed(2)}
                  </Badge>
                )}
              </h3>

              <div className="border rounded-lg overflow-hidden bg-white shadow-sm">
                <Table>
                  <TableHeader className="bg-slate-50">
                    <TableRow>
                      <TableHead>Data</TableHead>
                      <TableHead>Descrição do Item</TableHead>
                      <TableHead className="text-center">Qtd</TableHead>
                      <TableHead>Validação PMS</TableHead>
                      <TableHead className="text-right">Valor Líquido</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {selected && getConsumptionsByReservation(selected.id).length > 0 ? (
                      getConsumptionsByReservation(selected.id).map((c) => (
                        <TableRow key={c.id}>
                          <TableCell className="text-xs text-slate-500 font-mono whitespace-nowrap">
                            {formatDate(c.data_registro.split('T')[0])}
                          </TableCell>
                          <TableCell>
                            <div className="font-medium text-sm text-slate-900">{c.descricao}</div>
                            {c.desconto > 0 && (
                              <div className="text-xs text-emerald-600 mt-1 flex items-center gap-1.5">
                                <span className="font-medium">Motor de Desconto:</span>
                                <span>{c.motivo_desconto}</span>
                                <Badge
                                  variant="outline"
                                  className="text-[10px] h-4 px-1.5 border-emerald-200 bg-emerald-50 ml-1"
                                >
                                  -R$ {c.desconto.toFixed(2)}
                                </Badge>
                              </div>
                            )}
                          </TableCell>
                          <TableCell className="text-center font-medium text-sm">
                            {c.quantidade}
                          </TableCell>
                          <TableCell>
                            {c.validacao_hospede ? (
                              <Badge className="bg-emerald-100/50 text-emerald-700 hover:bg-emerald-100 border-emerald-200 gap-1.5 font-medium px-2 py-0.5">
                                <CheckSquare className="w-3.5 h-3.5" /> Assinatura Digital
                              </Badge>
                            ) : (
                              <Badge
                                variant="outline"
                                className="text-amber-600 border-amber-200 bg-amber-50 gap-1.5 font-medium px-2 py-0.5"
                              >
                                <Clock className="w-3.5 h-3.5" /> Aguardando Validação
                              </Badge>
                            )}
                          </TableCell>
                          <TableCell className="text-right font-bold text-slate-900">
                            R$ {c.valor.toFixed(2)}
                          </TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={5} className="text-center text-slate-500 py-8">
                          <div className="flex flex-col items-center gap-2">
                            <AlertCircle className="w-6 h-6 text-slate-300" />
                            <p>Nenhum lançamento registrado nesta conta.</p>
                          </div>
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
            </div>
          </div>
          <DrawerFooter className="border-t bg-slate-50/80 px-6 py-4">
            <div className="flex justify-between items-center w-full">
              <Button
                variant="outline"
                asChild
                className="gap-2 bg-white border-slate-300 hover:bg-slate-50 text-slate-700 shadow-sm"
              >
                <Link to={`/portal/guest/${selected?.id}`} target="_blank">
                  <Eye className="w-4 h-4" /> Abrir Portal de Assinaturas
                </Link>
              </Button>
              <Button
                className="bg-slate-900 hover:bg-slate-800 text-white px-8"
                onClick={() => setSelected(null)}
              >
                Fechar Ficha
              </Button>
            </div>
          </DrawerFooter>
        </DrawerContent>
      </Drawer>
    </div>
  )
}
