import { Users, Search } from 'lucide-react'
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

const GUESTS = [
  { id: '1', name: 'Ana Oliveira', doc: '123.456.789-00', vip: true, lastStay: '10/04/2024' },
  { id: '2', name: 'Carlos Mendes', doc: '987.654.321-11', vip: false, lastStay: 'Primeira vez' },
  { id: '3', name: 'Fernanda Costa', doc: '456.789.123-22', vip: true, lastStay: '22/02/2024' },
]

export default function Guests() {
  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Diretório de Hóspedes</h1>
          <p className="text-sm text-muted-foreground">Gerencie perfis e histórico de estadias.</p>
        </div>
        <div className="relative w-full sm:w-72">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Buscar por nome ou CPF..." className="pl-8" />
        </div>
      </div>

      <div className="rounded-md border bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>
                <Users className="h-4 w-4" />
              </TableHead>
              <TableHead>Nome</TableHead>
              <TableHead>Documento</TableHead>
              <TableHead>Última Estadia</TableHead>
              <TableHead>Categoria</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {GUESTS.map((guest) => (
              <TableRow key={guest.id}>
                <TableCell className="font-medium text-muted-foreground">{guest.id}</TableCell>
                <TableCell className="font-medium">{guest.name}</TableCell>
                <TableCell className="font-mono text-sm">{guest.doc}</TableCell>
                <TableCell>{guest.lastStay}</TableCell>
                <TableCell>
                  {guest.vip ? (
                    <Badge className="bg-primary">VIP</Badge>
                  ) : (
                    <Badge variant="secondary">Padrão</Badge>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
