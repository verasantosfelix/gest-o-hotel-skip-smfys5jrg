import { useState, useRef, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Send, AlertTriangle } from 'lucide-react'
import { cn } from '@/lib/utils'

type Field = 'nome' | 'checkin' | 'checkout' | 'tipo_quarto' | 'numero_hospedes' | 'contato'
type Step = 'IDLE' | 'COLLECTING' | 'CONFIRMING'
type Msg =
  | { role: 'user' | 'assistant'; text: string }
  | { role: 'system'; type: 'error'; errType: string; text: string }
  | { role: 'system'; type: 'output'; data: Record<string, any> }

const FIELDS: Field[] = ['nome', 'checkin', 'checkout', 'tipo_quarto', 'numero_hospedes', 'contato']
const PROMPTS: Record<Field, string> = {
  nome: 'Qual o nome do hóspede?',
  checkin: 'Data de check-in (ex: 10/10/2024):',
  checkout: 'Data de check-out (ex: 15/10/2024):',
  tipo_quarto: 'Tipo de quarto (Standard, Luxo, Suite):',
  numero_hospedes: 'Número de hóspedes:',
  contato: 'Telefone ou e-mail de contato:',
}

export function ReservationAssistant() {
  const [messages, setMessages] = useState<Msg[]>([
    {
      role: 'assistant',
      text: 'Assistente Operacional. Digite "nova reserva", "disponibilidade", "alterar" ou "cancelar".',
    },
  ])
  const [input, setInput] = useState('')
  const [step, setStep] = useState<Step>('IDLE')
  const [draft, setDraft] = useState<Partial<Record<Field, string>>>({})
  const scrollRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight
  }, [messages])

  const parseDate = (s: string) => {
    const p = s.split('/')
    return p.length === 3 ? new Date(+p[2], +p[1] - 1, +p[0]) : new Date(s)
  }

  const handleSend = () => {
    if (!input.trim()) return
    const userTxt = input.trim()
    const mTxt = userTxt.toLowerCase()
    setMessages((m) => [...m, { role: 'user', text: userTxt }])
    setInput('')

    if (step === 'IDLE') {
      if (mTxt.includes('reservar') || mTxt.includes('nova reserva')) {
        setStep('COLLECTING')
        setMessages((m) => [
          ...m,
          { role: 'assistant', text: `Iniciando reserva. ${PROMPTS.nome}` },
        ])
      } else if (mTxt.includes('disponibilidade') || mTxt.includes('disponíveis')) {
        setMessages((m) => [
          ...m,
          {
            role: 'system',
            type: 'output',
            data: {
              resumo: 'Disponibilidade verificada.',
              status: 'Sucesso',
              quartos_livres: '4 Standard, 2 Luxo, 1 Suite',
            },
          },
        ])
      } else {
        setMessages((m) => [
          ...m,
          { role: 'assistant', text: 'Comando não reconhecido. Tente "nova reserva".' },
        ])
      }
    } else if (step === 'COLLECTING') {
      const missing = FIELDS.find((f) => !draft[f])
      if (!missing) return

      if (!userTxt) {
        setMessages((m) => [
          ...m,
          {
            role: 'system',
            type: 'error',
            errType: 'faltam-dados',
            text: 'Dado obrigatório não preenchido.',
          },
          { role: 'assistant', text: PROMPTS[missing] },
        ])
        return
      }

      if (missing === 'checkout') {
        const d1 = parseDate(draft.checkin!)
        const d2 = parseDate(userTxt)
        if (!isNaN(d1.getTime()) && !isNaN(d2.getTime()) && d2 <= d1) {
          setMessages((m) => [
            ...m,
            {
              role: 'system',
              type: 'error',
              errType: 'datas-invalidas',
              text: 'A data de checkout deve ser posterior ao check-in.',
            },
            { role: 'assistant', text: PROMPTS.checkout },
          ])
          return
        }
      } else if (missing === 'numero_hospedes') {
        const num = parseInt(userTxt, 10)
        if (isNaN(num) || num <= 0) {
          setMessages((m) => [
            ...m,
            {
              role: 'system',
              type: 'error',
              errType: 'hospedes-invalidos',
              text: 'Número de hóspedes deve ser maior que 0.',
            },
            { role: 'assistant', text: PROMPTS.numero_hospedes },
          ])
          return
        }
      }

      const newDraft = { ...draft, [missing]: userTxt }
      setDraft(newDraft)
      const nextMissing = FIELDS.find((f) => !newDraft[f])

      if (nextMissing) {
        setMessages((m) => [...m, { role: 'assistant', text: PROMPTS[nextMissing] }])
      } else {
        setStep('CONFIRMING')
        setMessages((m) => [
          ...m,
          {
            role: 'assistant',
            text: `Confirma a reserva de ${newDraft.nome}, de ${newDraft.checkin} a ${newDraft.checkout}, quarto ${newDraft.tipo_quarto}, para ${newDraft.numero_hospedes} hóspedes? (sim/não)`,
          },
        ])
      }
    } else if (step === 'CONFIRMING') {
      if (['sim', 'confirmar', 'ok'].includes(mTxt)) {
        setMessages((m) => [
          ...m,
          {
            role: 'system',
            type: 'output',
            data: {
              resumo: 'Reserva registrada e confirmada com sucesso.',
              dados: {
                reserva_id: `RES-${Math.floor(Math.random() * 10000)}`,
                nome: draft.nome,
                datas: `${draft.checkin} a ${draft.checkout}`,
                tipo_quarto: draft.tipo_quarto,
                hospedes: draft.numero_hospedes,
                status: 'Confirmada',
              },
              perguntas: 'Deseja enviar o voucher por e-mail?',
              passos: 'Preparar quarto e aguardar chegada.',
            },
          },
        ])
      } else {
        setMessages((m) => [...m, { role: 'assistant', text: 'Operação cancelada.' }])
      }
      setStep('IDLE')
      setDraft({})
    }
  }

  return (
    <div className="flex flex-col h-[400px] w-full">
      <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-4 bg-muted/20">
        {messages.map((m, i) => (
          <div
            key={i}
            className={cn('flex flex-col', m.role === 'user' ? 'items-end' : 'items-start')}
          >
            {m.role === 'user' && (
              <div className="bg-primary text-primary-foreground px-3 py-2 rounded-lg max-w-[85%] text-sm">
                {m.text}
              </div>
            )}
            {m.role === 'assistant' && (
              <div className="bg-background border px-3 py-2 rounded-lg max-w-[85%] text-sm shadow-sm">
                {m.text}
              </div>
            )}
            {m.role === 'system' && m.type === 'error' && (
              <div className="bg-destructive/10 text-destructive p-3 rounded-md border border-destructive/20 max-w-[90%] text-xs font-mono w-full">
                <div className="flex items-center gap-2 font-bold mb-1">
                  <AlertTriangle className="h-4 w-4" />
                  <span>&lt;erro tipo="{m.errType}"&gt;</span>
                </div>
                <p className="pl-6">{m.text}</p>
                <span className="font-bold">&lt;/erro&gt;</span>
              </div>
            )}
            {m.role === 'system' && m.type === 'output' && (
              <div className="bg-slate-900 text-slate-50 p-4 rounded-md font-mono text-xs w-full max-w-[95%] shadow-inner overflow-x-auto">
                <span className="text-accent">&lt;OUTPUT&gt;</span>
                <div className="pl-4 mt-2 space-y-2 opacity-90">
                  <p>
                    <span className="text-blue-400">&lt;resumo&gt;</span> {m.data.resumo}{' '}
                    <span className="text-blue-400">&lt;/resumo&gt;</span>
                  </p>
                  {m.data.dados && (
                    <div>
                      <span className="text-blue-400">&lt;dados&gt;</span>
                      <div className="pl-4 text-emerald-400 flex flex-col gap-0.5 mt-1">
                        {Object.entries(m.data.dados).map(([k, v]) => (
                          <span key={k}>
                            &lt;{k}&gt;{String(v)}&lt;/{k}&gt;
                          </span>
                        ))}
                      </div>
                      <span className="text-blue-400">&lt;/dados&gt;</span>
                    </div>
                  )}
                  {m.data.quartos_livres && (
                    <p className="text-emerald-400">
                      &lt;quartos_livres&gt;{m.data.quartos_livres}&lt;/quartos_livres&gt;
                    </p>
                  )}
                  {m.data.perguntas && (
                    <p>
                      <span className="text-accent">&lt;perguntas&gt;</span> {m.data.perguntas}{' '}
                      <span className="text-accent">&lt;/perguntas&gt;</span>
                    </p>
                  )}
                  {m.data.passos && (
                    <p>
                      <span className="text-accent">&lt;proximos-passos&gt;</span> {m.data.passos}{' '}
                      <span className="text-accent">&lt;/proximos-passos&gt;</span>
                    </p>
                  )}
                </div>
                <span className="text-accent mt-2 block">&lt;/OUTPUT&gt;</span>
              </div>
            )}
          </div>
        ))}
      </div>
      <div className="p-3 border-t bg-background flex gap-2">
        <Input
          placeholder="Digite seu comando..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSend()}
          className="flex-1 font-mono text-sm"
        />
        <Button onClick={handleSend} size="icon">
          <Send className="h-4 w-4" />
        </Button>
      </div>
    </div>
  )
}
