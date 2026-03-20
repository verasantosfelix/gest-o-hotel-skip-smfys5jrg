import { useState, useEffect } from 'react'
import { getProtocols, updateProtocol, SecurityProtocol } from '@/services/security'
import { useRealtime } from '@/hooks/use-realtime'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { Badge } from '@/components/ui/badge'
import { AlertTriangle } from 'lucide-react'
import { toast } from '@/components/ui/use-toast'

export function EmergencyProtocols() {
  const [protocols, setProtocols] = useState<SecurityProtocol[]>([])

  const loadData = async () => {
    try {
      setProtocols(await getProtocols())
    } catch (e) {
      console.error(e)
    }
  }

  useEffect(() => {
    loadData()
  }, [])
  useRealtime('security_protocols', loadData)

  const handleActivate = async (p: SecurityProtocol) => {
    try {
      await updateProtocol(p.id, { is_active: !p.is_active })
      toast({
        title: p.is_active ? 'Protocolo Desativado' : 'Protocolo ATIVADO!',
        variant: p.is_active ? 'default' : 'destructive',
        description: `O protocolo ${p.name} foi ${p.is_active ? 'encerrado' : 'acionado'}.`,
      })
    } catch (e) {
      console.error(e)
    }
  }

  const toggleStep = async (p: SecurityProtocol, stepId: number) => {
    try {
      const newSteps = p.steps.map((s) => (s.id === stepId ? { ...s, done: !s.done } : s))
      await updateProtocol(p.id, { steps: newSteps })
    } catch (e) {
      console.error(e)
    }
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {protocols.map((p) => (
        <Card
          key={p.id}
          className={`border transition-all ${p.is_active ? 'border-rose-500 shadow-rose-200/50 shadow-lg' : 'border-slate-200'}`}
        >
          <CardHeader className={`${p.is_active ? 'bg-rose-50' : 'bg-slate-50'} border-b pb-4`}>
            <div className="flex justify-between items-start">
              <CardTitle className="text-base font-bold leading-tight">{p.name}</CardTitle>
              {p.is_active && <AlertTriangle className="w-5 h-5 text-rose-600 animate-pulse" />}
            </div>
            <Badge variant={p.is_active ? 'destructive' : 'outline'} className="mt-2 w-fit">
              {p.is_active ? 'EM ANDAMENTO' : 'Inativo'}
            </Badge>
          </CardHeader>
          <CardContent className="p-4 space-y-4">
            <div className="space-y-3">
              <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                Checklist de Ação
              </p>
              {p.steps?.map((step) => (
                <div key={step.id} className="flex items-start gap-3">
                  <Checkbox
                    checked={step.done}
                    onCheckedChange={() => toggleStep(p, step.id)}
                    disabled={!p.is_active}
                    className="mt-0.5"
                  />
                  <span
                    className={`text-sm ${step.done ? 'text-slate-400 line-through' : 'text-slate-700'}`}
                  >
                    {step.task}
                  </span>
                </div>
              ))}
            </div>
            <div className="pt-4 border-t">
              <Button
                variant={p.is_active ? 'outline' : 'destructive'}
                className="w-full font-bold"
                onClick={() => handleActivate(p)}
              >
                {p.is_active ? 'Desativar / Concluir' : 'ATIVAR PROTOCOLO'}
              </Button>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
