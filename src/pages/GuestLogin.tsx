import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { AlertCircle, Loader2 } from 'lucide-react'
import { Alert, AlertDescription } from '@/components/ui/alert'
import pb from '@/lib/pocketbase/client'

export default function GuestLogin() {
  const [reservaId, setReservaId] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const navigate = useNavigate()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!reservaId) {
      setError('Por favor, insira o ID da sua reserva.')
      return
    }

    setLoading(true)
    setError('')

    try {
      const res = await pb.collection('reservations').getOne(reservaId)
      if (res && res.id) {
        navigate(`/portal/guest/${res.id}`)
      }
    } catch (err) {
      console.error('Login error:', err)
      setError('Reserva não encontrada. Verifique o ID fornecido.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-slate-50 p-4 w-full">
      <Card className="w-full max-w-md shadow-sm border-slate-200 animate-fade-in-up">
        <CardHeader className="space-y-2 pb-6 text-center">
          <div className="mx-auto bg-slate-900 w-12 h-12 rounded-lg flex items-center justify-center mb-2">
            <span className="text-white font-bold text-xl">S</span>
          </div>
          <CardTitle className="text-2xl font-bold tracking-tight text-slate-900">
            Portal do Hóspede
          </CardTitle>
          <CardDescription className="text-slate-500">
            Acesse as informações da sua estadia
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
              <Label htmlFor="reservaId" className="text-slate-700">
                ID da Reserva
              </Label>
              <Input
                id="reservaId"
                type="text"
                placeholder="Ex: abcd1234efgh5678"
                value={reservaId}
                onChange={(e) => setReservaId(e.target.value)}
                disabled={loading}
                className="h-11 border-slate-200"
              />
            </div>

            <Button
              type="submit"
              className="w-full h-11 bg-slate-900 hover:bg-slate-800 text-white mt-4"
              disabled={loading}
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Acessando...
                </>
              ) : (
                'Acessar Portal'
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
