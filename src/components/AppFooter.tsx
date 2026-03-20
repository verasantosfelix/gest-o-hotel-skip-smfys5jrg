import { LockKeyhole } from 'lucide-react'
import { useState, useEffect } from 'react'

export function AppFooter() {
  const [time, setTime] = useState(new Date())

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000)
    return () => clearInterval(timer)
  }, [])

  return (
    <footer className="h-8 border-t bg-muted/30 flex items-center justify-between px-4 text-xs text-muted-foreground">
      <div className="flex items-center gap-2">
        <LockKeyhole className="h-3 w-3 text-accent" />
        <span>Conexão Segura</span>
      </div>
      <div>v0.0.1 (a4d12b3)</div>
      <div className="font-mono">{time.toLocaleTimeString('pt-BR')}</div>
    </footer>
  )
}
