import React, { useRef, useState, useImperativeHandle, forwardRef, useEffect } from 'react'
import { cn } from '@/lib/utils'

export interface SignaturePadRef {
  clear: () => void
  toDataURL: () => string | null
  isEmpty: () => boolean
}

export const SignaturePad = forwardRef<SignaturePadRef, React.HTMLAttributes<HTMLCanvasElement>>(
  ({ className, ...props }, ref) => {
    const canvasRef = useRef<HTMLCanvasElement>(null)
    const [isDrawing, setIsDrawing] = useState(false)
    const [empty, setEmpty] = useState(true)

    useImperativeHandle(ref, () => ({
      clear: () => {
        const canvas = canvasRef.current
        if (!canvas) return
        const ctx = canvas.getContext('2d')
        if (!ctx) return
        ctx.clearRect(0, 0, canvas.width, canvas.height)
        setEmpty(true)
      },
      toDataURL: () => {
        if (empty) return null
        return canvasRef.current?.toDataURL('image/png') || null
      },
      isEmpty: () => empty,
    }))

    // Ensure internal resolution matches display size to avoid stretched drawing
    useEffect(() => {
      const canvas = canvasRef.current
      if (canvas) {
        const rect = canvas.getBoundingClientRect()
        canvas.width = rect.width
        canvas.height = rect.height
      }
    }, [])

    const getCoordinates = (
      e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>,
    ) => {
      const canvas = canvasRef.current
      if (!canvas) return { x: 0, y: 0 }
      const rect = canvas.getBoundingClientRect()
      let clientX, clientY

      if ('touches' in e) {
        clientX = e.touches[0].clientX
        clientY = e.touches[0].clientY
      } else {
        clientX = (e as React.MouseEvent).clientX
        clientY = (e as React.MouseEvent).clientY
      }

      return {
        x: clientX - rect.left,
        y: clientY - rect.top,
      }
    }

    const startDrawing = (
      e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>,
    ) => {
      // Prevent scrolling on touch devices
      if (e.cancelable) e.preventDefault()

      const canvas = canvasRef.current
      if (!canvas) return
      const ctx = canvas.getContext('2d')
      if (!ctx) return

      const { x, y } = getCoordinates(e)
      ctx.beginPath()
      ctx.moveTo(x, y)
      ctx.lineWidth = 2.5
      ctx.lineCap = 'round'
      ctx.lineJoin = 'round'
      ctx.strokeStyle = '#0f172a' // slate-900
      setIsDrawing(true)
    }

    const draw = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
      if (e.cancelable) e.preventDefault()
      if (!isDrawing) return

      const canvas = canvasRef.current
      if (!canvas) return
      const ctx = canvas.getContext('2d')
      if (!ctx) return

      const { x, y } = getCoordinates(e)
      ctx.lineTo(x, y)
      ctx.stroke()
      setEmpty(false)
    }

    const stopDrawing = () => {
      setIsDrawing(false)
    }

    return (
      <canvas
        ref={canvasRef}
        onMouseDown={startDrawing}
        onMouseMove={draw}
        onMouseUp={stopDrawing}
        onMouseOut={stopDrawing}
        onTouchStart={startDrawing}
        onTouchMove={draw}
        onTouchEnd={stopDrawing}
        className={cn(
          'border-2 border-slate-300 border-dashed rounded-md bg-white touch-none cursor-crosshair',
          className,
        )}
        {...props}
      />
    )
  },
)
SignaturePad.displayName = 'SignaturePad'
