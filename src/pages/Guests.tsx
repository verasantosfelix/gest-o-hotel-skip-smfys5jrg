import { useState } from 'react'
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
import { Button } from '@/components/ui/button'
import { useAccess } from '@/hooks/use-access'
import { RestrictedAccess } from '@/components/RestrictedAccess'

const GUESTS = [
  {
    id: 'H-001',
    name: 'Ana Oliveira',
    doc: '123.456.789-00',
    email: 'ana.oliveira@email.com',
    phone: '+55 11 99999-1111',
    vip: true,
    lastStay: '10/04/2024',
    totalStays: 12,
    city: 'São Paulo, SP',
  },
]

export default function Guests() {
  const { hasAccess, canWrite } = useAccess()
  const [searchTerm, setSearchTerm] = useState('')

  if (!hasAccess([], 'Hóspedes')) {
    return <RestrictedAccess />
  }

  const filtered = GUESTS.filter(
    (g) =>
      g.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      g.doc.includes(searchTerm) ||
      g.email.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  return (
    <div className="space-y-6 animate-fade-in pb-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            Diretório de Hóspedes
          </h1>
        </div>
        {canWrite('Hóspedes') && (
          <Button className="bg-slate-900 text-white hover:bg-slate-800 shadow-sm">
            <Users className="w-4 h-4 mr-2" /> Novo Hóspede
          </Button>
        )}
      </div>

      <div className="bg-white rounded-lg border shadow-sm overflow-hidden">
        <div className="p-4 border-b border-slate-100 bg-slate-50/50">
          <div className="relative w-full sm:max-w-md">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
            <Input
              placeholder="Buscar hóspede..."
              className="pl-9"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="pl-6">Perfil</TableHead>
                <TableHead>Contato</TableHead>
                <TableHead>Localidade</TableHead>
                <TableHead className="text-center">Estadias</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((guest) => (
                <TableRow key={guest.id}>
                  <TableCell className="pl-6 font-semibold">{guest.name}</TableCell>
                  <TableCell>{guest.email}</TableCell>
                  <TableCell>{guest.city}</TableCell>
                  <TableCell className="text-center">{guest.totalStays}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  )
}
