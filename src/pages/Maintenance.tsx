import { Wrench } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { useAccess } from '@/hooks/use-access'
import { RestrictedAccess } from '@/components/RestrictedAccess'

export default function Maintenance() {
  const { hasAccess } = useAccess()
  if (!hasAccess(['Manutencao_Oficina', 'Direcao_Admin'])) {
    return <RestrictedAccess requiredRoles={['Manutencao_Oficina', 'Direcao_Admin']} />
  }
  return (
    <div className="space-y-6 animate-fade-in pb-8">
      <h1 className="text-2xl font-bold flex items-center gap-2">
        <Wrench /> Manutenção
      </h1>
      <Card>
        <CardContent className="pt-6">Gestão de OS</CardContent>
      </Card>
    </div>
  )
}
