import { useState } from 'react'
import { Search, MoreHorizontal, CheckCircle, Ban, Trash2, Edit2, Mail, Shield } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog'
import { EditUserDialog } from './EditUserDialog'
import { ResendAccessDialog } from './ResendAccessDialog'
import { StaffDocumentsSheet } from './StaffDocumentsSheet'
import { CreateUserDialog } from './CreateUserDialog'
import pb from '@/lib/pocketbase/client'

const categoriesList = [
  'Direção',
  'Managers',
  'Administrativos',
  'Operacionais',
  'Especiais',
  'Outros',
]

interface StaffOverviewTableProps {
  users: any[]
  profiles: any[]
  isManager: () => boolean
  handleSuspendToggle: (user: any) => void
  handleDeleteUser: (userId: string) => void
  handleRoleToggle: (user: any) => void
  getRoleBadge: (roleLevel: string) => React.ReactNode
}

export function StaffOverviewTable({
  users,
  profiles,
  isManager,
  handleSuspendToggle,
  handleDeleteUser,
  handleRoleToggle,
  getRoleBadge,
}: StaffOverviewTableProps) {
  const [searchTerm, setSearchTerm] = useState('')
  const [roleFilter, setRoleFilter] = useState('all')
  const [categoryFilter, setCategoryFilter] = useState('all')

  const filteredUsers = users.filter((u) => {
    const profile = profiles.find((p) => p.id === u.profile)
    const searchStr = searchTerm.toLowerCase()
    const matchesSearch =
      (u.name || '').toLowerCase().includes(searchStr) ||
      (u.email || '').toLowerCase().includes(searchStr) ||
      (u.employee_number || '').toLowerCase().includes(searchStr)

    const matchesRole = roleFilter === 'all' || u.profile === roleFilter
    const matchesCategory =
      categoryFilter === 'all' ||
      profile?.category === categoryFilter ||
      (!profile && categoryFilter === 'Sem Categoria')

    return matchesSearch && matchesRole && matchesCategory
  })

  return (
    <div className="space-y-4">
      <div className="flex flex-col md:flex-row gap-4 justify-between items-start md:items-center">
        <div className="flex flex-col md:flex-row gap-4 w-full md:w-auto flex-1">
          <div className="relative w-full md:w-80">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-slate-500" />
            <Input
              placeholder="Buscar por nome, email ou nº..."
              className="pl-9 bg-white"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <Select value={roleFilter} onValueChange={setRoleFilter}>
            <SelectTrigger className="w-full md:w-48 bg-white">
              <SelectValue placeholder="Filtrar por Cargo" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos os Cargos</SelectItem>
              {profiles.map((p) => (
                <SelectItem key={p.id} value={p.id}>
                  {p.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={categoryFilter} onValueChange={setCategoryFilter}>
            <SelectTrigger className="w-full md:w-48 bg-white">
              <SelectValue placeholder="Filtrar por Departamento" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos os Departamentos</SelectItem>
              {categoriesList.map((c) => (
                <SelectItem key={c} value={c}>
                  {c}
                </SelectItem>
              ))}
              <SelectItem value="Sem Categoria">Sem Categoria</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="flex-shrink-0">
          {isManager() && <CreateUserDialog profiles={profiles} />}
        </div>
      </div>

      <Card className="border-slate-200 shadow-sm overflow-hidden">
        <CardContent className="p-0 overflow-x-auto">
          <Table className="min-w-[1000px]">
            <TableHeader>
              <TableRow className="bg-slate-50">
                <TableHead className="pl-6 w-[250px]">Colaborador</TableHead>
                <TableHead>Identificação</TableHead>
                <TableHead>Contato</TableHead>
                <TableHead>Cargo / Função</TableHead>
                <TableHead>Departamento</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right pr-6">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredUsers.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="h-32 text-center text-slate-500">
                    Nenhum colaborador encontrado com os filtros atuais.
                  </TableCell>
                </TableRow>
              ) : (
                filteredUsers.map((u) => {
                  const profile = profiles.find((p) => p.id === u.profile)
                  const isSuspended = u.is_active === false
                  const avatarUrl = u.avatar
                    ? pb.files.getUrl(u, u.avatar, { thumb: '100x100' })
                    : undefined
                  const initials = u.name ? u.name.substring(0, 2).toUpperCase() : 'U'

                  return (
                    <TableRow key={u.id} className="hover:bg-slate-50/50">
                      <TableCell className="pl-6 font-medium py-3">
                        <div className="flex items-center gap-3">
                          <Avatar
                            className={`w-9 h-9 border border-slate-200 ${isSuspended ? 'opacity-50 grayscale' : ''}`}
                          >
                            <AvatarImage src={avatarUrl} className="object-cover" />
                            <AvatarFallback className="bg-slate-100 text-slate-600 text-xs font-semibold">
                              {initials}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex flex-col">
                            <span
                              className={`font-semibold text-slate-800 ${isSuspended ? 'text-slate-400 line-through' : ''}`}
                            >
                              {u.name || 'Sem Nome'}
                            </span>
                            {u.role === 'manager' && (
                              <span className="text-[10px] text-blue-600 font-medium flex items-center gap-1 mt-0.5">
                                <Shield className="w-3 h-3" /> Tech Admin
                              </span>
                            )}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className={isSuspended ? 'opacity-50' : ''}>
                        {u.employee_number ? (
                          <span className="font-mono text-sm text-slate-600">
                            {u.employee_number}
                          </span>
                        ) : (
                          <span className="text-slate-400 text-xs italic">N/A</span>
                        )}
                      </TableCell>
                      <TableCell className={isSuspended ? 'opacity-50' : ''}>
                        <div className="flex flex-col text-sm text-slate-600">
                          <span>{u.email}</span>
                          {u.phone && <span className="text-xs text-slate-400">{u.phone}</span>}
                        </div>
                      </TableCell>
                      <TableCell className={isSuspended ? 'opacity-50' : ''}>
                        {profile ? (
                          <div className="flex flex-col items-start gap-1">
                            <span className="text-sm font-medium text-slate-700">
                              {profile.name}
                            </span>
                            {getRoleBadge(profile.role_level)}
                          </div>
                        ) : (
                          <Badge
                            variant="outline"
                            className="text-slate-400 border-slate-200 bg-slate-50"
                          >
                            Sem Cargo
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell className={isSuspended ? 'opacity-50' : ''}>
                        {profile?.category ? (
                          <Badge
                            variant="secondary"
                            className="bg-slate-100 text-slate-600 text-[10px] uppercase shadow-sm"
                          >
                            {profile.category}
                          </Badge>
                        ) : (
                          <span className="text-slate-400 text-xs italic">-</span>
                        )}
                      </TableCell>
                      <TableCell>
                        {isSuspended ? (
                          <Badge
                            variant="outline"
                            className="text-slate-500 border-slate-200 bg-slate-50 shadow-sm"
                          >
                            Inativo
                          </Badge>
                        ) : (
                          <Badge className="bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100 shadow-sm">
                            Ativo
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell className="text-right pr-6">
                        <div className="flex items-center justify-end gap-2">
                          <StaffDocumentsSheet user={u} />
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" className="h-8 w-8 p-0">
                                <span className="sr-only">Abrir menu</span>
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="w-48">
                              <EditUserDialog
                                user={u}
                                profiles={profiles}
                                trigger={
                                  <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                                    <Edit2 className="mr-2 h-4 w-4" />
                                    <span>Editar</span>
                                  </DropdownMenuItem>
                                }
                              />

                              {pb.authStore.record?.role === 'manager' && (
                                <ResendAccessDialog
                                  user={u}
                                  trigger={
                                    <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                                      <Mail className="mr-2 h-4 w-4" />
                                      <span>Reenviar Acesso</span>
                                    </DropdownMenuItem>
                                  }
                                />
                              )}

                              <DropdownMenuSeparator />

                              <DropdownMenuItem onSelect={() => handleRoleToggle(u)}>
                                <Shield className="mr-2 h-4 w-4 text-blue-600" />
                                <span>
                                  {u.role === 'manager' ? 'Remover Admin' : 'Tornar Admin'}
                                </span>
                              </DropdownMenuItem>

                              {pb.authStore.record?.role === 'manager' &&
                                u.id !== pb.authStore.record?.id && (
                                  <AlertDialog>
                                    <AlertDialogTrigger asChild>
                                      <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                                        {isSuspended ? (
                                          <CheckCircle className="mr-2 h-4 w-4 text-emerald-600" />
                                        ) : (
                                          <Ban className="mr-2 h-4 w-4 text-amber-600" />
                                        )}
                                        <span>
                                          {isSuspended ? 'Ativar Acesso' : 'Suspender Acesso'}
                                        </span>
                                      </DropdownMenuItem>
                                    </AlertDialogTrigger>
                                    <AlertDialogContent>
                                      <AlertDialogHeader>
                                        <AlertDialogTitle>
                                          {isSuspended ? 'Ativar Acesso' : 'Suspender Acesso'}
                                        </AlertDialogTitle>
                                        <AlertDialogDescription>
                                          {isSuspended
                                            ? `Tem certeza que deseja ativar o acesso de ${u.name || u.email}?`
                                            : `Tem certeza que deseja suspender o acesso de ${u.name || u.email}?`}
                                        </AlertDialogDescription>
                                      </AlertDialogHeader>
                                      <AlertDialogFooter>
                                        <AlertDialogCancel>Cancelar</AlertDialogCancel>
                                        <AlertDialogAction
                                          onClick={() => handleSuspendToggle(u)}
                                          className={
                                            isSuspended
                                              ? 'bg-emerald-600 hover:bg-emerald-700'
                                              : 'bg-amber-600 hover:bg-amber-700'
                                          }
                                        >
                                          {isSuspended ? 'Sim, Ativar' : 'Sim, Suspender'}
                                        </AlertDialogAction>
                                      </AlertDialogFooter>
                                    </AlertDialogContent>
                                  </AlertDialog>
                                )}

                              {pb.authStore.record?.role === 'manager' &&
                                u.id !== pb.authStore.record?.id && (
                                  <AlertDialog>
                                    <AlertDialogTrigger asChild>
                                      <DropdownMenuItem
                                        onSelect={(e) => e.preventDefault()}
                                        className="text-rose-600 focus:text-rose-700 focus:bg-rose-50"
                                      >
                                        <Trash2 className="mr-2 h-4 w-4" />
                                        <span>Eliminar Conta</span>
                                      </DropdownMenuItem>
                                    </AlertDialogTrigger>
                                    <AlertDialogContent>
                                      <AlertDialogHeader>
                                        <AlertDialogTitle>Eliminar Usuário</AlertDialogTitle>
                                        <AlertDialogDescription>
                                          Tem certeza que deseja eliminar permanentemente o usuário{' '}
                                          {u.name || u.email}? Esta ação não pode ser desfeita.
                                        </AlertDialogDescription>
                                      </AlertDialogHeader>
                                      <AlertDialogFooter>
                                        <AlertDialogCancel>Cancelar</AlertDialogCancel>
                                        <AlertDialogAction
                                          onClick={() => handleDeleteUser(u.id)}
                                          className="bg-rose-600 hover:bg-rose-700"
                                        >
                                          Sim, Eliminar
                                        </AlertDialogAction>
                                      </AlertDialogFooter>
                                    </AlertDialogContent>
                                  </AlertDialog>
                                )}
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      </TableCell>
                    </TableRow>
                  )
                })
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
