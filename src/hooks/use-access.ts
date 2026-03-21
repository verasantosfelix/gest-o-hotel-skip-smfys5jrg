import { toast } from '@/components/ui/use-toast'
import useAuthStore, { Role } from '@/stores/useAuthStore'
import pb from '@/lib/pocketbase/client'

export function useAccess() {
  const { userRole, profile } = useAuthStore()

  const hasAccess = (requiredRoles: Role[], moduleName?: string) => {
    if (userRole === 'Direcao_Admin') return true

    if (profile && moduleName) {
      const allowed = Array.isArray(profile.allowed_actions) ? profile.allowed_actions : []
      const denied = Array.isArray(profile.denied_actions) ? profile.denied_actions : []

      if (denied.includes(moduleName) || denied.includes('*')) return false
      if (allowed.includes(moduleName) || allowed.includes('*')) return true
      if (allowed.length > 0) return false
    }

    const record = pb.authStore.record
    if (record?.role === 'manager') return true

    return requiredRoles.includes(userRole)
  }

  const isManager = () => {
    const record = pb.authStore.record
    if (record?.role === 'manager') return true
    if (userRole === 'Direcao_Admin') return true
    return false
  }

  const checkAccess = (
    requiredRoles: Role[],
    moduleName?: string,
    actionName?: string,
    sensitive: boolean = false,
  ) => {
    if (!hasAccess(requiredRoles, moduleName)) {
      toast({
        title: 'Acesso Restrito',
        description: `O perfil '${userRole}' não tem permissão para ${actionName || 'esta ação'}. Consulte o administrador.`,
        variant: 'destructive',
      })
      return false
    }

    if (sensitive && !isManager()) {
      toast({
        title: 'Acesso Restrito',
        description: `Esta é uma ação sensível. Apenas gestores do departamento podem executá-la.`,
        variant: 'destructive',
      })
      return false
    }

    return true
  }

  return { hasAccess, checkAccess, isManager }
}
