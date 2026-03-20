import { useState } from 'react'
import { ConciergeBell, Map, Car, Calendar, Search } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'

export default function AdvancedConcierge() {
  const [output, setOutput] = useState('')

  const handleItinerary = (e: React.FormEvent) => {
    e.preventDefault()
    setOutput(
      `<OUTPUT>\n  <roteiro_recomendado>\n    <dia_1>Tour histórico no centro (Manhã) e Jantar no Restaurante Litoral (Noite).</dia_1>\n    <dia_2>Passeio de barco pelas ilhas e fim de tarde no Spa do Hotel.</dia_2>\n  </roteiro_recomendado>\n</OUTPUT>`,
    )
  }

  const handleExternalBooking = (e: React.FormEvent) => {
    e.preventDefault()
    setOutput(
      `<OUTPUT>\n  <status>Reserva efetuada</status>\n  <detalhes>\n    <local>Restaurante Litoral</local>\n    <confirmacao>#EXT-4921</confirmacao>\n  </detalhes>\n</OUTPUT>`,
    )
  }

  const handleTransport = (e: React.FormEvent) => {
    e.preventDefault()
    setOutput(
      `<OUTPUT>\n  <status>Transporte solicitado</status>\n  <detalhes>\n    <tipo>Táxi Executivo</tipo>\n    <chegada_estimada>10 minutos</chegada_estimada>\n  </detalhes>\n</OUTPUT>`,
    )
  }

  return (
    <div className="space-y-6 animate-fade-in pb-8">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900 flex items-center gap-2">
          <ConciergeBell className="w-6 h-6 text-primary" />
          Concierge Avançado
        </h1>
        <p className="text-muted-foreground text-sm">
          Reservas externas, roteiros personalizados e assistência premium.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card className="border-slate-200 shadow-sm">
          <CardHeader>
            <CardTitle>Assistência ao Hóspede</CardTitle>
            <CardDescription>Crie experiências personalizadas fora do hotel.</CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="roteiros" className="w-full">
              <TabsList className="mb-4 bg-slate-100 flex flex-wrap h-auto p-1">
                <TabsTrigger value="roteiros">Itinerários</TabsTrigger>
                <TabsTrigger value="reservas">Reservas Externas</TabsTrigger>
                <TabsTrigger value="transporte">Transporte</TabsTrigger>
              </TabsList>

              <TabsContent value="roteiros">
                <form onSubmit={handleItinerary} className="space-y-4">
                  <div className="space-y-2">
                    <Label>Perfil de Interesses</Label>
                    <Input placeholder="Ex: Gastronomia, Cultura, Natureza..." required />
                  </div>
                  <div className="space-y-2">
                    <Label>Duração do Roteiro (Dias)</Label>
                    <Input type="number" min="1" placeholder="2" required />
                  </div>
                  <Button type="submit" className="w-full gap-2">
                    <Map className="w-4 h-4" /> Gerar Roteiro
                  </Button>
                </form>
              </TabsContent>

              <TabsContent value="reservas">
                <form onSubmit={handleExternalBooking} className="space-y-4">
                  <div className="space-y-2">
                    <Label>Local / Estabelecimento</Label>
                    <Input placeholder="Ex: Restaurante Fasano" required />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Pessoas (Pax)</Label>
                      <Input type="number" min="1" placeholder="2" required />
                    </div>
                    <div className="space-y-2">
                      <Label>Horário</Label>
                      <Input type="time" required />
                    </div>
                  </div>
                  <Button type="submit" className="w-full gap-2">
                    <Calendar className="w-4 h-4" /> Confirmar Reserva Externa
                  </Button>
                </form>
              </TabsContent>

              <TabsContent value="transporte">
                <form onSubmit={handleTransport} className="space-y-4">
                  <div className="space-y-2">
                    <Label>Destino</Label>
                    <Input placeholder="Ex: Aeroporto Internacional" required />
                  </div>
                  <div className="space-y-2">
                    <Label>Horário Desejado</Label>
                    <Input type="time" required />
                  </div>
                  <Button type="submit" className="w-full gap-2">
                    <Car className="w-4 h-4" /> Solicitar Transporte
                  </Button>
                </form>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>

        <div>
          {output && (
            <Card className="border-emerald-500/20 bg-emerald-50 shadow-sm animate-fade-in-up">
              <CardHeader>
                <CardTitle className="text-emerald-700 font-display text-base">
                  Resultado do Concierge
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
