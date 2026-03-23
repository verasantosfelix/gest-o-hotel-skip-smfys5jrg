import { useState, useEffect } from 'react'
import {
  Search,
  MoreHorizontal,
  Eye,
  DoorOpen,
  BedDouble,
  CalendarCheck,
  Plus,
  List,
  GanttChartSquare,
  FileCheck,
  Receipt,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent } from '@/components/ui/card'
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
import { useAccess } from '@/hooks/use-access'
import { RestrictedAccess } from '@/components/RestrictedAccess'
import { CreateReservationDialog } from '@/components/operations/CreateReservationDialog'
import { GanttChart } from '@/components/operations/GanttChart'
import { DigitalCheckInDialog } from '@/components/operations/DigitalCheckInDialog'
import { useRealtime } from '@/hooks/use-realtime'
import {
  PBReservation,
  getReservations,
  updateReservation,
  PBConsumption,
} from '@/services/reservations'
import { getRooms, RoomRecord } from '@/services/rooms'
import pb from '@/lib/pocketbase/client'
import { formatCurrency } from '@/lib/utils'
import { toast } from '@/components/ui/use-toast'
import { createFinancialDoc } from '@/services/financial'

export default function Reservations() {
  const { hasAccess, canWrite } = useAccess()
  const [viewMode, setViewMode] = useState<'list' | 'gantt'>('list')
  const [reservations, setReservations] = useState<PBReservation[]>([])
  const [consumptions, setConsumptions] = useState<PBConsumption[]>([])
  const [rooms, setRooms] = useState<RoomRecord[]>([])

  const [selected, setSelected] = useState<PBReservation | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [isCreateOpen, setIsCreateOpen] = useState(false)
  const [isCheckInOpen, setIsCheckInOpen] = useState(false)
  const [checkInRes, setCheckInRes] = useState<PBReservation | null>(null)

  const loadData = async () => {
    try {
      const [res, cons, rms] = await Promise.all([
        getReservations(),
        pb.collection('consumptions').getFullList<PBConsumption>(),
        getRooms(),
      ])
      setReservations(res)
      setConsumptions(cons)
      setRooms(rms)
    } catch (e) {
      console.error(e)
    }
  }

  useEffect(() => {
    loadData()
  }, [])
  useRealtime('reservations', loadData)
  useRealtime('consumptions', loadData)
  useRealtime('rooms', loadData)

  if (!hasAccess([], 'Reservas')) return <RestrictedAccess />

  const today = new Date().toISOString().split('T')[0]
  const arrivals = reservations.filter(
    (r) => r.check_in.startsWith(today) && r.status === 'previsto',
  ).length
  const departures = reservations.filter(
    (r) => r.check_out.startsWith(today) && r.status === 'in_house',
  ).length
  const inHouse = reservations.filter((r) => r.status === 'in_house').length

  const filtered = reservations.filter(
    (r) =>
      r.guest_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.expand?.room_id?.room_number.includes(searchTerm),
  )

  const handleMoveReservation = async (
    id: string,
    roomId: string,
    checkIn: string,
    checkOut: string,
  ) => {
    try {
      await updateReservation(id, { room_id: roomId, check_in: checkIn, check_out: checkOut })
      toast({ title: 'Reserva atualizada com sucesso!' })
    } catch (e) {
      toast({ title: 'Erro ao mover reserva', variant: 'destructive' })
    }
  }

  const handleRequestInvoice = async () => {
    if (!selected) return
    try {
      const totalCons = consumptions
        .filter((c) => c.reservation_id === selected.id)
        .reduce((a, b) => a + b.amount, 0)
      const totalAmount = totalCons + (selected.balance || 0)

      await createFinancialDoc({
        doc_type: 'invoice_request',
        amount: totalAmount,
        status: 'pending',
        category: 'A/R',
        entity_name: selected.guest_name,
        currency: 'AOA',
        notes: `Referente à reserva ${selected.id}`,
      })

      const financeUsers = await pb.collection('users').getFullList({ expand: 'profile' })
      const targetUsers = financeUsers.filter(
        (u) =>
          u.expand?.profile?.role_level === 'Administrativo_Financeiro' ||
          u.expand?.profile?.role_level === 'Direcao_Admin',
      )

      for (const u of targetUsers) {
        await pb.collection('notifications').create({
          recipient_id: u.id,
          sender_id: pb.authStore.record?.id,
          title: 'Solicitação de Fatura Interna',
          message: `Fatura solicitada para ${selected.guest_name} no valor de ${formatCurrency(totalAmount, 'AOA')}.`,
          type: 'approval_request',
          status: 'unread',
        })
      }

      toast({ title: 'Solicitação enviada ao departamento Financeiro.' })
    } catch (e) {
      toast({ title: 'Erro ao solicitar fatura', variant: 'destructive' })
    }
  }

  return (
    <div className="space-y-6 animate-fade-in pb-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">Gestão de Reservas</h1>
          <p className="text-muted-foreground text-sm">Controle de estadias e mapa de ocupação.</p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={() => setViewMode((v) => (v === 'list' ? 'gantt' : 'list'))}
            className="gap-2 border-slate-300 shadow-sm"
          >
            {viewMode === 'list' ? (
              <GanttChartSquare className="w-4 h-4" />
            ) : (
              <List className="w-4 h-4" />
            )}
            <span className="hidden sm:inline">
              {viewMode === 'list' ? 'Ver Mapa (Gantt)' : 'Ver Lista'}
            </span>
          </Button>
          {canWrite('Reservas') && (
            <Button
              onClick={() => setIsCreateOpen(true)}
              className="gap-2 bg-slate-900 text-white hover:bg-slate-800 shadow-sm"
            >
              <Plus className="w-4 h-4" /> Nova Reserva
            </Button>
          )}
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-3 lg:grid-cols-4">
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
      </div>

      {viewMode === 'gantt' ? (
        <div className="animate-fade-in-up">
          <GanttChart reservations={reservations} rooms={rooms} onMove={handleMoveReservation} />
        </div>
      ) : (
        <div className="space-y-4 animate-fade-in-up">
          <div className="flex justify-between items-center gap-4 bg-white p-3 rounded-lg border border-slate-200 shadow-sm">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar hóspede ou quarto..."
                className="pl-9 h-9 border-slate-200"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
          <div className="rounded-md border bg-white shadow-sm overflow-hidden border-slate-200">
            <Table>
              <TableHeader className="bg-slate-50/80">
                <TableRow>
                  <TableHead className="w-[80px]">Quarto</TableHead>
                  <TableHead>Hóspede</TableHead>
                  <TableHead>Período</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map((res) => (
                  <TableRow key={res.id} className="hover:bg-slate-50/50">
                    <TableCell className="font-mono text-slate-700 font-medium">
                      {res.expand?.room_id?.room_number || '-'}
                    </TableCell>
                    <TableCell>
                      <div className="font-semibold text-slate-900">{res.guest_name}</div>
                      {res.is_corporate && (
                        <div className="text-[10px] text-blue-600 font-bold uppercase tracking-wider">
                          Corporativo
                        </div>
                      )}
                    </TableCell>
                    <TableCell className="text-sm text-slate-600">
                      <div>{res.check_in.split(' ')[0]}</div>
                      <div className="text-xs text-slate-400">
                        até {res.check_out.split(' ')[0]}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant="outline"
                        className={
                          res.status === 'in_house'
                            ? 'bg-emerald-100 text-emerald-800 border-emerald-200'
                            : res.status === 'previsto'
                              ? 'bg-blue-100 text-blue-800 border-blue-200'
                              : 'bg-slate-100 text-slate-700 border-slate-200'
                        }
                      >
                        {res.status.replace('_', ' ').toUpperCase()}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" className="h-8 w-8 p-0">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => setSelected(res)}>
                            <Eye className="mr-2 h-4 w-4" /> Ver Detalhes e Fatura
                          </DropdownMenuItem>
                          {res.status === 'previsto' && canWrite('Reservas') && (
                            <DropdownMenuItem
                              onClick={() => {
                                setCheckInRes(res)
                                setIsCheckInOpen(true)
                              }}
                            >
                              <FileCheck className="mr-2 h-4 w-4 text-emerald-600" /> Check-in
                              Digital
                            </DropdownMenuItem>
                          )}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
                {filtered.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-8 text-slate-500">
                      Nenhuma reserva encontrada.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </div>
      )}

      {/* Details Drawer */}
      <Drawer open={!!selected} onOpenChange={(o) => !o && setSelected(null)}>
        <DrawerContent className="max-w-4xl mx-auto h-[85vh]">
          <DrawerHeader className="border-b pb-4 px-6 flex justify-between items-center">
            <DrawerTitle className="text-xl">Reserva - {selected?.guest_name}</DrawerTitle>
            <Badge variant="outline" className="uppercase">
              {selected?.status.replace('_', ' ')}
            </Badge>
          </DrawerHeader>
          <div className="p-6 overflow-y-auto space-y-6">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Card className="shadow-sm border-slate-200">
                <CardContent className="p-4">
                  <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                    Acomodação
                  </p>
                  <p className="font-bold text-lg text-slate-800 mt-1">
                    {selected?.expand?.room_id?.room_number || '-'}
                  </p>
                </CardContent>
              </Card>
              <Card className="shadow-sm border-slate-200">
                <CardContent className="p-4">
                  <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                    Check-in
                  </p>
                  <p className="font-bold text-lg text-slate-800 mt-1">
                    {selected?.check_in.split(' ')[0]}
                  </p>
                </CardContent>
              </Card>
              <Card className="shadow-sm border-slate-200">
                <CardContent className="p-4">
                  <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                    Check-out
                  </p>
                  <p className="font-bold text-lg text-slate-800 mt-1">
                    {selected?.check_out.split(' ')[0]}
                  </p>
                </CardContent>
              </Card>
              <Card className="shadow-sm border-slate-200">
                <CardContent className="p-4">
                  <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                    Saldo (Rate)
                  </p>
                  <p className="font-bold text-lg text-emerald-700 mt-1">
                    {formatCurrency(selected?.balance || 0, 'AOA')}
                  </p>
                </CardContent>
              </Card>
            </div>
            <div>
              <h3 className="font-bold text-lg mb-3 text-slate-800">Consumos Lançados</h3>
              <div className="border border-slate-200 rounded-md overflow-hidden">
                <Table>
                  <TableHeader className="bg-slate-50">
                    <TableRow>
                      <TableHead>Data</TableHead>
                      <TableHead>Categoria</TableHead>
                      <TableHead>Descrição</TableHead>
                      <TableHead className="text-right">Valor</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {consumptions
                      .filter((c) => c.reservation_id === selected?.id)
                      .map((c) => (
                        <TableRow key={c.id}>
                          <TableCell className="text-xs text-slate-500 font-mono">
                            {new Date(c.created).toLocaleString()}
                          </TableCell>
                          <TableCell className="capitalize">{c.type.replace('_', ' ')}</TableCell>
                          <TableCell className="font-medium">{c.description}</TableCell>
                          <TableCell className="text-right font-mono">
                            {formatCurrency(c.amount, 'AOA')}
                          </TableCell>
                        </TableRow>
                      ))}
                    {consumptions.filter((c) => c.reservation_id === selected?.id).length === 0 && (
                      <TableRow>
                        <TableCell colSpan={4} className="text-center py-6 text-slate-500">
                          Nenhum consumo registrado.
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
            </div>
          </div>
          <DrawerFooter className="border-t bg-slate-50/80 px-6 py-4 flex flex-row justify-between w-full">
            <Button
              variant="default"
              className="gap-2 bg-slate-900 text-white hover:bg-slate-800"
              onClick={handleRequestInvoice}
            >
              <Receipt className="w-4 h-4" /> Solicitar Fatura ao Financeiro
            </Button>
            <Button variant="secondary" onClick={() => setSelected(null)}>
              Fechar
            </Button>
          </DrawerFooter>
        </DrawerContent>
      </Drawer>

      <CreateReservationDialog open={isCreateOpen} onOpenChange={setIsCreateOpen} />
      <DigitalCheckInDialog
        open={isCheckInOpen}
        onOpenChange={setIsCheckInOpen}
        reservation={checkInRes}
      />
    </div>
  )
}
