import React, { useEffect, useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import {
  LayoutDashboard,
  CalendarDays,
  BedDouble,
  Users,
  History,
  Settings,
  Hotel,
  Sparkles,
  Search,
  Receipt,
  HeartHandshake,
  Megaphone,
  CalendarRange,
  Briefcase,
  Plug,
  Utensils,
  BarChart,
  FileText,
  Wrench,
  ShieldAlert,
  TrendingUp,
  Smartphone,
  Bot,
  Compass,
  MessageSquare,
  FileSignature,
  Building,
  ConciergeBell,
  Car,
  Heart,
  Umbrella,
  ShoppingBag,
  Terminal,
  CreditCard,
  Shirt,
  SearchX,
  Package,
  Star,
  Mail,
  BotMessageSquare,
  Landmark,
  MoonStar,
  UserCog,
  Server,
  UtensilsCrossed,
  LineChart,
  ShieldCheck,
  BookOpen,
  CalendarPlus,
  PenTool,
  CalendarHeart,
  BellRing,
} from 'lucide-react'
import {
  Sidebar,
  SidebarContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarHeader,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarGroupContent,
  SidebarMenuBadge,
} from '@/components/ui/sidebar'
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion'
import useHotelStore from '@/stores/useHotelStore'
import { useAccess } from '@/hooks/use-access'
import useAuthStore, { Role } from '@/stores/useAuthStore'
import { cn } from '@/lib/utils'
import pb from '@/lib/pocketbase/client'
import { useRealtime } from '@/hooks/use-realtime'

type NavItem = {
  name: string
  url: string
  icon: any
  roles: Role[]
  requiresManager?: boolean
}

const quickAccessItems: NavItem[] = [
  {
    name: 'Nova Reserva',
    url: '/reservations/new',
    icon: CalendarPlus,
    roles: ['Rececao_FrontOffice', 'Direcao_Admin', 'Front_Desk'],
  },
  {
    name: 'Novo Ticket Manut.',
    url: '/maintenance/new',
    icon: PenTool,
    roles: ['Manutencao_Oficina', 'Direcao_Admin', 'Front_Desk'],
  },
  {
    name: 'Agendamento Spa',
    url: '/spa/appointments',
    icon: CalendarHeart,
    roles: ['Spa_Wellness', 'Direcao_Admin', 'Front_Desk'],
  },
  {
    name: 'Room Service',
    url: '/fb/room-service',
    icon: BellRing,
    roles: ['Restaurante_Bar', 'Direcao_Admin', 'Front_Desk'],
  },
]

const navGroups = [
  {
    label: 'Front-Office',
    items: [
      {
        name: 'Dashboard',
        url: '/',
        icon: LayoutDashboard,
        roles: ['Rececao_FrontOffice', 'Direcao_Admin', 'Front_Desk'],
      },
      {
        name: 'Reservas',
        url: '/reservas',
        icon: CalendarDays,
        roles: ['Rececao_FrontOffice', 'Direcao_Admin', 'Front_Desk'],
      },
      {
        name: 'Hóspedes',
        url: '/hospedes',
        icon: Users,
        roles: ['Rececao_FrontOffice', 'Direcao_Admin', 'Front_Desk'],
      },
      {
        name: 'Quartos',
        url: '/quartos',
        icon: BedDouble,
        roles: ['Rececao_FrontOffice', 'Manutencao_Oficina', 'Direcao_Admin', 'Front_Desk'],
      },
      {
        name: 'Lançamentos Rápidos',
        url: '/lancamento-servicos',
        icon: Receipt,
        roles: [
          'Rececao_FrontOffice',
          'Restaurante_Bar',
          'Spa_Wellness',
          'Lavanderia_Limpeza',
          'Direcao_Admin',
          'Front_Desk',
        ],
      },
      {
        name: 'Busca Hóspedes',
        url: '/busca-hospedes',
        icon: Search,
        roles: [
          'Rececao_FrontOffice',
          'Restaurante_Bar',
          'Spa_Wellness',
          'Lavanderia_Limpeza',
          'Direcao_Admin',
          'Front_Desk',
        ],
      },
    ] as NavItem[],
  },
  {
    label: 'Governança & Operações',
    items: [
      {
        name: 'Governança',
        url: '/governanca',
        icon: Sparkles,
        roles: ['Lavanderia_Limpeza', 'Rececao_FrontOffice', 'Direcao_Admin', 'Front_Desk'],
      },
      {
        name: 'Lavanderia',
        url: '/lavanderia',
        icon: Shirt,
        roles: ['Lavanderia_Limpeza', 'Direcao_Admin', 'Front_Desk'],
      },
      {
        name: 'Achados e Perdidos',
        url: '/achados-perdidos',
        icon: SearchX,
        roles: ['Lavanderia_Limpeza', 'Rececao_FrontOffice', 'Direcao_Admin', 'Front_Desk'],
      },
      {
        name: 'Amenities',
        url: '/minibar-amenities',
        icon: Package,
        roles: ['Lavanderia_Limpeza', 'Rececao_FrontOffice', 'Direcao_Admin', 'Front_Desk'],
      },
      {
        name: 'F&B Básico',
        url: '/fnb',
        icon: Utensils,
        roles: ['Restaurante_Bar', 'Direcao_Admin', 'Front_Desk'],
      },
      {
        name: 'F&B Operações',
        url: '/fb-ops',
        icon: UtensilsCrossed,
        roles: ['Restaurante_Bar', 'Direcao_Admin'],
      },
      {
        name: 'Menu Digital',
        url: '/restaurante/menu-digital',
        icon: BookOpen,
        roles: ['Restaurante_Bar', 'Direcao_Admin'],
      },
      {
        name: 'Menu Impresso (PDF)',
        url: '/restaurante/menu-pdf',
        icon: FileText,
        roles: ['Restaurante_Bar', 'Direcao_Admin'],
      },
      {
        name: 'Spa & Wellness',
        url: '/spa',
        icon: Heart,
        roles: ['Spa_Wellness', 'Direcao_Admin', 'Front_Desk'],
      },
      {
        name: 'Lazer & Piscinas',
        url: '/lazer',
        icon: Umbrella,
        roles: ['Spa_Wellness', 'Rececao_FrontOffice', 'Direcao_Admin', 'Front_Desk'],
      },
      {
        name: 'Loja',
        url: '/loja',
        icon: ShoppingBag,
        roles: ['Rececao_FrontOffice', 'Restaurante_Bar', 'Direcao_Admin', 'Front_Desk'],
      },
      {
        name: 'Manutenção',
        url: '/manutencao',
        icon: Wrench,
        roles: ['Manutencao_Oficina', 'Direcao_Admin', 'Front_Desk'],
      },
    ] as NavItem[],
  },
  {
    label: 'Estratégico & Financeiro',
    items: [
      {
        name: 'Alçadas (Aprovações)',
        url: '/alcadas',
        icon: ShieldCheck,
        roles: [
          'Lavanderia_Limpeza',
          'Restaurante_Bar',
          'Spa_Wellness',
          'Rececao_FrontOffice',
          'Administrativo_Financeiro',
          'Manutencao_Oficina',
          'Tecnologia_TI',
          'Direcao_Admin',
        ],
        requiresManager: true,
      },
      {
        name: 'Analytics',
        url: '/analytics',
        icon: BarChart,
        roles: ['Administrativo_Financeiro', 'Direcao_Admin'],
      },
      {
        name: 'Relatórios',
        url: '/relatorios',
        icon: FileText,
        roles: ['Administrativo_Financeiro', 'Direcao_Admin'],
      },
      {
        name: 'Revenue Mgmt',
        url: '/revenue',
        icon: TrendingUp,
        roles: ['Administrativo_Financeiro', 'Direcao_Admin'],
      },
      {
        name: 'Vendas & Distribuição',
        url: '/sales-crm',
        icon: LineChart,
        roles: ['Rececao_FrontOffice', 'Direcao_Admin', 'Front_Desk'],
      },
      {
        name: 'Financeiro Corp',
        url: '/financeiro-corp',
        icon: Landmark,
        roles: ['Administrativo_Financeiro', 'Direcao_Admin'],
      },
      {
        name: 'Auditoria Noturna',
        url: '/auditoria-noturna',
        icon: MoonStar,
        roles: ['Administrativo_Financeiro', 'Rececao_FrontOffice', 'Direcao_Admin'],
      },
      {
        name: 'Pagamentos',
        url: '/pagamentos',
        icon: CreditCard,
        roles: ['Administrativo_Financeiro', 'Rececao_FrontOffice', 'Direcao_Admin'],
      },
      {
        name: 'Equipe & RH',
        url: '/equipe',
        icon: Briefcase,
        roles: ['Administrativo_Financeiro', 'Direcao_Admin'],
      },
      {
        name: 'HR Intelligence',
        url: '/hr',
        icon: UserCog,
        roles: ['Administrativo_Financeiro', 'Direcao_Admin'],
      },
      {
        name: 'Documentos',
        url: '/documentos-contratos',
        icon: FileSignature,
        roles: ['Administrativo_Financeiro', 'Direcao_Admin'],
      },
      {
        name: 'Auditoria',
        url: '/auditoria',
        icon: History,
        roles: ['Administrativo_Financeiro', 'Tecnologia_TI', 'Direcao_Admin'],
      },
    ] as NavItem[],
  },
  {
    label: 'Experiência & Marketing',
    items: [
      {
        name: 'CRM',
        url: '/crm',
        icon: HeartHandshake,
        roles: ['Rececao_FrontOffice', 'Direcao_Admin', 'Front_Desk'],
      },
      {
        name: 'Fidelidade',
        url: '/fidelidade-feedback',
        icon: Star,
        roles: ['Rececao_FrontOffice', 'Direcao_Admin', 'Front_Desk'],
      },
      {
        name: 'Marketing',
        url: '/marketing',
        icon: Megaphone,
        roles: ['Rececao_FrontOffice', 'Direcao_Admin', 'Front_Desk'],
      },
      {
        name: 'Eventos & MICE',
        url: '/eventos',
        icon: CalendarRange,
        roles: ['Rececao_FrontOffice', 'Direcao_Admin', 'Front_Desk'],
      },
      {
        name: 'Grupos (MICE)',
        url: '/mice',
        icon: Building,
        roles: ['Rececao_FrontOffice', 'Direcao_Admin', 'Front_Desk'],
      },
      {
        name: 'Concierge',
        url: '/concierge',
        icon: ConciergeBell,
        roles: ['Rececao_FrontOffice', 'Direcao_Admin', 'Front_Desk'],
      },
      {
        name: 'IA Concierge',
        url: '/ai-concierge',
        icon: BotMessageSquare,
        roles: ['Tecnologia_TI', 'Direcao_Admin'],
      },
      {
        name: 'Guest Journey',
        url: '/guest-journey',
        icon: Compass,
        roles: ['Rececao_FrontOffice', 'Direcao_Admin', 'Front_Desk'],
      },
      {
        name: 'Omnichannel',
        url: '/comunicacao',
        icon: MessageSquare,
        roles: ['Rececao_FrontOffice', 'Direcao_Admin', 'Front_Desk'],
      },
      {
        name: 'Comms Automáticas',
        url: '/guest-comms',
        icon: Mail,
        roles: ['Rececao_FrontOffice', 'Direcao_Admin', 'Front_Desk'],
      },
      {
        name: 'Frota',
        url: '/frota',
        icon: Car,
        roles: ['Rececao_FrontOffice', 'Direcao_Admin', 'Front_Desk'],
      },
    ] as NavItem[],
  },
  {
    label: 'Tecnologia & Infra',
    items: [
      {
        name: 'IT Admin',
        url: '/it-admin',
        icon: Server,
        roles: ['Tecnologia_TI', 'Direcao_Admin'],
      },
      {
        name: 'Integrações',
        url: '/integracoes',
        icon: Plug,
        roles: ['Tecnologia_TI', 'Direcao_Admin'],
      },
      {
        name: 'ChatOps',
        url: '/chatops',
        icon: Terminal,
        roles: ['Tecnologia_TI', 'Direcao_Admin'],
      },
      {
        name: 'Governança IA',
        url: '/ia-governanca',
        icon: Bot,
        roles: ['Tecnologia_TI', 'Direcao_Admin'],
      },
      {
        name: 'Mobilidade',
        url: '/mobilidade',
        icon: Smartphone,
        roles: ['Manutencao_Oficina', 'Tecnologia_TI', 'Direcao_Admin'],
      },
      {
        name: 'Segurança',
        url: '/seguranca',
        icon: ShieldAlert,
        roles: ['Tecnologia_TI', 'Manutencao_Oficina', 'Direcao_Admin'],
      },
      {
        name: 'Configurações',
        url: '/configuracoes',
        icon: Settings,
        roles: ['Tecnologia_TI', 'Direcao_Admin'],
      },
    ] as NavItem[],
  },
]

export function AppSidebar() {
  const location = useLocation()
  const { selectedHotel } = useHotelStore()
  const { userRole } = useAuthStore()
  const { isManager, hasAccess } = useAccess()

  const [accordionValue, setAccordionValue] = useState<string>('')
  const [openMaintenance, setOpenMaintenance] = useState(0)
  const [pendingPdf, setPendingPdf] = useState(0)

  const loadBadgeCounts = async () => {
    if (!pb.authStore.isValid) return

    try {
      if (hasAccess(['Manutencao_Oficina', 'Direcao_Admin', 'Front_Desk'], 'Manutenção')) {
        const maint = await pb.collection('maintenance_tickets').getList(1, 1, {
          filter: 'status = "open"',
        })
        setOpenMaintenance(maint.totalItems)
      } else {
        setOpenMaintenance(0)
      }
    } catch (e) {
      console.error('Failed to load maintenance counts', e)
    }

    try {
      if (hasAccess(['Restaurante_Bar', 'Direcao_Admin'], 'Menu Impresso (PDF)')) {
        const pdfs = await pb.collection('fb_pdf_versions').getList(1, 1, {
          filter: 'status = "pending_approval"',
        })
        setPendingPdf(pdfs.totalItems)
      } else {
        setPendingPdf(0)
      }
    } catch (e) {
      console.error('Failed to load pdf counts', e)
    }
  }

  useEffect(() => {
    loadBadgeCounts()
  }, [userRole])

  useRealtime('maintenance_tickets', loadBadgeCounts)
  useRealtime('fb_pdf_versions', loadBadgeCounts)

  useEffect(() => {
    // Automatically expand the group that contains the current active route
    const activeGroup = navGroups.find((group) =>
      group.items.some((item) => item.url === location.pathname),
    )
    if (activeGroup) {
      setAccordionValue(activeGroup.label)
    }
  }, [location.pathname])

  const hasModuleAccess = (item: NavItem) => {
    if (item.requiresManager && !isManager()) return false
    return hasAccess(item.roles, item.name)
  }

  const quickAccessVisible = quickAccessItems.filter(hasModuleAccess)

  return (
    <Sidebar variant="sidebar" collapsible="offcanvas">
      <SidebarHeader className="h-16 flex items-center justify-center border-b px-4">
        <div className="flex items-center gap-2 w-full font-bold text-primary">
          <Hotel className="h-5 w-5 text-accent" />
          <span className="truncate tracking-tight">SKIP {selectedHotel.name.split(' ')[1]}</span>
        </div>
      </SidebarHeader>
      <SidebarContent className="px-2 py-4">
        {quickAccessVisible.length > 0 && (
          <SidebarGroup className="mb-2 p-0">
            <SidebarGroupLabel className="text-[10px] font-bold text-slate-400 uppercase tracking-wider px-2 mb-1">
              Atalhos Rápidos
            </SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {quickAccessVisible.map((item) => {
                  const isActive = location.pathname === item.url
                  return (
                    <SidebarMenuItem key={item.name}>
                      <SidebarMenuButton
                        asChild
                        isActive={isActive}
                        tooltip={item.name}
                        className="text-indigo-600 hover:text-indigo-700 hover:bg-indigo-50/80 transition-colors"
                      >
                        <Link to={item.url} className="flex items-center gap-3">
                          <item.icon className="h-4 w-4 shrink-0" />
                          <span className="font-medium truncate">{item.name}</span>
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  )
                })}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        )}

        <Accordion
          type="single"
          collapsible
          value={accordionValue}
          onValueChange={setAccordionValue}
          className="w-full space-y-1"
        >
          {navGroups.map((group) => {
            const visibleItems = group.items.filter(hasModuleAccess)

            if (visibleItems.length === 0) return null

            const isGroupActive = group.items.some((item) => item.url === location.pathname)

            return (
              <AccordionItem key={group.label} value={group.label} className="border-none">
                <AccordionTrigger
                  className={cn(
                    'hover:bg-sidebar-accent hover:text-sidebar-accent-foreground py-2 px-2 rounded-md hover:no-underline text-sm font-medium',
                    isGroupActive && 'text-primary font-semibold',
                  )}
                >
                  {group.label}
                </AccordionTrigger>
                <AccordionContent className="pb-1 pt-1 px-1">
                  <SidebarMenu>
                    {visibleItems.map((item) => {
                      const isActive = location.pathname === item.url

                      let badgeCount = 0
                      let badgeColor = ''

                      if (item.name === 'Manutenção') {
                        badgeCount = openMaintenance
                        badgeColor = 'bg-amber-500 text-white'
                      } else if (item.name === 'Menu Impresso (PDF)') {
                        badgeCount = pendingPdf
                        badgeColor = 'bg-rose-500 text-white'
                      }

                      return (
                        <SidebarMenuItem key={item.name}>
                          <SidebarMenuButton
                            asChild
                            isActive={isActive}
                            tooltip={item.name}
                            className={badgeCount > 0 ? 'pr-8' : ''}
                          >
                            <Link to={item.url} className="flex items-center gap-3 w-full">
                              <item.icon className="h-4 w-4 shrink-0" />
                              <span className="font-medium truncate">{item.name}</span>
                            </Link>
                          </SidebarMenuButton>
                          {badgeCount > 0 && (
                            <SidebarMenuBadge
                              className={cn(
                                'rounded-full px-1.5 min-w-5 flex justify-center text-[10px]',
                                badgeColor,
                              )}
                            >
                              {badgeCount}
                            </SidebarMenuBadge>
                          )}
                        </SidebarMenuItem>
                      )
                    })}
                  </SidebarMenu>
                </AccordionContent>
              </AccordionItem>
            )
          })}
        </Accordion>
      </SidebarContent>
    </Sidebar>
  )
}
