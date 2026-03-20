import { useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { toast } from '@/components/ui/use-toast'
import { RoomRecord, updateRoom } from '@/services/rooms'
import { createMaintenanceTicket } from '@/services/housekeeping'
import { createLostAndFound } from '@/services/lost_found'
import pb from '@/lib/pocketbase/client'

export function MaintenanceModal({
  room,
  onClose,
}: {
  room: RoomRecord | null
  onClose: () => void
}) {
  const [desc, setDesc] = useState('')
  const [priority, setPriority] = useState<any>('medium')

  if (!room) return null

  const handleSave = async () => {
    try {
      await createMaintenanceTicket({
        room_id: room.id,
        description: desc,
        priority,
        status: 'open',
      })
      await updateRoom(room.id, { status: 'manutencao', maintenance_description: desc })
      toast({ title: 'Ticket de manutenção criado.' })
      onClose()
    } catch (e) {
      toast({ title: 'Erro ao criar ticket', variant: 'destructive' })
    }
  }

  return (
    <Dialog open={!!room} onOpenChange={(o) => !o && onClose()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Abrir OS de Manutenção - Q.{room.room_number}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label>Descrição do Problema</Label>
            <Input
              value={desc}
              onChange={(e) => setDesc(e.target.value)}
              placeholder="Ex: Ar condicionado pingando"
            />
          </div>
          <div className="space-y-2">
            <Label>Prioridade</Label>
            <Select value={priority} onValueChange={setPriority}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="low">Baixa</SelectItem>
                <SelectItem value="medium">Média</SelectItem>
                <SelectItem value="high">Alta</SelectItem>
                <SelectItem value="urgent">Urgente</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancelar
          </Button>
          <Button onClick={handleSave} disabled={!desc}>
            Abrir Ticket
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

export function MinibarModal({ room, onClose }: { room: RoomRecord | null; onClose: () => void }) {
  const [item, setItem] = useState('')
  const [qty, setQty] = useState('1')

  if (!room) return null

  const handleSave = async () => {
    try {
      const resList = await pb
        .collection('reservations')
        .getFullList({ filter: `room_id="${room.id}" && status="in_house"`, requestKey: null })
      if (resList.length > 0) {
        await pb.collection('consumptions').create({
          reservation_id: resList[0].id,
          type: 'minibar',
          amount: 15.0 * parseInt(qty),
          description: `Minibar: ${item} (${qty}x)`,
        })
        toast({ title: 'Consumo registrado na conta do hóspede.' })
      } else {
        toast({ title: 'Nenhuma reserva ativa para este quarto.', variant: 'destructive' })
      }
      onClose()
    } catch (e) {
      toast({ title: 'Erro ao registrar consumo', variant: 'destructive' })
    }
  }

  return (
    <Dialog open={!!room} onOpenChange={(o) => !o && onClose()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Registrar Minibar - Q.{room.room_number}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label>Item</Label>
            <Input
              value={item}
              onChange={(e) => setItem(e.target.value)}
              placeholder="Ex: Água, Amendoim"
            />
          </div>
          <div className="space-y-2">
            <Label>Quantidade</Label>
            <Input type="number" min="1" value={qty} onChange={(e) => setQty(e.target.value)} />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancelar
          </Button>
          <Button onClick={handleSave} disabled={!item}>
            Lançar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

export function LostFoundModal({
  room,
  onClose,
}: {
  room: RoomRecord | null
  onClose: () => void
}) {
  const [desc, setDesc] = useState('')

  if (!room) return null

  const handleSave = async () => {
    try {
      await createLostAndFound({
        description: desc,
        location: `Quarto ${room.room_number}`,
        status: 'pendente',
        date_found: new Date().toISOString(),
      })
      toast({ title: 'Item reportado ao setor de Achados e Perdidos.' })
      onClose()
    } catch (e) {
      toast({ title: 'Erro ao registrar', variant: 'destructive' })
    }
  }

  return (
    <Dialog open={!!room} onOpenChange={(o) => !o && onClose()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Reportar Achado - Q.{room.room_number}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label>Descrição do Objeto</Label>
            <Input
              value={desc}
              onChange={(e) => setDesc(e.target.value)}
              placeholder="Ex: Relógio dourado na mesa de cabeceira"
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancelar
          </Button>
          <Button onClick={handleSave} disabled={!desc}>
            Reportar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
