import { Building } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { useAccess } from '@/hooks/use-access'
import { RestrictedAccess } from '@/components/RestrictedAccess'

export default function MICE() {
  const { hasAccess } = useAccess()
  if (!hasAccess(['Rececao_FrontOffice', 'Direcao_Admin', 'Front_Desk'])) {
    return (
      <RestrictedAccess requiredRoles={['Rececao_FrontOffice', 'Direcao_Admin', 'Front_Desk']} />
    )
  }
  return (
    <div className="space-y-6 animate-fade-in pb-8">
      <h1 className="text-2xl font-bold flex items-center gap-2">
        <Building /> Grupos e Eventos
      </h1>
      <Card>
        <CardContent className="pt-6">Rooming Lists e Contratos</CardContent>
      </Card>
    </div>
  )
}
