import { Plug } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { useAccess } from '@/hooks/use-access'
import { RestrictedAccess } from '@/components/RestrictedAccess'

export default function Integrations() {
  const { hasAccess } = useAccess()
  if (!hasAccess(['Tecnologia_TI', 'Direcao_Admin'], 'Integrações')) {
    return <RestrictedAccess requiredRoles={['Tecnologia_TI', 'Direcao_Admin']} />
  }
  return (
    <div className="space-y-6 animate-fade-in pb-8">
      <h1 className="text-2xl font-bold flex items-center gap-2">
        <Plug /> Integrações
      </h1>
      <Card>
        <CardContent className="pt-6">Hub de Integrações</CardContent>
      </Card>
    </div>
  )
}
