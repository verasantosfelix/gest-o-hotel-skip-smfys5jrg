import { useState, useEffect } from 'react'
import { Briefcase, Shield, Crown, Trash2, Eye, Ban, CheckCircle } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
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
import { useAccess } from '@/hooks/use-access'
import { RestrictedAccess } from '@/components/RestrictedAccess'
import { getUsers, getProfiles, updateUser, updateProfile, deleteProfile } from '@/services/staff'
import { useRealtime } from '@/hooks/use-realtime'
import { toast } from '@/components/ui/use-toast'
import { CreateUserDialog } from '@/components/staff/CreateUserDialog'
import { EditUserDialog } from '@/components/staff/EditUserDialog'
import { StaffDocumentsSheet } from '@/components/staff/StaffDocumentsSheet'
import { CreateProfileDialog } from '@/components/staff/CreateProfileDialog'
import { EditProfileDialog } from '@/components/staff/EditProfileDialog'
import { ResendAccessDialog } from '@/components/staff/ResendAccessDialog'
import { EmailTemplateEditor } from '@/components/staff/EmailTemplateEditor'
import pb from '@/lib/pocketbase/client'

export default function Staff() {
  const { hasAccess, isManager } = useAccess()
  const [users, setUsers] = useState<any[]>([])
  const [profiles, setProfiles] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  const loadData = async () => {
    try {
      const [u, p] = await Promise.all([getUsers(), getProfiles()])
      setUsers(u)
      setProfiles(p)
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [])

  useRealtime('users', loadData)
  useRealtime('profiles', loadData)

  if (!hasAccess([], 'Equipe & RH')) {
    return <RestrictedAccess />
  }

  const handleRoleToggle = async (user: any) => {
    try {
      const newRole = user.role === 'manager' ? 'user' : 'manager'
      await updateUser(user.id, { role: newRole })
      toast({ title: 'Sucesso', description: `Nível base alterado para ${newRole}.` })
    } catch (e) {
      toast({
        title: 'Erro',
        description: 'Falha ao atualizar nível do usuário.',
        variant: 'destructive',
      })
    }
  }

  const handleSuspendToggle = async (user: any) => {
    const isActive = user.is_active === false ? true : false
    try {
      await updateUser(user.id, { is_active: isActive })

      try {
        await pb.collection('action_audit_logs').create({
          user_id: pb.authStore.record?.id,
          action_type: isActive ? 'reactivate_user' : 'suspend_user',
          module: 'Equipe & RH',
          details: { target_user_id: user.id, target_email: user.email },
        })
      } catch (err) {
        console.error('Failed to write audit log', err)
      }

      toast({ title: 'Sucesso', description: 'Status de acesso atualizado.' })
    } catch (e) {
      toast({ title: 'Erro', description: 'Falha ao atualizar status.', variant: 'destructive' })
    }
  }

  const handleManagerAssign = async (profileId: string, userId: string) => {
    try {
      const value = userId === 'none' ? null : userId
      await updateProfile(profileId, { manager_id: value })
      toast({ title: 'Sucesso', description: 'Responsável do perfil atualizado.' })
    } catch (e) {
      toast({
        title: 'Erro',
        description: 'Falha ao atribuir responsável.',
        variant: 'destructive',
      })
    }
  }

  const handleDeleteProfile = async (profileId: string) => {
    const assignedUsers = users.filter((u) => u.profile === profileId)
    if (assignedUsers.length > 0) {
      toast({
        title: 'Ação bloqueada',
        description: 'Não é possível remover este cargo, pois existem usuários vinculados a ele.',
        variant: 'destructive',
      })
      return
    }

    if (!window.confirm('Tem certeza que deseja apagar este cargo?')) return

    try {
      await deleteProfile(profileId)
      toast({ title: 'Sucesso', description: 'Cargo removido com sucesso.' })
    } catch (error) {
      toast({ title: 'Erro', description: 'Falha ao remover o cargo.', variant: 'destructive' })
    }
  }

  if (loading) {
    return (
      <div className="p-8 text-center text-slate-500 animate-pulse">
        Carregando dados da equipe...
      </div>
    )
  }

  const unassignedUsers = users.filter((u) => !u.profile)

  const getRoleBadge = (roleLevel: string) => {
    switch (roleLevel) {
      case 'Gerente_Geral':
        return <Badge className="bg-indigo-600 text-white hover:bg-indigo-700">Gerente Geral</Badge>
      case 'Director_Geral':
        return (
          <Badge className="bg-slate-700 text-white hover:bg-slate-800">
            <Eye className="w-3 h-3 mr-1" /> Director
          </Badge>
        )
      case 'Administrativo_Geral':
        return <Badge className="bg-blue-100 text-blue-800 border-blue-200">Admin Geral</Badge>
      case 'Administrativo':
        return (
          <Badge className="bg-slate-100 text-slate-700 border-slate-300">Administrativo</Badge>
        )
      case 'Gerente_Area':
        return <Badge className="bg-blue-100 text-blue-800 border-blue-200">Gerente Área</Badge>
      case 'Responsavel_Equipa':
        return <Badge className="bg-amber-100 text-amber-800 border-amber-200">Líder Equipa</Badge>
      case 'Atendente':
        return (
          <Badge variant="outline" className="text-slate-600">
            Atendente
          </Badge>
        )
      default:
        return <Badge variant="outline">Não Definido</Badge>
    }
  }

  const sortedProfiles = [...profiles].sort((a, b) => {
    const cats = ['Direção', 'Managers', 'Administrativos', 'Operacionais', 'Especiais', 'Outros']
    const idxA = cats.indexOf(a.category || 'Outros')
    const idxB = cats.indexOf(b.category || 'Outros')
    if (idxA !== idxB) {
      return (idxA === -1 ? 99 : idxA) - (idxB === -1 ? 99 : idxB)
    }
    return (a.name || '').localeCompare(b.name || '')
  })

  return (
    <div className="space-y-6 animate-fade-in pb-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-2">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-blue-100 rounded-full">
            <Briefcase className="w-6 h-6 text-blue-700" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-900">
              Equipe e Perfis (RBAC)
            </h1>
            <p className="text-sm text-slate-500">
              Gerencie níveis hierárquicos, acessos e templates de sistema
            </p>
          </div>
        </div>
      </div>

      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="mb-4">
          <TabsTrigger value="overview">Visão Geral & Membros</TabsTrigger>
          <TabsTrigger value="profiles">Cargos e Permissões (RBAC)</TabsTrigger>
          <TabsTrigger value="emails">Configurações de E-mail</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="flex justify-end mb-4">
            {isManager() && <CreateUserDialog profiles={sortedProfiles} />}
          </div>

          <div className="space-y-8">
            {sortedProfiles.map((profile) => {
              const profileUsers = users.filter((u) => u.profile === profile.id)

              return (
                <Card key={profile.id} className="border-slate-200 shadow-sm overflow-hidden">
                  <CardHeader className="bg-slate-50 border-b pb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                      <CardTitle className="text-lg font-bold flex items-center gap-2 text-slate-800">
                        {profile.name} {getRoleBadge(profile.role_level)}
                      </CardTitle>
                      <CardDescription className="flex items-center gap-2 mt-1">
                        <Badge variant="outline" className="text-[10px] uppercase font-semibold">
                          {profile.category || 'Outros'}
                        </Badge>
                        <span className="text-xs">
                          {profile.allowed_actions?.includes('*')
                            ? 'Acesso a todos os módulos'
                            : `${profile.allowed_actions?.length || 0} módulo(s) liberado(s)`}
                        </span>
                      </CardDescription>
                    </div>
                    <div className="flex items-center gap-3 bg-white p-2 rounded-md border border-slate-200">
                      <span className="text-sm font-medium text-slate-600 whitespace-nowrap">
                        Lead / Resp:
                      </span>
                      <Select
                        value={profile.manager_id || 'none'}
                        onValueChange={(val) => handleManagerAssign(profile.id, val)}
                      >
                        <SelectTrigger className="w-[220px] bg-white h-8 text-xs">
                          <SelectValue placeholder="Selecione um responsável" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="none" className="text-slate-400 italic">
                            Nenhum responsável
                          </SelectItem>
                          {profileUsers.map((u) => (
                            <SelectItem key={u.id} value={u.id}>
                              {u.name || u.email}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </CardHeader>
                  <CardContent className="p-0 overflow-x-auto">
                    {profileUsers.length > 0 ? (
                      <Table className="min-w-[800px]">
                        <TableHeader>
                          <TableRow className="bg-white hover:bg-white">
                            <TableHead className="pl-6 w-[250px]">Membro</TableHead>
                            <TableHead>Email</TableHead>
                            <TableHead>Nível Técnico</TableHead>
                            <TableHead>Último Acesso</TableHead>
                            <TableHead className="text-right pr-6">Ações</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {profileUsers.map((u) => {
                            const isProfileManager = profile.manager_id === u.id
                            const isSuspended = u.is_active === false
                            const avatarUrl = u.avatar
                              ? pb.files.getUrl(u, u.avatar, { thumb: '100x100' })
                              : undefined
                            const initials = u.name ? u.name.substring(0, 2).toUpperCase() : 'U'

                            return (
                              <TableRow key={u.id}>
                                <TableCell className="pl-6 font-medium">
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
                                        className={`truncate max-w-[150px] ${isSuspended ? 'text-slate-400 line-through' : ''}`}
                                      >
                                        {u.name || 'Sem Nome'}
                                      </span>
                                      <div className="flex items-center gap-1 mt-0.5">
                                        {isProfileManager && (
                                          <Badge className="bg-amber-100 text-amber-800 hover:bg-amber-200 border-amber-200 text-[9px] px-1.5 py-0 uppercase flex items-center w-fit">
                                            <Crown className="w-2.5 h-2.5 mr-1" /> Lead
                                          </Badge>
                                        )}
                                        {isSuspended && (
                                          <Badge
                                            variant="destructive"
                                            className="text-[9px] px-1.5 py-0 uppercase w-fit"
                                          >
                                            Suspenso
                                          </Badge>
                                        )}
                                      </div>
                                    </div>
                                  </div>
                                </TableCell>
                                <TableCell
                                  className={`text-slate-500 text-sm truncate max-w-[180px] ${isSuspended ? 'opacity-50' : ''}`}
                                >
                                  {u.email}
                                </TableCell>
                                <TableCell className={isSuspended ? 'opacity-50' : ''}>
                                  {u.role === 'manager' ? (
                                    <Badge
                                      variant="outline"
                                      className="bg-blue-50 border-blue-200 text-blue-700 flex items-center gap-1 w-fit shadow-sm"
                                    >
                                      <Shield className="w-3 h-3" /> Tech Admin
                                    </Badge>
                                  ) : (
                                    <Badge
                                      variant="outline"
                                      className="bg-slate-50 text-slate-600 font-normal w-fit"
                                    >
                                      Usuário
                                    </Badge>
                                  )}
                                </TableCell>
                                <TableCell className={isSuspended ? 'opacity-50' : ''}>
                                  <span className="text-slate-600 text-sm">
                                    {u.last_login
                                      ? (() => {
                                          const d = new Date(u.last_login)
                                          return `${d.toLocaleDateString('pt-PT', { day: '2-digit', month: '2-digit', year: 'numeric' })} ${d.toLocaleTimeString('pt-PT', { hour: '2-digit', minute: '2-digit' })}`
                                        })()
                                      : 'Nunca acessou'}
                                  </span>
                                </TableCell>
                                <TableCell className="text-right pr-6">
                                  <div className="flex justify-end items-center gap-2">
                                    <StaffDocumentsSheet user={u} />
                                    {pb.authStore.record?.role === 'manager' && (
                                      <ResendAccessDialog user={u} />
                                    )}
                                    <EditUserDialog user={u} profiles={sortedProfiles} />

                                    {pb.authStore.record?.role === 'manager' &&
                                      u.id !== pb.authStore.record?.id && (
                                        <AlertDialog>
                                          <AlertDialogTrigger asChild>
                                            <Button
                                              variant="outline"
                                              size="sm"
                                              className={`h-8 w-8 p-0 ${isSuspended ? 'text-emerald-600 border-emerald-200 hover:bg-emerald-50 hover:text-emerald-700' : 'text-rose-600 border-rose-200 hover:bg-rose-50 hover:text-rose-700'}`}
                                              title={
                                                isSuspended ? 'Ativar Acesso' : 'Suspender Acesso'
                                              }
                                            >
                                              {isSuspended ? (
                                                <CheckCircle className="w-4 h-4" />
                                              ) : (
                                                <Ban className="w-4 h-4" />
                                              )}
                                            </Button>
                                          </AlertDialogTrigger>
                                          <AlertDialogContent>
                                            <AlertDialogHeader>
                                              <AlertDialogTitle>
                                                {isSuspended ? 'Ativar Acesso' : 'Suspender Acesso'}
                                              </AlertDialogTitle>
                                              <AlertDialogDescription>
                                                {isSuspended
                                                  ? `Tem certeza que deseja ativar o acesso de ${u.name || u.email}? O utilizador poderá voltar a entrar no sistema.`
                                                  : `Tem certeza que deseja suspender o acesso de ${u.name || u.email}? O utilizador não poderá mais entrar no sistema.`}
                                              </AlertDialogDescription>
                                            </AlertDialogHeader>
                                            <AlertDialogFooter>
                                              <AlertDialogCancel>Cancelar</AlertDialogCancel>
                                              <AlertDialogAction
                                                onClick={() => handleSuspendToggle(u)}
                                                className={
                                                  isSuspended
                                                    ? 'bg-emerald-600 hover:bg-emerald-700'
                                                    : 'bg-rose-600 hover:bg-rose-700'
                                                }
                                              >
                                                {isSuspended ? 'Sim, Ativar' : 'Sim, Suspender'}
                                              </AlertDialogAction>
                                            </AlertDialogFooter>
                                          </AlertDialogContent>
                                        </AlertDialog>
                                      )}

                                    <Button
                                      variant="outline"
                                      size="sm"
                                      onClick={() => handleRoleToggle(u)}
                                      className={`h-8 px-2 text-[11px] font-medium transition-colors ${u.role === 'manager' ? 'border-slate-200 text-slate-600 hover:bg-slate-100' : 'border-blue-200 text-blue-600 hover:bg-blue-50'}`}
                                    >
                                      {u.role === 'manager' ? 'Tirar Admin' : 'Dar Admin'}
                                    </Button>
                                  </div>
                                </TableCell>
                              </TableRow>
                            )
                          })}
                        </TableBody>
                      </Table>
                    ) : (
                      <div className="p-8 text-center text-slate-400 bg-slate-50/50 text-sm">
                        Não há usuários vinculados a este cargo.
                      </div>
                    )}
                  </CardContent>
                </Card>
              )
            })}

            {unassignedUsers.length > 0 && (
              <Card className="border-slate-200 border-dashed bg-slate-50/30">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-semibold text-slate-500">
                    Usuários sem Cargo Atribuído
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2">
                    {unassignedUsers.map((u) => {
                      const isSuspended = u.is_active === false
                      return (
                        <div key={u.id} className="flex items-center gap-2">
                          <Badge
                            variant="secondary"
                            className={`px-3 py-1 font-normal border ${isSuspended ? 'border-rose-200 bg-rose-50 text-rose-700' : 'border-slate-200 bg-white'} shadow-sm flex items-center gap-2`}
                          >
                            <Avatar
                              className={`w-4 h-4 border border-slate-200 ${isSuspended ? 'opacity-50 grayscale' : ''}`}
                            >
                              <AvatarImage
                                src={u.avatar ? pb.files.getUrl(u, u.avatar) : undefined}
                                className="object-cover"
                              />
                              <AvatarFallback className="text-[8px] bg-slate-100">
                                {u.name ? u.name.substring(0, 2).toUpperCase() : 'U'}
                              </AvatarFallback>
                            </Avatar>
                            <span className={isSuspended ? 'line-through opacity-70' : ''}>
                              {u.name || u.email}
                            </span>
                          </Badge>
                          {pb.authStore.record?.role === 'manager' && (
                            <ResendAccessDialog user={u} />
                          )}
                          <EditUserDialog user={u} profiles={sortedProfiles} />

                          {pb.authStore.record?.role === 'manager' &&
                            u.id !== pb.authStore.record?.id && (
                              <AlertDialog>
                                <AlertDialogTrigger asChild>
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    className={`h-8 w-8 p-0 ${isSuspended ? 'text-emerald-600 border-emerald-200 hover:bg-emerald-50 hover:text-emerald-700' : 'text-rose-600 border-rose-200 hover:bg-rose-50 hover:text-rose-700'}`}
                                    title={isSuspended ? 'Ativar Acesso' : 'Suspender Acesso'}
                                  >
                                    {isSuspended ? (
                                      <CheckCircle className="w-4 h-4" />
                                    ) : (
                                      <Ban className="w-4 h-4" />
                                    )}
                                  </Button>
                                </AlertDialogTrigger>
                                <AlertDialogContent>
                                  <AlertDialogHeader>
                                    <AlertDialogTitle>
                                      {isSuspended ? 'Ativar Acesso' : 'Suspender Acesso'}
                                    </AlertDialogTitle>
                                    <AlertDialogDescription>
                                      {isSuspended
                                        ? `Tem certeza que deseja ativar o acesso de ${u.name || u.email}? O utilizador poderá voltar a entrar no sistema.`
                                        : `Tem certeza que deseja suspender o acesso de ${u.name || u.email}? O utilizador não poderá mais entrar no sistema.`}
                                    </AlertDialogDescription>
                                  </AlertDialogHeader>
                                  <AlertDialogFooter>
                                    <AlertDialogCancel>Cancelar</AlertDialogCancel>
                                    <AlertDialogAction
                                      onClick={() => handleSuspendToggle(u)}
                                      className={
                                        isSuspended
                                          ? 'bg-emerald-600 hover:bg-emerald-700'
                                          : 'bg-rose-600 hover:bg-rose-700'
                                      }
                                    >
                                      {isSuspended ? 'Sim, Ativar' : 'Sim, Suspender'}
                                    </AlertDialogAction>
                                  </AlertDialogFooter>
                                </AlertDialogContent>
                              </AlertDialog>
                            )}
                        </div>
                      )
                    })}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>

        <TabsContent value="profiles" className="space-y-6">
          <Card className="border-slate-200 shadow-sm">
            <CardHeader className="border-b bg-slate-50 flex flex-row items-center justify-between">
              <div>
                <CardTitle className="text-lg font-bold text-slate-800">
                  Cargos Administrativos (RBAC)
                </CardTitle>
                <CardDescription>
                  Crie e gerencie níveis de permissões de toda a hierarquia
                </CardDescription>
              </div>
              <CreateProfileDialog />
            </CardHeader>
            <CardContent className="p-0">
              {sortedProfiles.length > 0 ? (
                <Table>
                  <TableHeader>
                    <TableRow className="bg-white hover:bg-white">
                      <TableHead className="pl-6">Nome do Cargo</TableHead>
                      <TableHead>Categoria</TableHead>
                      <TableHead>Nível RBAC</TableHead>
                      <TableHead>Permissões/Módulos</TableHead>
                      <TableHead>Membros</TableHead>
                      <TableHead className="text-right pr-6">Ações</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {sortedProfiles.map((profile) => {
                      const usersCount = users.filter((u) => u.profile === profile.id).length
                      const isGlobal = ['Gerente_Geral', 'Director_Geral'].includes(
                        profile.role_level,
                      )

                      return (
                        <TableRow key={profile.id}>
                          <TableCell className="pl-6 font-medium text-slate-800">
                            {profile.name}
                          </TableCell>
                          <TableCell>
                            <Badge
                              variant="outline"
                              className="text-[10px] uppercase font-semibold"
                            >
                              {profile.category || 'Outros'}
                            </Badge>
                          </TableCell>
                          <TableCell>{getRoleBadge(profile.role_level)}</TableCell>
                          <TableCell>
                            {isGlobal ? (
                              <span className="text-xs text-indigo-600 font-medium">
                                Acesso a todos os módulos
                              </span>
                            ) : (
                              <span
                                className="text-xs text-slate-500 max-w-[200px] truncate inline-block"
                                title={profile.allowed_actions?.join(', ')}
                              >
                                {profile.allowed_actions?.length || 0} módulos permitidos
                              </span>
                            )}
                          </TableCell>
                          <TableCell className="text-slate-600 font-mono">
                            {usersCount} {usersCount === 1 ? 'membro' : 'membros'}
                          </TableCell>
                          <TableCell className="text-right pr-6">
                            <div className="flex justify-end items-center gap-1">
                              <EditProfileDialog profile={profile} />
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleDeleteProfile(profile.id)}
                                className="text-rose-500 hover:text-rose-700 hover:bg-rose-50 h-8 px-2"
                                title="Remover Cargo"
                              >
                                <Trash2 className="w-4 h-4 mr-2" /> Remover
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      )
                    })}
                  </TableBody>
                </Table>
              ) : (
                <div className="p-12 text-center text-slate-500">
                  Nenhum cargo cadastrado. Crie um novo para começar.
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="emails" className="space-y-6">
          <EmailTemplateEditor />
        </TabsContent>
      </Tabs>
    </div>
  )
}
