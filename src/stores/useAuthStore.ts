import React, { createContext, useContext, useState, useEffect, useCallback } from 'react'
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
  loadingProfile: boolean
  profileError: 'suspended' | 'not_found' | 'forbidden' | 'timeout' | null
  retryLoadProfile: () => void
}

const AuthContext = createContext<AuthStore | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [userRole, setUserRole] = useState<Role>('Direcao_Admin')
  const [allowReports, setAllowReports] = useState(false)
  const [profile, setProfile] = useState<any>(null)
  const [previewRole, setPreviewRole] = useState<string | null>(null)
  const [previewSector, setPreviewSector] = useState<string | null>(null)

  const [loadingProfile, setLoadingProfile] = useState(true)
  const [profileError, setProfileError] = useState<
    'suspended' | 'not_found' | 'forbidden' | 'timeout' | null
  >(null)

  const loadProfile = useCallback(async () => {
    setLoadingProfile(true)
    setProfileError(null)

    let user = pb.authStore.record
    if (!user) {
      setLoadingProfile(false)
      return
    }

    try {
      const latestUser = await Promise.race([
        pb.collection('users').getOne(user.id, { $autoCancel: false }),
        new Promise<any>((_, reject) => setTimeout(() => reject(new Error('TIMEOUT')), 10000)),
      ])
      user = latestUser
      pb.authStore.save(pb.authStore.token, user)
    } catch (e: any) {
      if (e.message === 'TIMEOUT') {
        setProfileError('timeout')
        setLoadingProfile(false)
        return
      }
    }

    if (user.is_active === false) {
      setProfileError('suspended')
      setProfile(null)
      setLoadingProfile(false)
      return
    }

    if (!user.profile) {
      setProfileError('not_found')
      setProfile(null)
      setLoadingProfile(false)
      return
    }

    try {
      const p = await Promise.race([
        pb.collection('profiles').getOne(user.profile, { $autoCancel: false }),
        new Promise<any>((_, reject) => setTimeout(() => reject(new Error('TIMEOUT')), 10000)),
      ])

      setProfile(p)
      setProfileError(null)

      try {
        await pb
          .collection('users')
          .update(user.id, { last_login: new Date().toISOString() }, { $autoCancel: false })
      } catch (e) {
        // ignore
      }
    } catch (e: any) {
      if (e.message === 'TIMEOUT') {
        setProfileError('timeout')
      } else if (e.status === 403) {
        setProfileError('forbidden')
      } else {
        setProfileError('not_found')
      }
      setProfile(null)
    } finally {
      setLoadingProfile(false)
    }
  }, [])

  useEffect(() => {
    loadProfile()
    const unsubscribe = pb.authStore.onChange(() => {
      loadProfile()
    }, true)
    return () => unsubscribe()
  }, [loadProfile])

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
        loadingProfile,
        profileError,
        retryLoadProfile: loadProfile,
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
