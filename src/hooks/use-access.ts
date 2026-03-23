import { toast } from '@/components/ui/use-toast'
import useAuthStore from '@/stores/useAuthStore'

export function useAccess() {
  const { profile, previewRole } = useAuthStore()

  const getMockAllowedActions = (role: string) => {
    switch (role) {
      case 'Administrativo_Geral':
        return ['*']
      case 'Administrativo':
        return ['Dashboard', 'Relatórios', 'Financeiro Corp', 'Documentos', 'Analytics', 'Equipe']
      case 'Gerente_Area':
        return [
          'Dashboard',
          'Reservas',
          'Quartos',
          'Governança',
          'Manutenção',
          'F&B Básico',
          'Equipe',
          'CRM',
        ]
      case 'Responsavel_Equipa':
        return ['Dashboard', 'Governança', 'F&B Básico', 'Manutenção']
      case 'Atendente':
        return ['Dashboard', 'Reservas', 'Lançamentos Rápidos', 'Busca Hóspedes', 'F&B Básico']
      default:
        return []
    }
  }

  const effectiveRoleLevel = previewRole || profile?.role_level || 'Atendente'
  const effectiveAllowedActions = previewRole
    ? getMockAllowedActions(previewRole)
    : Array.isArray(profile?.allowed_actions)
      ? profile.allowed_actions
      : []

  const hasAccess = (requiredRoles: string[] | string, moduleName?: string) => {
    if (!profile) return false

    if (
      effectiveRoleLevel === 'Gerente_Geral' ||
      effectiveRoleLevel === 'Director_Geral' ||
      effectiveRoleLevel === 'Administrativo_Geral'
    ) {
      return true
    }

    if (effectiveAllowedActions.includes('*')) return true

    if (moduleName && effectiveAllowedActions.includes(moduleName)) return true

    return false
  }

  const canWrite = (moduleName?: string) => {
    if (!profile) return false

    if (effectiveRoleLevel === 'Director_Geral') return false
    if (effectiveRoleLevel === 'Gerente_Geral' || effectiveRoleLevel === 'Administrativo_Geral')
      return true

    if (effectiveAllowedActions.includes('*')) return true

    if (moduleName && effectiveAllowedActions.includes(moduleName)) {
      if (effectiveRoleLevel === 'Atendente' || effectiveRoleLevel === 'Administrativo')
        return false // Minimal write permissions by default
      return true
    }

    return false
  }

  const isManager = () => {
    if (!profile) return false
    return [
      'Gerente_Geral',
      'Director_Geral',
      'Administrativo_Geral',
      'Gerente_Area',
      'Responsavel_Equipa',
    ].includes(effectiveRoleLevel)
  }

  const checkAccess = (moduleName?: string, actionName?: string, sensitive: boolean = false) => {
    if (!profile) return false

    if (effectiveRoleLevel === 'Director_Geral') {
      toast({
        title: 'Acesso Restrito',
        description: 'O perfil tem apenas permissão de leitura.',
        variant: 'destructive',
      })
      return false
    }

    if (!canWrite(moduleName)) {
      toast({
        title: 'Acesso Restrito',
        description: `Sem permissão para ${actionName || 'esta ação'}.`,
        variant: 'destructive',
      })
      return false
    }

    if (
      sensitive &&
      !['Gerente_Geral', 'Gerente_Area', 'Administrativo_Geral'].includes(effectiveRoleLevel)
    ) {
      toast({
        title: 'Acesso Restrito',
        description: 'Ação sensível. Apenas Gerentes podem executá-la.',
        variant: 'destructive',
      })
      return false
    }

    return true
  }

  return {
    hasAccess,
    checkAccess,
    isManager,
    canWrite,
    effectiveRoleLevel,
    effectiveAllowedActions,
  }
}
