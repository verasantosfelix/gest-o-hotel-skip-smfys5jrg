import { Card, CardContent } from '@/components/ui/card'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Calendar as CalendarIcon, Settings2, Plus } from 'lucide-react'

export function MaintenanceInventory({ assets }: { assets: any[] }) {
  return (
    <div className="space-y-4 animate-fade-in-up">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
          <Settings2 className="w-5 h-5 text-primary" /> Inventário Técnico & Preventivas
        </h2>
        <Button size="sm" className="gap-2">
          <Plus className="w-4 h-4" /> Novo Ativo
        </Button>
      </div>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader className="bg-slate-50">
              <TableRow>
                <TableHead>Equipamento</TableHead>
                <TableHead>Tipo/Serial</TableHead>
                <TableHead>Localização</TableHead>
                <TableHead>Última Manutenção</TableHead>
                <TableHead>Próxima Preventiva</TableHead>
                <TableHead className="text-right">Ação</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {assets.map((a) => (
                <TableRow key={a.id} className="hover:bg-slate-50/50">
                  <TableCell className="font-semibold">{a.name}</TableCell>
                  <TableCell>
                    <span className="block">{a.type}</span>
                    <span className="text-xs text-slate-500 font-mono">{a.serial}</span>
                  </TableCell>
                  <TableCell>{a.location || 'Não definido'}</TableCell>
                  <TableCell className="text-slate-600">{a.last_maintenance || '-'}</TableCell>
                  <TableCell>
                    <Badge
                      variant="outline"
                      className="flex items-center gap-1 w-fit bg-blue-50 border-blue-200 text-blue-700"
                    >
                      <CalendarIcon className="w-3 h-3" />
                      {a.next_maintenance_date || 'A agendar'}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <Button size="sm" variant="outline">
                      Intervenção
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
              {assets.length === 0 && (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-6 text-slate-500">
                    Nenhum equipamento registrado.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
