import { MoonStar } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { useAccess } from '@/hooks/use-access'
import { RestrictedAccess } from '@/components/RestrictedAccess'

export default function NightAudit() {
  const { hasAccess } = useAccess()
  if (!hasAccess(['Administrativo_Financeiro', 'Rececao_FrontOffice', 'Direcao_Admin'])) {
    return (
      <RestrictedAccess
        requiredRoles={['Administrativo_Financeiro', 'Rececao_FrontOffice', 'Direcao_Admin']}
      />
    )
  }
  return (
    <div className="space-y-6 animate-fade-in pb-8">
      <h1 className="text-2xl font-bold flex items-center gap-2">
        <MoonStar /> Auditoria Noturna
      </h1>
      <Card>
        <CardContent className="pt-6">Fechamento e Virada de Diária</CardContent>
      </Card>
    </div>
  )
}
