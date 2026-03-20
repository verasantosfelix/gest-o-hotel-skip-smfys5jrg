import { useState } from 'react'
import { Navigate } from 'react-router-dom'
import { Briefcase, Users, MessageSquare, AlertTriangle, CheckCircle } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Label } from '@/components/ui/label'
import { toast } from '@/components/ui/use-toast'
import useAuthStore from '@/stores/useAuthStore'

export default function Staff() {
  const { userRole } = useAuthStore()
  const [search, setSearch] = useState('')
  const [searched, setSearched] = useState(false)
  const [step, setStep] = useState(1)

  if (userRole !== 'Admin' && userRole !== 'Administrativa') {
    return <Navigate to="/" replace />
  }

  const notFound = searched && search.toLowerCase().includes('erro')

  const handleSaveScale = () => {
    toast({ title: 'Escala Salva', description: 'O cronograma foi atualizado com sucesso.' })
    setStep(1)
  }

  return (
    <div className="space-y-6 animate-fade-in pb-8">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900 flex items-center gap-2">
          <Briefcase className="w-6 h-6 text-primary" />
          Recursos Humanos & Equipe
        </h1>
        <p className="text-muted-foreground text-sm">
          Gestão de colaboradores, escalas e performance.
        </p>
      </div>

      <Tabs defaultValue="diretorio" className="w-full">
        <TabsList className="mb-4 bg-slate-100 p-1">
          <TabsTrigger value="diretorio">Diretório</TabsTrigger>
          <TabsTrigger value="escalas">Escalas de Turno</TabsTrigger>
          <TabsTrigger value="performance">Avaliações</TabsTrigger>
          <TabsTrigger value="comunicacao">Comunicação Interna</TabsTrigger>
        </TabsList>

        <TabsContent value="diretorio" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Buscar Colaborador</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex gap-2 w-full max-w-md mb-4">
                <Input
                  placeholder="Nome do colaborador..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
                <Button onClick={() => setSearched(true)}>
                  <Users className="w-4 h-4 mr-2" /> Buscar
                </Button>
              </div>
              {notFound && (
                <div className="bg-rose-50 text-rose-700 p-4 rounded-md border border-rose-200 flex items-center gap-2">
                  <AlertTriangle className="w-5 h-5" />
                  <p className="font-medium">Colaborador não localizado.</p>
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Registrar Novo Colaborador</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 max-w-md">
              <div className="space-y-2">
                <Label>Nome Completo</Label>
                <Input placeholder="Ex: Maria Souza" />
              </div>
              <div className="space-y-2">
                <Label>Cargo / Função</Label>
                <Input placeholder="Ex: Recepcionista" />
              </div>
              <Button>Cadastrar Funcionário</Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="escalas">
          <Card>
            <CardHeader>
              <CardTitle>Escalonamento de Turnos</CardTitle>
            </CardHeader>
            <CardContent>
              {step === 1 ? (
                <div className="space-y-4">
                  <p className="text-sm text-slate-600">
                    Configure a escala da semana para o setor de Governança.
                  </p>
                  <Button onClick={() => setStep(2)}>Gerar Escala (Avançar)</Button>
                </div>
              ) : (
                <div className="space-y-4 animate-fade-in">
                  <div className="bg-amber-50 border border-amber-200 p-4 rounded-md text-amber-800">
                    <h4 className="font-bold flex items-center gap-2">
                      <CheckCircle className="w-4 h-4" /> Confirmação
                    </h4>
                    <p className="text-sm mt-1">
                      Revise as escalas geradas. Deseja confirmar e publicar as alterações?
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" onClick={() => setStep(1)}>
                      Voltar
                    </Button>
                    <Button
                      onClick={handleSaveScale}
                      className="bg-emerald-600 hover:bg-emerald-700 text-white"
                    >
                      Confirmar e Salvar Escala
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="performance">
          <Card>
            <CardHeader>
              <CardTitle>Histórico de Performance</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-3 text-sm text-slate-700">
                <li className="bg-slate-50 p-4 rounded border">
                  <strong>João (Recepção):</strong> Avaliação mensal: 4.8/5. Excelente cordialidade.
                </li>
                <li className="bg-slate-50 p-4 rounded border">
                  <strong>Ana (Governança):</strong> Avaliação mensal: 4.5/5. Tempo de limpeza
                  reduzido em 10%.
                </li>
              </ul>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="comunicacao">
          <Card>
            <CardHeader>
              <CardTitle>Avisos e Comunicação</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 max-w-md">
              <div className="space-y-2">
                <Label>Mensagem à Equipe</Label>
                <Input placeholder="Digite o aviso (ex: Reunião geral amanhã às 14h)" />
              </div>
              <Button>
                <MessageSquare className="w-4 h-4 mr-2" /> Disparar Aviso
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
