import { useState } from 'react'
import { FBTable, updateFBTable } from '@/services/fnb'
import { InteractiveTable } from './InteractiveTable'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import { toast } from '@/components/ui/use-toast'
import { Info } from 'lucide-react'

interface FnBFloorPlanProps {
  tables: FBTable[]
  onTableClick: (table: FBTable) => void
  canEdit: boolean
}

export function FnBFloorPlan({ tables, onTableClick, canEdit }: FnBFloorPlanProps) {
  const [isEditMode, setIsEditMode] = useState(false)

  const handleUpdate = async (id: string, updates: Partial<FBTable>) => {
    try {
      await updateFBTable(id, updates)
    } catch (e) {
      console.error(e)
      toast({ title: 'Erro ao salvar layout da mesa', variant: 'destructive' })
    }
  }

  return (
    <div className="space-y-4 animate-fade-in-up">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between bg-slate-50 p-4 rounded-lg border border-slate-200 shadow-sm gap-4">
        <div className="flex items-center gap-3 text-sm text-slate-600">
          <div className="bg-white p-2 rounded-full shadow-sm border border-slate-200">
            <Info className="w-4 h-4 text-blue-600" />
          </div>
          <p>
            {isEditMode
              ? 'Modo de Edição Ativo. Arraste as mesas, use os cantos para redimensionar ou o topo para girar.'
              : 'Modo Operacional. Clique numa mesa para abrir o serviço ou lançamentos.'}
          </p>
        </div>
        {canEdit && (
          <div className="flex items-center space-x-3 bg-white px-4 py-2 rounded-md border border-slate-200 shadow-sm">
            <Switch id="edit-mode" checked={isEditMode} onCheckedChange={setIsEditMode} />
            <Label htmlFor="edit-mode" className="font-bold cursor-pointer text-slate-800">
              Desbloquear Layout
            </Label>
          </div>
        )}
      </div>

      <div className="w-full h-[65vh] overflow-auto border-2 border-slate-200 rounded-xl bg-slate-100 shadow-inner relative cursor-grab active:cursor-grabbing">
        <div
          className="w-[2000px] h-[1500px] relative bg-[linear-gradient(to_right,#cbd5e1_1px,transparent_1px),linear-gradient(to_bottom,#cbd5e1_1px,transparent_1px)] bg-[size:40px_40px] shadow-sm"
          style={{ backgroundColor: '#f8fafc' }}
        >
          {tables.map((table) => (
            <InteractiveTable
              key={table.id}
              table={table}
              isEditMode={isEditMode}
              onUpdate={handleUpdate}
              onClick={onTableClick}
            />
          ))}
        </div>
      </div>
    </div>
  )
}
