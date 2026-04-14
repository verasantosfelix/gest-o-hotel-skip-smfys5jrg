import { useEffect, useRef } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import pb from '@/lib/pocketbase/client'
import useAuthStore from '@/stores/useAuthStore'

export function AutoLogoff() {
  const { profile, logout } = useAuthStore()
  const navigate = useNavigate()
  const location = useLocation()
  const timerRef = useRef<NodeJS.Timeout | null>(null)

  const getTimeoutMinutes = () => {
    if (location.pathname.startsWith('/portal/')) return 60

    if (!profile) return 30

    const role = profile.role_level
    if (
      ['Gerente_Geral', 'Director_Geral', 'Administrativo_Geral', 'Administrativo'].includes(role)
    ) {
      return 240
    }
    if (['Gerente_Area', 'Responsavel_Equipa'].includes(role)) {
      return 45
    }
    return 30
  }

  const resetTimer = () => {
    if (timerRef.current) clearTimeout(timerRef.current)

    const isPortal = location.pathname.startsWith('/portal/')
    if (!isPortal && !pb.authStore.isValid) return

    const minutes = getTimeoutMinutes()
    timerRef.current = setTimeout(
      () => {
        if (isPortal) {
          navigate('/portal/login')
        } else {
          logout()
        }
      },
      minutes * 60 * 1000,
    )
  }

  useEffect(() => {
    const events = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart']
    const handler = () => resetTimer()

    events.forEach((e) => document.addEventListener(e, handler))
    resetTimer()

    return () => {
      events.forEach((e) => document.removeEventListener(e, handler))
      if (timerRef.current) clearTimeout(timerRef.current)
    }
  }, [profile, location.pathname])

  return null
}
