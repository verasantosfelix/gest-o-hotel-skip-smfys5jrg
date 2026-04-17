import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import pb from '@/lib/pocketbase/client'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { toast } from '@/components/ui/use-toast'
import { Loader2, CheckCircle2 } from 'lucide-react'
import useAuthStore from '@/stores/useAuthStore'

export default function PrimeiroAcesso() {
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()
  const { retryLoadProfile } = useAuthStore()

  const handleComplete = async () => {
    if (!pb.authStore.record?.id) return

    setLoading(true)
    try {
      await pb.collection('users').update(pb.authStore.record.id, {
        first_login_completed: true,
      })

      await retryLoadProfile(true)

      toast({
        title: 'Configuração concluída',
        description: 'Bem-vindo ao sistema Gestão Hotel SKIP!',
      })

      navigate('/', { replace: true })
    } catch (error: any) {
      console.error(error)
      toast({
        title: 'Erro',
        description: 'Não foi possível concluir a configuração. Tente novamente.',
        variant: 'destructive',
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-[80vh] p-4 w-full">
      <Card className="w-full max-w-md shadow-sm border-slate-200 animate-fade-in-up">
        <CardHeader className="space-y-2 pb-6 text-center">
          <div className="mx-auto bg-slate-900 w-12 h-12 rounded-lg flex items-center justify-center mb-2">
            <span className="text-white font-bold text-xl">S</span>
          </div>
          <CardTitle className="text-2xl font-bold tracking-tight text-slate-900">
            Bem-vindo!
          </CardTitle>
          <CardDescription className="text-slate-500">
            Este é o seu primeiro acesso ao sistema.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex flex-col items-center justify-center space-y-3 py-4 text-center">
            <div className="h-16 w-16 bg-slate-100 rounded-full flex items-center justify-center">
              <CheckCircle2 className="h-8 w-8 text-emerald-600" />
            </div>
            <p className="text-sm text-slate-600">
              A sua conta foi ativada com sucesso. Clique no botão abaixo para concluir o processo
              de integração e aceder ao painel principal.
            </p>
          </div>

          <Button
            onClick={handleComplete}
            className="w-full h-11 bg-slate-900 hover:bg-slate-800 text-white"
            disabled={loading}
          >
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" /> A configurar perfil...
              </>
            ) : (
              'Concluir Configuração e Entrar'
            )}
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
