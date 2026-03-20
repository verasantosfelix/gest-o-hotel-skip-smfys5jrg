import { useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { Label } from '@/components/ui/label'
import { Progress } from '@/components/ui/progress'
import { RoomRecord, updateRoom } from '@/services/rooms'
import { createHousekeepingLog } from '@/services/housekeeping'
import { toast } from '@/components/ui/use-toast'
import pb from '@/lib/pocketbase/client'

const CHECKLISTS = {
  checkout: [
    {
      title: 'Entrada',
      items: [
        'Confirmar liberação',
        'Verificar saída',
        'Abrir janelas',
        'Checar Achados e Perdidos',
      ],
    },
    {
      title: 'Cama e Roupas',
      items: ['Retirar enxoval', 'Checar manchas', 'Separar danificados', 'Fazer cama'],
    },
    {
      title: 'Banheiro',
      items: [
        'Sanitizar superfícies',
        'Trocar toalhas',
        'Repor amenities',
        'Checar vazamentos/odores',
      ],
    },
    {
      title: 'Geral',
      items: ['Aspirar/Varrer', 'Limpar pó', 'Checar Minibar', 'Remover lixo', 'Testar TV/Ar'],
    },
  ],
  stayover: [
    { title: 'Entrada', items: ['Bater/Anunciar', 'Confirmar autorização'] },
    {
      title: 'Limpeza Parcial',
      items: ['Arrumar cama', 'Trocar toalhas usadas', 'Repor amenities', 'Remover lixo'],
    },
    { title: 'Verificação', items: ['Respeitar itens pessoais', 'Checar janelas/portas'] },
    { title: 'Minibar', items: ['Contagem rápida', 'Anotar consumo'] },
  ],
  vip: [
    { title: 'Cama e Roupas', items: ['Retirar enxoval', 'Fazer cama com enxoval premium'] },
    { title: 'Banheiro', items: ['Sanitizar', 'Toalhas Extras', 'Repor Amenities Especiais'] },
    { title: 'Geral', items: ['Limpeza Profunda', 'Aspirar/Varrer'] },
    {
      title: 'Protocolo VIP',
      items: [
        'Menu Travesseiros',
        'Revisão Aroma',
        'Iluminação de Boas Vindas',
        'Brinde no quarto',
      ],
    },
  ],
}

interface ChecklistModalProps {
  room: RoomRecord | null
  onClose: () => void
}

export function ChecklistModal({ room, onClose }: ChecklistModalProps) {
  const [type, setType] = useState<keyof typeof CHECKLISTS>('stayover')
  const [step, setStep] = useState(0)
  const [checked, setChecked] = useState<Record<string, boolean>>({})

  if (!room) return null

  const flow = CHECKLISTS[type]
  const currentGroup = flow[step]

  const totalItems = flow.reduce((acc, g) => acc + g.items.length, 0)
  const checkedCount = Object.values(checked).filter(Boolean).length
  const progress = (checkedCount / totalItems) * 100

  const handleFinish = async () => {
    try {
      await updateRoom(room.id, { status: type === 'checkout' ? 'vago_pronto' : 'ocupado_pronto' })
      await createHousekeepingLog({
        room_id: room.id,
        staff_id: pb.authStore.model?.id,
        type: type,
        status: 'completed',
        checklist_progress: checked,
        completed_at: new Date().toISOString(),
      })
      toast({
        title: 'Limpeza finalizada com sucesso!',
        description: `Quarto ${room.room_number} liberado.`,
      })
      onClose()
    } catch (e) {
      toast({ title: 'Erro ao finalizar', variant: 'destructive' })
    }
  }

  return (
    <Dialog open={!!room} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="sm:max-w-xl">
        <DialogHeader>
          <DialogTitle className="text-xl flex items-center justify-between">
            <span>Limpeza: Quarto {room.room_number}</span>
            <span className="text-sm font-normal text-slate-500">Piso {room.floor}</span>
          </DialogTitle>
          <DialogDescription>
            Siga os passos do protocolo para garantir o padrão de qualidade.
          </DialogDescription>
        </DialogHeader>

        {step === 0 && Object.keys(checked).length === 0 ? (
          <div className="space-y-4 py-4">
            <Label>Selecione o Tipo de Limpeza</Label>
            <div className="grid grid-cols-3 gap-3">
              {(Object.keys(CHECKLISTS) as Array<keyof typeof CHECKLISTS>).map((t) => (
                <Button
                  key={t}
                  variant={type === t ? 'default' : 'outline'}
                  onClick={() => setType(t)}
                  className="capitalize"
                >
                  {t}
                </Button>
              ))}
            </div>
            <Button
              className="w-full mt-4"
              onClick={() => setStep(0) || setChecked({ init: true })}
            >
              Iniciar Fluxo
            </Button>
          </div>
        ) : (
          <div className="space-y-6 py-4">
            <div className="space-y-2">
              <div className="flex justify-between text-sm text-slate-600 font-medium">
                <span>Progresso</span>
                <span>{Math.round(progress)}%</span>
              </div>
              <Progress value={progress} className="h-2" />
            </div>

            <div className="bg-slate-50 p-4 rounded-lg border border-slate-200">
              <h3 className="font-bold text-slate-800 mb-4 text-lg border-b pb-2">
                {currentGroup.title}
              </h3>
              <div className="space-y-3">
                {currentGroup.items.map((item) => (
                  <div
                    key={item}
                    className="flex items-center space-x-3 bg-white p-3 rounded-md border border-slate-100 shadow-sm"
                  >
                    <Checkbox
                      id={item}
                      checked={!!checked[item]}
                      onCheckedChange={(c) => setChecked((p) => ({ ...p, [item]: !!c }))}
                      className="w-5 h-5"
                    />
                    <Label
                      htmlFor={item}
                      className="text-base cursor-pointer flex-1 font-medium text-slate-700"
                    >
                      {item}
                    </Label>
                  </div>
                ))}
              </div>
            </div>

            <DialogFooter className="flex justify-between items-center w-full">
              <Button
                variant="ghost"
                onClick={() => setStep((s) => Math.max(0, s - 1))}
                disabled={step === 0}
              >
                Voltar
              </Button>
              {step < flow.length - 1 ? (
                <Button onClick={() => setStep((s) => s + 1)}>Próxima Etapa</Button>
              ) : (
                <Button
                  onClick={handleFinish}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white"
                >
                  Finalizar Limpeza
                </Button>
              )}
            </DialogFooter>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
