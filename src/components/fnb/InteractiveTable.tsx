import { useState, useRef, useEffect } from 'react'
import { FBTable } from '@/services/fnb'
import { cn } from '@/lib/utils'
import { RotateCw, GripHorizontal, Trash2 } from 'lucide-react'

interface InteractiveTableProps {
  table: FBTable
  isEditMode: boolean
  scale: number
  snapToGrid: boolean
  onUpdate: (id: string, updates: Partial<FBTable>) => void
  onDelete: (id: string) => void
  onClick: (table: FBTable) => void
}

const statusStyles = {
  free: 'bg-emerald-50 border-emerald-400 text-emerald-800 shadow-emerald-100',
  occupied: 'bg-rose-50 border-rose-400 text-rose-800 shadow-rose-100',
  reserved: 'bg-orange-50 border-orange-400 text-orange-800 shadow-orange-100',
}

export function InteractiveTable({
  table,
  isEditMode,
  scale,
  snapToGrid,
  onUpdate,
  onDelete,
  onClick,
}: InteractiveTableProps) {
  const [pos, setPos] = useState({ x: table.pos_x ?? 50, y: table.pos_y ?? 50 })
  const [size, setSize] = useState({ w: table.width ?? 80, h: table.height ?? 80 })
  const [rot, setRot] = useState(table.rotation ?? 0)

  const elementRef = useRef<HTMLDivElement>(null)
  const isInteracting = useRef(false)
  const stateRef = useRef({ pos, size, rot })

  useEffect(() => {
    if (!isInteracting.current) {
      setPos({ x: table.pos_x ?? 50, y: table.pos_y ?? 50 })
      setSize({ w: table.width ?? 80, h: table.height ?? 80 })
      setRot(table.rotation ?? 0)
      stateRef.current = {
        pos: { x: table.pos_x ?? 50, y: table.pos_y ?? 50 },
        size: { w: table.width ?? 80, h: table.height ?? 80 },
        rot: table.rotation ?? 0,
      }
    }
  }, [table.pos_x, table.pos_y, table.width, table.height, table.rotation])

  const handlePointerDown = (
    e: React.PointerEvent<HTMLDivElement>,
    action: 'move' | 'resize' | 'rotate',
  ) => {
    if (!isEditMode) {
      if (action === 'move') onClick(table)
      return
    }

    e.stopPropagation()
    e.preventDefault()
    isInteracting.current = true

    const startX = e.clientX
    const startY = e.clientY
    const startPos = { ...stateRef.current.pos }
    const startSize = { ...stateRef.current.size }
    const startRot = stateRef.current.rot

    const rect = elementRef.current?.getBoundingClientRect()
    const centerX = rect ? rect.left + rect.width / 2 : 0
    const centerY = rect ? rect.top + rect.height / 2 : 0

    const handlePointerMove = (moveEvent: PointerEvent) => {
      moveEvent.preventDefault()

      const dx = (moveEvent.clientX - startX) / scale
      const dy = (moveEvent.clientY - startY) / scale

      if (action === 'move') {
        let newX = startPos.x + dx
        let newY = startPos.y + dy
        if (snapToGrid) {
          newX = Math.round(newX / 20) * 20
          newY = Math.round(newY / 20) * 20
        }
        setPos({ x: newX, y: newY })
        stateRef.current.pos = { x: newX, y: newY }
      } else if (action === 'resize') {
        const rad = -startRot * (Math.PI / 180)
        const localDx = dx * Math.cos(rad) - dy * Math.sin(rad)
        const localDy = dx * Math.sin(rad) + dy * Math.cos(rad)

        let newW = Math.max(40, startSize.w + localDx)
        let newH = Math.max(40, startSize.h + localDy)
        if (snapToGrid) {
          newW = Math.round(newW / 20) * 20
          newH = Math.round(newH / 20) * 20
        }
        setSize({ w: newW, h: newH })
        stateRef.current.size = { w: newW, h: newH }
      } else if (action === 'rotate') {
        const angle =
          Math.atan2(moveEvent.clientY - centerY, moveEvent.clientX - centerX) * (180 / Math.PI)
        let newRot = angle + 90
        if (snapToGrid) {
          newRot = Math.round(newRot / 15) * 15
        }
        setRot(newRot)
        stateRef.current.rot = newRot
      }
    }

    const handlePointerUp = () => {
      window.removeEventListener('pointermove', handlePointerMove)
      window.removeEventListener('pointerup', handlePointerUp)

      onUpdate(table.id, {
        pos_x: Math.round(stateRef.current.pos.x),
        pos_y: Math.round(stateRef.current.pos.y),
        width: Math.round(stateRef.current.size.w),
        height: Math.round(stateRef.current.size.h),
        rotation: Math.round(stateRef.current.rot),
      })

      setTimeout(() => {
        isInteracting.current = false
      }, 100)
    }

    window.addEventListener('pointermove', handlePointerMove, { passive: false })
    window.addEventListener('pointerup', handlePointerUp)
  }

  return (
    <div
      ref={elementRef}
      onPointerDown={(e) => handlePointerDown(e, 'move')}
      style={{
        position: 'absolute',
        left: pos.x,
        top: pos.y,
        width: size.w,
        height: size.h,
        transform: `rotate(${rot}deg)`,
        touchAction: 'none',
      }}
      className={cn(
        'border-2 flex flex-col items-center justify-center rounded-lg shadow-sm transition-all duration-100 ease-linear select-none',
        statusStyles[table.status],
        isEditMode
          ? 'cursor-move ring-offset-2 hover:ring-2 ring-slate-300 z-20'
          : 'cursor-pointer hover:-translate-y-1 hover:shadow-md z-20',
      )}
    >
      <span className="font-black text-xl leading-none">{table.table_number.replace('T', '')}</span>
      <span className="text-xs font-medium opacity-80 mt-1">{table.capacity} Pax</span>

      {isEditMode && (
        <>
          <div
            className="absolute -top-8 left-1/2 -translate-x-1/2 flex flex-col items-center cursor-alias z-10"
            onPointerDown={(e) => handlePointerDown(e, 'rotate')}
          >
            <div className="w-7 h-7 bg-slate-800 text-white rounded-full flex items-center justify-center shadow-lg hover:scale-110 transition-transform">
              <RotateCw className="w-3.5 h-3.5" />
            </div>
            <div className="w-[2px] h-3 bg-slate-800" />
          </div>

          <div
            className="absolute -bottom-3 -right-3 w-6 h-6 bg-white border-2 border-slate-800 rounded flex items-center justify-center cursor-se-resize shadow-md hover:scale-110 transition-transform z-10"
            onPointerDown={(e) => handlePointerDown(e, 'resize')}
          >
            <GripHorizontal className="w-3 h-3 text-slate-800 -rotate-45" />
          </div>

          <div
            className="absolute -top-3 -left-3 w-6 h-6 bg-rose-500 text-white rounded-full flex items-center justify-center cursor-pointer shadow-md hover:scale-110 z-10"
            onPointerDown={(e) => {
              e.stopPropagation()
              onDelete(table.id)
            }}
          >
            <Trash2 className="w-3 h-3" />
          </div>
        </>
      )}
    </div>
  )
}
