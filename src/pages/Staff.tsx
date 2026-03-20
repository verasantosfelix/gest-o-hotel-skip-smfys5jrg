import { Briefcase } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { useAccess } from '@/hooks/use-access'
import { RestrictedAccess } from '@/components/RestrictedAccess'

export default function Staff() {
  const { hasAccess } = useAccess()
  if (!hasAccess(['Administrativo_Financeiro', 'Direcao_Admin'])) {
    return <RestrictedAccess requiredRoles={['Administrativo_Financeiro', 'Direcao_Admin']} />
  }
  return (
    <div className="space-y-6 animate-fade-in pb-8">
      <h1 className="text-2xl font-bold flex items-center gap-2">
        <Briefcase /> Equipe
      </h1>
      <Card>
        <CardContent className="pt-6">Gestão de Equipe Active</CardContent>
      </Card>
    </div>
  )
}
