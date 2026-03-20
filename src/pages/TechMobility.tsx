import { useState } from 'react'
import { Smartphone, CheckSquare, Wrench } from 'lucide-react'
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
import { toast } from '@/components/ui/use-toast'

export default function TechMobility() {
  const [activeTab, setActiveTab] = useState('atribuicao')

  const handleAction = (msg: string) => {
    toast({ title: 'Ação Confirmada', description: msg })
  }

  // Mobile optimized layout wrapper
  return (
    <div className="bg-slate-50 min-h-[calc(100vh-64px)] pb-24 -m-4 md:-m-6 p-4 animate-fade-in">
      <div className="max-w-md mx-auto space-y-6 pt-4">
        <div className="text-center space-y-1">
          <div className="inline-flex p-3 bg-blue-100 rounded-full mb-2">
            <Smartphone className="w-8 h-8 text-blue-700" />
          </div>
          <h1 className="text-2xl font-bold text-slate-900">App Operacional</h1>
          <p className="text-slate-500 text-sm">Mobilidade para equipe técnica</p>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="w-full h-14 mb-4">
            <TabsTrigger value="atribuicao" className="flex-1 h-full font-bold">
              Atribuição
            </TabsTrigger>
            <TabsTrigger value="checklists" className="flex-1 h-full font-bold">
              Checklists
            </TabsTrigger>
            <TabsTrigger value="intervencao" className="flex-1 h-full font-bold">
              Intervenção
            </TabsTrigger>
          </TabsList>

          <TabsContent value="atribuicao">
            <Card className="shadow-md border-slate-200">
              <CardContent className="p-5 space-y-5">
                <div className="space-y-3">
                  <Label className="text-base text-slate-700">Colaborador</Label>
                  <Input className="h-14 text-lg" placeholder="Nome do técnico" />
                </div>
                <div className="space-y-3">
                  <Label className="text-base text-slate-700">Descrição da Tarefa</Label>
                  <Input className="h-14 text-lg" placeholder="O que precisa ser feito?" />
                </div>
                <Button
                  className="w-full h-14 text-lg bg-blue-600 hover:bg-blue-700 text-white shadow-sm"
                  onClick={() => handleAction('Tarefa atribuída ao colaborador com sucesso.')}
                >
                  Delegar Tarefa
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="checklists">
            <Card className="shadow-md border-slate-200">
              <CardContent className="p-5 space-y-5">
                <div className="space-y-3">
                  <Label className="text-base text-slate-700">Rotina Técnica</Label>
                  <Select defaultValue="ar_condicionado">
                    <SelectTrigger className="h-14 text-lg">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="ar_condicionado" className="text-base py-3">
                        Limpeza de Filtros AC
                      </SelectItem>
                      <SelectItem value="piscina" className="text-base py-3">
                        Rotina Área de Lazer
                      </SelectItem>
                      <SelectItem value="preventiva_geral" className="text-base py-3">
                        Preventiva Quartos
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="p-4 bg-slate-100 rounded-lg space-y-3 border border-slate-200">
                  <div className="flex items-center gap-3">
                    <CheckSquare className="w-6 h-6 text-slate-400" />
                    <span className="text-lg font-medium text-slate-700">Verificar Gás</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <CheckSquare className="w-6 h-6 text-slate-400" />
                    <span className="text-lg font-medium text-slate-700">Lavar Painel Frontal</span>
                  </div>
                </div>
                <Button
                  className="w-full h-14 text-lg bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm"
                  onClick={() => handleAction('Checklist marcado como concluído.')}
                >
                  Concluir Rotina
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="intervencao">
            <Card className="shadow-md border-slate-200">
              <CardContent className="p-5 space-y-5">
                <div className="space-y-3">
                  <Label className="text-base text-slate-700">Área / Local</Label>
                  <Input className="h-14 text-lg" placeholder="Ex: Hall Principal" />
                </div>
                <div className="space-y-3">
                  <Label className="text-base text-slate-700">Descrição do Problema</Label>
                  <Input className="h-14 text-lg" placeholder="Relate o que encontrou" />
                </div>
                <Button
                  className="w-full h-14 text-lg bg-slate-900 hover:bg-slate-800 text-white shadow-sm flex items-center gap-2"
                  onClick={() => handleAction('Intervenção técnica acionada. Equipe notificada.')}
                >
                  <Wrench className="w-5 h-5" /> Acionar Intervenção
                </Button>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
