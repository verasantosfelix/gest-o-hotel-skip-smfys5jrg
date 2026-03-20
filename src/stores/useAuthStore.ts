import React, { createContext, useContext, useState } from 'react'

export type Role =
  | 'Lavanderia_Limpeza'
  | 'Restaurante_Bar'
  | 'Spa_Wellness'
  | 'Rececao_FrontOffice'
  | 'Administrativo_Financeiro'
  | 'Manutencao_Oficina'
  | 'Tecnologia_TI'
  | 'Direcao_Admin'

interface AuthStore {
  userRole: Role
  setUserRole: (role: Role) => void
  userName: string
  allowReports: boolean
  setAllowReports: (allow: boolean) => void
}

const AuthContext = createContext<AuthStore | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [userRole, setUserRole] = useState<Role>('Direcao_Admin')
  const [allowReports, setAllowReports] = useState(false)

  const userNameMap: Record<Role, string> = {
    Direcao_Admin: 'Gerente Geral',
    Rececao_FrontOffice: 'Atendente Front-Desk',
    Lavanderia_Limpeza: 'Equipe de Governança',
    Restaurante_Bar: 'Equipe F&B',
    Spa_Wellness: 'Terapeuta Spa',
    Administrativo_Financeiro: 'Analista Financeiro',
    Manutencao_Oficina: 'Técnico de Manutenção',
    Tecnologia_TI: 'Administrador de Redes',
  }

  const userName = userNameMap[userRole]

  return React.createElement(
    AuthContext.Provider,
    { value: { userRole, setUserRole, userName, allowReports, setAllowReports } },
    children,
  )
}

export default function useAuthStore() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuthStore must be used within an AuthProvider')
  }
  return context
}
