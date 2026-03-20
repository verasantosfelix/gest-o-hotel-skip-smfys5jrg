import { useState } from 'react'
import { Compass, UploadCloud, Coffee, CreditCard, LogOut, CheckCircle } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
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

export default function GuestJourney() {
  const [activeTab, setActiveTab] = useState('precheckin')
  const [statusMsg, setStatusMsg] = useState('')

  const handleAction = (msg: string) => {
    setStatusMsg(msg)
    setTimeout(() => setStatusMsg(''), 4000)
  }

  // Mobile optimized interface for Guest Experience
  return (
    <div className="bg-slate-50 min-h-[calc(100vh-64px)] pb-24 -m-4 md:-m-6 p-4 animate-fade-in">
      <div className="max-w-md mx-auto space-y-6 pt-4">
        <div className="text-center space-y-1">
          <div className="inline-flex p-3 bg-emerald-100 rounded-full mb-2">
            <Compass className="w-8 h-8 text-emerald-700" />
          </div>
          <h1 className="text-2xl font-bold text-slate-900">Portal do Hóspede</h1>
          <p className="text-slate-500 text-sm">Sua jornada digital completa</p>
        </div>

        {statusMsg && (
          <div className="bg-emerald-600 text-white p-4 rounded-lg flex items-center gap-3 font-medium animate-fade-in-down shadow-md">
            <CheckCircle className="w-6 h-6 shrink-0" />
            <p>{statusMsg}</p>
          </div>
        )}

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="w-full h-auto flex flex-wrap p-1 mb-4 gap-1 bg-slate-200/50">
            <TabsTrigger value="precheckin" className="flex-1 py-3 text-sm font-bold min-w-[45%]">
              Pré-Check-in
            </TabsTrigger>
            <TabsTrigger value="pedidos" className="flex-1 py-3 text-sm font-bold min-w-[45%]">
              Pedidos (App)
            </TabsTrigger>
            <TabsTrigger value="pagamento" className="flex-1 py-3 text-sm font-bold min-w-[45%]">
              In-App Pay
            </TabsTrigger>
            <TabsTrigger value="checkout" className="flex-1 py-3 text-sm font-bold min-w-[45%]">
              Exp. Checkout
            </TabsTrigger>
          </TabsList>

          <TabsContent value="precheckin">
            <Card className="shadow-md border-slate-200">
              <CardContent className="p-6 space-y-5">
                <div className="text-center mb-6">
                  <UploadCloud className="w-12 h-12 text-slate-400 mx-auto mb-2" />
                  <h3 className="font-semibold text-lg text-slate-800">Envio de Documentos</h3>
                  <p className="text-sm text-slate-500">
                    Agilize sua entrada enviando a foto do seu documento de identificação.
                  </p>
                </div>
                <div className="border-2 border-dashed border-slate-300 rounded-lg p-8 flex justify-center items-center bg-slate-50 cursor-pointer hover:bg-slate-100 transition-colors">
                  <span className="text-slate-600 font-medium">Toque para anexar foto</span>
                </div>
                <Button
                  className="w-full h-14 text-lg bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm"
                  onClick={() =>
                    handleAction('Documento enviado com sucesso! Seu pré-check-in foi registrado.')
                  }
                >
                  Finalizar Pré-Check-in
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="pedidos">
            <Card className="shadow-md border-slate-200">
              <CardContent className="p-6 space-y-5">
                <div className="space-y-3">
                  <Label className="text-base text-slate-700">O que deseja pedir?</Label>
                  <Input className="h-14 text-lg" placeholder="Ex: Toalhas extras, jantar..." />
                </div>
                <Button
                  className="w-full h-14 text-lg bg-slate-900 hover:bg-slate-800 text-white shadow-sm flex items-center gap-2"
                  onClick={() =>
                    handleAction('Seu pedido foi enviado diretamente para nossa equipe interna.')
                  }
                >
                  <Coffee className="w-5 h-5" /> Enviar Pedido
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="pagamento">
            <Card className="shadow-md border-slate-200">
              <CardContent className="p-6 space-y-5">
                <div className="p-4 bg-slate-50 rounded-lg border border-slate-200 text-center mb-4">
                  <p className="text-sm text-slate-500">Saldo Atual</p>
                  <p className="text-3xl font-black text-emerald-600">R$ 150,00</p>
                </div>
                <div className="space-y-3">
                  <Label className="text-base text-slate-700">Método de Pagamento In-App</Label>
                  <Select defaultValue="cartao">
                    <SelectTrigger className="h-14 text-lg">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="cartao" className="text-base py-3">
                        Cartão de Crédito final 4321
                      </SelectItem>
                      <SelectItem value="pix" className="text-base py-3">
                        Pagar via PIX (Gerar QR Code)
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <Button
                  className="w-full h-14 text-lg bg-blue-600 hover:bg-blue-700 text-white shadow-sm flex items-center gap-2"
                  onClick={() => handleAction('Pagamento processado com sucesso.')}
                >
                  <CreditCard className="w-5 h-5" /> Processar Pagamento
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="checkout">
            <Card className="shadow-md border-slate-200 text-center">
              <CardContent className="p-6 space-y-5">
                <LogOut className="w-16 h-16 text-slate-300 mx-auto mb-4" />
                <h3 className="font-bold text-xl text-slate-900">Pronto para partir?</h3>
                <p className="text-slate-600">
                  Ao confirmar, seu consumo total será consolidado e o quarto liberado no sistema.
                </p>
                <div className="pt-4 border-t border-slate-100">
                  <Button
                    className="w-full h-14 text-lg bg-rose-600 hover:bg-rose-700 text-white shadow-sm"
                    onClick={() =>
                      handleAction('Express Checkout realizado! Agradecemos a preferência.')
                    }
                  >
                    Confirmar Express Checkout
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
