import { useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { AlertCircle, Loader2 } from 'lucide-react'
import { Alert, AlertDescription } from '@/components/ui/alert'
import pb from '@/lib/pocketbase/client'
import useAuthStore from '@/stores/useAuthStore'
import { toast } from '@/components/ui/use-toast'

export function LoginForm() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const { retryLoadProfile } = useAuthStore()
  const navigate = useNavigate()
  const location = useLocation()

  const handleResetPassword = async () => {
    if (!email || !email.includes('@')) {
      setError('Para recuperar a palavra-passe, insira o seu email no campo acima.')
      return
    }
    setLoading(true)
    setError('')
    try {
      await pb.collection('users').requestPasswordReset(email)
      toast({ title: 'Email enviado', description: 'Verifique a sua caixa de entrada.' })
    } catch (err: any) {
      setError('Erro ao solicitar recuperação. Verifique se o email está correto.')
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email || !password) {
      setError('Por favor, preencha todos os campos.')
      return
    }

    setLoading(true)
    setError('')

    try {
      const res = await pb.send('/backend/v1/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email, password }),
      })

      pb.authStore.save(res.token, res.record)
      retryLoadProfile()

      const searchParams = new URLSearchParams(location.search)
      const redirect = searchParams.get('redirect')
      if (redirect) {
        navigate(redirect, { replace: true })
      }
    } catch (err: any) {
      console.error('Login error:', err)
      if (err.status === 403) {
        setError('A sua conta está suspensa. Por favor, contacte o administrador.')
      } else {
        setError('Email ou palavra-passe inválidos.')
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-[70vh] p-4 w-full">
      <Card className="w-full max-w-md shadow-sm border-slate-200 animate-fade-in-up">
        <CardHeader className="space-y-2 pb-6 text-center">
          <div className="mx-auto bg-slate-900 w-12 h-12 rounded-lg flex items-center justify-center mb-2">
            <span className="text-white font-bold text-xl">S</span>
          </div>
          <CardTitle className="text-2xl font-bold tracking-tight text-slate-900">
            Gestão Hotel SKIP
          </CardTitle>
          <CardDescription className="text-slate-500">
            Aceda ao sistema utilizando as suas credenciais
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <Alert variant="destructive" className="py-3 px-4 animate-fade-in">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription className="ml-2 font-medium">{error}</AlertDescription>
              </Alert>
            )}

            <div className="space-y-2">
              <Label htmlFor="email" className="text-slate-700">
                Email
              </Label>
              <Input
                id="email"
                type="email"
                placeholder="exemplo@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={loading}
                className="h-11 border-slate-200"
                autoComplete="username"
              />
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="password" className="text-slate-700">
                  Palavra-passe
                </Label>
                <button
                  type="button"
                  onClick={handleResetPassword}
                  className="text-xs text-blue-600 hover:text-blue-800 font-medium"
                >
                  Esqueceu a senha?
                </button>
              </div>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={loading}
                className="h-11 border-slate-200"
                autoComplete="current-password"
              />
            </div>

            <Button
              type="submit"
              className="w-full h-11 bg-slate-900 hover:bg-slate-800 text-white mt-4"
              disabled={loading}
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />A autenticar...
                </>
              ) : (
                'Entrar no Sistema'
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
