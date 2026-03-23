import { useState, useEffect } from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useAccess } from '@/hooks/use-access'
import { createMaintenanceTicket } from '@/services/maintenance'
import { createAmenityRequest } from '@/services/amenities'
import { createLaundryLog } from '@/services/laundry'
import { getRooms, RoomRecord } from '@/services/rooms'
import pb from '@/lib/pocketbase/client'
import { toast } from '@/components/ui/use-toast'

const AMENITY_ITEMS = [
  'sabonete',
  'shampoo',
  'condicionador',
  'toalhas_extra',
  'água',
  'chá / café',
  'kit_dentes',
  'pantufas',
]

interface Props {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function NewServiceRequestDialog({ open, onOpenChange }: Props) {
  const { isManager } = useAccess()
  const [rooms, setRooms] = useState<RoomRecord[]>([])

  const [dept, setDept] = useState('maintenance')
  const [roomId, setRoomId] = useState('')
  const [description, setDescription] = useState('')
  const [priority, setPriority] = useState('medium')
  const [item, setItem] = useState('')
  const [quantity, setQuantity] = useState(1)
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    if (open) {
      getRooms()
        .then(setRooms)
        .catch((e) => console.error(e))
    }
  }, [open])

  const resetForm = () => {
    setDept('maintenance')
    setRoomId('')
    setDescription('')
    setPriority('medium')
    setItem('')
    setQuantity(1)
  }

  const handleSubmit = async () => {
    if (!roomId && dept !== 'laundry') {
      return toast({ title: 'Quarto/Local é obrigatório.', variant: 'destructive' })
    }

    setIsSubmitting(true)
    try {
      const isMgr = isManager()
      const user = pb.authStore.record
      if (!user) throw new Error('Não autenticado')

      let ticketStatus = 'pending_approval'
      if (isMgr) {
        if (dept === 'maintenance') ticketStatus = 'open'
        else ticketStatus = 'pending'
      }

      if (dept === 'maintenance') {
        await createMaintenanceTicket({
          room_id: roomId,
          description,
          priority: priority as 'low' | 'medium' | 'high' | 'urgent',
          status: ticketStatus as any,
          created_by: user.id,
          origin: 'Solicitação Externa',
        })
      } else if (dept === 'amenities') {
        await createAmenityRequest({
          room_id: roomId,
          item,
          quantity,
          priority: priority === 'urgent' ? 'urgente' : 'normal',
          status: ticketStatus as any,
          created_by: user.id,
          guest_name: 'Hóspede / Staff',
        })
      } else if (dept === 'laundry') {
        const activeRoom = rooms.find((r) => r.id === roomId)
        await createLaundryLog({
          type: 'Serviço Solicitado',
          item: description || item,
          quantity: quantity,
          urgency: priority === 'urgent' ? 'high' : 'normal',
          location: activeRoom ? `Quarto ${activeRoom.room_number}` : 'Geral',
          status: ticketStatus,
          created_by: user.id,
          staff_member: user.name || 'Equipe',
        })
      }

      // Notification Logic for Pending Approval
      if (!isMgr) {
        const profileId = user.profile
        if (profileId) {
          const profile = await pb.collection('profiles').getOne(profileId)
          if (profile.manager_id) {
            await pb.collection('notifications').create({
              recipient_id: profile.manager_id,
              sender_id: user.id,
              title: 'Nova Solicitação Operacional',
              message: `Uma solicitação para o departamento de ${dept.toUpperCase()} requer sua aprovação.`,
              type: 'approval_request',
              status: 'unread',
              link: '/alcadas',
            })
          }
        }
      }

      toast({
        title: 'Solicitação enviada!',
        description: isMgr
          ? 'O ticket foi encaminhado diretamente ao departamento.'
          : 'Sua solicitação foi enviada para aprovação do seu gerente.',
      })

      onOpenChange(false)
      resetForm()
    } catch (error) {
      console.error(error)
      toast({ title: 'Erro ao enviar solicitação.', variant: 'destructive' })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[450px]">
        <DialogHeader>
          <DialogTitle>Nova Solicitação de Serviço</DialogTitle>
          <DialogDescription>
            Reporte um problema ou solicite recursos para outro departamento.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label>Departamento de Destino</Label>
            <Select value={dept} onValueChange={setDept}>
              <SelectTrigger>
                <SelectValue placeholder="Selecione o departamento" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="maintenance">Manutenção</SelectItem>
                <SelectItem value="laundry">Lavanderia</SelectItem>
                <SelectItem value="amenities">Governança (Amenities)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2 col-span-2 sm:col-span-1">
              <Label>{dept === 'laundry' ? 'Local (Opcional)' : 'Quarto / Local'}</Label>
              <Select value={roomId} onValueChange={setRoomId}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione" />
                </SelectTrigger>
                <SelectContent>
                  {rooms.map((r) => (
                    <SelectItem key={r.id} value={r.id}>
                      Quarto {r.room_number}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2 col-span-2 sm:col-span-1">
              <Label>Prioridade / Urgência</Label>
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

          {dept === 'amenities' && (
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Item Solicitado</Label>
                <Select value={item} onValueChange={setItem}>
                  <SelectTrigger>
                    <SelectValue placeholder="Item" />
                  </SelectTrigger>
                  <SelectContent>
                    {AMENITY_ITEMS.map((i) => (
                      <SelectItem key={i} value={i} className="capitalize">
                        {i.replace('_', ' ')}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Quantidade</Label>
                <Input
                  type="number"
                  min="1"
                  value={quantity}
                  onChange={(e) => setQuantity(Number(e.target.value))}
                />
              </div>
            </div>
          )}

          {dept === 'laundry' && (
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Descrição do Item</Label>
                <Input
                  placeholder="Ex: Fardamento, Toalhas"
                  value={item}
                  onChange={(e) => setItem(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label>Quantidade</Label>
                <Input
                  type="number"
                  min="1"
                  value={quantity}
                  onChange={(e) => setQuantity(Number(e.target.value))}
                />
              </div>
            </div>
          )}

          {(dept === 'maintenance' || dept === 'laundry') && (
            <div className="space-y-2">
              <Label>Descrição do Problema / Detalhes</Label>
              <Input
                placeholder="Descreva o que precisa ser feito..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button onClick={handleSubmit} disabled={isSubmitting}>
            {isSubmitting ? 'Enviando...' : 'Confirmar Solicitação'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
