import { useState, useEffect } from 'react'
import { Utensils, ChefHat, CheckCircle } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { useAccess } from '@/hooks/use-access'
import { RestrictedAccess } from '@/components/RestrictedAccess'
import { getFbEvents } from '@/services/fb'
import { useRealtime } from '@/hooks/use-realtime'
import { formatCurrency } from '@/lib/utils'

export default function FnB() {
  const { hasAccess } = useAccess()
  const [events, setEvents] = useState<any[]>([])

  const loadData = async () => {
    try {
      const data = await getFbEvents()
      setEvents(data)
    } catch (e) {
      console.error(e)
    }
  }

  useEffect(() => {
    loadData()
  }, [])

  useRealtime('fb_events', loadData)

  if (!hasAccess(['Restaurante_Bar', 'Direcao_Admin'])) {
    return <RestrictedAccess requiredRoles={['Restaurante_Bar', 'Direcao_Admin']} />
  }

  return (
    <div className="space-y-6 animate-fade-in pb-8">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-3 bg-orange-100 rounded-full">
          <Utensils className="w-6 h-6 text-orange-700" />
        </div>
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">F&B KDS & Dashboard</h1>
          <p className="text-sm text-slate-500">Visualização adaptativa para KDS e Gestão</p>
        </div>
      </div>

      {/* MOBILE VIEW: KDS Simple Cards */}
      <div className="block md:hidden space-y-4">
        <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
          <ChefHat className="w-5 h-5" /> KDS - Pedidos Ativos
        </h2>
        {events.map((ev) => (
          <Card key={ev.id} className="border-orange-200 shadow-sm bg-orange-50/30">
            <CardHeader className="pb-2 pt-4">
              <CardTitle className="text-lg flex justify-between">
                <span>{ev.title}</span>
                <Badge variant="outline" className="bg-white">
                  Mesa/Evento
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="pb-2">
              <p className="text-slate-700 font-medium mb-2">{ev.menu_details}</p>
              <p className="text-sm text-slate-500 font-mono">Agendado: {ev.date}</p>
            </CardContent>
            <CardFooter className="pt-2">
              <Button className="w-full bg-emerald-600 hover:bg-emerald-700 text-white gap-2">
                <CheckCircle className="w-4 h-4" /> Marcar Pronto
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>

      {/* TABLET VIEW: Structured Table Only */}
      <div className="hidden md:block lg:hidden bg-white rounded-lg border shadow-sm overflow-hidden">
        <div className="p-4 border-b bg-slate-50">
          <h2 className="text-lg font-bold text-slate-800">Fila de Eventos & Pedidos</h2>
        </div>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Título</TableHead>
              <TableHead>Detalhes</TableHead>
              <TableHead>Data/Hora</TableHead>
              <TableHead className="text-right">Ação</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {events.map((ev) => (
              <TableRow key={ev.id}>
                <TableCell className="font-semibold">{ev.title}</TableCell>
                <TableCell className="text-slate-600">{ev.menu_details}</TableCell>
                <TableCell className="font-mono text-sm">{ev.date}</TableCell>
                <TableCell className="text-right">
                  <Button size="sm" variant="outline" className="text-emerald-600">
                    Concluir
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* DESKTOP VIEW: Double Panel (KDS + Table) */}
      <div className="hidden lg:grid grid-cols-12 gap-6">
        <div className="col-span-4 space-y-4">
          <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2 bg-slate-100 p-3 rounded-md">
            <ChefHat className="w-5 h-5 text-orange-600" /> KDS View
          </h2>
          <div className="space-y-4 max-h-[70vh] overflow-y-auto pr-2">
            {events.map((ev) => (
              <Card key={`kds-${ev.id}`} className="border-slate-300 shadow-md">
                <CardContent className="p-4">
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="font-black text-xl text-slate-800">{ev.title}</h3>
                    <Badge className="bg-orange-100 text-orange-800 hover:bg-orange-200">
                      Preparo
                    </Badge>
                  </div>
                  <div className="p-3 bg-slate-50 border border-slate-100 rounded text-slate-700 font-medium min-h-[80px]">
                    {ev.menu_details}
                  </div>
                  <div className="mt-4 flex justify-end">
                    <Button size="sm" className="bg-emerald-600 hover:bg-emerald-700">
                      Despachar
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        <div className="col-span-8">
          <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2 bg-slate-100 p-3 rounded-md mb-4">
            <Utensils className="w-5 h-5 text-slate-600" /> Visão Administrativa
          </h2>
          <div className="bg-white rounded-lg border shadow-sm overflow-hidden">
            <Table>
              <TableHeader className="bg-slate-50">
                <TableRow>
                  <TableHead>Evento/Pedido</TableHead>
                  <TableHead>Data Agendada</TableHead>
                  <TableHead>Detalhes do Menu</TableHead>
                  <TableHead className="text-right">Receita</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {events.map((ev) => (
                  <TableRow key={`adm-${ev.id}`}>
                    <TableCell className="font-medium">{ev.title}</TableCell>
                    <TableCell className="font-mono text-sm">{ev.date}</TableCell>
                    <TableCell className="text-sm text-slate-600 truncate max-w-[200px]">
                      {ev.menu_details}
                    </TableCell>
                    <TableCell className="text-right font-mono font-medium">
                      {formatCurrency(ev.price, ev.currency)}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </div>
      </div>
    </div>
  )
}
