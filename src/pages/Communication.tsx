import { MessageSquare } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { useAccess } from '@/hooks/use-access'
import { RestrictedAccess } from '@/components/RestrictedAccess'

export default function Communication() {
  const { hasAccess } = useAccess()
  if (!hasAccess(['Rececao_FrontOffice', 'Direcao_Admin'])) {
    return <RestrictedAccess requiredRoles={['Rececao_FrontOffice', 'Direcao_Admin']} />
  }
  return (
    <div className="space-y-6 animate-fade-in pb-8">
      <h1 className="text-2xl font-bold flex items-center gap-2">
        <MessageSquare /> Omnichannel
      </h1>
      <Card>
        <CardContent className="pt-6">Envio de Mensagens</CardContent>
      </Card>
    </div>
  )
}
