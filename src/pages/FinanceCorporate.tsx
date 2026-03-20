import { Landmark } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { useAccess } from '@/hooks/use-access'
import { RestrictedAccess } from '@/components/RestrictedAccess'

export default function FinanceCorporate() {
  const { hasAccess } = useAccess()
  if (!hasAccess(['Administrativo_Financeiro', 'Direcao_Admin'])) {
    return <RestrictedAccess requiredRoles={['Administrativo_Financeiro', 'Direcao_Admin']} />
  }
  return (
    <div className="space-y-6 animate-fade-in pb-8">
      <h1 className="text-2xl font-bold flex items-center gap-2">
        <Landmark /> Financeiro B2B
      </h1>
      <Card>
        <CardContent className="pt-6">Acompanhamento Corporativo</CardContent>
      </Card>
    </div>
  )
}
