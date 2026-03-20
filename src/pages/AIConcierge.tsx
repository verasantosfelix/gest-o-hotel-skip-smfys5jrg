import { useState } from 'react'
import { BotMessageSquare, Send } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { sendAIChat } from '@/services/custom'

export default function AIConcierge() {
  const [messages, setMessages] = useState([
    {
      role: 'bot',
      text: 'Olá, sou o Concierge Virtual. Peça informações do hotel ou recomendações locais!',
    },
  ])
  const [input, setInput] = useState('')

  const handleSend = async () => {
    if (!input.trim()) return
    const msg = input
    setInput('')
    setMessages((p) => [...p, { role: 'user', text: msg }])
    try {
      const res = await sendAIChat(msg)
      setMessages((p) => [...p, { role: 'bot', text: res.reply }])
    } catch (e) {
      setMessages((p) => [...p, { role: 'bot', text: 'Erro de conexão com o motor de IA.' }])
    }
  }

  return (
    <div className="space-y-6 animate-fade-in pb-8">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900 flex items-center gap-2">
          <BotMessageSquare className="w-6 h-6 text-primary" /> IA Concierge 24/7
        </h1>
        <p className="text-muted-foreground text-sm">
          Interface de autoatendimento digital para hóspedes.
        </p>
      </div>

      <Card className="max-w-2xl h-[500px] flex flex-col shadow-sm">
        <CardHeader className="border-b pb-3">
          <CardTitle className="text-lg">Simulador de Hóspede</CardTitle>
        </CardHeader>
        <CardContent className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50">
          {messages.map((m, i) => (
            <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div
                className={`p-3 rounded-lg max-w-[80%] text-sm ${m.role === 'user' ? 'bg-slate-900 text-white' : 'bg-white border text-slate-800'}`}
              >
                {m.text}
              </div>
            </div>
          ))}
        </CardContent>
        <CardFooter className="p-3 border-t bg-white">
          <form
            onSubmit={(e) => {
              e.preventDefault()
              handleSend()
            }}
            className="flex w-full gap-2"
          >
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Tente perguntar sobre o café da manhã..."
            />
            <Button type="submit">
              <Send className="w-4 h-4" />
            </Button>
          </form>
        </CardFooter>
      </Card>
    </div>
  )
}
