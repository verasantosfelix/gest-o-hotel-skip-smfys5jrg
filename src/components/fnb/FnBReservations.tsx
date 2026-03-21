import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  getFBReservations,
  createFBReservation,
  updateFBReservation,
  FBReservationFNB,
  getFBTables,
  FBTable,
  updateFBTable,
} from '@/services/fnb'
import { toast } from '@/components/ui/use-toast'
import { CalendarDays, MapPin } from 'lucide-react'
import useAuthStore from '@/stores/useAuthStore'

export function FnBReservations() {
  const { userRole } = useAuthStore()
  const isFrontDesk = userRole === 'Front_Desk'

  const [reservations, setReservations] = useState<FBReservationFNB[]>([])
  const [tables, setTables] = useState<FBTable[]>([])
  const [form, setForm] = useState({ name: '', people: '', time: '', table: '' })

  const loadData = async () => {
    try {
      setReservations(await getFBReservations())
      setTables(await getFBTables())
    } catch (e) {
      console.error(e)
    }
  }
  useEffect(() => {
    loadData()
  }, [])

  const handleCreate = async () => {
    if (!form.name || !form.people || !form.time)
      return toast({ title: 'Preencha os campos obrigatórios', variant: 'destructive' })
    try {
      await createFBReservation({
        guest_name: form.name,
        people_count: parseInt(form.people),
        reservation_time: form.time,
        table_id: form.table || undefined,
        status: 'confirmed',
        notes: '',
      })
      if (form.table) await updateFBTable(form.table, { status: 'reserved' })
      toast({ title: 'Reserva Criada com Sucesso' })
      setForm({ name: '', people: '', time: '', table: '' })
      loadData()
    } catch (e) {
      console.error(e)
    }
  }

  const handleArrive = async (r: FBReservationFNB) => {
    try {
      await updateFBReservation(r.id, { status: 'arrived' })
      if (r.table_id) await updateFBTable(r.table_id, { status: 'occupied' })
      toast({ title: 'Check-in realizado. Mesa Ocupada.' })
      loadData()
    } catch (e) {
      console.error(e)
    }
  }

  return (
    <div className="grid md:grid-cols-3 gap-6 animate-fade-in-up">
      <div className="md:col-span-1 space-y-4">
        <Card className="border-slate-200 shadow-sm">
          <CardHeader className="bg-slate-50 border-b pb-4">
            <CardTitle className="text-base flex items-center gap-2">
              <CalendarDays className="w-5 h-5 text-blue-600" /> Cadastrar Reserva F&B
            </CardTitle>
          </CardHeader>
          <CardContent className="p-5 space-y-4">
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-500 uppercase">Nome do Cliente</label>
              <Input
                placeholder="Ex: Sr. Marcos Antônio"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-500 uppercase">Qtd Pessoas</label>
                <Input
                  type="number"
                  placeholder="0"
                  value={form.people}
                  onChange={(e) => setForm({ ...form, people: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-500 uppercase">Horário</label>
                <Input
                  type="datetime-local"
                  value={form.time}
                  onChange={(e) => setForm({ ...form, time: e.target.value })}
                />
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-500 uppercase">Alocação de Mesa</label>
              <Select value={form.table} onValueChange={(v) => setForm({ ...form, table: v })}>
                <SelectTrigger>
                  <SelectValue placeholder="Mesa (Opcional)" />
                </SelectTrigger>
                <SelectContent>
                  {tables
                    .filter((t) => t.status === 'free')
                    .map((t) => (
                      <SelectItem key={t.id} value={t.id}>
                        Mesa {t.table_number} ({t.capacity} l)
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
            </div>
            <Button
              onClick={handleCreate}
              className="w-full font-bold bg-blue-600 hover:bg-blue-700"
            >
              Confirmar Reserva
            </Button>
          </CardContent>
        </Card>
      </div>

      <div className="md:col-span-2 space-y-4">
        <h3 className="font-bold text-lg text-slate-800">Próximas Chegadas</h3>
        <div className="space-y-3">
          {reservations.map((r) => (
            <Card key={r.id} className="border-slate-200 shadow-sm transition-all hover:shadow-md">
              <CardContent className="p-4 flex flex-col sm:flex-row justify-between sm:items-center gap-4">
                <div>
                  <div className="flex items-center gap-3 mb-2">
                    <p className="font-bold text-lg text-slate-900">{r.guest_name}</p>
                    <Badge variant="outline" className="bg-slate-100">
                      {r.people_count} Pax
                    </Badge>
                  </div>
                  <div className="flex items-center gap-4 text-sm text-slate-500">
                    <span className="flex items-center gap-1 font-mono">
                      <CalendarDays className="w-4 h-4" />{' '}
                      {new Date(r.reservation_time).toLocaleString()}
                    </span>
                    {r.expand?.table_id && (
                      <span className="flex items-center gap-1 text-blue-600 font-bold">
                        <MapPin className="w-4 h-4" /> Mesa {r.expand.table_id.table_number}
                      </span>
                    )}
                  </div>
                </div>
                <div className="text-right">
                  {r.status === 'confirmed' ? (
                    !isFrontDesk ? (
                      <Button
                        onClick={() => handleArrive(r)}
                        className="bg-slate-900 text-white font-bold w-full sm:w-auto"
                      >
                        Registrar Chegada
                      </Button>
                    ) : (
                      <Badge variant="outline" className="border-blue-200 text-blue-700">
                        CONFIRMADA
                      </Badge>
                    )
                  ) : (
                    <Badge
                      className={
                        r.status === 'arrived' ? 'bg-emerald-500' : 'bg-slate-300 text-slate-700'
                      }
                      variant="secondary"
                    >
                      {r.status.toUpperCase()}
                    </Badge>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
          {reservations.length === 0 && (
            <div className="p-8 text-center bg-slate-50 border border-slate-200 rounded-lg text-slate-500">
              Nenhuma reserva agendada para hoje.
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
