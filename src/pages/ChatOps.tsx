import { useState, useRef, useEffect } from 'react'
import { Navigate } from 'react-router-dom'
import { Terminal, Send, Bot, User } from 'lucide-react'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
  CardFooter,
} from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { ScrollArea } from '@/components/ui/scroll-area'
import useAuthStore from '@/stores/useAuthStore'

type Message = {
  id: string
  role: 'user' | 'bot'
  text: string
  isXml?: boolean
}

export default function ChatOps() {
  const { userRole } = useAuthStore()
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      role: 'bot',
      text: 'Olá! Sou o assistente ChatOps. Digite seu comando (ex: "executar comando", "abrir ticket via chat", "atualizar estado via chat").',
    },
  ])
  const [input, setInput] = useState('')
  const [context, setContext] = useState<'idle' | 'awaiting_ticket_desc' | 'awaiting_action_desc'>(
    'idle',
  )
  const scrollRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollIntoView({ behavior: 'smooth' })
    }
  }, [messages])

  if (userRole !== 'Admin' && userRole !== 'Administrativa') {
    return <Navigate to="/" replace />
  }

  const handleSend = () => {
    if (!input.trim()) return

    const userMsg: Message = { id: Date.now().toString(), role: 'user', text: input }
    setMessages((prev) => [...prev, userMsg])
    const lowerInput = input.toLowerCase()

    setTimeout(() => {
      let botResponse = ''
      let isXml = false
      let newContext = context

      if (context === 'awaiting_ticket_desc') {
        botResponse = `<OUTPUT>\n  <status>Ticket criado</status>\n  <ticket_id>TKT-${Math.floor(Math.random() * 9000) + 1000}</ticket_id>\n  <descricao>${input}</descricao>\n</OUTPUT>`
        isXml = true
        newContext = 'idle'
      } else if (context === 'awaiting_action_desc') {
        botResponse = `<OUTPUT>\n  <status>Ação atualizada</status>\n  <detalhes>${input}</detalhes>\n</OUTPUT>`
        isXml = true
        newContext = 'idle'
      } else {
        if (
          lowerInput.includes('executar comando') ||
          lowerInput.includes('ação rápida') ||
          lowerInput.includes('acao rapida') ||
          lowerInput.includes('comando interno')
        ) {
          botResponse = `<OUTPUT>\n  <status>Comando executado</status>\n  <detalhes>Ação interpretada e finalizada com sucesso via ChatOps.</detalhes>\n</OUTPUT>`
          isXml = true
        } else if (
          lowerInput.includes('abrir ticket via chat') ||
          lowerInput.includes('ticket rápido') ||
          lowerInput.includes('ticket rapido')
        ) {
          botResponse = 'Por favor, informe a descrição do problema para o ticket:'
          newContext = 'awaiting_ticket_desc'
        } else if (
          lowerInput.includes('atualizar estado via chat') ||
          lowerInput.includes('operação direta') ||
          lowerInput.includes('operacao direta')
        ) {
          botResponse = 'Qual o módulo e a ação desejada para atualização?'
          newContext = 'awaiting_action_desc'
        } else {
          botResponse =
            'Comando não reconhecido. Tente "executar comando", "abrir ticket via chat" ou "atualizar estado via chat".'
        }
      }

      setContext(newContext)
      setMessages((prev) => [
        ...prev,
        { id: Date.now().toString() + 'b', role: 'bot', text: botResponse, isXml },
      ])
    }, 600)

    setInput('')
  }

  return (
    <div className="space-y-6 animate-fade-in pb-8 h-[calc(100vh-80px)] flex flex-col">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900 flex items-center gap-2">
          <Terminal className="w-6 h-6 text-primary" />
          ChatOps Interno
        </h1>
        <p className="text-muted-foreground text-sm">
          Interface baseada em texto para acionamento de fluxos operacionais rápidos.
        </p>
      </div>

      <Card className="border-slate-200 shadow-sm max-w-3xl flex-1 flex flex-col min-h-[400px]">
        <CardHeader className="border-b bg-slate-50/50 py-4">
          <CardTitle className="text-lg flex items-center gap-2 font-mono">
            <Bot className="w-5 h-5 text-emerald-600" />
            Terminal de Assistência
          </CardTitle>
          <CardDescription>
            Envie comandos de linguagem natural para gerenciar a operação.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex-1 p-0 overflow-hidden relative">
          <ScrollArea className="h-full absolute inset-0 p-4">
            <div className="space-y-4 pb-4">
              {messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex gap-3 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  {msg.role === 'bot' && (
                    <div className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0 border border-emerald-200">
                      <Bot className="w-4 h-4" />
                    </div>
                  )}
                  <div
                    className={`max-w-[85%] rounded-lg p-3 shadow-sm ${
                      msg.role === 'user'
                        ? 'bg-slate-900 text-white'
                        : 'bg-white border border-slate-200 text-slate-800'
                    }`}
                  >
                    {msg.isXml ? (
                      <pre className="text-xs font-mono text-emerald-600 bg-slate-900 p-3 rounded-md overflow-x-auto">
                        {msg.text}
                      </pre>
                    ) : (
                      <p className="text-sm whitespace-pre-wrap">{msg.text}</p>
                    )}
                  </div>
                  {msg.role === 'user' && (
                    <div className="w-8 h-8 rounded-full bg-slate-200 text-slate-600 flex items-center justify-center shrink-0 border border-slate-300">
                      <User className="w-4 h-4" />
                    </div>
                  )}
                </div>
              ))}
              <div ref={scrollRef} />
            </div>
          </ScrollArea>
        </CardContent>
        <CardFooter className="p-4 border-t bg-slate-50">
          <form
            onSubmit={(e) => {
              e.preventDefault()
              handleSend()
            }}
            className="flex w-full gap-2"
          >
            <Input
              placeholder="Digite um comando (ex: abrir ticket via chat)..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              className="flex-1 bg-white"
            />
            <Button
              type="submit"
              size="icon"
              className="shrink-0 bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm"
              disabled={!input.trim()}
            >
              <Send className="w-4 h-4" />
            </Button>
          </form>
        </CardFooter>
      </Card>
    </div>
  )
}
