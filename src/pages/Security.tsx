import { ShieldAlert } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { useAccess } from '@/hooks/use-access'
import { RestrictedAccess } from '@/components/RestrictedAccess'

export default function Security() {
  const { hasAccess } = useAccess()
  if (!hasAccess(['Tecnologia_TI', 'Manutencao_Oficina', 'Direcao_Admin'])) {
    return (
      <RestrictedAccess requiredRoles={['Tecnologia_TI', 'Manutencao_Oficina', 'Direcao_Admin']} />
    )
  }
  return (
    <div className="space-y-6 animate-fade-in pb-8">
      <h1 className="text-2xl font-bold flex items-center gap-2">
        <ShieldAlert /> Segurança
      </h1>
      <Card>
        <CardContent className="pt-6">Logs de Segurança</CardContent>
      </Card>
    </div>
  )
}
