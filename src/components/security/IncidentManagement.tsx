import { useState, useEffect } from 'react'
import { getIncidents, createIncident, updateIncident, SecurityIncident } from '@/services/security'
import { useRealtime } from '@/hooks/use-realtime'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { toast } from '@/components/ui/use-toast'
import { format } from 'date-fns'

export function IncidentManagement() {
  const [incidents, setIncidents] = useState<SecurityIncident[]>([])
  const [isNewOpen, setIsNewOpen] = useState(false)
  const [formData, setFormData] = useState<Partial<SecurityIncident>>({
    status: 'pending',
    category: 'média',
  })

  const loadData = async () => {
    try {
      setIncidents(await getIncidents())
    } catch (e) {
      console.error(e)
    }
  }

  useEffect(() => {
    loadData()
  }, [])
  useRealtime('security_incidents', loadData)

  const handleSubmit = async () => {
    try {
      if (!formData.type || !formData.location || !formData.description) {
        return toast({ title: 'Preencha os campos obrigatórios', variant: 'destructive' })
      }
      await createIncident({ ...formData, date_time: new Date().toISOString() })
      toast({ title: 'Incidente registrado com sucesso' })
      setIsNewOpen(false)
      setFormData({ status: 'pending', category: 'média' })
    } catch (e) {
      toast({ title: 'Erro ao registrar incidente', variant: 'destructive' })
    }
  }

  const handleResolve = async (id: string) => {
    try {
      await updateIncident(id, {
        status: 'resolved',
        resolution: 'Resolvido pela equipe de segurança.',
      })
      toast({ title: 'Incidente marcado como resolvido' })
    } catch (e) {
      console.error(e)
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center bg-white p-4 rounded-lg shadow-sm border">
        <h2 className="text-lg font-bold text-slate-800">Registro de Ocorrências</h2>
        <Dialog open={isNewOpen} onOpenChange={setIsNewOpen}>
          <DialogTrigger asChild>
            <Button>Novo Registro</Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>Registrar Incidente</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <Input
                placeholder="Tipo (ex: Furto, Invasão, Dano)"
                onChange={(e) => setFormData({ ...formData, type: e.target.value })}
              />
              <Input
                placeholder="Local"
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
              />
              <Select onValueChange={(v) => setFormData({ ...formData, category: v })}>
                <SelectTrigger>
                  <SelectValue placeholder="Categoria de Risco" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="baixa">Baixa</SelectItem>
                  <SelectItem value="média">Média</SelectItem>
                  <SelectItem value="alta">Alta</SelectItem>
                  <SelectItem value="crítica">Crítica</SelectItem>
                </SelectContent>
              </Select>
              <Textarea
                placeholder="Relato do incidente..."
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              />
              <Input
                placeholder="Envolvidos (nomes, quartos)"
                onChange={(e) => setFormData({ ...formData, involved: e.target.value })}
              />
              <Button onClick={handleSubmit} className="w-full">
                Salvar Registro
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="bg-white rounded-lg border shadow-sm overflow-hidden">
        <Table>
          <TableHeader className="bg-slate-50">
            <TableRow>
              <TableHead>Data/Hora</TableHead>
              <TableHead>Tipo & Local</TableHead>
              <TableHead>Categoria</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {incidents.map((inc) => (
              <TableRow key={inc.id}>
                <TableCell className="font-mono text-xs">
                  {format(new Date(inc.date_time), 'dd/MM/yy HH:mm')}
                </TableCell>
                <TableCell>
                  <p className="font-semibold text-slate-800">{inc.type}</p>
                  <p className="text-xs text-slate-500">{inc.location}</p>
                </TableCell>
                <TableCell>
                  <Badge variant="outline" className="uppercase text-[10px]">
                    {inc.category}
                  </Badge>
                </TableCell>
                <TableCell>
                  <Badge
                    className={
                      inc.status === 'pending'
                        ? 'bg-rose-500'
                        : inc.status === 'investigation'
                          ? 'bg-amber-500'
                          : 'bg-emerald-500'
                    }
                  >
                    {inc.status}
                  </Badge>
                </TableCell>
                <TableCell className="text-right">
                  {inc.status !== 'resolved' && inc.status !== 'closed' && (
                    <Button variant="outline" size="sm" onClick={() => handleResolve(inc.id)}>
                      Resolver
                    </Button>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
