import React, { createContext, useContext, useState } from 'react'

export type Role = 'Admin' | 'Administrativa' | 'Restaurante' | 'Bar' | 'Spa' | 'Limpeza'

interface AuthStore {
  userRole: Role
  setUserRole: (role: Role) => void
  userName: string
  allowReports: boolean
  setAllowReports: (allow: boolean) => void
}

const AuthContext = createContext<AuthStore | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [userRole, setUserRole] = useState<Role>('Admin')
  const [allowReports, setAllowReports] = useState(false)

  const userName =
    userRole === 'Admin'
      ? 'Gerente Geral'
      : userRole === 'Administrativa'
        ? 'Responsável de Reservas'
        : userRole === 'Limpeza'
          ? 'Equipe de Governança'
          : `Atendente ${userRole}`

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
