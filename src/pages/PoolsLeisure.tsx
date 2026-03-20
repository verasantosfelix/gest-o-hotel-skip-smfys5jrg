import { Umbrella } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { useAccess } from '@/hooks/use-access'
import { RestrictedAccess } from '@/components/RestrictedAccess'

export default function PoolsLeisure() {
  const { hasAccess } = useAccess()
  if (!hasAccess(['Spa_Wellness', 'Rececao_FrontOffice', 'Direcao_Admin'])) {
    return (
      <RestrictedAccess requiredRoles={['Spa_Wellness', 'Rececao_FrontOffice', 'Direcao_Admin']} />
    )
  }
  return (
    <div className="space-y-6 animate-fade-in pb-8">
      <h1 className="text-2xl font-bold flex items-center gap-2">
        <Umbrella /> Piscinas e Lazer
      </h1>
      <Card>
        <CardContent className="pt-6">Gestão de Áreas de Lazer</CardContent>
      </Card>
    </div>
  )
}
