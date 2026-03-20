import { Heart } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { useAccess } from '@/hooks/use-access'
import { RestrictedAccess } from '@/components/RestrictedAccess'

export default function SpaWellness() {
  const { hasAccess } = useAccess()
  if (!hasAccess(['Spa_Wellness', 'Direcao_Admin'])) {
    return <RestrictedAccess requiredRoles={['Spa_Wellness', 'Direcao_Admin']} />
  }
  return (
    <div className="space-y-6 animate-fade-in pb-8">
      <h1 className="text-2xl font-bold flex items-center gap-2">
        <Heart /> Spa & Wellness
      </h1>
      <Card>
        <CardContent className="pt-6">Gestão do Spa</CardContent>
      </Card>
    </div>
  )
}
