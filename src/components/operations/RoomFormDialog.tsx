import { useEffect, useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Checkbox } from '@/components/ui/checkbox'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { RoomRecord, createRoom, updateRoom } from '@/services/rooms'
import { toast } from '@/components/ui/use-toast'
import { extractFieldErrors, getErrorMessage, type FieldErrors } from '@/lib/pocketbase/errors'

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
  'Micro-ondas',
]

export function RoomFormDialog({ open, onOpenChange, room }: RoomFormDialogProps) {
  const [formData, setFormData] = useState<Partial<RoomRecord>>({})
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({})
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    if (open) {
      if (room) {
        setFormData({ ...room, appliances: room.appliances || [] })
      } else {
        setFormData({
          room_number: '',
          bloco: 'A',
          floor: 0,
          room_type: 'Single',
          status: 'Disponível',
          max_occupancy: 2,
          bed_count: 1,
          allow_extra_bed: false,
          base_rate: 0,
          appliances: [],
        })
      }
      setFieldErrors({})
    }
  }, [open, room])

  const handleSubmit = async () => {
    setFieldErrors({})

    // Client-side basic validation
    const errors: FieldErrors = {}
    if (!formData.room_number?.trim()) {
      errors.room_number = 'O número do quarto é obrigatório.'
    }
    if (!formData.bloco) {
      errors.bloco = 'O bloco é obrigatório.'
    }
    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors)
      return
    }

    setIsSubmitting(true)
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
      const apiErrors = extractFieldErrors(error)
      if (Object.keys(apiErrors).length > 0) {
        setFieldErrors(apiErrors)
        toast({
          title: 'Erro de Validação',
          description: 'Verifique os campos do formulário.',
          variant: 'destructive',
        })
      } else {
        toast({
          title: 'Erro ao salvar quarto',
          description: getErrorMessage(error),
          variant: 'destructive',
        })
      }
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleApplianceToggle = (app: string, checked: boolean) => {
    setFormData((prev) => {
      const current = prev.appliances || []
      if (checked) {
        return { ...prev, appliances: [...current, app] }
      } else {
        return { ...prev, appliances: current.filter((a) => a !== app) }
      }
    })
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{room ? 'Editar Quarto' : 'Novo Quarto'}</DialogTitle>
          <DialogDescription>
            Preencha as informações detalhadas para o inventário de quartos.
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-6 py-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label>Número do Quarto *</Label>
              <Input
                value={formData.room_number || ''}
                onChange={(e) => setFormData({ ...formData, room_number: e.target.value })}
                className={fieldErrors.room_number ? 'border-rose-500' : ''}
              />
              {fieldErrors.room_number && (
                <p className="text-xs text-rose-500">{fieldErrors.room_number}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label>Bloco *</Label>
              <Select
                value={formData.bloco}
                onValueChange={(val: any) => setFormData({ ...formData, bloco: val })}
              >
                <SelectTrigger className={fieldErrors.bloco ? 'border-rose-500' : ''}>
                  <SelectValue placeholder="Selecione..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="A">Bloco A</SelectItem>
                  <SelectItem value="B">Bloco B</SelectItem>
                  <SelectItem value="V">Vivendas (V)</SelectItem>
                </SelectContent>
              </Select>
              {fieldErrors.bloco && <p className="text-xs text-rose-500">{fieldErrors.bloco}</p>}
            </div>
            <div className="space-y-2">
              <Label>Andar</Label>
              <Input
                type="number"
                min="0"
                value={formData.floor ?? ''}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    floor: e.target.value === '' ? 0 : Number(e.target.value),
                  })
                }
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Tipologia *</Label>
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
              <Label>Status Operacional *</Label>
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

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label>Lotação Máxima (Pax)</Label>
              <Input
                type="number"
                min="1"
                value={formData.max_occupancy || ''}
                onChange={(e) =>
                  setFormData({ ...formData, max_occupancy: Number(e.target.value) })
                }
              />
            </div>
            <div className="space-y-2">
              <Label>Número de Camas</Label>
              <Input
                type="number"
                min="1"
                value={formData.bed_count || ''}
                onChange={(e) => setFormData({ ...formData, bed_count: Number(e.target.value) })}
              />
            </div>
            <div className="space-y-2">
              <Label>Tarifa Base (AOA)</Label>
              <Input
                type="number"
                min="0"
                step="0.01"
                value={formData.base_rate || ''}
                onChange={(e) => setFormData({ ...formData, base_rate: Number(e.target.value) })}
              />
            </div>
          </div>

          <div className="flex items-center space-x-2 bg-slate-50 p-3 rounded-md border border-slate-100">
            <Switch
              id="extra-bed"
              checked={formData.allow_extra_bed || false}
              onCheckedChange={(checked) => setFormData({ ...formData, allow_extra_bed: checked })}
            />
            <Label htmlFor="extra-bed" className="cursor-pointer">
              Permite Cama Extra?
            </Label>
          </div>

          <div className="space-y-3 pt-2 border-t">
            <Label className="text-base font-semibold">Eletrodomésticos e Comodidades</Label>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3 bg-slate-50/50 p-4 rounded-lg border border-slate-100">
              {APPLIANCE_OPTIONS.map((app) => (
                <div key={app} className="flex items-center space-x-2">
                  <Checkbox
                    id={`app-${app}`}
                    checked={formData.appliances?.includes(app) || false}
                    onCheckedChange={(checked) => handleApplianceToggle(app, checked as boolean)}
                  />
                  <Label
                    htmlFor={`app-${app}`}
                    className="text-sm font-normal cursor-pointer leading-none"
                  >
                    {app}
                  </Label>
                </div>
              ))}
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isSubmitting}>
            Cancelar
          </Button>
          <Button onClick={handleSubmit} disabled={isSubmitting}>
            {isSubmitting ? 'Salvando...' : 'Salvar Quarto'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
