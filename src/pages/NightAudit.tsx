import { useState } from 'react'
import { MoonStar, CheckSquare, AlertTriangle, PlayCircle } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { completeNightAudit } from '@/services/custom'

export default function NightAudit() {
  const [step, setStep] = useState(1)
  const [logs, setLogs] = useState<string[]>([])

  const nextStep = () => setStep((s) => s + 1)

  const handleFinalize = async () => {
    try {
      const res = await completeNightAudit()
      setLogs((p) => [...p, res.status + ': ' + res.details])
      setStep(4)
    } catch (e) {
      setLogs((p) => [...p, 'Erro ao conectar ao motor de auditoria.'])
    }
  }

  return (
    <div className="space-y-6 animate-fade-in pb-8 max-w-3xl mx-auto">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900 flex items-center gap-2">
          <MoonStar className="w-6 h-6 text-primary" /> Auditoria Noturna
        </h1>
        <p className="text-muted-foreground text-sm">
          Assistente de fechamento de caixa e virada de diária.
        </p>
      </div>

      <Card className="shadow-sm border-slate-200">
        <CardHeader>
          <CardTitle>Wizard de Fechamento</CardTitle>
          <CardDescription>Passo {Math.min(step, 3)} de 3</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {step === 1 && (
            <div className="space-y-4">
              <h3 className="font-bold text-slate-800">1. Revisar Lançamentos Diários</h3>
              <div className="p-4 bg-slate-50 border rounded text-sm text-slate-600">
                Lançamentos processados: 45. <br />
                <span className="text-amber-600 flex items-center gap-1 mt-2">
                  <AlertTriangle className="w-4 h-4" /> 1 lançamento suspeito no Quarto 204
                  (Verificado)
                </span>
              </div>
              <Button onClick={nextStep} className="w-full">
                Confirmar Lançamentos
              </Button>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-4">
              <h3 className="font-bold text-slate-800">2. Reconciliação (Receita vs Pagamentos)</h3>
              <div className="p-4 bg-slate-50 border rounded text-sm text-slate-600 space-y-1 font-mono">
                <p>Receita Total Lançada: R$ 12.450,00</p>
                <p>Pagamentos Recebidos: R$ 12.450,00</p>
                <p className="text-emerald-600 font-bold mt-2">Diferença: R$ 0,00 (Caixa Batido)</p>
              </div>
              <Button onClick={nextStep} className="w-full">
                Validar Receitas
              </Button>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-4">
              <h3 className="font-bold text-slate-800">3. Concluir e Rolar Data (Night Audit)</h3>
              <p className="text-sm text-slate-500">
                Ao finalizar, o sistema bloqueará edições de dias anteriores e cobrará as novas
                diárias ativas.
              </p>
              <Button onClick={handleFinalize} className="w-full bg-slate-900 text-white gap-2">
                <PlayCircle className="w-5 h-5" /> Processar Night Audit
              </Button>
            </div>
          )}

          {step === 4 && (
            <div className="space-y-4">
              <div className="p-4 bg-emerald-50 border border-emerald-200 rounded text-emerald-800 flex items-center gap-2 font-bold">
                <CheckSquare className="w-5 h-5" /> Auditoria Noturna Concluída com Sucesso.
              </div>
              <pre className="text-xs bg-slate-900 text-emerald-400 p-4 rounded overflow-auto">
                {logs.join('\n')}
              </pre>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
