import { useState, useEffect } from 'react'
import { Briefcase, Shield, Crown, Trash2, Eye } from 'lucide-react'
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
              Gerencie níveis hierárquicos e acesso a módulos
            </p>
          </div>
        </div>
      </div>

      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="mb-4">
          <TabsTrigger value="overview">Visão Geral & Membros</TabsTrigger>
          <TabsTrigger value="profiles">Cargos e Permissões (RBAC)</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="flex justify-end mb-4">
            {isManager() && <CreateUserDialog profiles={profiles} />}
          </div>

          <div className="space-y-8">
            {profiles.map((profile) => {
              const profileUsers = users.filter((u) => u.profile === profile.id)

              return (
                <Card key={profile.id} className="border-slate-200 shadow-sm overflow-hidden">
                  <CardHeader className="bg-slate-50 border-b pb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                      <CardTitle className="text-lg font-bold flex items-center gap-2 text-slate-800">
                        {profile.name} {getRoleBadge(profile.role_level)}
                      </CardTitle>
                      <CardDescription>
                        {profile.allowed_actions?.length} módulo(s) liberado(s)
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
                      <Table className="min-w-[700px]">
                        <TableHeader>
                          <TableRow className="bg-white hover:bg-white">
                            <TableHead className="pl-6 w-[250px]">Membro</TableHead>
                            <TableHead>Email</TableHead>
                            <TableHead>Nível Técnico</TableHead>
                            <TableHead className="text-right pr-6">Ações</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {profileUsers.map((u) => {
                            const isProfileManager = profile.manager_id === u.id
                            const avatarUrl = u.avatar
                              ? pb.files.getUrl(u, u.avatar, { thumb: '100x100' })
                              : undefined
                            const initials = u.name ? u.name.substring(0, 2).toUpperCase() : 'U'

                            return (
                              <TableRow key={u.id}>
                                <TableCell className="pl-6 font-medium">
                                  <div className="flex items-center gap-3">
                                    <Avatar className="w-9 h-9 border border-slate-200">
                                      <AvatarImage src={avatarUrl} className="object-cover" />
                                      <AvatarFallback className="bg-slate-100 text-slate-600 text-xs font-semibold">
                                        {initials}
                                      </AvatarFallback>
                                    </Avatar>
                                    <div className="flex flex-col">
                                      <span className="truncate max-w-[150px]">
                                        {u.name || 'Sem Nome'}
                                      </span>
                                      {isProfileManager && (
                                        <Badge className="bg-amber-100 text-amber-800 hover:bg-amber-200 border-amber-200 text-[9px] px-1.5 py-0 uppercase gap-1 flex items-center w-fit mt-0.5">
                                          <Crown className="w-2.5 h-2.5" /> Lead
                                        </Badge>
                                      )}
                                    </div>
                                  </div>
                                </TableCell>
                                <TableCell className="text-slate-500 text-sm truncate max-w-[180px]">
                                  {u.email}
                                </TableCell>
                                <TableCell>
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
                                <TableCell className="text-right pr-6">
                                  <div className="flex justify-end items-center gap-2">
                                    <StaffDocumentsSheet user={u} />
                                    <EditUserDialog user={u} profiles={profiles} />
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
                    {unassignedUsers.map((u) => (
                      <div key={u.id} className="flex items-center gap-2">
                        <Badge
                          variant="secondary"
                          className="px-3 py-1 font-normal border border-slate-200 bg-white shadow-sm flex items-center gap-2"
                        >
                          <Avatar className="w-4 h-4 border border-slate-200">
                            <AvatarImage
                              src={u.avatar ? pb.files.getUrl(u, u.avatar) : undefined}
                              className="object-cover"
                            />
                            <AvatarFallback className="text-[8px] bg-slate-100">
                              {u.name ? u.name.substring(0, 2).toUpperCase() : 'U'}
                            </AvatarFallback>
                          </Avatar>
                          {u.name || u.email}
                        </Badge>
                        <EditUserDialog user={u} profiles={profiles} />
                      </div>
                    ))}
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
              {profiles.length > 0 ? (
                <Table>
                  <TableHeader>
                    <TableRow className="bg-white hover:bg-white">
                      <TableHead className="pl-6">Nome do Cargo</TableHead>
                      <TableHead>Nível RBAC</TableHead>
                      <TableHead>Permissões/Módulos</TableHead>
                      <TableHead>Membros</TableHead>
                      <TableHead className="text-right pr-6">Ações</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {profiles.map((profile) => {
                      const usersCount = users.filter((u) => u.profile === profile.id).length
                      const isGlobal = ['Gerente_Geral', 'Director_Geral'].includes(
                        profile.role_level,
                      )

                      return (
                        <TableRow key={profile.id}>
                          <TableCell className="pl-6 font-medium text-slate-800">
                            {profile.name}
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
      </Tabs>
    </div>
  )
}
