import { useState, useEffect } from 'react'
import { Briefcase, Eye, Trash2 } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
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
import { CreateProfileDialog } from '@/components/staff/CreateProfileDialog'
import { EditProfileDialog } from '@/components/staff/EditProfileDialog'
import { EmailTemplateEditor } from '@/components/staff/EmailTemplateEditor'
import { StaffOverviewTable } from '@/components/staff/StaffOverviewTable'
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

  const handleDeleteUser = async (userId: string) => {
    try {
      await pb.collection('users').delete(userId)
      toast({ title: 'Sucesso', description: 'Usuário eliminado com sucesso.' })
    } catch (error) {
      toast({ title: 'Erro', description: 'Falha ao eliminar o usuário.', variant: 'destructive' })
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

  const getRoleBadge = (roleLevel: string) => {
    switch (roleLevel) {
      case 'Gerente_Geral':
        return (
          <Badge className="bg-indigo-600 text-white hover:bg-indigo-700 shadow-sm text-[10px]">
            Gerente Geral
          </Badge>
        )
      case 'Director_Geral':
        return (
          <Badge className="bg-slate-700 text-white hover:bg-slate-800 shadow-sm text-[10px]">
            <Eye className="w-3 h-3 mr-1" /> Director
          </Badge>
        )
      case 'Administrativo_Geral':
        return (
          <Badge className="bg-blue-100 text-blue-800 border-blue-200 text-[10px]">
            Admin Geral
          </Badge>
        )
      case 'Administrativo':
        return (
          <Badge className="bg-slate-100 text-slate-700 border-slate-300 text-[10px]">
            Administrativo
          </Badge>
        )
      case 'Gerente_Area':
        return (
          <Badge className="bg-blue-100 text-blue-800 border-blue-200 text-[10px]">
            Gerente Área
          </Badge>
        )
      case 'Responsavel_Equipa':
        return (
          <Badge className="bg-amber-100 text-amber-800 border-amber-200 text-[10px]">
            Líder Equipa
          </Badge>
        )
      case 'Atendente':
        return (
          <Badge variant="outline" className="text-slate-600 text-[10px]">
            Atendente
          </Badge>
        )
      default:
        return (
          <Badge variant="outline" className="text-[10px]">
            Não Definido
          </Badge>
        )
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
          <StaffOverviewTable
            users={users}
            profiles={sortedProfiles}
            isManager={isManager}
            handleSuspendToggle={handleSuspendToggle}
            handleDeleteUser={handleDeleteUser}
            handleRoleToggle={handleRoleToggle}
            getRoleBadge={getRoleBadge}
          />
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
