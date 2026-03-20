import { useState } from 'react'
import { Navigate } from 'react-router-dom'
import {
  Plug,
  Server,
  RefreshCw,
  AlertCircle,
  ArrowDownToLine,
  ArrowUpFromLine,
  Search,
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import useAuthStore from '@/stores/useAuthStore'

export default function Integrations() {
  const { userRole } = useAuthStore()
  const [search, setSearch] = useState('')
  const [searched, setSearched] = useState(false)

  if (userRole !== 'Admin' && userRole !== 'Administrativa') {
    return <Navigate to="/" replace />
  }

  const notFound = searched && !['booking', 'airbnb', 'expedia'].includes(search.toLowerCase())

  const integrations = [
    { name: 'Booking.com (OTA)', status: 'Online', latency: '45ms', error: 'Nenhum' },
    { name: 'Airbnb (OTA)', status: 'Online', latency: '60ms', error: 'Sync delay às 14:02' },
    { name: 'Expedia (OTA)', status: 'Offline', latency: '-', error: 'Timeout de Conexão' },
  ]

  return (
    <div className="space-y-6 animate-fade-in pb-8">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900 flex items-center gap-2">
          <Plug className="w-6 h-6 text-primary" />
          Hub de Integrações
        </h1>
        <p className="text-muted-foreground text-sm">
          Sincronização com OTAs, PMS e gateways de pagamento.
        </p>
      </div>

      <div className="flex gap-2 w-full max-w-md">
        <Input
          placeholder="Buscar integração (ex: decolar, booking)..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <Button onClick={() => setSearched(true)}>
          <Search className="w-4 h-4 mr-2" /> Buscar
        </Button>
      </div>

      {notFound && (
        <div className="bg-rose-50 text-rose-700 p-4 rounded-md border border-rose-200 flex items-center gap-2">
          <AlertCircle className="w-5 h-5" />
          <p className="font-medium">Plataforma não reconhecida.</p>
        </div>
      )}

      <div className="grid gap-4 md:grid-cols-3 mt-4">
        {integrations.map((integ) => (
          <Card key={integ.name} className="shadow-sm border-slate-200">
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex justify-between items-center">
                {integ.name}
                <Badge
                  variant="outline"
                  className={
                    integ.status === 'Online'
                      ? 'bg-emerald-100 text-emerald-800'
                      : 'bg-rose-100 text-rose-800'
                  }
                >
                  {integ.status}
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <div className="flex justify-between text-slate-600 bg-slate-50 p-2 rounded">
                <span>Latência:</span> <span className="font-mono">{integ.latency}</span>
              </div>
              <div className="flex justify-between text-slate-600 bg-slate-50 p-2 rounded">
                <span>Último Erro:</span>{' '}
                <span className="text-rose-600 font-medium">{integ.error}</span>
              </div>
              <Button variant="outline" className="w-full mt-2" size="sm">
                <RefreshCw className="w-3 h-3 mr-2" /> Forçar Sync
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card className="border-slate-200 shadow-sm mt-6">
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Server className="w-5 h-5" /> Transferência de Dados
          </CardTitle>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-4">
          <Button variant="secondary" className="gap-2">
            <ArrowDownToLine className="w-4 h-4" /> Importar PMS
          </Button>
          <Button variant="secondary" className="gap-2">
            <ArrowUpFromLine className="w-4 h-4" /> Exportar Relatórios
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
