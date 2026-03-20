import { useState } from 'react'
import { CheckCircle2, Clock, PlayCircle, SprayCan, AlertTriangle } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from '@/components/ui/dialog'
import { toast } from '@/components/ui/use-toast'

type TaskStatus = 'Pendente' | 'Em Execução' | 'Concluído'
type Task = { id: string; room: string; type: string; status: TaskStatus; staff?: string }

const INITIAL_TASKS: Task[] = [
  { id: 'T1', room: '102', type: 'Limpeza Diária', status: 'Pendente' },
  {
    id: 'T2',
    room: '302',
    type: 'Checkout - Limpeza Profunda',
    status: 'Em Execução',
    staff: 'Maria Silva',
  },
  { id: 'T3', room: '204', type: 'Arrumação', status: 'Concluído', staff: 'João Souza' },
  { id: 'T4', room: '105', type: 'Checkout', status: 'Pendente' },
]

export default function Housekeeping() {
  const [tasks, setTasks] = useState<Task[]>(INITIAL_TASKS)
  const [tab, setTab] = useState<TaskStatus | 'Todas'>('Todas')
  const [selectedTask, setSelectedTask] = useState<Task | null>(null)
  const [staffName, setStaffName] = useState('')
  const [error, setError] = useState('')

  const handleUpdateStatus = () => {
    if (!selectedTask) return
    if (selectedTask.status === 'Em Execução' && !staffName.trim()) {
      setError('<erro tipo="faltam-dados">Nome do responsável é obrigatório para concluir.</erro>')
      return
    }

    const nextStatus: TaskStatus = selectedTask.status === 'Pendente' ? 'Em Execução' : 'Concluído'

    setTasks(
      tasks.map((t) =>
        t.id === selectedTask.id ? { ...t, status: nextStatus, staff: staffName || t.staff } : t,
      ),
    )

    toast({
      title: 'Status Atualizado',
      description: `Quarto ${selectedTask.room} marcado como ${nextStatus}.`,
    })

    setSelectedTask(null)
    setStaffName('')
    setError('')
  }

  const filteredTasks = tab === 'Todas' ? tasks : tasks.filter((t) => t.status === tab)

  const getStatusIcon = (status: TaskStatus) => {
    if (status === 'Pendente') return <Clock className="w-4 h-4 text-amber-500" />
    if (status === 'Em Execução') return <PlayCircle className="w-4 h-4 text-blue-500" />
    return <CheckCircle2 className="w-4 h-4 text-emerald-500" />
  }

  return (
    <div className="space-y-6 animate-fade-in pb-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
            <SprayCan className="w-6 h-6 text-primary" />
            Controle de Governança
          </h1>
          <p className="text-muted-foreground text-sm">
            Gestão de limpeza e preparação de quartos.
          </p>
        </div>
      </div>

      <Tabs defaultValue="Todas" className="w-full" onValueChange={(v) => setTab(v as any)}>
        <TabsList className="mb-4">
          <TabsTrigger value="Todas">Todas</TabsTrigger>
          <TabsTrigger value="Pendente">Pendentes</TabsTrigger>
          <TabsTrigger value="Em Execução">Em Execução</TabsTrigger>
          <TabsTrigger value="Concluído">Concluídas</TabsTrigger>
        </TabsList>

        <TabsContent value={tab} className="mt-0 outline-none">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {filteredTasks.map((task) => (
              <Card key={task.id} className="border-slate-200 shadow-sm relative overflow-hidden">
                <div
                  className={`absolute top-0 left-0 w-1 h-full ${
                    task.status === 'Pendente'
                      ? 'bg-amber-400'
                      : task.status === 'Em Execução'
                        ? 'bg-blue-400'
                        : 'bg-emerald-400'
                  }`}
                />
                <CardHeader className="pb-2 flex flex-row items-start justify-between">
                  <div>
                    <CardTitle className="text-lg flex items-center gap-2">
                      Quarto {task.room}
                    </CardTitle>
                    <p className="text-sm text-muted-foreground mt-1">{task.type}</p>
                  </div>
                  <Badge
                    variant="outline"
                    className="flex items-center gap-1 font-normal bg-background"
                  >
                    {getStatusIcon(task.status)}
                    {task.status}
                  </Badge>
                </CardHeader>
                <CardContent className="pb-2">
                  <p className="text-sm text-slate-600">
                    <span className="font-medium">Responsável:</span>{' '}
                    {task.staff || 'Não atribuído'}
                  </p>
                </CardContent>
                <CardFooter className="pt-2 pb-4">
                  {task.status !== 'Concluído' && (
                    <Button
                      variant={task.status === 'Pendente' ? 'default' : 'secondary'}
                      className="w-full"
                      onClick={() => setSelectedTask(task)}
                    >
                      {task.status === 'Pendente' ? 'Iniciar Limpeza' : 'Marcar como Limpo'}
                    </Button>
                  )}
                </CardFooter>
              </Card>
            ))}
            {filteredTasks.length === 0 && (
              <div className="col-span-full p-8 text-center text-slate-500 border border-dashed rounded-lg">
                Nenhuma tarefa encontrada para este filtro.
              </div>
            )}
          </div>
        </TabsContent>
      </Tabs>

      <Dialog open={!!selectedTask} onOpenChange={(o) => !o && setSelectedTask(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Atualizar Status: Quarto {selectedTask?.room}</DialogTitle>
            <DialogDescription>
              {selectedTask?.status === 'Pendente'
                ? 'Iniciar tarefa de limpeza.'
                : 'Confirmar conclusão e liberar quarto.'}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Nome do Colaborador (Responsável)</Label>
              <Input
                placeholder="Ex: Maria Silva"
                value={staffName}
                onChange={(e) => setStaffName(e.target.value)}
              />
            </div>
            {error && (
              <div className="text-xs text-rose-600 bg-rose-50 p-2 rounded flex items-center gap-2 font-mono">
                <AlertTriangle className="w-4 h-4" />
                {error}
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setSelectedTask(null)}>
              Cancelar
            </Button>
            <Button onClick={handleUpdateStatus}>
              {selectedTask?.status === 'Pendente' ? 'Confirmar Início' : 'Confirmar Limpeza'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
