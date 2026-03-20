import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { History, Search } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { toast } from '@/components/ui/use-toast'
import useAuthStore from '@/stores/useAuthStore'
import useAuditStore from '@/stores/useAuditStore'

export default function Audit() {
  const { userRole, allowReports } = useAuthStore()
  const { logs } = useAuditStore()
  const navigate = useNavigate()

  const canAccess = userRole === 'Admin' || (userRole === 'Administrativa' && allowReports)

  useEffect(() => {
    if (userRole === 'Limpeza') {
      navigate('/governanca', { replace: true })
    } else if (!canAccess) {
      toast({
        title: 'Acesso Negado',
        description: 'Você não tem permissão para visualizar relatórios e auditoria.',
        variant: 'destructive',
      })
      navigate('/', { replace: true })
    }
  }, [userRole, canAccess, navigate])

  if (!canAccess) return null

  const formatDate = (dateStr: string) => {
    const d = new Date(dateStr)
    return d.toLocaleString()
  }

  return (
    <div className="space-y-6 animate-fade-in pb-8">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900 flex items-center gap-2">
          <History className="w-6 h-6 text-primary" />
          Rastreabilidade e Auditoria
        </h1>
        <p className="text-muted-foreground text-sm">Registro de todos os eventos operacionais.</p>
      </div>

      <Card className="border-slate-200 shadow-sm">
        <CardHeader>
          <CardTitle>Logs do Sistema</CardTitle>
          <CardDescription>Acompanhe ações de usuários e alterações no sistema.</CardDescription>
        </CardHeader>
        <CardContent>
          {logs.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-slate-500 border border-dashed rounded-lg bg-slate-50">
              <Search className="w-8 h-8 text-slate-300 mb-2" />
              <p>Nenhum log registrado na sessão atual.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {logs.map((log) => (
                <div
                  key={log.id}
                  className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 p-3 border rounded-lg bg-slate-50 hover:bg-slate-100 transition-colors"
                >
                  <div className="text-xs font-mono text-slate-500 min-w-[150px]">
                    {formatDate(log.timestamp)}
                  </div>
                  <div className="text-xs font-bold text-slate-700 bg-slate-200 px-2 py-0.5 rounded uppercase tracking-wider w-max">
                    {log.action}
                  </div>
                  <div className="text-sm text-slate-800">{log.details}</div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
