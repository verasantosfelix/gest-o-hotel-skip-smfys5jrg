import { Package } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { useAccess } from '@/hooks/use-access'
import { RestrictedAccess } from '@/components/RestrictedAccess'

export default function MinibarAmenities() {
  const { hasAccess } = useAccess()
  if (
    !hasAccess(
      ['Lavanderia_Limpeza', 'Rececao_FrontOffice', 'Direcao_Admin', 'Front_Desk'],
      'Amenities',
    )
  ) {
    return (
      <RestrictedAccess
        requiredRoles={['Lavanderia_Limpeza', 'Rececao_FrontOffice', 'Direcao_Admin', 'Front_Desk']}
      />
    )
  }
  return (
    <div className="space-y-6 animate-fade-in pb-8">
      <h1 className="text-2xl font-bold flex items-center gap-2">
        <Package /> Minibar e Amenities
      </h1>
      <Card>
        <CardContent className="pt-6">Reposições de Quarto</CardContent>
      </Card>
    </div>
  )
}
