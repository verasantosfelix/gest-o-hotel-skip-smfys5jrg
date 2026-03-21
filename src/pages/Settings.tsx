import { Shield } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import useAuthStore from '@/stores/useAuthStore'
import { useAccess } from '@/hooks/use-access'
import { RestrictedAccess } from '@/components/RestrictedAccess'

export default function Settings() {
  const { hasAccess } = useAccess()
  const { allowReports, setAllowReports } = useAuthStore()

  if (!hasAccess(['Tecnologia_TI', 'Direcao_Admin'], 'Configurações')) {
    return <RestrictedAccess requiredRoles={['Tecnologia_TI', 'Direcao_Admin']} />
  }

  return (
    <div className="space-y-6 animate-fade-in pb-8">
      <h1 className="text-2xl font-bold">Configurações do Sistema</h1>
      <Card className="max-w-xl">
        <CardHeader>
          <CardTitle className="flex gap-2">
            <Shield /> Permissões
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between p-4 border rounded-lg bg-slate-50">
            <Label>Permitir relatórios antigos (Legado)</Label>
            <Switch checked={allowReports} onCheckedChange={setAllowReports} />
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
