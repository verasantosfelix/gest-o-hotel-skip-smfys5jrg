import { useState, useRef, useEffect } from 'react'
import { FBLayoutElement } from '@/services/fnb'
import { RotateCw, GripHorizontal, Trash2 } from 'lucide-react'
import { cn } from '@/lib/utils'

interface InteractiveElementProps {
  element: FBLayoutElement
  isEditMode: boolean
  scale: number
  snapToGrid: boolean
  onUpdate: (id: string, updates: Partial<FBLayoutElement>) => void
  onDelete: (id: string) => void
}

export function InteractiveElement({
  element,
  isEditMode,
  scale,
  snapToGrid,
  onUpdate,
  onDelete,
}: InteractiveElementProps) {
  const [pos, setPos] = useState({ x: element.pos_x ?? 50, y: element.pos_y ?? 50 })
  const [size, setSize] = useState({ w: element.width ?? 80, h: element.height ?? 80 })
  const [rot, setRot] = useState(element.rotation ?? 0)

  const elementRef = useRef<HTMLDivElement>(null)
  const isInteracting = useRef(false)
  const stateRef = useRef({ pos, size, rot })

  useEffect(() => {
    if (!isInteracting.current) {
      setPos({ x: element.pos_x ?? 50, y: element.pos_y ?? 50 })
      setSize({ w: element.width ?? 80, h: element.height ?? 80 })
      setRot(element.rotation ?? 0)
      stateRef.current = {
        pos: { x: element.pos_x ?? 50, y: element.pos_y ?? 50 },
        size: { w: element.width ?? 80, h: element.height ?? 80 },
        rot: element.rotation ?? 0,
      }
    }
  }, [element.pos_x, element.pos_y, element.width, element.height, element.rotation])

  const handlePointerDown = (
    e: React.PointerEvent<HTMLDivElement>,
    action: 'move' | 'resize' | 'rotate',
  ) => {
    if (!isEditMode) return

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

        let newW = Math.max(20, startSize.w + localDx)
        let newH = Math.max(20, startSize.h + localDy)
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

      onUpdate(element.id, {
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

  let customStyle = ''
  switch (element.type) {
    case 'wall':
      customStyle = 'bg-slate-700 border-slate-900'
      break
    case 'column':
      customStyle = 'bg-slate-400 rounded-full border-2 border-slate-500'
      break
    case 'counter':
      customStyle = 'bg-slate-200 border-2 border-slate-400 rounded'
      break
    case 'door':
      customStyle = 'bg-transparent border-4 border-dashed border-slate-400'
      break
    case 'window':
      customStyle = 'bg-blue-100 border-2 border-blue-300 rounded-sm opacity-70'
      break
    case 'staircase':
      customStyle =
        'bg-[repeating-linear-gradient(45deg,transparent,transparent_10px,#cbd5e1_10px,#cbd5e1_20px)] border-2 border-slate-400'
      break
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
        'flex items-center justify-center select-none shadow-sm',
        customStyle,
        isEditMode
          ? 'cursor-move ring-offset-2 hover:ring-2 ring-blue-400'
          : 'pointer-events-none opacity-90',
      )}
    >
      {element.label && (
        <span className="text-xs font-bold text-slate-800 bg-white/70 px-1.5 py-0.5 rounded truncate pointer-events-none">
          {element.label}
        </span>
      )}

      {isEditMode && (
        <>
          <div
            className="absolute -top-8 left-1/2 -translate-x-1/2 flex flex-col items-center cursor-alias z-10"
            onPointerDown={(e) => handlePointerDown(e, 'rotate')}
          >
            <div className="w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center shadow-lg hover:scale-110 transition-transform">
              <RotateCw className="w-3 h-3" />
            </div>
            <div className="w-[2px] h-3 bg-blue-600" />
          </div>

          <div
            className="absolute -bottom-3 -right-3 w-5 h-5 bg-white border-2 border-blue-600 rounded flex items-center justify-center cursor-se-resize shadow-md hover:scale-110 transition-transform z-10"
            onPointerDown={(e) => handlePointerDown(e, 'resize')}
          >
            <GripHorizontal className="w-3 h-3 text-blue-600 -rotate-45" />
          </div>

          <div
            className="absolute -top-3 -right-3 w-5 h-5 bg-rose-500 text-white rounded-full flex items-center justify-center cursor-pointer shadow-md hover:scale-110 z-10"
            onPointerDown={(e) => {
              e.stopPropagation()
              onDelete(element.id)
            }}
          >
            <Trash2 className="w-2.5 h-2.5" />
          </div>
        </>
      )}
    </div>
  )
}
