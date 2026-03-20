import { useState } from 'react'
import { Heart, Calendar, User, Clock, Sparkles } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

export default function SpaWellness() {
  const [output, setOutput] = useState('')

  const handleBooking = (e: React.FormEvent) => {
    e.preventDefault()
    setOutput(
      `<OUTPUT>\n  <status>Agendamento Confirmado</status>\n  <servico>Massagem Relaxante</servico>\n  <terapeuta>Atribuído automaticamente</terapeuta>\n</OUTPUT>`,
    )
  }

  const therapists = [
    { id: 1, name: 'Clara Lima', specialization: 'Massoterapia', status: 'Livre' },
    { id: 2, name: 'Juliana Costa', specialization: 'Estética Facial', status: 'Em Atendimento' },
  ]

  return (
    <div className="space-y-6 animate-fade-in pb-8">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900 flex items-center gap-2">
          <Heart className="w-6 h-6 text-primary" />
          Spa & Wellness
        </h1>
        <p className="text-muted-foreground text-sm">
          Agendamentos de tratamentos e gestão da equipe de terapeutas.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card className="border-slate-200 shadow-sm">
          <CardHeader>
            <CardTitle>Recepção do Spa</CardTitle>
            <CardDescription>Marque horários e controle a agenda de bem-estar.</CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="agendamentos" className="w-full">
              <TabsList className="mb-4 bg-slate-100 flex flex-wrap h-auto p-1">
                <TabsTrigger value="agendamentos" className="flex-1">
                  Agendamentos
                </TabsTrigger>
                <TabsTrigger value="terapeutas" className="flex-1">
                  Terapeutas
                </TabsTrigger>
              </TabsList>

              <TabsContent value="agendamentos">
                <form onSubmit={handleBooking} className="space-y-4">
                  <div className="space-y-2">
                    <Label>Reserva ou Hóspede</Label>
                    <Input placeholder="Ex: Reserva #12345" required />
                  </div>
                  <div className="space-y-2">
                    <Label>Serviço (Tratamento)</Label>
                    <Select defaultValue="relaxante" required>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="relaxante">Massagem Relaxante (60m)</SelectItem>
                        <SelectItem value="pedras">Massagem Pedras Quentes (90m)</SelectItem>
                        <SelectItem value="facial">Limpeza de Pele (45m)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Data e Horário</Label>
                    <div className="flex gap-2">
                      <Input type="date" required className="flex-1" />
                      <Input type="time" required className="w-32" />
                    </div>
                  </div>
                  <Button type="submit" className="w-full gap-2">
                    <Calendar className="w-4 h-4" /> Reservar Horário
                  </Button>
                </form>
              </TabsContent>

              <TabsContent value="terapeutas" className="space-y-4">
                <div className="grid gap-3">
                  {therapists.map((t) => (
                    <div
                      key={t.id}
                      className="p-3 border rounded-lg bg-slate-50 flex items-center justify-between"
                    >
                      <div className="flex items-center gap-3">
                        <div className="bg-white p-2 rounded-full border shadow-sm">
                          <User className="w-4 h-4 text-slate-500" />
                        </div>
                        <div>
                          <p className="font-bold text-slate-900">{t.name}</p>
                          <p className="text-xs text-slate-500">{t.specialization}</p>
                        </div>
                      </div>
                      <span
                        className={`text-xs font-semibold px-2 py-1 rounded ${
                          t.status === 'Livre'
                            ? 'bg-emerald-100 text-emerald-800'
                            : 'bg-amber-100 text-amber-800'
                        }`}
                      >
                        {t.status}
                      </span>
                    </div>
                  ))}
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>

        <div>
          {output && (
            <Card className="border-emerald-500/20 bg-emerald-50 shadow-sm animate-fade-in-up">
              <CardHeader>
                <CardTitle className="text-emerald-700 font-display text-base flex items-center gap-2">
                  <Sparkles className="w-4 h-4" /> Agendamento Efetuado
                </CardTitle>
              </CardHeader>
              <CardContent>
                <pre className="bg-slate-900 text-emerald-400 p-4 rounded-md font-mono text-sm overflow-x-auto shadow-inner whitespace-pre-wrap">
                  {output}
                </pre>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}
