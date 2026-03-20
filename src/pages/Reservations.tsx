import { useState } from 'react'
import { Search, Filter, AlertTriangle, CheckCircle2, Terminal } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerDescription,
  DrawerFooter,
} from '@/components/ui/drawer'
import { ReservationAssistant } from '@/components/ReservationAssistant'

type Reservation = {
  id: string
  guest: string
  dates: string
  status: 'Confirmado' | 'Pendente' | 'Cancelado'
  room: string
}

const MOCK_DATA: Reservation[] = [
  {
    id: 'RES-001',
    guest: 'Ana Oliveira',
    dates: '10/05 - 14/05',
    status: 'Confirmado',
    room: 'Luxo - 204',
  },
  {
    id: 'RES-002',
    guest: 'Carlos Mendes',
    dates: '12/05 - 15/05',
    status: 'Pendente',
    room: 'Standard - 102',
  },
  {
    id: 'RES-003',
    guest: 'Fernanda Costa',
    dates: '15/05 - 20/05',
    status: 'Confirmado',
    room: 'Suite - 401',
  },
]

export default function Reservations() {
  const [selected, setSelected] = useState<Reservation | null>(null)

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Gestão de Reservas</h1>
          <p className="text-muted-foreground text-sm">
            Controle de estadias e motor de assistência.
          </p>
        </div>
      </div>

      <Card className="border-primary/20 shadow-md overflow-hidden">
        <CardHeader className="bg-primary/5 pb-4 border-b">
          <CardTitle className="text-lg flex items-center gap-2 font-mono">
            <Terminal className="h-5 w-5 text-primary" />
            Assistente SKIP
          </CardTitle>
          <CardDescription>
            Motor de processamento de linguagem natural. Interaja para gerenciar reservas.
          </CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          <ReservationAssistant />
        </CardContent>
      </Card>

      <div className="flex justify-between items-center gap-4 mt-8 mb-4">
        <h2 className="text-lg font-semibold">Tabela de Operações</h2>
        <div className="flex gap-2">
          <div className="relative flex-1 sm:w-64">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input placeholder="Buscar na tabela..." className="pl-8 h-9" />
          </div>
          <Button variant="outline" size="icon" className="h-9 w-9">
            <Filter className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <div className="rounded-md border bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Reserva</TableHead>
              <TableHead>Hóspede</TableHead>
              <TableHead>Datas</TableHead>
              <TableHead>Acomodação</TableHead>
              <TableHead>Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {MOCK_DATA.map((res) => (
              <TableRow
                key={res.id}
                className="cursor-pointer hover:bg-muted/50"
                onClick={() => setSelected(res)}
              >
                <TableCell className="font-medium font-mono text-xs">{res.id}</TableCell>
                <TableCell>{res.guest}</TableCell>
                <TableCell>{res.dates}</TableCell>
                <TableCell>{res.room}</TableCell>
                <TableCell>
                  <Badge
                    variant={
                      res.status === 'Confirmado'
                        ? 'default'
                        : res.status === 'Pendente'
                          ? 'outline'
                          : 'destructive'
                    }
                    className={
                      res.status === 'Confirmado'
                        ? 'bg-emerald-600/20 text-emerald-600 hover:bg-emerald-600/30 border-transparent'
                        : ''
                    }
                  >
                    {res.status}
                  </Badge>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <Drawer open={!!selected} onOpenChange={(o) => !o && setSelected(null)}>
        <DrawerContent className="max-w-2xl mx-auto h-[85vh]">
          <DrawerHeader>
            <DrawerTitle>Detalhes da Reserva: {selected?.id}</DrawerTitle>
            <DrawerDescription>Informações completas do ciclo de hospedagem.</DrawerDescription>
          </DrawerHeader>
          <div className="p-4 space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-muted-foreground">Hóspede Principal</p>
                <p className="font-medium">{selected?.guest}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Período</p>
                <p className="font-medium">{selected?.dates}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Acomodação alocada</p>
                <p className="font-medium">{selected?.room}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Status Financeiro</p>
                <Badge className="bg-emerald-600">Pago</Badge>
              </div>
            </div>
          </div>
          <DrawerFooter>
            <Button variant="outline" onClick={() => setSelected(null)}>
              Fechar
            </Button>
          </DrawerFooter>
        </DrawerContent>
      </Drawer>
    </div>
  )
}
