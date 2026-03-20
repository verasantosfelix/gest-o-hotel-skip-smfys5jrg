import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { toast } from '@/components/ui/use-toast'
import { createEvent, getEventSpaces, EventSpace } from '@/services/events'

export function EventWizard() {
  const [step, setStep] = useState(1)
  const [spaces, setSpaces] = useState<EventSpace[]>([])
  const [data, setData] = useState({
    title: '',
    type: 'corporate',
    client_name: '',
    space_id: '',
    participants_count: 50,
    total_budget: 0,
    start_time: new Date().toISOString().split('T')[0] + 'T09:00',
  })

  useEffect(() => {
    getEventSpaces().then(setSpaces).catch(console.error)
  }, [])

  const next = () => setStep((s) => s + 1)
  const prev = () => setStep((s) => s - 1)

  const handleSubmit = async () => {
    try {
      await createEvent({ ...data, status: 'pending', end_time: data.start_time })
      toast({ title: 'Sucesso!', description: 'Proposta de evento gerada e salva.' })
      setStep(1)
      setData({
        title: '',
        type: 'corporate',
        client_name: '',
        space_id: '',
        participants_count: 50,
        total_budget: 0,
        start_time: new Date().toISOString().split('T')[0] + 'T09:00',
      })
    } catch (e) {
      toast({ title: 'Erro ao criar evento', variant: 'destructive' })
    }
  }

  return (
    <Card className="max-w-2xl mx-auto border-slate-200 shadow-sm">
      <CardHeader className="bg-slate-50 border-b pb-4">
        <CardTitle className="text-xl text-purple-800">
          Assistente de Planejamento - Passo {step} de 3
        </CardTitle>
      </CardHeader>
      <CardContent className="p-6 space-y-4">
        {step === 1 && (
          <>
            <div className="space-y-2">
              <Label>Nome do Evento</Label>
              <Input
                value={data.title}
                onChange={(e) => setData({ ...data, title: e.target.value })}
                placeholder="Ex: Convenção Anual"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Tipo de Evento</Label>
                <Select value={data.type} onValueChange={(v) => setData({ ...data, type: v })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="corporate">Corporativo</SelectItem>
                    <SelectItem value="wedding">Casamento</SelectItem>
                    <SelectItem value="conference">Conferência</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Cliente / Empresa</Label>
                <Input
                  value={data.client_name}
                  onChange={(e) => setData({ ...data, client_name: e.target.value })}
                  placeholder="Nome do Cliente"
                />
              </div>
            </div>
          </>
        )}
        {step === 2 && (
          <>
            <div className="space-y-2">
              <Label>Espaço Desejado</Label>
              <Select
                value={data.space_id}
                onValueChange={(v) => setData({ ...data, space_id: v })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione a Sala" />
                </SelectTrigger>
                <SelectContent>
                  {spaces.map((s) => (
                    <SelectItem key={s.id} value={s.id}>
                      {s.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Participantes (Estimativa)</Label>
                <Input
                  type="number"
                  value={data.participants_count}
                  onChange={(e) =>
                    setData({ ...data, participants_count: parseInt(e.target.value) })
                  }
                />
              </div>
              <div className="space-y-2">
                <Label>Data de Início</Label>
                <Input
                  type="datetime-local"
                  value={data.start_time}
                  onChange={(e) => setData({ ...data, start_time: e.target.value })}
                />
              </div>
            </div>
          </>
        )}
        {step === 3 && (
          <>
            <div className="space-y-2">
              <Label>Orçamento Total Previsto (Kz)</Label>
              <Input
                type="number"
                value={data.total_budget}
                onChange={(e) => setData({ ...data, total_budget: parseFloat(e.target.value) })}
              />
            </div>
            <div className="p-4 bg-slate-100 rounded-md mt-4">
              <h4 className="font-bold text-slate-800 mb-2">Resumo da Proposta</h4>
              <p className="text-sm text-slate-600">Evento: {data.title || '-'}</p>
              <p className="text-sm text-slate-600">Cliente: {data.client_name || '-'}</p>
              <p className="text-sm text-slate-600">Participantes: {data.participants_count}</p>
            </div>
          </>
        )}
      </CardContent>
      <CardFooter className="flex justify-between bg-slate-50 border-t p-4">
        <Button variant="outline" onClick={prev} disabled={step === 1}>
          Voltar
        </Button>
        {step < 3 ? (
          <Button onClick={next}>Próximo</Button>
        ) : (
          <Button onClick={handleSubmit} className="bg-purple-600 hover:bg-purple-700 text-white">
            Gerar Proposta e Finalizar
          </Button>
        )}
      </CardFooter>
    </Card>
  )
}
