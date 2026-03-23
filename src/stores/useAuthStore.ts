import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react'
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
  profileError: 'suspended' | 'not_found' | 'forbidden' | 'timeout' | 'fetch_error' | null
  errorDetails: any
  retryLoadProfile: () => void
  logout: () => void
}

const AuthContext = createContext<AuthStore | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [userRole, setUserRole] = useState<Role>('Direcao_Admin')
  const [allowReports, setAllowReports] = useState(false)
  const [profile, setProfile] = useState<any>(null)
  const [previewRole, setPreviewRole] = useState<string | null>(null)
  const [previewSector, setPreviewSector] = useState<string | null>(null)

  const [loadingProfile, setLoadingProfile] = useState(true)
  const [profileError, setProfileError] = useState<AuthStore['profileError']>(null)
  const [errorDetails, setErrorDetails] = useState<any>(null)

  const loadingRef = useRef(false)

  const logout = useCallback(() => {
    pb.authStore.clear()
    window.location.href = '/'
  }, [])

  const loadProfile = useCallback(async () => {
    if (loadingRef.current) return
    loadingRef.current = true
    setLoadingProfile(true)
    setProfileError(null)
    setErrorDetails(null)

    let user = pb.authStore.record
    if (!user) {
      setLoadingProfile(false)
      loadingRef.current = false
      return
    }

    try {
      const latestUser = await Promise.race([
        pb.collection('users').getOne(user.id, { expand: 'profile', $autoCancel: false }),
        new Promise<any>((_, reject) => setTimeout(() => reject(new Error('TIMEOUT')), 10000)),
      ])
      user = latestUser
    } catch (e: any) {
      if (e.message === 'TIMEOUT') {
        setProfileError('timeout')
        setErrorDetails({ message: 'Request timed out after 10000ms' })
      } else {
        if (e.status === 403) setProfileError('forbidden')
        else if (e.status === 404) setProfileError('not_found')
        else setProfileError('fetch_error')

        setErrorDetails({
          status: e.status,
          message: e.message,
          response: e.response,
        })
      }
      setProfile(null)
      setLoadingProfile(false)
      loadingRef.current = false
      return
    }

    if (user.is_active === false) {
      setProfileError('suspended')
      setErrorDetails({ message: 'Acesso negado: a sua conta está marcada como inativa.' })
      setProfile(null)
      setLoadingProfile(false)
      loadingRef.current = false
      return
    }

    if (!user.profile) {
      setProfileError('not_found')
      setErrorDetails({
        message: 'O utilizador não possui um perfil associado. A propriedade "profile" está vazia.',
      })
      setProfile(null)
      setLoadingProfile(false)
      loadingRef.current = false
      return
    }

    if (user.expand?.profile) {
      setProfile(user.expand.profile)
      setProfileError(null)
      setLoadingProfile(false)
      loadingRef.current = false
    } else {
      try {
        const p = await Promise.race([
          pb.collection('profiles').getOne(user.profile, { $autoCancel: false }),
          new Promise<any>((_, reject) => setTimeout(() => reject(new Error('TIMEOUT')), 10000)),
        ])

        setProfile(p)
        setProfileError(null)
      } catch (e: any) {
        if (e.message === 'TIMEOUT') {
          setProfileError('timeout')
          setErrorDetails({ message: 'Profile request timed out after 10000ms' })
        } else if (e.status === 403) {
          setProfileError('forbidden')
          setErrorDetails({ status: e.status, message: e.message, response: e.response })
        } else {
          setProfileError('not_found')
          setErrorDetails({ status: e.status, message: e.message, response: e.response })
        }
        setProfile(null)
      } finally {
        setLoadingProfile(false)
        loadingRef.current = false
      }
    }

    try {
      await pb
        .collection('users')
        .update(user.id, { last_login: new Date().toISOString() }, { $autoCancel: false })
    } catch (e) {
      // ignore
    }
  }, [])

  useEffect(() => {
    loadProfile()
    const unsubscribe = pb.authStore.onChange((token, record) => {
      if (!token || !record) {
        setProfile(null)
        setProfileError(null)
      } else {
        if (!loadingRef.current) {
          loadProfile()
        }
      }
    }, false)
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
        errorDetails,
        retryLoadProfile: loadProfile,
        logout,
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
