import { Server } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { useAccess } from '@/hooks/use-access'
import { RestrictedAccess } from '@/components/RestrictedAccess'

export default function ITAdmin() {
  const { hasAccess } = useAccess()
  if (!hasAccess(['Tecnologia_TI', 'Direcao_Admin'])) {
    return <RestrictedAccess requiredRoles={['Tecnologia_TI', 'Direcao_Admin']} />
  }
  return (
    <div className="space-y-6 animate-fade-in pb-8">
      <h1 className="text-2xl font-bold flex items-center gap-2">
        <Server /> Infraestrutura TI
      </h1>
      <Card>
        <CardContent className="pt-6">Painel de Sistemas</CardContent>
      </Card>
    </div>
  )
}
