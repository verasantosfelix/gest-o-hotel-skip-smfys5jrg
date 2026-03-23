import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Search, Receipt, UserCheck, FileText, Plus, UserCog, Building2 } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
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
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import useReservationStore from '@/stores/useReservationStore'
import { useAccess } from '@/hooks/use-access'
import { RestrictedAccess } from '@/components/RestrictedAccess'
import { CreateReservationDialog } from '@/components/operations/CreateReservationDialog'
import { getLoyalty, createLoyalty, updateLoyalty, GuestLoyalty } from '@/services/guest_loyalty'
import { useRealtime } from '@/hooks/use-realtime'
import { toast } from '@/components/ui/use-toast'

export default function ServiceGuestLookup() {
  const [searchTerm, setSearchTerm] = useState('')
  const [isCreateOpen, setIsCreateOpen] = useState(false)
  const { reservations } = useReservationStore()
  const { hasAccess, canWrite } = useAccess()

  const [loyalties, setLoyalties] = useState<GuestLoyalty[]>([])
  const [editGuest, setEditGuest] = useState<{ open: boolean; name: string; isCorporate: boolean }>(
    { open: false, name: '', isCorporate: false },
  )
  const [formData, setFormData] = useState({ email: '', company_name: '', vat_number: '' })
  const [isSaving, setIsSaving] = useState(false)

  const loadLoyalties = async () => {
    try {
      const data = await getLoyalty()
      setLoyalties(data)
    } catch (e) {
      console.error(e)
    }
  }

  useEffect(() => {
    loadLoyalties()
  }, [])

  useRealtime('guest_loyalty', loadLoyalties)

  if (!hasAccess([], 'Busca Hóspedes')) {
    return <RestrictedAccess />
  }

  const inHouse = reservations.filter((r) => r.status === 'checked-in')
  const filtered = inHouse.filter(
    (r) =>
      r.guestName.toLowerCase().includes(searchTerm.toLowerCase()) || r.room?.includes(searchTerm),
  )

  const handleOpenEdit = (guestName: string, isCorporate: boolean) => {
    const profile = loyalties.find((l) => l.guest_name === guestName)
    setFormData({
      email: profile?.email || '',
      company_name: profile?.company_name || '',
      vat_number: profile?.vat_number || '',
    })
    setEditGuest({ open: true, name: guestName, isCorporate })
  }

  const handleSaveProfile = async () => {
    setIsSaving(true)
    try {
      const existing = loyalties.find((l) => l.guest_name === editGuest.name)
      if (existing) {
        await updateLoyalty(existing.id, formData)
      } else {
        await createLoyalty({
          guest_name: editGuest.name,
          ...formData,
          tier: 'Basic',
          points: 0,
        })
      }
      toast({ title: 'Perfil atualizado com sucesso!' })
      setEditGuest({ open: false, name: '', isCorporate: false })
    } catch (error) {
      toast({ title: 'Erro ao atualizar perfil', variant: 'destructive' })
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <div className="space-y-6 animate-fade-in pb-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h1 className="text-2xl font-bold tracking-tight text-slate-900 flex items-center gap-2">
          <UserCheck className="w-6 h-6 text-primary" /> Busca de Hóspedes (In-House)
        </h1>
        {canWrite('Reservas') && (
          <Button
            onClick={() => setIsCreateOpen(true)}
            className="gap-2 bg-slate-900 text-white hover:bg-slate-800"
          >
            <Plus className="w-4 h-4" /> Nova Reserva
          </Button>
        )}
      </div>

      <div className="bg-white rounded-lg border border-slate-200 shadow-sm p-4 space-y-4">
        <div className="relative w-full max-w-md">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
          <Input
            placeholder="Buscar por nome ou quarto..."
            className="pl-9 bg-slate-50 border-slate-200"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="rounded-md border border-slate-200 overflow-hidden">
          <Table>
            <TableHeader className="bg-slate-50">
              <TableRow>
                <TableHead className="w-24">Quarto</TableHead>
                <TableHead>Hóspede</TableHead>
                <TableHead className="hidden md:table-cell">Empresa</TableHead>
                <TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((res) => {
                const profile = loyalties.find((l) => l.guest_name === res.guestName)
                const isCorporate =
                  res.guestName.toLowerCase().includes('corp') || !!profile?.company_name // Mocking corporate check

                return (
                  <TableRow key={res.id} className="hover:bg-slate-50/50 transition-colors">
                    <TableCell>
                      <Badge variant="outline" className="font-mono bg-white">
                        {res.room || '-'}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="font-medium text-slate-900">{res.guestName}</div>
                      {isCorporate && (
                        <div className="text-[10px] text-blue-600 font-bold uppercase tracking-wider mt-0.5">
                          Corporativo
                        </div>
                      )}
                    </TableCell>
                    <TableCell className="hidden md:table-cell text-sm text-slate-500">
                      {profile?.company_name || '-'}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleOpenEdit(res.guestName, isCorporate)}
                          className="text-slate-600 hover:text-slate-900"
                        >
                          <UserCog className="w-4 h-4 mr-1.5" /> Perfil
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          asChild
                          className="gap-2 border-slate-200"
                        >
                          <Link to="/extrato-hospede">
                            <FileText className="w-4 h-4" /> Extrato
                          </Link>
                        </Button>
                        {canWrite('Lançamentos Rápidos') && (
                          <Button
                            size="sm"
                            asChild
                            className="gap-2 bg-emerald-600 hover:bg-emerald-700 text-white border-0"
                          >
                            <Link to={`/lancamento-servicos?reserva_id=${res.id}`}>
                              <Receipt className="w-4 h-4" /> Consumo
                            </Link>
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                )
              })}
              {filtered.length === 0 && (
                <TableRow>
                  <TableCell colSpan={4} className="text-center py-8 text-slate-500">
                    Nenhum hóspede in-house encontrado.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      <CreateReservationDialog open={isCreateOpen} onOpenChange={setIsCreateOpen} />

      <Dialog
        open={editGuest.open}
        onOpenChange={(o) => !o && setEditGuest({ open: false, name: '', isCorporate: false })}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Editar Perfil do Hóspede</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Nome do Hóspede</Label>
              <Input value={editGuest.name} disabled className="bg-slate-50" />
            </div>
            <div className="space-y-2">
              <Label>Email</Label>
              <Input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="email@exemplo.com"
              />
            </div>

            <div
              className={`p-4 rounded-lg border ${editGuest.isCorporate ? 'bg-blue-50 border-blue-200' : 'bg-slate-50 border-slate-100'} space-y-4 mt-2`}
            >
              <div className="flex items-center gap-2 mb-2">
                <Building2
                  className={`w-4 h-4 ${editGuest.isCorporate ? 'text-blue-600' : 'text-slate-500'}`}
                />
                <span className="text-sm font-semibold text-slate-700">
                  Dados Corporativos (Faturamento)
                </span>
              </div>
              <div className="space-y-2">
                <Label className={editGuest.isCorporate ? 'text-blue-900' : ''}>Empresa</Label>
                <Input
                  value={formData.company_name}
                  onChange={(e) => setFormData({ ...formData, company_name: e.target.value })}
                  placeholder="Nome legal da empresa"
                  className={editGuest.isCorporate ? 'bg-white border-blue-200' : ''}
                />
              </div>
              <div className="space-y-2">
                <Label className={editGuest.isCorporate ? 'text-blue-900' : ''}>
                  Contribuinte (NIF/VAT)
                </Label>
                <Input
                  value={formData.vat_number}
                  onChange={(e) => setFormData({ ...formData, vat_number: e.target.value })}
                  placeholder="Número de identificação fiscal"
                  className={editGuest.isCorporate ? 'bg-white border-blue-200' : ''}
                />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setEditGuest({ open: false, name: '', isCorporate: false })}
            >
              Cancelar
            </Button>
            <Button
              onClick={handleSaveProfile}
              disabled={isSaving}
              className="bg-slate-900 text-white hover:bg-slate-800"
            >
              {isSaving ? 'Salvando...' : 'Salvar Perfil'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
