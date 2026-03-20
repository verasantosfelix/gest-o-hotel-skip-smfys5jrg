import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Sun, Sunset, Moon } from 'lucide-react'

export function ShiftRoutines() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 animate-fade-in">
      <Card className="border-t-4 border-t-amber-400">
        <CardHeader className="bg-slate-50/50 pb-4">
          <CardTitle className="flex items-center gap-2 text-amber-600">
            <Sun className="w-5 h-5" /> Turno da Manhã (07h - 15h)
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-4 space-y-4">
          <ul className="space-y-2 text-sm text-slate-700">
            <li className="flex items-start gap-2">
              <span className="text-amber-500 font-bold">•</span> Priorizar limpeza de Checkouts
              confirmados.
            </li>
            <li className="flex items-start gap-2">
              <span className="text-amber-500 font-bold">•</span> Atender pedidos de Early Check-in
              (Recepção).
            </li>
            <li className="flex items-start gap-2">
              <span className="text-amber-500 font-bold">•</span> Iniciar limpeza de Stayovers a
              partir das 10h.
            </li>
            <li className="flex items-start gap-2">
              <span className="text-amber-500 font-bold">•</span> Recolher lixo áreas comuns dos
              andares.
            </li>
          </ul>
        </CardContent>
      </Card>

      <Card className="border-t-4 border-t-orange-500">
        <CardHeader className="bg-slate-50/50 pb-4">
          <CardTitle className="flex items-center gap-2 text-orange-600">
            <Sunset className="w-5 h-5" /> Turno da Tarde (14h - 22h)
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-4 space-y-4">
          <ul className="space-y-2 text-sm text-slate-700">
            <li className="flex items-start gap-2">
              <span className="text-orange-500 font-bold">•</span> Finalizar todos Stayovers
              pendentes.
            </li>
            <li className="flex items-start gap-2">
              <span className="text-orange-500 font-bold">•</span> Serviço de Turndown (Abertura de
              cama) para VIPs.
            </li>
            <li className="flex items-start gap-2">
              <span className="text-orange-500 font-bold">•</span> Inspeção visual de Late
              Checkouts.
            </li>
            <li className="flex items-start gap-2">
              <span className="text-orange-500 font-bold">•</span> Reposição inicial de carrinhos de
              limpeza.
            </li>
          </ul>
        </CardContent>
      </Card>

      <Card className="border-t-4 border-t-indigo-500">
        <CardHeader className="bg-slate-50/50 pb-4">
          <CardTitle className="flex items-center gap-2 text-indigo-600">
            <Moon className="w-5 h-5" /> Turno da Noite (22h - 06h)
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-4 space-y-4">
          <ul className="space-y-2 text-sm text-slate-700">
            <li className="flex items-start gap-2">
              <span className="text-indigo-500 font-bold">•</span> Limpeza profunda do Lobby e
              Restaurantes.
            </li>
            <li className="flex items-start gap-2">
              <span className="text-indigo-500 font-bold">•</span> Inventário de Amenities e Roupas
              no DML.
            </li>
            <li className="flex items-start gap-2">
              <span className="text-indigo-500 font-bold">•</span> Atender pedidos noturnos urgentes
              (toalhas extras).
            </li>
            <li className="flex items-start gap-2">
              <span className="text-indigo-500 font-bold">•</span> Preparação total dos carrinhos
              para a manhã.
            </li>
          </ul>
        </CardContent>
      </Card>
    </div>
  )
}
