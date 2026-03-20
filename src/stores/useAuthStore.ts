import React, { createContext, useContext, useState } from 'react'

export type Role = 'Admin' | 'Restaurante' | 'Bar' | 'Spa'

interface AuthStore {
  userRole: Role
  setUserRole: (role: Role) => void
  userName: string
}

const AuthContext = createContext<AuthStore | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [userRole, setUserRole] = useState<Role>('Admin')

  const userName = userRole === 'Admin' ? 'Gerente Geral' : `Atendente ${userRole}`

  return React.createElement(
    AuthContext.Provider,
    { value: { userRole, setUserRole, userName } },
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
