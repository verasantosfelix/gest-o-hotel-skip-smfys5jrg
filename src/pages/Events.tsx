import { useState } from 'react'
import { Navigate } from 'react-router-dom'
import { CalendarRange, LayoutTemplate, Calculator } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Checkbox } from '@/components/ui/checkbox'
import useAuthStore from '@/stores/useAuthStore'

export default function Events() {
  const { userRole } = useAuthStore()
  const [pax, setPax] = useState('50')
  const [coffee, setCoffee] = useState(false)

  if (userRole !== 'Admin' && userRole !== 'Administrativa') {
    return <Navigate to="/" replace />
  }

  const basePrice = 1500
  const coffeePrice = coffee ? parseInt(pax || '0') * 35 : 0
  const total = basePrice + coffeePrice

  return (
    <div className="space-y-6 animate-fade-in pb-8">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900 flex items-center gap-2">
          <CalendarRange className="w-6 h-6 text-primary" />
          Eventos & Conferências
        </h1>
        <p className="text-muted-foreground text-sm">
          Reserva de salas, layouts e orçamentos corporativos.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card className="shadow-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <LayoutTemplate className="w-5 h-5" /> Configuração de Espaço
            </CardTitle>
            <CardDescription>Defina a sala e a disposição estrutural</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Sala / Espaço</Label>
              <Select defaultValue="sala1">
                <SelectTrigger>
                  <SelectValue placeholder="Selecione a sala" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="sala1">Salão Diamante</SelectItem>
                  <SelectItem value="sala2">Sala Executiva A</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Layout da Sala</Label>
              <Select defaultValue="auditorio">
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o layout" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="auditorio">Auditório</SelectItem>
                  <SelectItem value="u">Formato em U</SelectItem>
                  <SelectItem value="escolar">Escolar</SelectItem>
                  <SelectItem value="banquete">Banquete</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Participantes (Pax)</Label>
              <Input type="number" min="1" value={pax} onChange={(e) => setPax(e.target.value)} />
            </div>

            <div className="space-y-2">
              <Label>Data do Evento</Label>
              <Input type="date" />
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calculator className="w-5 h-5" /> Orçamento e Serviços
            </CardTitle>
            <CardDescription>Adicione extras e gere cotação</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-4">
              <h4 className="font-semibold text-sm text-slate-800">Serviços Adicionais</h4>
              <div className="flex items-center space-x-3 bg-slate-50 p-3 rounded border border-slate-200">
                <Checkbox id="coffee" checked={coffee} onCheckedChange={(c) => setCoffee(!!c)} />
                <Label htmlFor="coffee" className="cursor-pointer">
                  Adicionar Coffee Break (R$ 35/pax)
                </Label>
              </div>
              <div className="flex items-center space-x-3 bg-slate-50 p-3 rounded border border-slate-200">
                <Checkbox id="av" />
                <Label htmlFor="av" className="cursor-pointer">
                  Kit Audiovisual Premium
                </Label>
              </div>
            </div>

            <div className="bg-slate-50 p-5 rounded-lg border border-slate-200 space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-slate-600">Aluguel da Sala:</span>
                <span className="font-medium text-slate-900">R$ {basePrice.toFixed(2)}</span>
              </div>
              {coffee && (
                <div className="flex justify-between text-sm">
                  <span className="text-slate-600">Coffee Break ({pax} pax):</span>
                  <span className="font-medium text-slate-900">R$ {coffeePrice.toFixed(2)}</span>
                </div>
              )}
              <div className="flex justify-between border-t border-slate-200 pt-3 mt-3">
                <span className="font-bold text-slate-800">Orçamento Total:</span>
                <span className="font-bold text-emerald-600 text-xl">R$ {total.toFixed(2)}</span>
              </div>
            </div>

            <Button className="w-full bg-slate-900 text-white hover:bg-slate-800">
              Salvar Reserva e Gerar Orçamento
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
