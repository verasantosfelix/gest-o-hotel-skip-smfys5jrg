import React, { useEffect, useState } from 'react'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import useAuthStore from '@/stores/useAuthStore'
import { UserCircle, Bell, Crown, ShieldAlert, Eye } from 'lucide-react'
import { SidebarTrigger } from '@/components/ui/sidebar'
import { useAccess } from '@/hooks/use-access'
import pb from '@/lib/pocketbase/client'
import { useRealtime } from '@/hooks/use-realtime'
import { Link, useLocation } from 'react-router-dom'
import { format } from 'date-fns'
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb'

const PATH_LABELS: Record<string, string> = {
  reservas: 'Reservas',
  reservations: 'Reservas',
  hospedes: 'Hóspedes',
  quartos: 'Quartos',
  governanca: 'Governança',
  'busca-hospedes': 'Busca de Hóspedes',
  'lancamento-servicos': 'Lançamentos',
  auditoria: 'Auditoria',
  alcadas: 'Alçadas',
  analytics: 'Analytics',
  relatorios: 'Relatórios',
  configuracoes: 'Configurações',
  crm: 'CRM',
  equipe: 'Equipe',
  integracoes: 'Integrações',
  marketing: 'Marketing',
  fnb: 'F&B Básico',
  fb: 'F&B',
  restaurante: 'Restaurante',
  'menu-digital': 'Menu Digital',
  'menu-pdf': 'Menu PDF',
  eventos: 'Eventos',
  manutencao: 'Manutenção',
  maintenance: 'Manutenção',
  seguranca: 'Segurança',
  revenue: 'Revenue',
  mobilidade: 'Mobilidade',
  'ia-governanca': 'Governança IA',
  'guest-journey': 'Guest Journey',
  comunicacao: 'Comunicação',
  'documentos-contratos': 'Documentos',
  concierge: 'Concierge',
  mice: 'MICE',
  frota: 'Frota',
  spa: 'Spa',
  lazer: 'Lazer',
  loja: 'Loja',
  chatops: 'ChatOps',
  pagamentos: 'Pagamentos',
  lavanderia: 'Lavanderia',
  'achados-perdidos': 'Achados e Perdidos',
  'minibar-amenities': 'Amenities',
  'fidelidade-feedback': 'Fidelidade',
  'guest-comms': 'Comunicações',
  'ai-concierge': 'IA Concierge',
  'financeiro-corp': 'Finanças',
  'auditoria-noturna': 'Auditoria Noturna',
  hr: 'RH',
  'it-admin': 'IT Admin',
  'fb-ops': 'F&B Operações',
  'sales-crm': 'Vendas',
  new: 'Novo',
  edit: 'Editar',
  appointments: 'Agendamentos',
  'room-service': 'Room Service',
}

function DynamicBreadcrumbs() {
  const location = useLocation()
  const paths = location.pathname.split('/').filter(Boolean)

  if (paths.length === 0) {
    return (
      <Breadcrumb className="hidden sm:flex">
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbPage className="font-medium text-slate-800">Dashboard</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>
    )
  }

  return (
    <Breadcrumb className="hidden sm:flex">
      <BreadcrumbList>
        <BreadcrumbItem>
          <BreadcrumbLink asChild>
            <Link to="/">Início</Link>
          </BreadcrumbLink>
        </BreadcrumbItem>
        <BreadcrumbSeparator />
        {paths.map((path, index) => {
          const isLast = index === paths.length - 1
          const to = `/${paths.slice(0, index + 1).join('/')}`
          const label =
            PATH_LABELS[path] || path.replace(/-/g, ' ').replace(/\b\w/g, (l) => l.toUpperCase())

          return (
            <React.Fragment key={to}>
              <BreadcrumbItem>
                {isLast ? (
                  <BreadcrumbPage className="font-medium text-slate-800">{label}</BreadcrumbPage>
                ) : (
                  <BreadcrumbLink asChild>
                    <Link to={to}>{label}</Link>
                  </BreadcrumbLink>
                )}
              </BreadcrumbItem>
              {!isLast && <BreadcrumbSeparator />}
            </React.Fragment>
          )
        })}
      </BreadcrumbList>
    </Breadcrumb>
  )
}

export function AppHeader() {
  const { profile } = useAuthStore()
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
    } catch (e) {
      console.error('Failed to load notifications', e)
    }
  }

  useEffect(() => {
    loadNotifications()
  }, [])
  useRealtime('notifications', loadNotifications)

  const markAsRead = async (id: string) => {
    try {
      await pb.collection('notifications').update(id, { status: 'read' })
      setNotifications((prev) => prev.filter((n) => n.id !== id))
    } catch (e) {
      console.error(e)
    }
  }

  const roleLabels: Record<string, string> = {
    Gerente_Geral: 'Gerente Geral',
    Director_Geral: 'Director',
    Gerente_Area: 'Gerente Área',
    Responsavel_Equipa: 'Líder Equipa',
    Atendente: 'Atendente',
  }

  const roleLevel = profile?.role_level || 'Atendente'

  return (
    <header className="h-16 border-b bg-white flex items-center justify-between px-4 sm:px-6 shadow-sm z-10 sticky top-0">
      <div className="flex items-center gap-4">
        <SidebarTrigger />
        <div className="h-4 w-px bg-slate-200 hidden sm:block" />
        <DynamicBreadcrumbs />
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

        <div className="flex flex-col items-end mr-1 hidden sm:flex">
          <span className="text-sm font-bold text-slate-800">
            {pb.authStore.record?.name || pb.authStore.record?.email}
          </span>
          <span className="text-[10px] font-medium text-slate-500 flex items-center gap-1 uppercase">
            {roleLevel === 'Gerente_Geral' && <Crown className="w-3 h-3 text-indigo-500" />}
            {roleLevel === 'Director_Geral' && <Eye className="w-3 h-3 text-slate-500" />}
            {profile?.name} • {roleLabels[roleLevel] || roleLevel}
          </span>
        </div>

        <div className="flex items-center gap-2 bg-slate-50 p-1.5 rounded-full border border-slate-200">
          <UserCircle className="w-7 h-7 text-slate-400" />
        </div>
      </div>
    </header>
  )
}
