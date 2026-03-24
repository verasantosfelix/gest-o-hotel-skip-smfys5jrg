import { toast } from '@/components/ui/use-toast'
import useAuthStore from '@/stores/useAuthStore'

export function useAccess() {
  const { profile, previewRole, previewSector } = useAuthStore()

  const getDefaultAllowedActions = (role: string, sector: string | null) => {
    // Transversal modules visible to all employees
    const transversal = ['Omnichannel', 'Comunicação']

    switch (role) {
      case 'Administrativo_Geral':
        return ['*']
      case 'Administrativo':
        return [
          ...transversal,
          'Relatórios',
          'Financeiro Corp',
          'Documentos',
          'Analytics',
          'Equipe & RH',
          'Pagamentos',
        ]
      default: {
        const actions = new Set([...transversal])

        if (sector === 'Front_Desk' || sector === 'Rececao_FrontOffice') {
          actions
            .add('Dashboard')
            .add('Reservas')
            .add('Hóspedes')
            .add('Quartos')
            .add('Lançamentos Rápidos')
            .add('Busca Hóspedes')
            .add('Concierge')
          if (role === 'Responsavel_Equipa' || role === 'Gerente_Area') {
            actions.add('Auditoria Noturna').add('Guest Journey')
            // Cross-department operational modules for Area/Team Leaders
            actions
              .add('Agenda Diária')
              .add('F&B Básico')
              .add('Vendas & Distribuição')
              .add('F&B Operações')
          }
          if (role === 'Gerente_Area') {
            actions.add('Revenue Mgmt').add('CRM').add('Manutenção').add('Governança')
          }
        } else if (sector === 'F&B' || sector === 'Restaurante_Bar') {
          actions.add('F&B Básico').add('Menu Digital')
          if (role === 'Responsavel_Equipa' || role === 'Gerente_Area') {
            actions.add('F&B Operações').add('Menu Impresso (PDF)')
          }
          if (role === 'Gerente_Area') {
            actions.add('Eventos & MICE').add('Manutenção')
          }
        } else if (sector === 'SPA' || sector === 'Spa_Wellness') {
          actions.add('Agenda Diária').add('Catálogo de Serviços')
          if (role === 'Responsavel_Equipa' || role === 'Gerente_Area') {
            actions.add('Agenda Mensal').add('Operações & Salas').add('Lavanderia SPA')
          }
          if (role === 'Gerente_Area') {
            actions.add('Lazer & Piscinas').add('Manutenção').add('Lavanderia Geral')
          }
        } else if (sector === 'Governança' || sector === 'Lavanderia_Limpeza') {
          actions.add('Governança').add('Achados e Perdidos').add('Amenities')
          if (role === 'Responsavel_Equipa' || role === 'Gerente_Area') {
            actions.add('Lavanderia Geral')
          }
          if (role === 'Gerente_Area') {
            actions.add('Manutenção')
          }
        } else if (sector === 'Manutenção' || sector === 'Manutencao_Oficina') {
          actions.add('Manutenção')
          if (role === 'Responsavel_Equipa' || role === 'Gerente_Area') {
            actions.add('Segurança')
          }
          if (role === 'Gerente_Area') {
            actions.add('IT Admin')
          }
        }

        return Array.from(actions)
      }
    }
  }

  const effectiveRoleLevel = previewRole || profile?.role_level || 'Atendente'
  const effectiveSector = previewSector || profile?.name || 'Front_Desk'

  const defaultActions = getDefaultAllowedActions(effectiveRoleLevel, effectiveSector) || []

  const effectiveAllowedActions = previewRole
    ? defaultActions
    : Array.from(
        new Set([
          ...(Array.isArray(profile?.allowed_actions) ? profile.allowed_actions : []),
          ...defaultActions,
        ]),
      )

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

    if (requiredRoles && requiredRoles.length > 0) {
      const roles = Array.isArray(requiredRoles) ? requiredRoles : [requiredRoles]
      if (roles.includes(effectiveSector)) return true
    }

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
        return false
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
    effectiveSector,
    effectiveAllowedActions,
  }
}
