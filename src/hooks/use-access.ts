import { toast } from '@/components/ui/use-toast'
import useAuthStore from '@/stores/useAuthStore'

export function useAccess() {
  const { profile } = useAuthStore()

  const hasAccess = (requiredRoles: string[] | string, moduleName?: string) => {
    if (!profile) return false
    const roleLevel = profile.role_level

    if (roleLevel === 'Gerente_Geral' || roleLevel === 'Director_Geral') return true

    const allowed = Array.isArray(profile.allowed_actions) ? profile.allowed_actions : []
    if (allowed.includes('*')) return true

    if (moduleName && allowed.includes(moduleName)) return true

    return false
  }

  const canWrite = (moduleName?: string) => {
    if (!profile) return false
    const roleLevel = profile.role_level

    if (roleLevel === 'Director_Geral') return false
    if (roleLevel === 'Gerente_Geral') return true

    const allowed = Array.isArray(profile.allowed_actions) ? profile.allowed_actions : []
    if (allowed.includes('*')) return true

    if (moduleName && allowed.includes(moduleName)) {
      if (roleLevel === 'Atendente') return false // Minimal write permissions by default
      return true
    }

    return false
  }

  const isManager = () => {
    if (!profile) return false
    const roleLevel = profile.role_level
    return ['Gerente_Geral', 'Director_Geral', 'Gerente_Area', 'Responsavel_Equipa'].includes(
      roleLevel,
    )
  }

  const checkAccess = (moduleName?: string, actionName?: string, sensitive: boolean = false) => {
    if (!profile) return false
    const roleLevel = profile.role_level

    if (roleLevel === 'Director_Geral') {
      toast({
        title: 'Acesso Restrito',
        description: 'O perfil de Director Geral tem apenas permissão de leitura.',
        variant: 'destructive',
      })
      return false
    }

    if (!canWrite(moduleName)) {
      toast({
        title: 'Acesso Restrito',
        description: `Seu perfil não tem permissão para ${actionName || 'esta ação'}.`,
        variant: 'destructive',
      })
      return false
    }

    if (sensitive && !['Gerente_Geral', 'Gerente_Area'].includes(roleLevel)) {
      toast({
        title: 'Acesso Restrito',
        description: 'Ação sensível. Apenas Gerentes podem executá-la.',
        variant: 'destructive',
      })
      return false
    }

    return true
  }

  return { hasAccess, checkAccess, isManager, canWrite }
}
