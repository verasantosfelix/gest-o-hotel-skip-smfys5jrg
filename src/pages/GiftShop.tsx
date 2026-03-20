import { ShoppingBag } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { useAccess } from '@/hooks/use-access'
import { RestrictedAccess } from '@/components/RestrictedAccess'

export default function GiftShop() {
  const { hasAccess } = useAccess()
  if (!hasAccess(['Rececao_FrontOffice', 'Restaurante_Bar', 'Direcao_Admin'])) {
    return (
      <RestrictedAccess
        requiredRoles={['Rececao_FrontOffice', 'Restaurante_Bar', 'Direcao_Admin']}
      />
    )
  }
  return (
    <div className="space-y-6 animate-fade-in pb-8">
      <h1 className="text-2xl font-bold flex items-center gap-2">
        <ShoppingBag /> Gift Shop
      </h1>
      <Card>
        <CardContent className="pt-6">Ponto de Venda de Conveniência</CardContent>
      </Card>
    </div>
  )
}
