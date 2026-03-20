import { useEffect, useState } from 'react'
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
import { UserCircle, Shield, Bell } from 'lucide-react'
import { SidebarTrigger } from '@/components/ui/sidebar'
import { useAccess } from '@/hooks/use-access'
import pb from '@/lib/pocketbase/client'
import { useRealtime } from '@/hooks/use-realtime'
import { Link } from 'react-router-dom'
import { format } from 'date-fns'

export function AppHeader() {
  const { userRole, setUserRole, userName } = useAuthStore()
  const { isManager } = useAccess()
  const [notifications, setNotifications] = useState<any[]>([])

  const loadNotifications = async () => {
    if (!pb.authStore.isValid || !pb.authStore.record) return
    try {
      const records = await pb.collection('notifications').getFullList({
        filter: `recipient_id = "${pb.authStore.record.id}" && status = "unread"`,
        sort: '-created',
      })
      setNotifications(records)
    } catch (e) {}
  }

  useEffect(() => {
    loadNotifications()
  }, [])
  useRealtime('notifications', loadNotifications)

  const markAsRead = async (id: string) => {
    try {
      await pb.collection('notifications').update(id, { status: 'read' })
      setNotifications((prev) => prev.filter((n) => n.id !== id))
    } catch (e) {}
  }

  return (
    <header className="h-16 border-b bg-white flex items-center justify-between px-4 sm:px-6 shadow-sm z-10 sticky top-0">
      <div className="flex items-center gap-4">
        <SidebarTrigger />
      </div>
      <div className="flex items-center gap-3 sm:gap-4">
        {isManager() && (
          <Popover>
            <PopoverTrigger asChild>
              <button className="relative p-2 rounded-full hover:bg-slate-100 transition-colors">
                <Bell className="w-5 h-5 text-slate-600" />
                {notifications.length > 0 && (
                  <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-rose-500 rounded-full border-2 border-white animate-pulse" />
                )}
              </button>
            </PopoverTrigger>
            <PopoverContent
              align="end"
              className="w-80 p-0 overflow-hidden shadow-lg border-slate-200"
            >
              <div className="bg-slate-50 p-3 border-b border-slate-100 flex justify-between items-center">
                <h4 className="text-sm font-semibold text-slate-800">Notificações</h4>
                {notifications.length > 0 && (
                  <span className="text-xs font-medium text-slate-500">
                    {notifications.length} não lidas
                  </span>
                )}
              </div>
              <div className="max-h-[300px] overflow-y-auto">
                {notifications.length === 0 ? (
                  <div className="p-6 text-center text-sm text-slate-500">
                    Nenhuma notificação pendente.
                  </div>
                ) : (
                  <div className="flex flex-col">
                    {notifications.map((notif) => (
                      <div
                        key={notif.id}
                        className="p-3 border-b border-slate-100 last:border-0 hover:bg-slate-50 transition-colors"
                      >
                        <div className="flex justify-between items-start mb-1">
                          <Badge
                            variant="outline"
                            className={`text-[10px] bg-white ${notif.type === 'urgent' ? 'text-rose-600 border-rose-200' : 'text-slate-600'}`}
                          >
                            {notif.type.replace('_', ' ')}
                          </Badge>
                          <span className="text-[10px] text-slate-400 font-mono">
                            {format(new Date(notif.created), 'HH:mm')}
                          </span>
                        </div>
                        <p className="text-sm font-medium text-slate-900 leading-tight mt-1">
                          {notif.title}
                        </p>
                        <p className="text-xs text-slate-500 mt-1">{notif.message}</p>
                        <div className="flex justify-end items-center mt-3 gap-2">
                          <Button
                            size="sm"
                            variant="ghost"
                            className="h-7 text-xs text-slate-500 hover:text-slate-800"
                            onClick={() => markAsRead(notif.id)}
                          >
                            Marcar Lida
                          </Button>
                          {notif.type === 'approval_request' && (
                            <Button
                              size="sm"
                              asChild
                              className="h-7 text-xs bg-indigo-600 hover:bg-indigo-700"
                            >
                              <Link to="/alcadas" onClick={() => markAsRead(notif.id)}>
                                Ver Alçadas
                              </Link>
                            </Button>
                          )}
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
