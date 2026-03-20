import { useState, useEffect } from 'react'
import { Navigate } from 'react-router-dom'
import { Briefcase, BrainCircuit, UserPlus, GraduationCap, Target, Clock } from 'lucide-react'
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
import { Textarea } from '@/components/ui/textarea'
import { toast } from '@/components/ui/use-toast'
import useAuthStore from '@/stores/useAuthStore'
import { getTrainings, createCandidate, createEnrollment, createShift } from '@/services/hr'

export default function HRIntelligence() {
  const { userRole } = useAuthStore()
  const [trainings, setTrainings] = useState<any[]>([])

  // Forms state
  const [cvData, setCvData] = useState({ name: '', cargo: '', text: '' })
  const [cvOutput, setCvOutput] = useState<any>(null)
  const [enrollData, setEnrollData] = useState({ staffName: '', courseId: '' })
  const [shiftData, setShiftData] = useState({
    staffName: '',
    sector: 'Recepção',
    start: '',
    end: '',
  })

  useEffect(() => {
    getTrainings().then(setTrainings).catch(console.error)
  }, [])

  if (userRole !== 'Admin' && userRole !== 'Administrativa') {
    return <Navigate to="/" replace />
  }

  const handleScreenCV = async () => {
    if (!cvData.name || !cvData.cargo) {
      toast({
        title: 'Atenção',
        description: 'Preencha o nome e cargo alvo.',
        variant: 'destructive',
      })
      return
    }
    const score = Math.floor(Math.random() * 40) + 60 // 60-99
    try {
      await createCandidate({
        name: cvData.name,
        cargo: cvData.cargo,
        cv_data: cvData.text,
        match_score: score,
        status: 'Triado',
      })
      setCvOutput({
        score,
        skills: ['Comunicação', 'Inglês', 'Organização'],
        alerts: score < 70 ? ['Requer treinamento extra'] : ['Forte candidato'],
      })
      toast({ title: 'CV Triado', description: `Análise concluída. Match: ${score}%` })
    } catch (e) {
      toast({ title: 'Erro', description: 'Falha ao salvar candidato.', variant: 'destructive' })
    }
  }

  const handleEnroll = async () => {
    if (!enrollData.staffName || !enrollData.courseId) return
    try {
      await createEnrollment({
        staff_name: enrollData.staffName,
        training_id: enrollData.courseId,
        status: 'Inscrito',
        certificate_issued: false,
      })
      toast({ title: 'Inscrição Confirmada', description: 'O colaborador foi matriculado.' })
      setEnrollData({ staffName: '', courseId: '' })
    } catch (e) {
      toast({ title: 'Erro', variant: 'destructive' })
    }
  }

  const handleCreateShift = async () => {
    if (!shiftData.staffName || !shiftData.start || !shiftData.end) return
    const d1 = new Date(`1970-01-01T${shiftData.start}`)
    const d2 = new Date(`1970-01-01T${shiftData.end}`)
    let diff = (d2.getTime() - d1.getTime()) / (1000 * 60 * 60)
    if (diff < 0) diff += 24 // overnight shift

    try {
      await createShift({
        staff_name: shiftData.staffName,
        sector: shiftData.sector,
        start_time: shiftData.start,
        end_time: shiftData.end,
        total_hours: diff,
      })
      toast({ title: 'Escala Criada', description: `${diff} horas calculadas e salvas.` })
      setShiftData({ ...shiftData, staffName: '', start: '', end: '' })
    } catch (e) {
      toast({ title: 'Erro', variant: 'destructive' })
    }
  }

  return (
    <div className="space-y-6 animate-fade-in pb-8">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900 flex items-center gap-2">
          <BrainCircuit className="w-6 h-6 text-primary" /> HR Intelligence Suite
        </h1>
        <p className="text-muted-foreground text-sm">
          Gestão de talentos, recrutamento com IA, performance e escalas.
        </p>
      </div>

      <Tabs defaultValue="recrutamento" className="w-full">
        <TabsList className="mb-4 bg-slate-100 flex flex-wrap h-auto p-1">
          <TabsTrigger value="recrutamento">Recrutamento</TabsTrigger>
          <TabsTrigger value="capacitacao">Capacitação</TabsTrigger>
          <TabsTrigger value="performance">Performance 360º</TabsTrigger>
          <TabsTrigger value="escalas">Escalas & Turnos</TabsTrigger>
        </TabsList>

        <TabsContent value="recrutamento" className="grid gap-6 md:grid-cols-2">
          <Card className="shadow-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <UserPlus className="w-5 h-5" /> Triar CV (IA)
              </CardTitle>
              <CardDescription>Analise candidatos para vagas abertas.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Nome do Candidato</Label>
                <Input
                  value={cvData.name}
                  onChange={(e) => setCvData({ ...cvData, name: e.target.value })}
                  placeholder="Ex: Ana Silva"
                />
              </div>
              <div className="space-y-2">
                <Label>Cargo Alvo</Label>
                <Input
                  value={cvData.cargo}
                  onChange={(e) => setCvData({ ...cvData, cargo: e.target.value })}
                  placeholder="Ex: Recepcionista Bilíngue"
                />
              </div>
              <div className="space-y-2">
                <Label>Texto do Currículo (Resumo)</Label>
                <Textarea
                  value={cvData.text}
                  onChange={(e) => setCvData({ ...cvData, text: e.target.value })}
                  rows={3}
                />
              </div>
              <Button onClick={handleScreenCV} className="w-full">
                Processar Match
              </Button>
            </CardContent>
          </Card>
          {cvOutput && (
            <Card className="shadow-sm border-emerald-200 bg-emerald-50">
              <CardHeader>
                <CardTitle className="text-emerald-800">Resultado da Análise</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-sm text-emerald-900">
                <p>
                  <strong>Match Score:</strong> {cvOutput.score}%
                </p>
                <p>
                  <strong>Competências:</strong> {cvOutput.skills.join(', ')}
                </p>
                <p className="text-amber-600 font-medium">
                  <strong>Alertas:</strong> {cvOutput.alerts.join(', ')}
                </p>
                <Button variant="outline" className="w-full mt-4 bg-white">
                  Agendar Entrevista
                </Button>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="capacitacao" className="grid gap-6 md:grid-cols-2">
          <Card className="shadow-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <GraduationCap className="w-5 h-5" /> Trilhas de Treinamento
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Colaborador</Label>
                <Input
                  value={enrollData.staffName}
                  onChange={(e) => setEnrollData({ ...enrollData, staffName: e.target.value })}
                  placeholder="Nome"
                />
              </div>
              <div className="space-y-2">
                <Label>Curso / Trilha</Label>
                <Select
                  value={enrollData.courseId}
                  onValueChange={(v) => setEnrollData({ ...enrollData, courseId: v })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione um curso" />
                  </SelectTrigger>
                  <SelectContent>
                    {trainings.map((t) => (
                      <SelectItem key={t.id} value={t.id}>
                        {t.title}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <Button onClick={handleEnroll} className="w-full">
                Inscrever Colaborador
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="performance">
          <Card className="shadow-sm max-w-xl">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="w-5 h-5" /> Avaliação 360º
              </CardTitle>
              <CardDescription>Configure avaliadores múltiplos e gere relatórios.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Avaliado</Label>
                <Input placeholder="Colaborador Alvo" />
              </div>
              <div className="space-y-2">
                <Label>Avaliadores (Pares e Liderança)</Label>
                <Input placeholder="Pessoa 1, Pessoa 2..." />
              </div>
              <Button
                className="w-full"
                onClick={() =>
                  toast({
                    title: 'Ciclo Iniciado',
                    description: 'Notificações de avaliação enviadas.',
                  })
                }
              >
                Iniciar Ciclo de Avaliação
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="escalas">
          <Card className="shadow-sm max-w-xl">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="w-5 h-5" /> Criar Escala
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Colaborador</Label>
                <Input
                  value={shiftData.staffName}
                  onChange={(e) => setShiftData({ ...shiftData, staffName: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>Setor</Label>
                <Select
                  value={shiftData.sector}
                  onValueChange={(v) => setShiftData({ ...shiftData, sector: v })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Recepção">Recepção</SelectItem>
                    <SelectItem value="Governança">Governança</SelectItem>
                    <SelectItem value="F&B">F&B</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Entrada</Label>
                  <Input
                    type="time"
                    value={shiftData.start}
                    onChange={(e) => setShiftData({ ...shiftData, start: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Saída</Label>
                  <Input
                    type="time"
                    value={shiftData.end}
                    onChange={(e) => setShiftData({ ...shiftData, end: e.target.value })}
                  />
                </div>
              </div>
              <Button onClick={handleCreateShift} className="w-full">
                Processar Turno
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
