import { useState, useEffect, useRef } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import { Checkbox } from '@/components/ui/checkbox'
import { SignaturePad, SignaturePadRef } from '@/components/ui/signature-pad'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { toast } from '@/components/ui/use-toast'
import { ArrowLeft, Clock, Save, ShieldCheck, Utensils, Sparkles } from 'lucide-react'
import { GuestLoyalty, updateLoyalty } from '@/services/guest_loyalty'
import { GuestInteraction, getGuestInteractions, createGuestInteraction } from '@/services/crm'
import {
  getSpaServices,
  getUsers,
  createSpaAppointment,
  SpaAppointment,
  getSpaAppointments,
} from '@/services/spa'
import { getReservations, PBReservation } from '@/services/reservations'
import {
  createFBReservation,
  createFBOrder,
  createFBOrderItem,
  getFBProducts,
  FBProduct,
} from '@/services/fnb'
import pb from '@/lib/pocketbase/client'
import { useRealtime } from '@/hooks/use-realtime'

export function GuestProfileView({ guest, onBack }: { guest: GuestLoyalty; onBack: () => void }) {
  const [interactions, setInteractions] = useState<GuestInteraction[]>([])
  const [newIntType, setNewIntType] = useState<any>('note')
  const [newIntDetails, setNewIntDetails] = useState('')

  const [marketingConsent, setMarketingConsent] = useState(guest.marketing_consent || false)
  const [roomPrefs, setRoomPrefs] = useState(guest.room_preferences || '')
  const sigRef = useRef<SignaturePadRef>(null)

  const [spaServices, setSpaServices] = useState<any[]>([])
  const [therapists, setTherapists] = useState<any[]>([])
  const [spaAppts, setSpaAppts] = useState<SpaAppointment[]>([])
  const [spaForm, setSpaForm] = useState({ serviceId: '', therapistId: '', date: '' })

  const [reservations, setReservations] = useState<PBReservation[]>([])
  const [fbProducts, setFbProducts] = useState<FBProduct[]>([])
  const [fbForm, setFbForm] = useState({
    type: 'table',
    date: '',
    pax: '2',
    resId: '',
    productId: '',
  })

  const loadData = async () => {
    try {
      setInteractions(await getGuestInteractions(guest.id))
      setSpaServices(await getSpaServices("status='published'"))
      setTherapists(await getUsers())
      setSpaAppts(await getSpaAppointments())
      const res = await getReservations()
      setReservations(
        res.filter(
          (r) =>
            r.guest_name.toLowerCase() === guest.guest_name.toLowerCase() &&
            r.status === 'in_house',
        ),
      )
      setFbProducts(await getFBProducts())
    } catch (e) {
      console.error(e)
    }
  }

  useEffect(() => {
    loadData()
  }, [guest.id])
  useRealtime('guest_interactions', () => getGuestInteractions(guest.id).then(setInteractions))
  useRealtime('spa_appointments', () => getSpaAppointments().then(setSpaAppts))

  const handleAddInteraction = async () => {
    if (!newIntDetails) return
    try {
      await createGuestInteraction({
        guest_id: guest.id,
        type: newIntType,
        details: newIntDetails,
        staff_id: pb.authStore.record?.id,
      })
      setNewIntDetails('')
      toast({ title: 'Interação registrada.' })
    } catch (e) {
      toast({ title: 'Erro', variant: 'destructive' })
    }
  }

  const dataURLtoBlob = (dataurl: string) => {
    const arr = dataurl.split(',')
    const mimeMatch = arr[0].match(/:(.*?);/)
    const mime = mimeMatch ? mimeMatch[1] : 'image/png'
    const bstr = atob(arr[1])
    let n = bstr.length
    const u8arr = new Uint8Array(n)
    while (n--) {
      u8arr[n] = bstr.charCodeAt(n)
    }
    return new Blob([u8arr], { type: mime })
  }

  const handleSavePrefs = async () => {
    try {
      const formData = new FormData()
      formData.append('marketing_consent', marketingConsent.toString())
      formData.append('room_preferences', roomPrefs)
      if (marketingConsent && sigRef.current && !sigRef.current.isEmpty()) {
        const blob = dataURLtoBlob(sigRef.current.toDataURL()!)
        formData.append('consent_signature', blob, 'signature.png')
      }
      await updateLoyalty(guest.id, formData)
      toast({ title: 'Preferências e consentimento salvos com sucesso!' })
    } catch (e) {
      toast({ title: 'Erro ao salvar', variant: 'destructive' })
    }
  }

  const handleBookSpa = async () => {
    if (!spaForm.serviceId || !spaForm.therapistId || !spaForm.date)
      return toast({ title: 'Preencha todos os campos', variant: 'destructive' })
    try {
      const start = new Date(spaForm.date)
      const end = new Date(start.getTime() + 60 * 60000)

      let conflict = false
      for (const a of spaAppts) {
        if (a.therapist_id !== spaForm.therapistId || a.status === 'cancelled') continue
        const aStart = new Date(a.start_time)
        const aEnd = new Date(a.end_time)
        if (Math.max(start.getTime(), aStart.getTime()) < Math.min(end.getTime(), aEnd.getTime())) {
          conflict = true
          break
        }
      }

      await createSpaAppointment({
        guest_name: guest.guest_name,
        service_id: spaForm.serviceId,
        therapist_id: spaForm.therapistId,
        start_time: spaForm.date,
        end_time: end.toISOString(),
        status: conflict ? 'pending_approval' : 'scheduled',
        spa_room_id: '',
        notes: `Agendado via CRM. Conflito verificado: ${conflict}`,
      })
      toast({ title: conflict ? 'Agendamento Pendente de Validação' : 'SPA Agendado' })
      setSpaForm({ serviceId: '', therapistId: '', date: '' })
    } catch (e) {
      toast({ title: 'Erro', variant: 'destructive' })
    }
  }

  const handleBookFB = async () => {
    try {
      if (fbForm.type === 'table') {
        if (!fbForm.date) return
        await createFBReservation({
          guest_name: guest.guest_name,
          people_count: parseInt(fbForm.pax) || 2,
          reservation_time: fbForm.date,
          status: 'pending',
          notes: 'Agendado via CRM',
        })
        toast({ title: 'Reserva de mesa enviada para aprovação (Pendente).' })
      } else {
        if (!fbForm.resId || !fbForm.productId) return
        const prod = fbProducts.find((p) => p.id === fbForm.productId)
        if (!prod) return
        const res = reservations.find((r) => r.id === fbForm.resId)
        const o = await createFBOrder({
          type: 'room_service',
          status: 'pending',
          reservation_id: res?.id,
          room_id: res?.room_id,
          total_amount: prod.price,
          service_fee: 0,
        })
        await createFBOrderItem({
          order_id: o.id,
          product_id: prod.id,
          quantity: 1,
          price_at_time: prod.price,
          status: 'pending',
        })
        toast({ title: 'Pedido Room Service enviado para a cozinha (Pendente).' })
      }
      setFbForm({ ...fbForm, date: '', productId: '' })
    } catch (e) {
      toast({ title: 'Erro', variant: 'destructive' })
    }
  }

  return (
    <div className="space-y-6 animate-fade-in pb-8">
      <div className="flex items-center justify-between">
        <Button variant="ghost" onClick={onBack} className="mb-2">
          <ArrowLeft className="w-4 h-4 mr-2" /> Voltar à Lista
        </Button>
        <Badge className="bg-slate-900 text-white text-lg px-4 py-1">
          {guest.tier || 'Standard'}
        </Badge>
      </div>

      <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex items-center gap-4">
        <div className="w-16 h-16 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-2xl font-bold uppercase">
          {guest.guest_name.charAt(0)}
        </div>
        <div>
          <h1 className="text-2xl font-bold text-slate-800">{guest.guest_name}</h1>
          <p className="text-slate-500">
            {guest.email || 'Sem email'} • {guest.points || 0} Pontos
          </p>
        </div>
      </div>

      <Tabs defaultValue="history">
        <TabsList className="bg-slate-100 p-1 rounded-lg">
          <TabsTrigger value="history">Histórico CRM</TabsTrigger>
          <TabsTrigger value="prefs">GDPR & Preferências</TabsTrigger>
          <TabsTrigger value="spa">Booking SPA</TabsTrigger>
          <TabsTrigger value="fnb">Booking F&B</TabsTrigger>
        </TabsList>

        <TabsContent value="history" className="space-y-4 pt-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Nova Interação</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex flex-col md:flex-row gap-4">
                <Select value={newIntType} onValueChange={setNewIntType}>
                  <SelectTrigger className="md:w-48">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="note">Nota / Observação</SelectItem>
                    <SelectItem value="preference">Preferência</SelectItem>
                    <SelectItem value="incident">Incidente</SelectItem>
                    <SelectItem value="interaction">Interação Direta</SelectItem>
                  </SelectContent>
                </Select>
                <Input
                  placeholder="Detalhes da interação..."
                  value={newIntDetails}
                  onChange={(e) => setNewIntDetails(e.target.value)}
                />
                <Button onClick={handleAddInteraction}>Salvar</Button>
              </div>
            </CardContent>
          </Card>

          <div className="space-y-4 relative before:absolute before:inset-0 before:ml-5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-slate-300 before:to-transparent pt-6">
            {interactions.map((int) => (
              <div
                key={int.id}
                className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active"
              >
                <div className="flex items-center justify-center w-10 h-10 rounded-full border border-white bg-slate-200 text-slate-500 shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 z-10">
                  <Clock className="w-4 h-4" />
                </div>
                <div className="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] p-4 rounded-lg border border-slate-200 bg-white shadow-sm z-10">
                  <div className="flex justify-between items-center mb-1">
                    <Badge variant="outline">{int.type.toUpperCase()}</Badge>
                    <time className="font-mono text-xs text-slate-500">
                      {new Date(int.created).toLocaleString()}
                    </time>
                  </div>
                  <div className="text-slate-700 mt-2">{int.details}</div>
                  <div className="text-xs text-slate-400 mt-3 flex items-center gap-1">
                    Por: {int.expand?.staff_id?.name || 'Staff'}
                  </div>
                </div>
              </div>
            ))}
            {interactions.length === 0 && (
              <p className="text-center text-slate-500 relative z-10 py-10">
                Nenhuma interação registrada.
              </p>
            )}
          </div>
        </TabsContent>

        <TabsContent value="prefs" className="pt-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-emerald-600" /> Consentimento & Preferências
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label className="text-base">Preferências de Acomodação (Permanentes)</Label>
                <Textarea
                  placeholder="Ex: Andar alto, travesseiro extra, alérgico a penas..."
                  value={roomPrefs}
                  onChange={(e) => setRoomPrefs(e.target.value)}
                  className="min-h-[100px]"
                />
              </div>
              <div className="border-t pt-6 space-y-4">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="marketing"
                    checked={marketingConsent}
                    onCheckedChange={(v) => setMarketingConsent(v as boolean)}
                  />
                  <Label htmlFor="marketing" className="text-base font-semibold">
                    Consentimento para Marketing (GDPR)
                  </Label>
                </div>
                <p className="text-sm text-slate-500 md:ml-6">
                  O hóspede aceita explicitamente receber comunicações de marketing e campanhas
                  promocionais automatizadas baseadas em nível de fidelidade.
                </p>

                {marketingConsent && !guest.consent_signature && (
                  <div className="md:ml-6 space-y-2 border border-orange-200 bg-orange-50 p-4 rounded-lg">
                    <Label className="text-orange-800 font-bold">
                      Assinatura Obrigatória para Consentimento
                    </Label>
                    <div className="bg-white rounded-md p-1 border">
                      <SignaturePad ref={sigRef} className="w-full h-32" />
                    </div>
                    <Button variant="ghost" size="sm" onClick={() => sigRef.current?.clear()}>
                      Limpar Assinatura
                    </Button>
                  </div>
                )}
                {marketingConsent && guest.consent_signature && (
                  <div className="md:ml-6 flex items-center gap-2 text-emerald-600 font-medium">
                    <ShieldCheck className="w-5 h-5" /> Assinatura Digital Registrada no Sistema
                  </div>
                )}
              </div>
              <Button onClick={handleSavePrefs} className="w-full md:w-auto">
                <Save className="w-4 h-4 mr-2" /> Salvar Preferências
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="spa" className="pt-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-purple-600" /> Agendamento Rápido SPA
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-slate-500 mb-4">
                Caso o terapeuta selecionado já possua conflito no horário, a reserva será criada
                com status{' '}
                <Badge variant="outline" className="text-orange-600">
                  Pendente de Validação
                </Badge>
                .
              </p>
              <div className="grid md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label>Serviço</Label>
                  <Select
                    value={spaForm.serviceId}
                    onValueChange={(v) => setSpaForm({ ...spaForm, serviceId: v })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione..." />
                    </SelectTrigger>
                    <SelectContent>
                      {spaServices.map((s) => (
                        <SelectItem key={s.id} value={s.id}>
                          {s.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Terapeuta</Label>
                  <Select
                    value={spaForm.therapistId}
                    onValueChange={(v) => setSpaForm({ ...spaForm, therapistId: v })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione..." />
                    </SelectTrigger>
                    <SelectContent>
                      {therapists.map((t) => (
                        <SelectItem key={t.id} value={t.id}>
                          {t.name || t.email}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Data / Hora</Label>
                  <Input
                    type="datetime-local"
                    value={spaForm.date}
                    onChange={(e) => setSpaForm({ ...spaForm, date: e.target.value })}
                  />
                </div>
              </div>
              <Button onClick={handleBookSpa} className="bg-purple-600 hover:bg-purple-700">
                Confirmar Agendamento
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="fnb" className="pt-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Utensils className="w-5 h-5 text-orange-600" /> Pedidos F&B
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex gap-4 border-b pb-4">
                <Button
                  variant={fbForm.type === 'table' ? 'default' : 'outline'}
                  onClick={() => setFbForm({ ...fbForm, type: 'table' })}
                >
                  Reserva de Mesa
                </Button>
                <Button
                  variant={fbForm.type === 'room_service' ? 'default' : 'outline'}
                  onClick={() => setFbForm({ ...fbForm, type: 'room_service' })}
                >
                  Room Service
                </Button>
              </div>

              {fbForm.type === 'table' && (
                <div className="space-y-4 animate-in fade-in">
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Data / Hora</Label>
                      <Input
                        type="datetime-local"
                        value={fbForm.date}
                        onChange={(e) => setFbForm({ ...fbForm, date: e.target.value })}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Qtd Pessoas</Label>
                      <Input
                        type="number"
                        value={fbForm.pax}
                        onChange={(e) => setFbForm({ ...fbForm, pax: e.target.value })}
                      />
                    </div>
                  </div>
                  <Button onClick={handleBookFB} className="bg-orange-600 hover:bg-orange-700">
                    Enviar Pedido de Reserva
                  </Button>
                </div>
              )}

              {fbForm.type === 'room_service' && (
                <div className="space-y-4 animate-in fade-in">
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Reserva Ativa do Hóspede</Label>
                      <Select
                        value={fbForm.resId}
                        onValueChange={(v) => setFbForm({ ...fbForm, resId: v })}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione o quarto..." />
                        </SelectTrigger>
                        <SelectContent>
                          {reservations.map((r) => (
                            <SelectItem key={r.id} value={r.id}>
                              Quarto {r.expand?.room_id?.room_number}
                            </SelectItem>
                          ))}
                          {reservations.length === 0 && (
                            <SelectItem value="none" disabled>
                              Nenhuma reserva In-House encontrada
                            </SelectItem>
                          )}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label>Produto</Label>
                      <Select
                        value={fbForm.productId}
                        onValueChange={(v) => setFbForm({ ...fbForm, productId: v })}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="O que deseja pedir?" />
                        </SelectTrigger>
                        <SelectContent>
                          {fbProducts.map((p) => (
                            <SelectItem key={p.id} value={p.id}>
                              {p.name} - {p.price} kz
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <Button onClick={handleBookFB} className="bg-orange-600 hover:bg-orange-700">
                    Lançar Room Service
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
