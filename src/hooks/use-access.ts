import { toast } from '@/components/ui/use-toast'
import useAuthStore, { Role } from '@/stores/useAuthStore'

export function useAccess() {
  const { userRole } = useAuthStore()

  const hasAccess = (requiredRoles: Role[]) => {
    if (userRole === 'Direcao_Admin') return true
    return requiredRoles.includes(userRole)
  }

  const checkAccess = (requiredRoles: Role[], actionName?: string) => {
    if (hasAccess(requiredRoles)) return true

    toast({
      title: 'Ação Bloqueada',
      description: `O perfil '${userRole}' não tem permissão para ${actionName || 'esta ação'}. Consulte o administrador.`,
      variant: 'destructive',
    })
    return false
  }

  return { hasAccess, checkAccess }
}
