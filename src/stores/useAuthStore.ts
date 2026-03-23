import React, { createContext, useContext, useState, useEffect } from 'react'
import pb from '@/lib/pocketbase/client'

export type Role =
  | 'Lavanderia_Limpeza'
  | 'Restaurante_Bar'
  | 'Spa_Wellness'
  | 'Rececao_FrontOffice'
  | 'Administrativo_Financeiro'
  | 'Manutencao_Oficina'
  | 'Tecnologia_TI'
  | 'Direcao_Admin'
  | 'Front_Desk'

interface AuthStore {
  userRole: Role
  setUserRole: (role: Role) => void
  userName: string
  allowReports: boolean
  setAllowReports: (allow: boolean) => void
  profile: any
  previewRole: string | null
  setPreviewRole: (role: string | null) => void
  previewSector: string | null
  setPreviewSector: (sector: string | null) => void
}

const AuthContext = createContext<AuthStore | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [userRole, setUserRole] = useState<Role>('Direcao_Admin')
  const [allowReports, setAllowReports] = useState(false)
  const [profile, setProfile] = useState<any>(null)
  const [previewRole, setPreviewRole] = useState<string | null>(null)
  const [previewSector, setPreviewSector] = useState<string | null>(null)

  const loadProfile = async () => {
    const user = pb.authStore.record
    if (user?.profile) {
      try {
        const p = await pb.collection('profiles').getOne(user.profile)
        setProfile(p)
      } catch (e) {
        setProfile(null)
      }
    } else {
      setProfile(null)
    }
  }

  useEffect(() => {
    loadProfile()
    const unsubscribe = pb.authStore.onChange(() => {
      loadProfile()
    }, true)
    return () => unsubscribe()
  }, [])

  useEffect(() => {
    if (!profile?.id) return

    let unsubscribeFn: (() => Promise<void>) | undefined
    let cancelled = false

    pb.collection('profiles')
      .subscribe(profile.id, (e) => {
        if (e.action === 'update') setProfile(e.record)
      })
      .then((fn) => {
        if (cancelled) fn().catch(() => {})
        else unsubscribeFn = fn
      })

    return () => {
      cancelled = true
      if (unsubscribeFn) unsubscribeFn().catch(() => {})
    }
  }, [profile?.id])

  const userNameMap: Record<Role, string> = {
    Direcao_Admin: 'Gerente Geral',
    Rececao_FrontOffice: 'Atendente Front-Desk',
    Front_Desk: 'Operação Front Desk',
    Lavanderia_Limpeza: 'Equipe de Governança',
    Restaurante_Bar: 'Equipe F&B',
    Spa_Wellness: 'Terapeuta Spa',
    Administrativo_Financeiro: 'Analista Financeiro',
    Manutencao_Oficina: 'Técnico de Manutenção',
    Tecnologia_TI: 'Administrador de Redes',
  }

  const userName = pb.authStore.record?.name || userNameMap[userRole]

  return React.createElement(
    AuthContext.Provider,
    {
      value: {
        userRole,
        setUserRole,
        userName,
        allowReports,
        setAllowReports,
        profile,
        previewRole,
        setPreviewRole,
        previewSector,
        setPreviewSector,
      },
    },
    children,
  )
}

export default function useAuthStore() {
  const context = useContext(AuthContext)
  if (!context) throw new Error('useAuthStore must be used within an AuthProvider')
  return context
}
