import { Shirt } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { useAccess } from '@/hooks/use-access'
import { RestrictedAccess } from '@/components/RestrictedAccess'

export default function Laundry() {
  const { hasAccess } = useAccess()
  if (!hasAccess(['Lavanderia_Limpeza', 'Direcao_Admin'])) {
    return <RestrictedAccess requiredRoles={['Lavanderia_Limpeza', 'Direcao_Admin']} />
  }
  return (
    <div className="space-y-6 animate-fade-in pb-8">
      <h1 className="text-2xl font-bold flex items-center gap-2">
        <Shirt /> Lavanderia
      </h1>
      <Card>
        <CardContent className="pt-6">Gestão de enxovais</CardContent>
      </Card>
    </div>
  )
}
