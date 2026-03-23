import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { ShieldAlert, ArrowLeft } from 'lucide-react'
import { Button } from '@/components/ui/button'

export function RestrictedAccess({ requiredRoles }: { requiredRoles?: string[] }) {
  const navigate = useNavigate()

  useEffect(() => {
    const timer = setTimeout(() => navigate('/'), 4000)
    return () => clearTimeout(timer)
  }, [navigate])

  return (
    <div className="flex flex-col items-center justify-center py-20 text-center space-y-4 animate-fade-in">
      <div className="bg-rose-100 p-4 rounded-full">
        <ShieldAlert className="w-10 h-10 text-rose-600" />
      </div>
      <h2 className="text-2xl font-bold text-slate-900">Acesso Restrito</h2>
      <p className="text-slate-500 max-w-md">
        Seu perfil não tem permissão para acessar este módulo.
        <br />
        Redirecionando para a página inicial...
      </p>
      <Button onClick={() => navigate('/')} variant="outline" className="mt-4">
        <ArrowLeft className="w-4 h-4 mr-2" />
        Voltar Agora
      </Button>
    </div>
  )
}
