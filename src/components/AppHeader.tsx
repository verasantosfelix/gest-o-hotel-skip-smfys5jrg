import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import useAuthStore, { Role } from '@/stores/useAuthStore'
import useApprovalStore from '@/stores/useApprovalStore'
import useAuditStore from '@/stores/useAuditStore'
import { UserCircle, Shield, Bell, Check, X } from 'lucide-react'
import { SidebarTrigger } from '@/components/ui/sidebar'
import { useAccess } from '@/hooks/use-access'

export function AppHeader() {
  const { userRole, setUserRole, userName } = useAuthStore()
  const { approvals, resolveRequest } = useApprovalStore()
  const { addLog } = useAuditStore()
  const { hasAccess } = useAccess()

  const pendingApprovals = approvals.filter((a) => a.status === 'pending')
  const canApprove = hasAccess(['Direcao_Admin', 'Administrativo_Financeiro'])

  const handleResolve = (id: string, status: 'approved' | 'denied') => {
    resolveRequest(id, status, userName)
    const req = approvals.find((a) => a.id === id)
    if (req) {
      addLog(
        'DISCOUNT_APPROVAL',
        `${userName} ${status === 'approved' ? 'aprovou' : 'negou'} desconto de ${req.discountPercent}% para ${req.description} (Solicitante: ${req.requesterName})`,
      )
    }
  }

  return (
    <header className="h-16 border-b bg-white flex items-center justify-between px-4 sm:px-6 shadow-sm z-10 sticky top-0">
      <div className="flex items-center gap-4">
        <SidebarTrigger />
      </div>
      <div className="flex items-center gap-3 sm:gap-4">
        {canApprove && (
          <Popover>
            <PopoverTrigger asChild>
              <button className="relative p-2 rounded-full hover:bg-slate-100 transition-colors">
                <Bell className="w-5 h-5 text-slate-600" />
                {pendingApprovals.length > 0 && (
                  <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-rose-500 rounded-full border-2 border-white animate-pulse" />
                )}
              </button>
            </PopoverTrigger>
            <PopoverContent
              align="end"
              className="w-80 p-0 overflow-hidden shadow-lg border-slate-200"
            >
              <div className="bg-slate-50 p-3 border-b border-slate-100">
                <h4 className="text-sm font-semibold text-slate-800">Aprovações Pendentes</h4>
              </div>
              <div className="max-h-[300px] overflow-y-auto">
                {pendingApprovals.length === 0 ? (
                  <div className="p-6 text-center text-sm text-slate-500">
                    Nenhuma solicitação pendente.
                  </div>
                ) : (
                  <div className="flex flex-col">
                    {pendingApprovals.map((req) => (
                      <div
                        key={req.id}
                        className="p-3 border-b border-slate-100 last:border-0 hover:bg-slate-50 transition-colors"
                      >
                        <div className="flex justify-between items-start mb-1">
                          <Badge variant="outline" className="text-xs bg-white text-slate-600">
                            {req.type}
                          </Badge>
                          <span className="text-xs text-rose-600 font-mono font-medium">
                            -{req.discountPercent}% OFF
                          </span>
                        </div>
                        <p className="text-sm font-medium text-slate-900 leading-tight mt-1">
                          {req.description}
                        </p>
                        <p className="text-xs text-slate-500 mt-1">
                          Por: {req.requesterName} ({req.requesterRole})
                        </p>
                        <div className="flex justify-between items-center mt-3">
                          <span className="text-sm font-bold text-slate-800">
                            R$ {req.finalAmount.toFixed(2)}
                          </span>
                          <div className="flex gap-1.5">
                            <Button
                              size="icon"
                              variant="outline"
                              className="h-7 w-7 text-rose-600 border-rose-200 hover:bg-rose-50"
                              onClick={() => handleResolve(req.id, 'denied')}
                            >
                              <X className="w-3.5 h-3.5" />
                            </Button>
                            <Button
                              size="icon"
                              variant="outline"
                              className="h-7 w-7 text-emerald-600 border-emerald-200 hover:bg-emerald-50"
                              onClick={() => handleResolve(req.id, 'approved')}
                            >
                              <Check className="w-3.5 h-3.5" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </PopoverContent>
          </Popover>
        )}

        <div className="flex items-center gap-2 text-sm text-slate-600 bg-slate-50 px-3 py-1.5 rounded-full border border-slate-100">
          <UserCircle className="w-4 h-4" />
          <span className="font-medium hidden sm:inline-block">{userName}</span>
        </div>
        <div className="flex items-center gap-2">
          <Shield className="w-4 h-4 text-slate-400 hidden sm:block" />
          <Select value={userRole} onValueChange={(v) => setUserRole(v as Role)}>
            <SelectTrigger className="w-[180px] h-9 text-xs font-medium border-slate-200 focus:ring-slate-300">
              <SelectValue placeholder="Perfil" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Direcao_Admin" className="text-xs">
                Direção / Admin
              </SelectItem>
              <SelectItem value="Rececao_FrontOffice" className="text-xs">
                Recepção / Front
              </SelectItem>
              <SelectItem value="Administrativo_Financeiro" className="text-xs">
                Finanças / Adm
              </SelectItem>
              <SelectItem value="Restaurante_Bar" className="text-xs">
                Restaurante / Bar
              </SelectItem>
              <SelectItem value="Lavanderia_Limpeza" className="text-xs">
                Limpeza / Gov.
              </SelectItem>
              <SelectItem value="Spa_Wellness" className="text-xs">
                Spa / Wellness
              </SelectItem>
              <SelectItem value="Manutencao_Oficina" className="text-xs">
                Manutenção
              </SelectItem>
              <SelectItem value="Tecnologia_TI" className="text-xs">
                Tecnologia / TI
              </SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
    </header>
  )
}
