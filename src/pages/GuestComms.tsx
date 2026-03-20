import { useState } from 'react'
import { Mail, Zap } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { toast } from '@/components/ui/use-toast'

export default function GuestComms() {
  const [pre, setPre] = useState(
    'Olá {nome}, estamos ansiosos para recebê-lo amanhã! Adicione itens extras no seu check-in.',
  )
  const [post, setPost] = useState(
    'Olá {nome}, obrigado por se hospedar conosco. Avalie sua estadia pelo link: {link}',
  )

  const handleSave = () => {
    toast({ title: 'Templates Salvos', description: 'Fluxos automáticos ativados com sucesso.' })
  }

  return (
    <div className="space-y-6 animate-fade-in pb-8">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900 flex items-center gap-2">
          <Mail className="w-6 h-6 text-primary" /> Comunicação Pré/Pós Estadia
        </h1>
        <p className="text-muted-foreground text-sm">
          Automatize e-mails e mensagens baseadas em eventos da reserva.
        </p>
      </div>

      <div className="grid gap-6 max-w-3xl">
        <Card className="shadow-sm border-slate-200">
          <CardHeader>
            <CardTitle>Gatilhos Automáticos</CardTitle>
            <CardDescription>Edite as mensagens de upsell e survey.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <label className="font-semibold text-slate-800">
                Template: Pré-Chegada (24h antes)
              </label>
              <Textarea value={pre} onChange={(e) => setPre(e.target.value)} rows={3} />
            </div>
            <div className="space-y-2">
              <label className="font-semibold text-slate-800">
                Template: Pós-Estadia (Check-out)
              </label>
              <Textarea value={post} onChange={(e) => setPost(e.target.value)} rows={3} />
            </div>
            <Button onClick={handleSave} className="w-full gap-2">
              <Zap className="w-4 h-4" /> Salvar e Ativar Fluxos
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
