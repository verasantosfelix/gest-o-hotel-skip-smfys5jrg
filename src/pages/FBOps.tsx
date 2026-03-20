import { UtensilsCrossed } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { useAccess } from '@/hooks/use-access'
import { RestrictedAccess } from '@/components/RestrictedAccess'

export default function FBOps() {
  const { hasAccess } = useAccess()
  if (!hasAccess(['Restaurante_Bar', 'Direcao_Admin'])) {
    return <RestrictedAccess requiredRoles={['Restaurante_Bar', 'Direcao_Admin']} />
  }
  return (
    <div className="space-y-6 animate-fade-in pb-8">
      <h1 className="text-2xl font-bold flex items-center gap-2">
        <UtensilsCrossed /> F&B Avançado
      </h1>
      <Card>
        <CardContent className="pt-6">Operações KDS e Logística</CardContent>
      </Card>
    </div>
  )
}
