import { Smartphone } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { useAccess } from '@/hooks/use-access'
import { RestrictedAccess } from '@/components/RestrictedAccess'

export default function TechMobility() {
  const { hasAccess } = useAccess()
  if (!hasAccess(['Manutencao_Oficina', 'Tecnologia_TI', 'Direcao_Admin'])) {
    return (
      <RestrictedAccess requiredRoles={['Manutencao_Oficina', 'Tecnologia_TI', 'Direcao_Admin']} />
    )
  }
  return (
    <div className="space-y-6 animate-fade-in pb-8">
      <h1 className="text-2xl font-bold flex items-center gap-2">
        <Smartphone /> Mobilidade Técnica
      </h1>
      <Card>
        <CardContent className="pt-6">App Operacional View</CardContent>
      </Card>
    </div>
  )
}
