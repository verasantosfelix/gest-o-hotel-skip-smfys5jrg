import { useState, useEffect, useMemo } from 'react'
import { Plus, Search, Eye, Edit, Trash2, BedDouble, Users, Coffee, Calendar } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { useAccess } from '@/hooks/use-access'
import { RestrictedAccess } from '@/components/RestrictedAccess'
import { useRealtime } from '@/hooks/use-realtime'
import { getRooms, deleteRoom, type RoomRecord } from '@/services/rooms'
import { cn, formatCurrency } from '@/lib/utils'
import { toast } from '@/components/ui/use-toast'
import pb from '@/lib/pocketbase/client'
import { RoomFormDialog } from '@/components/operations/RoomFormDialog'
import { format } from 'date-fns'

const getStatusConfig = (status: string) => {
  switch (status) {
    case 'Manutenção':
      return 'bg-rose-100 text-rose-800 border-rose-300'
    case 'Ocupado':
      return 'bg-blue-100 text-blue-800 border-blue-300'
    case 'Limpeza':
      return 'bg-amber-100 text-amber-800 border-amber-300'
    case 'Disponível':
    default:
      return 'bg-emerald-100 text-emerald-800 border-emerald-300'
  }
}

export default function Rooms() {
  const { isManager } = useAccess()
  const isAuthManager = pb.authStore.record?.role === 'manager'

  const hasManagerAccess = useMemo(() => isManager() || isAuthManager, [isManager, isAuthManager])

  const [rooms, setRooms] = useState<RoomRecord[]>([])
  const [search, setSearch] = useState('')
  const [filter, setFilter] = useState('all')

  const [formOpen, setFormOpen] = useState(false)
  const [editingRoom, setEditingRoom] = useState<RoomRecord | null>(null)
  const [viewRoom, setViewRoom] = useState<RoomRecord | null>(null)
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)

  const loadRooms = async () => {
    try {
      const data = await getRooms()
      setRooms(data)
    } catch (e) {
      console.error('Failed to load rooms data', e)
    }
  }

  useEffect(() => {
    if (hasManagerAccess) {
      loadRooms()
    }
  }, [hasManagerAccess])

  useRealtime('rooms', loadRooms, hasManagerAccess)

  if (!hasManagerAccess) {
    return <RestrictedAccess />
  }

  const handleNewRoom = () => {
    setEditingRoom(null)
    setFormOpen(true)
  }

  const handleEditRoom = (room: RoomRecord) => {
    setEditingRoom(room)
    setFormOpen(true)
  }

  const handleDeleteConfirm = async () => {
    if (!deleteId) return
    setIsDeleting(true)
    try {
      await deleteRoom(deleteId)
      toast({ title: 'Quarto excluído', description: 'O quarto foi removido do inventário.' })
      setDeleteId(null)
    } catch (error: any) {
      toast({
        title: 'Erro ao excluir',
        description: 'Pode haver reservas associadas a este quarto.',
        variant: 'destructive',
      })
    } finally {
      setIsDeleting(false)
    }
  }

  const filteredRooms = rooms.filter((r) => {
    if (search && !r.room_number.toLowerCase().includes(search.toLowerCase())) return false
    if (filter !== 'all' && r.status !== filter) return false
    return true
  })

  return (
    <div className="space-y-6 animate-fade-in pb-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Gestão de Quartos (Inventário)</h1>
          <p className="text-sm text-muted-foreground">
            Controle centralizado de configurações, status e tarifas de acomodações.
          </p>
        </div>
        <Button onClick={handleNewRoom} className="bg-emerald-600 hover:bg-emerald-700 gap-2">
          <Plus className="w-4 h-4" />
          Adicionar Quarto
        </Button>
      </div>

      <div className="flex flex-col sm:flex-row gap-4 bg-white p-4 rounded-lg border shadow-sm">
        <div className="relative flex-1 sm:max-w-xs">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-slate-400" />
          <Input
            placeholder="Buscar por número..."
            className="pl-9"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <Select value={filter} onValueChange={setFilter}>
          <SelectTrigger className="w-full sm:w-[200px]">
            <SelectValue placeholder="Filtrar Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos os Status</SelectItem>
            <SelectItem value="Disponível">Disponível</SelectItem>
            <SelectItem value="Ocupado">Ocupado</SelectItem>
            <SelectItem value="Limpeza">Limpeza</SelectItem>
            <SelectItem value="Manutenção">Manutenção</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="bg-white border rounded-lg shadow-sm overflow-hidden">
        <Table>
          <TableHeader className="bg-slate-50">
            <TableRow>
              <TableHead className="w-[100px]">Número</TableHead>
              <TableHead>Bloco</TableHead>
              <TableHead>Andar</TableHead>
              <TableHead>Tipologia</TableHead>
              <TableHead className="text-center">Lotação</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Tarifa Base</TableHead>
              <TableHead className="text-right">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredRooms.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} className="text-center py-8 text-slate-500">
                  Nenhum quarto encontrado com os filtros atuais.
                </TableCell>
              </TableRow>
            ) : (
              filteredRooms.map((room) => (
                <TableRow key={room.id} className="hover:bg-slate-50 transition-colors">
                  <TableCell className="font-semibold text-slate-900">{room.room_number}</TableCell>
                  <TableCell className="font-medium text-slate-700">{room.bloco || '—'}</TableCell>
                  <TableCell>{room.floor === 0 ? 'Térreo' : `${room.floor}º`}</TableCell>
                  <TableCell>{room.room_type}</TableCell>
                  <TableCell className="text-center">{room.max_occupancy} Pax</TableCell>
                  <TableCell>
                    <Badge variant="outline" className={cn(getStatusConfig(room.status))}>
                      {room.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right font-medium text-slate-700">
                    {room.base_rate ? formatCurrency(room.base_rate, 'AOA') : '—'}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        title="Visualizar Detalhes"
                        className="text-slate-500 hover:text-blue-600"
                        onClick={() => setViewRoom(room)}
                      >
                        <Eye className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        title="Editar"
                        className="text-slate-500 hover:text-emerald-600"
                        onClick={() => handleEditRoom(room)}
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        title="Excluir"
                        className="text-slate-500 hover:text-rose-600"
                        onClick={() => setDeleteId(room.id)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <RoomFormDialog open={formOpen} onOpenChange={setFormOpen} room={editingRoom} />

      {/* Delete Confirmation Alert */}
      <AlertDialog open={!!deleteId} onOpenChange={(open) => !open && setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir Quarto?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta ação não pode ser desfeita. O quarto será removido permanentemente do sistema de
              inventário. Se o quarto possui histórico de reservas, a exclusão pode falhar por
              restrições do banco de dados.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteConfirm}
              disabled={isDeleting}
              className="bg-rose-600 hover:bg-rose-700 text-white"
            >
              {isDeleting ? 'Excluindo...' : 'Excluir Quarto'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* View Room Details Dialog */}
      <Dialog open={!!viewRoom} onOpenChange={(open) => !open && setViewRoom(null)}>
        <DialogContent className="sm:max-w-xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-xl">
              <BedDouble className="w-5 h-5 text-slate-500" />
              Detalhes do Quarto {viewRoom?.room_number}
            </DialogTitle>
          </DialogHeader>

          {viewRoom && (
            <div className="space-y-6 pt-4">
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-4 bg-slate-50 p-4 rounded-lg border border-slate-200 shadow-sm">
                <div>
                  <p className="text-xs text-slate-500 mb-1">Status</p>
                  <Badge variant="outline" className={cn(getStatusConfig(viewRoom.status))}>
                    {viewRoom.status}
                  </Badge>
                </div>
                <div>
                  <p className="text-xs text-slate-500 mb-1">Tipologia</p>
                  <p className="font-semibold text-slate-900">{viewRoom.room_type}</p>
                </div>
                <div>
                  <p className="text-xs text-slate-500 mb-1">Bloco</p>
                  <p className="font-semibold text-slate-900">{viewRoom.bloco || '—'}</p>
                </div>
                <div>
                  <p className="text-xs text-slate-500 mb-1">Andar</p>
                  <p className="font-semibold text-slate-900">
                    {viewRoom.floor === 0 ? 'Térreo' : `${viewRoom.floor}º`}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-slate-500 mb-1">Tarifa Base</p>
                  <p className="font-semibold text-slate-900">
                    {viewRoom.base_rate ? formatCurrency(viewRoom.base_rate, 'AOA') : '—'}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div className="flex items-center gap-3 p-3 bg-white border rounded-lg">
                  <div className="bg-blue-50 p-2 rounded-md">
                    <Users className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-xs text-slate-500">Lotação Máx.</p>
                    <p className="font-semibold">{viewRoom.max_occupancy || 2} Pax</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-3 bg-white border rounded-lg">
                  <div className="bg-emerald-50 p-2 rounded-md">
                    <BedDouble className="w-5 h-5 text-emerald-600" />
                  </div>
                  <div>
                    <p className="text-xs text-slate-500">Qtd. Camas</p>
                    <p className="font-semibold">{viewRoom.bed_count || 1}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-3 bg-white border rounded-lg">
                  <div className="bg-purple-50 p-2 rounded-md">
                    <BedDouble className="w-5 h-5 text-purple-600" />
                  </div>
                  <div>
                    <p className="text-xs text-slate-500">Cama Extra?</p>
                    <p className="font-semibold">{viewRoom.allow_extra_bed ? 'Sim' : 'Não'}</p>
                  </div>
                </div>
              </div>

              {viewRoom.appliances && viewRoom.appliances.length > 0 && (
                <div className="space-y-3">
                  <h4 className="text-sm font-semibold text-slate-800 flex items-center gap-2">
                    <Coffee className="w-4 h-4 text-slate-500" /> Eletrodomésticos e Comodidades
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {viewRoom.appliances.map((app) => (
                      <Badge
                        key={app}
                        variant="secondary"
                        className="bg-slate-100 text-slate-700 border-slate-200 font-medium px-3 py-1"
                      >
                        {app}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              <div className="flex justify-between items-center text-xs text-slate-500 pt-4 border-t">
                <span className="flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5" />
                  Criado em: {format(new Date(viewRoom.created), 'dd/MM/yyyy HH:mm')}
                </span>
                <span>ID: {viewRoom.id}</span>
              </div>
            </div>
          )}

          <DialogFooter className="mt-2">
            <Button variant="outline" onClick={() => setViewRoom(null)}>
              Fechar
            </Button>
            <Button
              onClick={() => {
                setViewRoom(null)
                handleEditRoom(viewRoom!)
              }}
            >
              Editar Quarto
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
