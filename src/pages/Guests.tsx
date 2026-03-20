import { useState } from 'react'
import { Navigate } from 'react-router-dom'
import {
  Users,
  Search,
  Mail,
  Phone,
  MapPin,
  MoreHorizontal,
  Calendar,
  Star,
  Building,
  ArrowRightLeft,
} from 'lucide-react'
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
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Card, CardContent } from '@/components/ui/card'
import useAuthStore from '@/stores/useAuthStore'

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
  {
    id: 'H-002',
    name: 'Carlos Mendes',
    doc: '987.654.321-11',
    email: 'cmendes@empresa.com.br',
    phone: '+55 21 98888-2222',
    vip: false,
    lastStay: 'Primeira vez',
    totalStays: 0,
    city: 'Rio de Janeiro, RJ',
  },
  {
    id: 'H-003',
    name: 'Fernanda Costa',
    doc: '456.789.123-22',
    email: 'fecosta@email.com',
    phone: '+55 31 97777-3333',
    vip: true,
    lastStay: '22/02/2024',
    totalStays: 5,
    city: 'Belo Horizonte, MG',
  },
  {
    id: 'H-004',
    name: 'João Silva',
    doc: '321.654.987-33',
    email: 'joao.silva@email.com',
    phone: '+55 11 98765-4321',
    vip: false,
    lastStay: 'Hospedado Agora',
    totalStays: 2,
    city: 'Campinas, SP',
  },
]

export default function Guests() {
  const { userRole } = useAuthStore()
  const [searchTerm, setSearchTerm] = useState('')

  if (userRole === 'Limpeza') {
    return <Navigate to="/governanca" replace />
  }

  const filtered = GUESTS.filter(
    (g) =>
      g.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      g.doc.includes(searchTerm) ||
      g.email.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  const vips = GUESTS.filter((g) => g.vip).length
  const inHouse = GUESTS.filter((g) => g.lastStay === 'Hospedado Agora').length

  return (
    <div className="space-y-6 animate-fade-in pb-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            Diretório de Hóspedes
          </h1>
          <p className="text-sm text-muted-foreground">
            Gerencie perfis, histórico de estadias e status VIP.
          </p>
        </div>
        <Button className="bg-slate-900 text-white hover:bg-slate-800 shadow-sm">
          <Users className="w-4 h-4 mr-2" /> Novo Hóspede
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card className="border-slate-200 shadow-sm">
          <CardContent className="p-4 flex items-center gap-4">
            <div className="bg-blue-50 p-3 rounded-full border border-blue-100">
              <Users className="w-5 h-5 text-blue-700" />
            </div>
            <div>
              <p className="text-sm font-medium text-slate-500">Total na Base</p>
              <h3 className="text-2xl font-bold text-slate-900">{GUESTS.length}</h3>
            </div>
          </CardContent>
        </Card>
        <Card className="border-slate-200 shadow-sm">
          <CardContent className="p-4 flex items-center gap-4">
            <div className="bg-amber-50 p-3 rounded-full border border-amber-100">
              <Star className="w-5 h-5 text-amber-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-slate-500">Hóspedes VIP</p>
              <h3 className="text-2xl font-bold text-slate-900">{vips}</h3>
            </div>
          </CardContent>
        </Card>
        <Card className="border-slate-200 shadow-sm">
          <CardContent className="p-4 flex items-center gap-4">
            <div className="bg-emerald-50 p-3 rounded-full border border-emerald-100">
              <Building className="w-5 h-5 text-emerald-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-slate-500">Em Casa Hoje</p>
              <h3 className="text-2xl font-bold text-slate-900">{inHouse}</h3>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="bg-white rounded-lg border shadow-sm overflow-hidden">
        <div className="p-4 border-b border-slate-100 bg-slate-50/50 flex flex-col sm:flex-row gap-4 justify-between items-center">
          <div className="relative w-full sm:max-w-md">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
            <Input
              placeholder="Buscar por nome, CPF ou e-mail..."
              className="pl-9"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="bg-slate-50/80 hover:bg-slate-50/80">
                <TableHead className="pl-6">Perfil</TableHead>
                <TableHead>Contato</TableHead>
                <TableHead>Localidade</TableHead>
                <TableHead className="text-center">Estadias</TableHead>
                <TableHead>Última Visita</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((guest) => (
                <TableRow key={guest.id} className="hover:bg-slate-50/50">
                  <TableCell className="pl-6">
                    <div className="font-semibold text-slate-900">{guest.name}</div>
                  </TableCell>
                  <TableCell>{guest.email}</TableCell>
                  <TableCell>{guest.city}</TableCell>
                  <TableCell className="text-center">{guest.totalStays}</TableCell>
                  <TableCell>{guest.lastStay}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  )
}
