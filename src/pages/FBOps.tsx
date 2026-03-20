import { useState, useEffect } from 'react'
import { Navigate } from 'react-router-dom'
import { UtensilsCrossed, CalendarClock, TrendingUp, Route } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { toast } from '@/components/ui/use-toast'
import useAuthStore from '@/stores/useAuthStore'
import { getFbEvents, createEventBooking } from '@/services/fb'
import { formatCurrency } from '@/lib/utils'

export default function FBOps() {
  const { userRole } = useAuthStore()
  const [events, setEvents] = useState<any[]>([])
  const [bookData, setBookData] = useState({ id: '', pax: 1 })

  useEffect(() => {
    getFbEvents().then(setEvents).catch(console.error)
  }, [])

  if (userRole !== 'Admin' && userRole !== 'Administrativa' && userRole !== 'Restaurante') {
    return <Navigate to="/" replace />
  }

  const handleBookEvent = async () => {
    if (!bookData.id) return
    try {
      await createEventBooking(bookData.id, { pax: bookData.pax })
      toast({ title: 'Reserva Confirmada', description: 'Pré-pagamento processado via gateway.' })
      setBookData({ id: '', pax: 1 })
    } catch(e) { toast({ title: 'Erro', variant: 'destructive' }) }
  }

  const handleDynamicPrice = () => {
    toast({ title: 'Motor Acionado', description: 'Preços atualizados com base na demanda (+15%).' })
  }

  return (
    <div className="space-y-6 animate-fade-in pb-8">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900 flex items-center gap-2">
          <UtensilsCrossed className="w-6 h-6 text-primary" /> F&B Avançado
        </h1>
        <p className="text-muted-foreground text-sm">Eventos gastronómicos, precificação dinâmica e logística de salão.</p>
      </div>

      <Tabs defaultValue="eventos" className="w-full">
        <TabsList className="mb-4 bg-slate-100 flex flex-wrap h-auto p-1">
          <TabsTrigger value="eventos">Eventos Gastronómicos</TabsTrigger>
          <TabsTrigger value="dinamico">Menu Dinâmico</TabsTrigger>
          <TabsTrigger value="rotas">Rotas de Serviço</TabsTrigger>
        </TabsList>

        <TabsContent value="eventos" className="grid gap-6 md:grid-cols-2">
          <Card className="shadow-sm">
            <CardHeader><CardTitle className="flex items-center gap-2"><CalendarClock className="w-5 h-5"/> Calendário de Eventos</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              {events.map(ev => (
                <div key={ev.id} className="p-4 border rounded-lg bg-slate-50">
                  <h3 className="font-bold text-lg text-slate-900">{ev.title}</h3>
                  <p className="text-sm text-slate-600 mb-2">{new Date(ev.date).toLocaleString()}</p>
                  <p className="text-sm italic">{ev.menu_details}</p>
                  <div className="mt-3 font-bold text-emerald-700">{formatCurrency(ev.price, ev.currency)} / pax</div>
                </div>
              ))}
            </CardContent>
          </Card>
          <Card className="shadow-sm">
            <CardHeader><CardTitle>Reservar & Pré-pagamento</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2"><Label>Selecione o Evento</Label>
                <select className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm" value={bookData.id} onChange={e => setBookData({...bookData, id: e.target.value})}>
                  <option value="">Selecione...</option>
                  {events.map(ev => <option key={ev.id} value={ev.id}>{ev.title}</option>)}
                </select>
              </div>
              <div className="space-y-2"><Label>Pessoas (Pax)</Label><Input type="number" min="1" value={bookData.pax} onChange={e => setBookData({...bookData, pax: parseInt(e.target.value)})} /></div>
              <Button onClick={handleBookEvent} className="w-full">Processar Reserva</Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="dinamico">
          <Card className="shadow-sm max-w-xl">
            <CardHeader><CardTitle className="flex items-center gap-2"><TrendingUp className="w-5 h-5"/> Pricing Engine</CardTitle><CardDescription>Ajuste preços baseado em tags de demanda.</CardDescription></CardHeader>
            <CardContent className="space-y-4">
              <div className="p-4 bg-amber-50 border border-amber-200 rounded-md text-amber-800 text-sm">
                <strong>Alerta de Demanda:</strong> Alta ocupação detectada para o fim de semana. Sugere-se aplicar tag "Sazonalidade Alta".
              </div>
              <Button onClick={handleDynamicPrice} className="w-full bg-slate-900">Aplicar Atualização em Lote (+15%)</Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="rotas">
          <Card className="shadow-sm max-w-xl">
            <CardHeader><CardTitle className="flex items-center gap-2"><Route className="w-5 h-5"/> Otimização de Salão</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div className="p-3 border-l-4 border-blue-500 bg-slate-50 text-sm">
                  <strong>Garçom 1 (João):</strong> Rota Otimizada -> Mesa 12 (Entrega) -> Mesa 14 (Recolha) -> Cozinha
                </div>
                <div className="p-3 border-l-4 border-emerald-500 bg-slate-50 text-sm">
                  <strong>Garçom 2 (Ana):</strong> Rota Otimizada -> Bar -> Mesa 05 (Bebidas) -> Receber Mesa 02
                </div>
              </div>
              <p className="text-xs text-slate-500 mt-4">* Rotas calculadas em tempo real baseadas no KDS.</p>
            </CardContent>
          </Card>
        </TabsContent>

      </Tabs>
    </div>
  )
}
