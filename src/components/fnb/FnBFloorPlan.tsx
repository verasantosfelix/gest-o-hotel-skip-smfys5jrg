import { useState, useRef } from 'react'
import { FBTable, FBLayoutElement } from '@/services/fnb'
import { InteractiveTable } from './InteractiveTable'
import { InteractiveElement } from './InteractiveElement'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import {
  Info,
  ZoomIn,
  ZoomOut,
  Maximize,
  PlusCircle,
  Square,
  DoorOpen,
  Baseline,
  Circle,
} from 'lucide-react'

interface FnBFloorPlanProps {
  tables: FBTable[]
  elements: FBLayoutElement[]
  onTableClick: (table: FBTable) => void
  canEdit: boolean
  onUpdateTable: (id: string, updates: Partial<FBTable>) => void
  onDeleteTable: (id: string) => void
  onUpdateElement: (id: string, updates: Partial<FBLayoutElement>) => void
  onDeleteElement: (id: string) => void
  onAddElement: (type: string) => void
  onAddTable: () => void
}

export function FnBFloorPlan({
  tables,
  elements,
  onTableClick,
  canEdit,
  onUpdateTable,
  onDeleteTable,
  onUpdateElement,
  onDeleteElement,
  onAddElement,
  onAddTable,
}: FnBFloorPlanProps) {
  const [isEditMode, setIsEditMode] = useState(false)
  const [view, setView] = useState({ x: 0, y: 0, scale: 1 })
  const isPanning = useRef(false)
  const startPan = useRef({ x: 0, y: 0 })

  const handleCanvasPointerDown = (e: React.PointerEvent) => {
    if (e.target instanceof HTMLElement && e.target.id !== 'canvas-bg') return
    isPanning.current = true
    startPan.current = { x: e.clientX - view.x, y: e.clientY - view.y }
    e.currentTarget.setPointerCapture(e.pointerId)
  }
  const handleCanvasPointerMove = (e: React.PointerEvent) => {
    if (isPanning.current) {
      setView((v) => ({
        ...v,
        x: e.clientX - startPan.current.x,
        y: e.clientY - startPan.current.y,
      }))
    }
  }
  const handleCanvasPointerUp = (e: React.PointerEvent) => {
    isPanning.current = false
    e.currentTarget.releasePointerCapture(e.pointerId)
  }
  const handleCanvasWheel = (e: React.WheelEvent) => {
    const zoomSpeed = 0.002
    const delta = -e.deltaY * zoomSpeed
    setView((v) => ({ ...v, scale: Math.max(0.2, Math.min(v.scale + delta, 3)) }))
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
              : 'Arraste o fundo para mover, use scroll para Zoom. Clique numa mesa para abrir o serviço.'}
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

      {isEditMode && (
        <div className="flex gap-2 p-2 bg-white border border-slate-200 rounded-lg shadow-sm overflow-x-auto items-center">
          <span className="text-xs font-bold text-slate-500 uppercase mr-2 ml-2">Adicionar:</span>
          <Button
            variant="outline"
            size="sm"
            onClick={onAddTable}
            className="border-blue-200 bg-blue-50 text-blue-700 hover:bg-blue-100 hover:text-blue-800"
          >
            <PlusCircle className="w-4 h-4 mr-1" /> Mesa
          </Button>
          <div className="w-px h-6 bg-slate-200 mx-1" />
          <Button variant="ghost" size="sm" onClick={() => onAddElement('wall')}>
            <Baseline className="w-4 h-4 mr-1" /> Parede
          </Button>
          <Button variant="ghost" size="sm" onClick={() => onAddElement('column')}>
            <Circle className="w-4 h-4 mr-1" /> Coluna
          </Button>
          <Button variant="ghost" size="sm" onClick={() => onAddElement('counter')}>
            <Square className="w-4 h-4 mr-1" /> Balcão
          </Button>
          <Button variant="ghost" size="sm" onClick={() => onAddElement('door')}>
            <DoorOpen className="w-4 h-4 mr-1" /> Porta
          </Button>
        </div>
      )}

      <div className="w-full h-[65vh] overflow-hidden border-2 border-slate-200 rounded-xl bg-slate-100 shadow-inner relative touch-none select-none">
        <div className="absolute bottom-4 right-4 bg-white/90 backdrop-blur-sm shadow-md rounded-md border border-slate-200 flex items-center p-1 gap-1 z-30">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setView((v) => ({ ...v, scale: Math.min(v.scale + 0.2, 3) }))}
          >
            <ZoomIn className="w-4 h-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setView((v) => ({ ...v, scale: Math.max(v.scale - 0.2, 0.2) }))}
          >
            <ZoomOut className="w-4 h-4" />
          </Button>
          <div className="w-px h-6 bg-slate-200 mx-1" />
          <Button variant="ghost" size="icon" onClick={() => setView({ x: 0, y: 0, scale: 1 })}>
            <Maximize className="w-4 h-4" />
          </Button>
        </div>

        <div
          id="canvas-bg"
          onPointerDown={handleCanvasPointerDown}
          onPointerMove={handleCanvasPointerMove}
          onPointerUp={handleCanvasPointerUp}
          onPointerLeave={handleCanvasPointerUp}
          onWheel={handleCanvasWheel}
          style={{
            transform: `translate(${view.x}px, ${view.y}px) scale(${view.scale})`,
            transformOrigin: '0 0',
            width: '4000px',
            height: '4000px',
            position: 'absolute',
          }}
          className="bg-[linear-gradient(to_right,#cbd5e1_1px,transparent_1px),linear-gradient(to_bottom,#cbd5e1_1px,transparent_1px)] bg-[size:40px_40px] cursor-grab active:cursor-grabbing origin-top-left"
        >
          {elements.map((el) => (
            <InteractiveElement
              key={el.id}
              element={el}
              isEditMode={isEditMode}
              onUpdate={onUpdateElement}
              onDelete={onDeleteElement}
            />
          ))}
          {tables.map((table) => (
            <InteractiveTable
              key={table.id}
              table={table}
              isEditMode={isEditMode}
              onUpdate={onUpdateTable}
              onDelete={onDeleteTable}
              onClick={onTableClick}
            />
          ))}
        </div>
      </div>
    </div>
  )
}
