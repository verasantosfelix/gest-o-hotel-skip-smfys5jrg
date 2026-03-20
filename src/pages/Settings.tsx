import { useEffect } from 'react'
import { useNavigate, Navigate } from 'react-router-dom'
import { Shield } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import { toast } from '@/components/ui/use-toast'
import useAuthStore from '@/stores/useAuthStore'

export default function Settings() {
  const { userRole, allowReports, setAllowReports } = useAuthStore()
  const navigate = useNavigate()

  if (userRole === 'Limpeza') return <Navigate to="/governanca" replace />

  useEffect(() => {
    if (userRole !== 'Admin') {
      toast({
        title: 'Acesso Restrito',
        description: 'Apenas administradores podem acessar as configurações globais.',
        variant: 'destructive',
      })
      navigate('/', { replace: true })
    }
  }, [userRole, navigate])

  if (userRole !== 'Admin') {
    return null
  }

  return (
    <div className="space-y-6 animate-fade-in pb-8">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">
          Configurações do Sistema
        </h1>
        <p className="text-muted-foreground text-sm">Gerencie permissões e preferências globais.</p>
      </div>

      <Card className="border-slate-200 shadow-sm max-w-xl">
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Shield className="w-5 h-5 text-primary" />
            Permissões de Acesso
          </CardTitle>
          <CardDescription>
            Controle o nível de acesso para diferentes perfis na plataforma.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between p-4 border rounded-lg bg-slate-50">
            <div className="space-y-0.5 max-w-[80%]">
              <Label className="text-base font-semibold text-slate-900">
                Permitir acesso a relatórios
              </Label>
              <p className="text-sm text-slate-500">
                Concede ao perfil "Administrativa" acesso ao Painel Financeiro e ao módulo de
                Auditoria e Rastreabilidade.
              </p>
            </div>
            <Switch checked={allowReports} onCheckedChange={setAllowReports} />
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
