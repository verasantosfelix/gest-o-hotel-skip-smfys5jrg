import { History, Search } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import useAuditStore from '@/stores/useAuditStore'
import { useAccess } from '@/hooks/use-access'
import { RestrictedAccess } from '@/components/RestrictedAccess'

export default function Audit() {
  const { hasAccess } = useAccess()
  const { logs } = useAuditStore()

  if (!hasAccess(['Administrativo_Financeiro', 'Tecnologia_TI', 'Direcao_Admin'])) {
    return (
      <RestrictedAccess
        requiredRoles={['Administrativo_Financeiro', 'Tecnologia_TI', 'Direcao_Admin']}
      />
    )
  }

  return (
    <div className="space-y-6 animate-fade-in pb-8">
      <div>
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <History /> Rastreabilidade e Auditoria
        </h1>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Logs</CardTitle>
        </CardHeader>
        <CardContent>
          {logs.map((log) => (
            <div key={log.id} className="p-2 border-b">
              <span className="text-xs font-mono">{log.timestamp}</span> - <b>{log.action}</b>:{' '}
              {log.details}
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  )
}
