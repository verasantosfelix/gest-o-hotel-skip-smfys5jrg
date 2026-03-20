import { useState } from 'react'
import { Navigate } from 'react-router-dom'
import { Megaphone, Target, Tag, CheckCircle } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Label } from '@/components/ui/label'
import { toast } from '@/components/ui/use-toast'
import useAuthStore from '@/stores/useAuthStore'

export default function Marketing() {
  const { userRole } = useAuthStore()
  const [step, setStep] = useState(1)

  if (userRole !== 'Admin' && userRole !== 'Administrativa') {
    return <Navigate to="/" replace />
  }

  const handleCreate = () => {
    toast({ title: 'Campanha Criada', description: 'Sua campanha foi agendada com sucesso.' })
    setStep(1)
  }

  return (
    <div className="space-y-6 animate-fade-in pb-8">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900 flex items-center gap-2">
          <Megaphone className="w-6 h-6 text-primary" />
          Marketing & Campanhas
        </h1>
        <p className="text-muted-foreground text-sm">
          Crie promoções, segmente públicos e ative ofertas.
        </p>
      </div>

      <Tabs defaultValue="campanhas" className="w-full">
        <TabsList className="mb-4 bg-slate-100 p-1">
          <TabsTrigger value="campanhas">Criar Campanha</TabsTrigger>
          <TabsTrigger value="segmentacao">Segmentação</TabsTrigger>
          <TabsTrigger value="promocoes">Promoções Ativas</TabsTrigger>
        </TabsList>

        <TabsContent value="campanhas">
          <Card className="max-w-xl shadow-sm">
            <CardHeader>
              <CardTitle>Nova Campanha de Email/SMS</CardTitle>
            </CardHeader>
            <CardContent>
              {step === 1 ? (
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label>Público-Alvo</Label>
                    <Input placeholder="Ex: Hóspedes VIP (Gold)" />
                  </div>
                  <div className="space-y-2">
                    <Label>Mensagem / Gatilho</Label>
                    <Input placeholder="Texto da promoção..." />
                  </div>
                  <div className="space-y-2">
                    <Label>Agendamento</Label>
                    <Input type="datetime-local" />
                  </div>
                  <Button onClick={() => setStep(2)}>Revisar e Avançar</Button>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="bg-slate-50 p-4 rounded border">
                    <h4 className="font-bold flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-emerald-600" /> Confirmar Envio
                    </h4>
                    <p className="text-sm mt-2 text-slate-600">
                      Verifique os dados da campanha. Esta ação disparará mensagens para o segmento
                      selecionado.
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" onClick={() => setStep(1)}>
                      Voltar
                    </Button>
                    <Button
                      onClick={handleCreate}
                      className="bg-slate-900 text-white hover:bg-slate-800"
                    >
                      Confirmar e Agendar
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="segmentacao">
          <Card className="shadow-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="w-5 h-5" /> Filtros de Base
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-slate-600 mb-4">
                Filtre hóspedes por localização, consumo total ou estadias passadas.
              </p>
              <div className="flex gap-4">
                <Input placeholder="Filtrar por cidade..." className="max-w-xs" />
                <Button variant="secondary">Aplicar Filtro</Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="promocoes">
          <Card className="shadow-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Tag className="w-5 h-5" /> Promoções e Rewards
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-3">
                <li className="p-4 border rounded-lg bg-slate-50 flex justify-between items-center">
                  <div>
                    <strong className="block text-slate-900">Desconto de Inverno (15%)</strong>
                    <span className="text-sm text-slate-500 mt-1 block">
                      Regra: Fidelidade Gold + 3 diárias
                    </span>
                  </div>
                  <Button
                    size="sm"
                    variant="outline"
                    className="text-rose-600 hover:text-rose-700 hover:bg-rose-50"
                  >
                    Pausar Oferta
                  </Button>
                </li>
              </ul>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
