import { TrendingUp, Landmark } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Link } from 'react-router-dom'
import { useAccess } from '@/hooks/use-access'
import { RestrictedAccess } from '@/components/RestrictedAccess'

export default function Revenue() {
  const { hasAccess } = useAccess()
  if (!hasAccess(['Administrativo_Financeiro', 'Direcao_Admin'], 'Revenue Mgmt')) {
    return <RestrictedAccess requiredRoles={['Administrativo_Financeiro', 'Direcao_Admin']} />
  }
  return (
    <div className="space-y-6 animate-fade-in pb-8">
      <h1 className="text-2xl font-bold flex items-center gap-2">
        <TrendingUp /> Revenue Management
      </h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-4">
        <Card className="hover:border-indigo-200 transition-colors shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg flex items-center gap-2 text-indigo-700">
              <Landmark className="w-5 h-5" />
              Gestão de Tarifário
            </CardTitle>
            <CardDescription>
              Configuração de tarifas base de quartos e regras de descontos.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button
              asChild
              className="w-full mt-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200"
              variant="outline"
            >
              <Link to="/tarifario">Acessar Tarifário Central</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
