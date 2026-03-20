import { useState, useEffect } from 'react'
import { Navigate } from 'react-router-dom'
import { HardDrive, Activity, ShieldCheck, LifeBuoy, AlertCircle } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
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
import { useRealtime } from '@/hooks/use-realtime'
import {
  getAssets,
  createAsset,
  getAccessRequests,
  createAccessRequest,
  getIotSensors,
  getTickets,
  createTicket,
} from '@/services/it'

export default function ITAdmin() {
  const { userRole, userName } = useAuthStore()
  const [assets, setAssets] = useState<any[]>([])
  const [sensors, setSensors] = useState<any[]>([])
  const [tickets, setTickets] = useState<any[]>([])
  const [requests, setRequests] = useState<any[]>([])

  const [assetForm, setAssetForm] = useState({ name: '', type: 'Desktop', serial: '' })
  const [reqForm, setReqForm] = useState({ user: '', system: 'PMS' })
  const [ticketForm, setTicketForm] = useState({ category: 'Rede', desc: '' })

  const loadData = async () => {
    try {
      setAssets(await getAssets())
      setSensors(await getIotSensors())
      setTickets(await getTickets())
      setRequests(await getAccessRequests())
    } catch (e) {
      console.error(e)
    }
  }

  useEffect(() => {
    loadData()
  }, [])
  useRealtime('iot_sensors', loadData)
  useRealtime('it_tickets', loadData)

  if (userRole !== 'Admin' && userRole !== 'Administrativa') return <Navigate to="/" replace />

  const handleAsset = async () => {
    try {
      await createAsset({ ...assetForm, status: 'Ativo' })
      toast({ title: 'Sucesso', description: 'Equipamento registrado.' })
      setAssetForm({ name: '', type: 'Desktop', serial: '' })
      loadData()
    } catch (e) {
      toast({ title: 'Erro', variant: 'destructive' })
    }
  }

  const handleAccess = async () => {
    try {
      await createAccessRequest({
        user_name: reqForm.user,
        system_name: reqForm.system,
        status: 'Aprovado',
        auditor_name: userName,
      })
      toast({ title: 'Acesso Concedido', description: 'Log de auditoria gerado.' })
      setReqForm({ user: '', system: 'PMS' })
      loadData()
    } catch (e) {
      toast({ title: 'Erro', variant: 'destructive' })
    }
  }

  const handleTicket = async () => {
    try {
      const d = new Date()
      d.setHours(d.getHours() + 4) // 4h SLA
      await createTicket({
        requester_name: userName,
        category: ticketForm.category,
        description: ticketForm.desc,
        status: 'Aberto',
        sla_deadline: d.toISOString(),
      })
      toast({ title: 'Ticket Criado', description: 'Equipe de TI notificada.' })
      setTicketForm({ category: 'Rede', desc: '' })
    } catch (e) {
      toast({ title: 'Erro', variant: 'destructive' })
    }
  }

  return (
    <div className="space-y-6 animate-fade-in pb-8">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900 flex items-center gap-2">
          <HardDrive className="w-6 h-6 text-primary" /> Gestão de TI & Infraestrutura
        </h1>
        <p className="text-muted-foreground text-sm">
          Inventário, sensores IoT, acessos e suporte técnico.
        </p>
      </div>

      <Tabs defaultValue="iot" className="w-full">
        <TabsList className="mb-4 bg-slate-100 flex flex-wrap h-auto p-1">
          <TabsTrigger value="iot">IoT Center</TabsTrigger>
          <TabsTrigger value="inventario">Inventário TI</TabsTrigger>
          <TabsTrigger value="acessos">Acessos & Permissões</TabsTrigger>
          <TabsTrigger value="helpdesk">Help Desk</TabsTrigger>
        </TabsList>

        <TabsContent value="iot" className="grid gap-4 md:grid-cols-3">
          {sensors.map((s) => {
            const isCritical = s.current_value > s.threshold
            return (
              <Card
                key={s.id}
                className={`shadow-sm ${isCritical ? 'border-rose-300 bg-rose-50' : ''}`}
              >
                <CardHeader className="pb-2">
                  <CardTitle className="text-base flex items-center justify-between">
                    <span className="flex items-center gap-2">
                      <Activity className="w-4 h-4" /> {s.name}
                    </span>
                    {isCritical && <AlertCircle className="w-4 h-4 text-rose-600 animate-pulse" />}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold font-mono text-slate-800">
                    {s.current_value} {s.unit}
                  </div>
                  <p className="text-xs text-slate-500 mt-1">
                    Threshold: {s.threshold} {s.unit}
                  </p>
                </CardContent>
              </Card>
            )
          })}
        </TabsContent>

        <TabsContent value="inventario" className="grid gap-6 md:grid-cols-2">
          <Card className="shadow-sm">
            <CardHeader>
              <CardTitle>Registrar Equipamento</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Nome</Label>
                <Input
                  value={assetForm.name}
                  onChange={(e) => setAssetForm({ ...assetForm, name: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>Tipo</Label>
                <Select
                  value={assetForm.type}
                  onValueChange={(v) => setAssetForm({ ...assetForm, type: v })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Desktop">Desktop</SelectItem>
                    <SelectItem value="Tablet">Tablet</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Serial Number</Label>
                <Input
                  value={assetForm.serial}
                  onChange={(e) => setAssetForm({ ...assetForm, serial: e.target.value })}
                />
              </div>
              <Button onClick={handleAsset} className="w-full">
                Salvar Inventário
              </Button>
            </CardContent>
          </Card>
          <Card className="shadow-sm">
            <CardHeader>
              <CardTitle>Listar Equipamentos</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {assets.map((a) => (
                <div
                  key={a.id}
                  className="p-3 bg-slate-50 border rounded text-sm flex justify-between"
                >
                  <span>
                    <strong>{a.name}</strong> ({a.serial})
                  </span>
                  <span className="text-slate-500">{a.status}</span>
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="acessos" className="grid gap-6 md:grid-cols-2">
          <Card className="shadow-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ShieldCheck className="w-5 h-5" /> Solicitar Acesso
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Usuário</Label>
                <Input
                  value={reqForm.user}
                  onChange={(e) => setReqForm({ ...reqForm, user: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>Sistema</Label>
                <Select
                  value={reqForm.system}
                  onValueChange={(v) => setReqForm({ ...reqForm, system: v })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="PMS">PMS Principal</SelectItem>
                    <SelectItem value="ERP">ERP Financeiro</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Button onClick={handleAccess} className="w-full">
                Aprovar e Logar Auditoria
              </Button>
            </CardContent>
          </Card>
          <Card className="shadow-sm">
            <CardHeader>
              <CardTitle>Auditoria de Acessos</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {requests.map((r) => (
                <div key={r.id} className="p-2 border-b text-sm flex justify-between">
                  <span>
                    {r.user_name} ➔ {r.system_name}
                  </span>
                  <span className="text-emerald-600 font-bold text-xs bg-emerald-50 px-2 py-1 rounded">
                    {r.status}
                  </span>
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="helpdesk" className="grid gap-6 md:grid-cols-2">
          <Card className="shadow-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <LifeBuoy className="w-5 h-5" /> Abrir Ticket TI
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Categoria</Label>
                <Select
                  value={ticketForm.category}
                  onValueChange={(v) => setTicketForm({ ...ticketForm, category: v })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Rede">Rede / Wi-Fi</SelectItem>
                    <SelectItem value="Hardware">Hardware Defeituoso</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Descrição</Label>
                <Textarea
                  value={ticketForm.desc}
                  onChange={(e) => setTicketForm({ ...ticketForm, desc: e.target.value })}
                />
              </div>
              <Button onClick={handleTicket} className="w-full bg-slate-900">
                Registrar Incidente
              </Button>
            </CardContent>
          </Card>
          <Card className="shadow-sm">
            <CardHeader>
              <CardTitle>SLA Tracking (Abertos)</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {tickets.slice(0, 5).map((t) => (
                <div key={t.id} className="p-3 border rounded-lg bg-slate-50 text-sm">
                  <div className="flex justify-between font-bold mb-1">
                    <span>{t.category}</span> <span>{t.status}</span>
                  </div>
                  <p className="text-slate-600 truncate">{t.description}</p>
                  <p className="text-xs text-rose-500 mt-2 font-mono">
                    SLA Deadline: {new Date(t.sla_deadline).toLocaleString()}
                  </p>
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
