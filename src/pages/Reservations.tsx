import { useState } from 'react'
import { Search, Filter, AlertTriangle, CheckCircle2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
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
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'

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
  const [validationOpen, setValidationOpen] = useState(false)
  const [hasConflict, setHasConflict] = useState(false)

  const handleAction = (conflict: boolean) => {
    setHasConflict(conflict)
    setValidationOpen(true)
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h1 className="text-2xl font-bold tracking-tight">Gestão de Reservas</h1>
        <div className="flex gap-2 w-full sm:w-auto">
          <div className="relative flex-1 sm:w-64">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input placeholder="Buscar por hóspede ou reserva" className="pl-8" />
          </div>
          <Button variant="outline" size="icon">
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
              <TableHead className="text-right">Ação</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {MOCK_DATA.map((res) => (
              <TableRow
                key={res.id}
                className="cursor-pointer hover:bg-muted/50"
                onClick={() => setSelected(res)}
              >
                <TableCell className="font-medium">{res.id}</TableCell>
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
                      res.status === 'Confirmado' ? 'bg-accent text-accent-foreground' : ''
                    }
                  >
                    {res.status}
                  </Badge>
                </TableCell>
                <TableCell className="text-right">
                  <Button variant="ghost" size="sm">
                    Ver Detalhes
                  </Button>
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
                <Badge className="bg-accent">Pago</Badge>
              </div>
            </div>
            <div className="pt-4 border-t flex gap-2">
              <Button onClick={() => handleAction(false)} className="bg-primary">
                Confirmar Check-in
              </Button>
              <Button variant="outline" onClick={() => handleAction(true)}>
                Modificar Datas
              </Button>
              <Button variant="destructive" onClick={() => handleAction(false)}>
                Cancelar Reserva
              </Button>
            </div>
          </div>
          <DrawerFooter>
            <Button variant="outline" onClick={() => setSelected(null)}>
              Fechar
            </Button>
          </DrawerFooter>
        </DrawerContent>
      </Drawer>

      <Dialog open={validationOpen} onOpenChange={setValidationOpen}>
        <DialogContent className="glassmorphism sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              {hasConflict ? (
                <AlertTriangle className="text-destructive h-5 w-5" />
              ) : (
                <CheckCircle2 className="text-accent h-5 w-5" />
              )}
              Motor de Validação SKIP
            </DialogTitle>
          </DialogHeader>
          <div className="py-4">
            {hasConflict ? (
              <Alert variant="destructive" className="animate-pulse-error bg-destructive/10">
                <AlertTriangle className="h-4 w-4" />
                <AlertTitle className="font-mono">&lt;erro tipo="validacao"&gt;</AlertTitle>
                <AlertDescription className="font-mono text-xs mt-2">
                  Conflito de inventário: Acomodação indisponível para o novo período solicitado.
                  Sugestão: Datas disponíveis a partir de 18/05.
                </AlertDescription>
              </Alert>
            ) : (
              <div className="bg-slate-900 text-slate-50 p-3 rounded font-mono text-xs">
                <span className="text-accent">Intent:</span> Confirmar operação.
                <br />
                <span className="text-blue-400">Validate:</span> Dados íntegros. Regras de negócio
                satisfeitas.
                <br />
                <br />
                Aguardando confirmação final do operador.
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setValidationOpen(false)}>
              Abortar
            </Button>
            <Button
              disabled={hasConflict}
              className={hasConflict ? '' : 'bg-accent hover:bg-accent/90'}
              onClick={() => setValidationOpen(false)}
            >
              {hasConflict ? 'Corrigir Dados' : 'Confirmar Execução'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
