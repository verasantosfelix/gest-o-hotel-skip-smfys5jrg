import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import pb from '@/lib/pocketbase/client'
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  ShieldCheck,
  User,
  Receipt,
  Wrench,
  ConciergeBell,
  CheckCircle2,
  Award,
} from 'lucide-react'
import { toast } from '@/components/ui/use-toast'

export default function GuestPortal() {
  const { reserva_id } = useParams()
  const navigate = useNavigate()
  const [reserva, setReserva] = useState<any>(null)
  const [guestLoyalty, setGuestLoyalty] = useState<any>(null)
  const [consumptions, setConsumptions] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  const [guestForm, setGuestForm] = useState({ phone: '', document_id: '', email: '' })
  const [housekeepingType, setHousekeepingType] = useState('toalhas_extra')
  const [maintenanceDesc, setMaintenanceDesc] = useState('')

  useEffect(() => {
    loadData()
  }, [reserva_id])

  const loadData = async () => {
    try {
      const res = await pb
        .collection('reservations')
        .getOne(reserva_id!, { expand: 'guest_id,room_id' })
      setReserva(res)
      if (res.guest_id) {
        const guest = await pb.collection('guest_loyalty').getOne(reserva.guest_id)
        setGuestLoyalty(guest)
        setGuestForm({
          phone: guest.phone || '',
          document_id: guest.document_id || '',
          email: guest.email || '',
        })
      }
      const cons = await pb
        .collection('consumptions')
        .getFullList({ filter: `reservation_id="${res.id}"` })
      setConsumptions(cons)
    } catch {
      toast({
        title: 'Erro',
        description: 'Não foi possível carregar os dados da reserva.',
        variant: 'destructive',
      })
    } finally {
      setLoading(false)
    }
  }

  const handleUpdateGuest = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!guestLoyalty) return
    try {
      await pb.collection('guest_loyalty').update(guestLoyalty.id, guestForm)
      toast({ title: 'Sucesso', description: 'Dados atualizados com sucesso.' })
    } catch {
      toast({ title: 'Erro', description: 'Falha ao atualizar dados.', variant: 'destructive' })
    }
  }

  const handleRequestService = async () => {
    try {
      await pb.collection('amenity_requests').create({
        room_id: reserva.room_id,
        guest_name: reserva.guest_name,
        item: housekeepingType,
        quantity: 1,
        priority: 'normal',
        status: 'pending',
      })
      toast({
        title: 'Solicitação Enviada',
        description: 'Sua solicitação foi encaminhada para a recepção.',
      })
    } catch {
      toast({ title: 'Erro', description: 'Falha ao solicitar serviço.', variant: 'destructive' })
    }
  }

  const handleReportProblem = async () => {
    if (!maintenanceDesc) return
    try {
      await pb.collection('maintenance_tickets').create({
        room_id: reserva.room_id,
        description: maintenanceDesc,
        priority: 'normal',
        status: 'open',
        problem_type: 'guest_reported',
      })
      setMaintenanceDesc('')
      toast({ title: 'Problema Reportado', description: 'A equipe de manutenção foi notificada.' })
    } catch {
      toast({ title: 'Erro', description: 'Falha ao reportar problema.', variant: 'destructive' })
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-8">
        Carregando...
      </div>
    )
  }

  if (!reserva) {
    return (
      <div className="min-h-screen bg-slate-50 p-8 flex flex-col items-center justify-center font-sans">
        <div className="text-center text-slate-500 bg-white p-8 rounded-lg shadow-sm border border-slate-200">
          <p className="font-medium text-lg">Reserva não encontrada.</p>
          <Button onClick={() => navigate('/portal/login')} className="mt-4">
            Voltar ao Login
          </Button>
        </div>
      </div>
    )
  }

  const totalConsumo = consumptions.reduce((acc, curr) => acc + (curr.amount || 0), 0)

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col p-4 sm:p-8 font-sans items-center pb-20">
      <div className="w-full max-w-2xl space-y-6 animate-fade-in-up">
        <div className="flex justify-between items-center mt-4 sm:mt-8">
          <div className="space-y-1">
            <h1 className="text-2xl font-bold text-slate-900">Portal do Hóspede</h1>
            <p className="text-slate-500 text-sm">Gerencie a sua estadia com facilidade</p>
          </div>
          <Button variant="outline" size="sm" onClick={() => navigate('/portal/login')}>
            Sair
          </Button>
        </div>

        <Card className="border-slate-200 shadow-sm overflow-hidden">
          <div className="bg-slate-800 h-2 w-full" />
          <CardContent className="p-5 flex flex-wrap items-center gap-4 justify-between">
            <div className="flex items-center gap-4">
              <div className="bg-slate-100 p-3 rounded-full shrink-0">
                <User className="w-6 h-6 text-slate-600" />
              </div>
              <div>
                <p className="text-sm text-slate-500 mb-0.5">Bem-vindo(a),</p>
                <p className="text-lg font-bold text-slate-900 leading-tight">
                  {reserva.guest_name}
                </p>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-xs font-medium bg-slate-100 px-2 py-0.5 rounded text-slate-600">
                    Quarto {reserva.expand?.room_id?.room_number || 'N/A'}
                  </span>
                  <span className="text-xs text-slate-400">ID: {reserva.id}</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Tabs defaultValue="resumo" className="w-full">
          <TabsList className="grid grid-cols-2 md:grid-cols-5 mb-4 h-auto">
            <TabsTrigger value="resumo" className="py-2 text-xs md:text-sm">
              Resumo
            </TabsTrigger>
            <TabsTrigger value="perfil" className="py-2 text-xs md:text-sm">
              Perfil
            </TabsTrigger>
            <TabsTrigger value="servicos" className="py-2 text-xs md:text-sm">
              Serviços
            </TabsTrigger>
            <TabsTrigger value="conta" className="py-2 text-xs md:text-sm">
              Conta
            </TabsTrigger>
            <TabsTrigger
              value="fidelidade"
              className="py-2 text-xs md:text-sm disabled:opacity-50"
              disabled
            >
              Fidelidade <Award className="w-3 h-3 ml-1 inline" />
            </TabsTrigger>
          </TabsList>

          <TabsContent value="resumo" className="space-y-4">
            <Card className="border-slate-200 shadow-sm">
              <CardHeader>
                <CardTitle className="text-base">Detalhes da Reserva</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-slate-500 block mb-1">Check-in</span>
                    <span className="font-medium">
                      {reserva.check_in ? new Date(reserva.check_in).toLocaleDateString() : 'N/A'}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-500 block mb-1">Check-out</span>
                    <span className="font-medium">
                      {reserva.check_out ? new Date(reserva.check_out).toLocaleDateString() : 'N/A'}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-500 block mb-1">Status</span>
                    <span className="font-medium uppercase">{reserva.status}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block mb-1">Hóspedes</span>
                    <span className="font-medium">{reserva.guests_count || 1}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="perfil" className="space-y-4">
            <Card className="border-slate-200 shadow-sm">
              <CardHeader>
                <CardTitle className="text-base">Ficha de Cliente</CardTitle>
              </CardHeader>
              <CardContent>
                {guestLoyalty ? (
                  <form onSubmit={handleUpdateGuest} className="space-y-4">
                    <div className="space-y-2">
                      <Label>Email</Label>
                      <Input
                        value={guestForm.email}
                        onChange={(e) => setGuestForm({ ...guestForm, email: e.target.value })}
                        placeholder="Seu email"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Telefone</Label>
                      <Input
                        value={guestForm.phone}
                        onChange={(e) => setGuestForm({ ...guestForm, phone: e.target.value })}
                        placeholder="Seu telefone"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Documento / Passaporte</Label>
                      <Input
                        value={guestForm.document_id}
                        onChange={(e) =>
                          setGuestForm({ ...guestForm, document_id: e.target.value })
                        }
                        placeholder="Nº Documento"
                      />
                    </div>
                    <Button type="submit" className="w-full mt-2">
                      Atualizar Dados
                    </Button>
                  </form>
                ) : (
                  <p className="text-sm text-slate-500">
                    Dados de fidelidade não encontrados para esta reserva.
                  </p>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="servicos" className="space-y-4">
            <Card className="border-slate-200 shadow-sm">
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <ConciergeBell className="w-5 h-5" /> Solicitar Amenities
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>Item Desejado</Label>
                  <Select value={housekeepingType} onValueChange={setHousekeepingType}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="toalhas_extra">Toalhas Extra</SelectItem>
                      <SelectItem value="shampoo">Shampoo / Gel</SelectItem>
                      <SelectItem value="kit_dentes">Kit Dental</SelectItem>
                      <SelectItem value="água">Água Mineral</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <Button onClick={handleRequestService} className="w-full">
                  Solicitar Recepção
                </Button>
              </CardContent>
            </Card>

            <Card className="border-slate-200 shadow-sm">
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <Wrench className="w-5 h-5" /> Reportar Problema
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>Descrição do Problema</Label>
                  <Textarea
                    placeholder="Ex: Ar condicionado não funciona, lâmpada queimada..."
                    value={maintenanceDesc}
                    onChange={(e) => setMaintenanceDesc(e.target.value)}
                  />
                </div>
                <Button variant="outline" onClick={handleReportProblem} className="w-full">
                  Enviar para Manutenção
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="conta" className="space-y-4">
            <Card className="border-slate-200 shadow-sm">
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <Receipt className="w-5 h-5" /> Extrato Atual
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="mb-6 bg-slate-50 p-4 rounded-lg flex justify-between items-center border border-slate-100">
                  <span className="text-slate-600 font-medium">Total de Consumos</span>
                  <span className="text-xl font-bold">R$ {totalConsumo.toFixed(2)}</span>
                </div>

                {consumptions.length === 0 ? (
                  <div className="text-center p-6 text-slate-500">Nenhum consumo registrado.</div>
                ) : (
                  <div className="space-y-3">
                    {consumptions.map((item) => (
                      <div
                        key={item.id}
                        className="flex justify-between items-center border-b border-slate-100 pb-2 last:border-0 last:pb-0"
                      >
                        <div>
                          <p className="font-medium text-sm text-slate-800">
                            {item.description || item.type}
                          </p>
                          <p className="text-xs text-slate-500 uppercase">{item.type}</p>
                        </div>
                        <span className="font-semibold text-slate-900">
                          R$ {(item.amount || 0).toFixed(2)}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="fidelidade">
            <Card className="border-slate-200 shadow-sm opacity-50">
              <CardContent className="p-8 text-center">
                <Award className="w-12 h-12 mx-auto text-slate-400 mb-3" />
                <h3 className="text-lg font-medium text-slate-700">Programa de Fidelidade</h3>
                <p className="text-sm text-slate-500 mt-1">Em breve disponível.</p>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
