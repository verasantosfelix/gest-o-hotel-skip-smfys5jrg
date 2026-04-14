import { useEffect, useState } from 'react'
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
import { Switch } from '@/components/ui/switch'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { RoomRecord, createRoom, updateRoom } from '@/services/rooms'
import { toast } from '@/components/ui/use-toast'
import { Badge } from '@/components/ui/badge'
import { X, Plus } from 'lucide-react'

interface RoomFormDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  room?: RoomRecord | null
}

const APPLIANCE_OPTIONS = [
  'Frigobar',
  'TV',
  'Ar Condicionado',
  'Cofre',
  'Secador de Cabelo',
  'Chaleira',
  'Máquina de Café',
  'Banheira',
  'Ferro de Passar',
]

export function RoomFormDialog({ open, onOpenChange, room }: RoomFormDialogProps) {
  const [formData, setFormData] = useState<Partial<RoomRecord>>({})
  const [newAppliance, setNewAppliance] = useState('')

  useEffect(() => {
    if (open) {
      if (room) {
        setFormData({ ...room, appliances: room.appliances || [] })
      } else {
        setFormData({
          room_number: '',
          floor: 1,
          room_type: 'Single',
          status: 'Disponível',
          max_occupancy: 2,
          bed_count: 1,
          allow_extra_bed: false,
          base_rate: 0,
          appliances: [],
        })
      }
      setNewAppliance('')
    }
  }, [open, room])

  const handleSubmit = async () => {
    try {
      if (room?.id) {
        await updateRoom(room.id, formData)
        toast({ title: 'Quarto atualizado com sucesso!' })
      } else {
        await createRoom(formData)
        toast({ title: 'Quarto criado com sucesso!' })
      }
      onOpenChange(false)
    } catch (error: any) {
      toast({ title: 'Erro ao salvar quarto', description: error.message, variant: 'destructive' })
    }
  }

  const addAppliance = (app: string) => {
    if (app && !formData.appliances?.includes(app)) {
      setFormData((prev) => ({ ...prev, appliances: [...(prev.appliances || []), app] }))
    }
    setNewAppliance('')
  }

  const removeAppliance = (app: string) => {
    setFormData((prev) => ({
      ...prev,
      appliances: prev.appliances?.filter((a) => a !== app),
    }))
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{room ? 'Editar Quarto' : 'Novo Quarto'}</DialogTitle>
        </DialogHeader>

        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Número do Quarto</Label>
              <Input
                value={formData.room_number || ''}
                onChange={(e) => setFormData({ ...formData, room_number: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label>Andar</Label>
              <Input
                type="number"
                value={formData.floor || ''}
                onChange={(e) => setFormData({ ...formData, floor: Number(e.target.value) })}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Tipo de Quarto</Label>
              <Select
                value={formData.room_type}
                onValueChange={(val: any) => setFormData({ ...formData, room_type: val })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione..." />
                </SelectTrigger>
                <SelectContent>
                  {[
                    'Single',
                    'Duplo/Casal',
                    'Casal',
                    'Especial',
                    'Quádruplo',
                    'Vivenda T1',
                    'Vivenda T2',
                  ].map((t) => (
                    <SelectItem key={t} value={t}>
                      {t}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Status Operacional</Label>
              <Select
                value={formData.status}
                onValueChange={(val: any) => setFormData({ ...formData, status: val })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione..." />
                </SelectTrigger>
                <SelectContent>
                  {['Disponível', 'Ocupado', 'Manutenção', 'Limpeza'].map((s) => (
                    <SelectItem key={s} value={s}>
                      {s}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label>Ocupação Máx.</Label>
              <Input
                type="number"
                value={formData.max_occupancy || ''}
                onChange={(e) =>
                  setFormData({ ...formData, max_occupancy: Number(e.target.value) })
                }
              />
            </div>
            <div className="space-y-2">
              <Label>Qtd. Camas</Label>
              <Input
                type="number"
                value={formData.bed_count || ''}
                onChange={(e) => setFormData({ ...formData, bed_count: Number(e.target.value) })}
              />
            </div>
            <div className="space-y-2">
              <Label>Diária Base (AOA)</Label>
              <Input
                type="number"
                value={formData.base_rate || ''}
                onChange={(e) => setFormData({ ...formData, base_rate: Number(e.target.value) })}
              />
            </div>
          </div>

          <div className="flex items-center space-x-2 pt-2 pb-2">
            <Switch
              checked={formData.allow_extra_bed || false}
              onCheckedChange={(checked) => setFormData({ ...formData, allow_extra_bed: checked })}
            />
            <Label>Permite Cama Extra?</Label>
          </div>

          <div className="space-y-3">
            <Label>Equipamentos e Comodidades</Label>
            <div className="flex gap-2">
              <Select value={newAppliance} onValueChange={addAppliance}>
                <SelectTrigger className="flex-1">
                  <SelectValue placeholder="Adicionar equipamento..." />
                </SelectTrigger>
                <SelectContent>
                  {APPLIANCE_OPTIONS.filter((a) => !formData.appliances?.includes(a)).map((app) => (
                    <SelectItem key={app} value={app}>
                      {app}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <div className="relative flex-1">
                <Input
                  placeholder="Ou digite outro..."
                  value={newAppliance}
                  onChange={(e) => setNewAppliance(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && addAppliance(newAppliance)}
                />
                <Button
                  size="icon"
                  variant="ghost"
                  className="absolute right-0 top-0 h-full"
                  onClick={() => addAppliance(newAppliance)}
                >
                  <Plus className="w-4 h-4" />
                </Button>
              </div>
            </div>
            <div className="flex flex-wrap gap-2">
              {formData.appliances?.map((app) => (
                <Badge key={app} variant="secondary" className="flex items-center gap-1 px-2 py-1">
                  {app}
                  <X
                    className="w-3 h-3 cursor-pointer hover:text-rose-500"
                    onClick={() => removeAppliance(app)}
                  />
                </Badge>
              ))}
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button onClick={handleSubmit}>Salvar Quarto</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
