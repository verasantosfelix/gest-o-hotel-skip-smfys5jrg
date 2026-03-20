import { useState } from 'react'
import { Car, MapPin, Clock, CheckCircle } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'

export default function FleetTransfers() {
  const [output, setOutput] = useState('')

  const drivers = [
    { id: '1', name: 'Marcos Silva', status: 'Disponível', vehicle: 'Van Executiva (PLK-1234)' },
    { id: '2', name: 'Ana Souza', status: 'Em Rota', vehicle: 'Sedan Luxo (XYZ-9876)' },
    { id: '3', name: 'Roberto Carlos', status: 'Folga', vehicle: 'SUV (ABC-5555)' },
  ]

  const handleBooking = (e: React.FormEvent) => {
    e.preventDefault()
    setOutput(
      `<OUTPUT>\n  <status>Transfer Confirmado</status>\n  <detalhes>\n    <destino>Aeroporto GIG</destino>\n    <motorista_atribuido>Marcos Silva</motorista_atribuido>\n  </detalhes>\n</OUTPUT>`,
    )
  }

  return (
    <div className="space-y-6 animate-fade-in pb-8">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900 flex items-center gap-2">
          <Car className="w-6 h-6 text-primary" />
          Frota & Transfers
        </h1>
        <p className="text-muted-foreground text-sm">
          Gestão de transporte de hóspedes, disponibilidade de veículos e agendamentos.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card className="border-slate-200 shadow-sm">
          <CardHeader>
            <CardTitle>Central de Despacho</CardTitle>
            <CardDescription>Agende corridas ou visualize a frota ativa.</CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="agendar" className="w-full">
              <TabsList className="mb-4 bg-slate-100 flex flex-wrap h-auto p-1">
                <TabsTrigger value="agendar" className="flex-1">
                  Agendar Transfer
                </TabsTrigger>
                <TabsTrigger value="motoristas" className="flex-1">
                  Frota & Motoristas
                </TabsTrigger>
              </TabsList>

              <TabsContent value="agendar">
                <form onSubmit={handleBooking} className="space-y-4">
                  <div className="space-y-2">
                    <Label>Reserva ou Hóspede</Label>
                    <Input placeholder="Ex: Reserva #12345" required />
                  </div>
                  <div className="space-y-2">
                    <Label>Destino Final</Label>
                    <div className="relative">
                      <MapPin className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                      <Input className="pl-9" placeholder="Ex: Aeroporto" required />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label>Horário da Partida</Label>
                    <div className="relative">
                      <Clock className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                      <Input type="time" className="pl-9" required />
                    </div>
                  </div>
                  <Button type="submit" className="w-full">
                    Confirmar Solicitação
                  </Button>
                </form>
              </TabsContent>

              <TabsContent value="motoristas" className="space-y-4">
                <div className="grid gap-3">
                  {drivers.map((d) => (
                    <div
                      key={d.id}
                      className="p-3 border rounded-lg bg-slate-50 flex items-center justify-between"
                    >
                      <div>
                        <p className="font-bold text-slate-900">{d.name}</p>
                        <p className="text-xs text-slate-500">{d.vehicle}</p>
                      </div>
                      <span
                        className={`text-xs font-semibold px-2 py-1 rounded ${
                          d.status === 'Disponível'
                            ? 'bg-emerald-100 text-emerald-800'
                            : d.status === 'Em Rota'
                              ? 'bg-blue-100 text-blue-800'
                              : 'bg-slate-200 text-slate-600'
                        }`}
                      >
                        {d.status}
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
                  <CheckCircle className="w-4 h-4" /> Despacho Realizado
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
