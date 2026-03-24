import { useState, useRef } from 'react'
import { FBTable, FBLayoutElement } from '@/services/fnb'
import { InteractiveTable } from './InteractiveTable'
import { InteractiveElement } from './InteractiveElement'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
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
  onAddElement: (type: string, x?: number, y?: number) => void
  onAddTable: (x?: number, y?: number) => void
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
  const [snapToGrid, setSnapToGrid] = useState(true)
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
    <div className="space-y-4 animate-fade-in-up flex flex-col h-full">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between bg-slate-50 p-4 rounded-lg border border-slate-200 shadow-sm gap-4">
        <div className="flex items-center gap-3 text-sm text-slate-600">
          <div className="bg-white p-2 rounded-full shadow-sm border border-slate-200">
            <Info className="w-4 h-4 text-blue-600" />
          </div>
          <p>
            {isEditMode
              ? 'Modo de Edição. Arraste ferramentas da barra lateral para o mapa para adicionar elementos.'
              : 'Modo de Serviço. Arraste o fundo para mover, scroll para Zoom. Clique numa mesa para operar.'}
          </p>
        </div>
        {canEdit && (
          <div className="flex items-center gap-4 ml-auto">
            {isEditMode && (
              <div className="flex items-center space-x-2 bg-white px-3 py-2 rounded-md border border-slate-200 shadow-sm">
                <Switch id="snap-mode" checked={snapToGrid} onCheckedChange={setSnapToGrid} />
                <Label htmlFor="snap-mode" className="font-bold cursor-pointer text-slate-800">
                  Snap to Grid
                </Label>
              </div>
            )}
            <div className="flex items-center space-x-3 bg-white px-4 py-2 rounded-md border border-slate-200 shadow-sm">
              <Switch id="edit-mode" checked={isEditMode} onCheckedChange={setIsEditMode} />
              <Label htmlFor="edit-mode" className="font-bold cursor-pointer text-slate-800">
                {isEditMode ? 'Modo de Edição' : 'Modo de Serviço'}
              </Label>
            </div>
          </div>
        )}
      </div>

      <div className="flex flex-col md:flex-row gap-4 h-[65vh]">
        {isEditMode && (
          <div className="w-full md:w-48 shrink-0 bg-white border border-slate-200 rounded-xl shadow-sm p-4 flex flex-col gap-3 overflow-y-auto">
            <div>
              <h4 className="text-xs font-bold text-slate-500 uppercase">Ferramentas</h4>
              <p className="text-[10px] text-slate-400 mb-2 leading-tight">
                Arraste para o mapa para adicionar.
              </p>
            </div>

            <ToolbarItem
              type="table"
              icon={<PlusCircle className="w-4 h-4 text-blue-600" />}
              label="Nova Mesa"
            />
            <div className="w-full h-px bg-slate-100 my-1" />
            <ToolbarItem
              type="wall"
              icon={<Baseline className="w-4 h-4 text-slate-700" />}
              label="Parede"
            />
            <ToolbarItem
              type="column"
              icon={<Circle className="w-4 h-4 text-slate-700" />}
              label="Coluna"
            />
            <ToolbarItem
              type="counter"
              icon={<Square className="w-4 h-4 text-slate-700" />}
              label="Balcão / Bar"
            />
            <ToolbarItem
              type="door"
              icon={<DoorOpen className="w-4 h-4 text-slate-700" />}
              label="Porta / Saída"
            />
          </div>
        )}

        <div className="flex-1 overflow-hidden border-2 border-slate-200 rounded-xl bg-slate-100 shadow-inner relative select-none touch-none">
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
            onDragOver={(e) => {
              e.preventDefault()
              e.dataTransfer.dropEffect = 'copy'
            }}
            onDrop={(e) => {
              e.preventDefault()
              const type = e.dataTransfer.getData('element_type')
              if (!type) return

              const rect = e.currentTarget.getBoundingClientRect()
              const dropX = (e.clientX - rect.left) / view.scale
              const dropY = (e.clientY - rect.top) / view.scale

              if (type === 'table') onAddTable(dropX, dropY)
              else onAddElement(type, dropX, dropY)
            }}
            style={{
              transform: `translate(${view.x}px, ${view.y}px) scale(${view.scale})`,
              transformOrigin: '0 0',
              width: '4000px',
              height: '4000px',
              position: 'absolute',
            }}
            className={cn(
              'bg-[linear-gradient(to_right,#cbd5e1_1px,transparent_1px),linear-gradient(to_bottom,#cbd5e1_1px,transparent_1px)] origin-top-left',
              snapToGrid ? 'bg-[size:20px_20px]' : 'bg-[size:40px_40px]',
              isEditMode ? 'cursor-grab active:cursor-grabbing' : 'cursor-move',
            )}
          >
            {elements.map((el) => (
              <InteractiveElement
                key={el.id}
                element={el}
                isEditMode={isEditMode}
                scale={view.scale}
                snapToGrid={snapToGrid}
                onUpdate={onUpdateElement}
                onDelete={onDeleteElement}
              />
            ))}
            {tables.map((table) => (
              <InteractiveTable
                key={table.id}
                table={table}
                isEditMode={isEditMode}
                scale={view.scale}
                snapToGrid={snapToGrid}
                onUpdate={onUpdateTable}
                onDelete={onDeleteTable}
                onClick={onTableClick}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

function ToolbarItem({
  type,
  icon,
  label,
}: {
  type: string
  icon: React.ReactNode
  label: string
}) {
  return (
    <div
      draggable
      onDragStart={(e) => {
        e.dataTransfer.setData('element_type', type)
        e.dataTransfer.effectAllowed = 'copy'
      }}
      className="flex items-center gap-3 p-2.5 border border-slate-200 rounded-lg cursor-grab active:cursor-grabbing hover:bg-slate-50 hover:border-blue-300 transition-all bg-white shadow-sm hover:shadow-md"
    >
      <div className="bg-slate-100 p-1.5 rounded-md flex items-center justify-center">{icon}</div>
      <span className="text-xs font-bold text-slate-700">{label}</span>
    </div>
  )
}
