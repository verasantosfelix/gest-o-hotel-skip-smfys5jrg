import { toast } from '@/components/ui/use-toast'
import useAuthStore, { Role } from '@/stores/useAuthStore'
import pb from '@/lib/pocketbase/client'

export function useAccess() {
  const { userRole } = useAuthStore()

  const hasAccess = (requiredRoles: Role[]) => {
    if (userRole === 'Direcao_Admin') return true
    return requiredRoles.includes(userRole)
  }

  const isManager = () => {
    const record = pb.authStore.record
    if (record?.role === 'manager') return true
    if (userRole === 'Direcao_Admin') return true
    return false
  }

  const checkAccess = (requiredRoles: Role[], actionName?: string, sensitive: boolean = false) => {
    if (!hasAccess(requiredRoles)) {
      toast({
        title: 'Ação Bloqueada',
        description: `O perfil '${userRole}' não tem permissão para ${actionName || 'esta ação'}. Consulte o administrador.`,
        variant: 'destructive',
      })
      return false
    }

    if (sensitive && !isManager()) {
      toast({
        title: 'Acesso Restrito',
        description: `Esta é uma ação sensível. Apenas gestores (Managers) do departamento podem ${actionName || 'executar esta ação'}.`,
        variant: 'destructive',
      })
      return false
    }

    return true
  }

  return { hasAccess, checkAccess, isManager }
}
