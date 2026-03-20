import React from 'react'
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
} from 'lucide-react'
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarHeader,
  SidebarSeparator,
} from '@/components/ui/sidebar'
import useHotelStore from '@/stores/useHotelStore'
import { useAccess } from '@/hooks/use-access'
import { Role } from '@/stores/useAuthStore'

type NavItem = {
  name: string
  url: string
  icon: any
  roles: Role[]
  requiresManager?: boolean
}

const navGroups = [
  {
    label: 'Front-Office',
    items: [
      {
        name: 'Dashboard',
        url: '/',
        icon: LayoutDashboard,
        roles: ['Rececao_FrontOffice', 'Direcao_Admin'],
      },
      {
        name: 'Reservas',
        url: '/reservas',
        icon: CalendarDays,
        roles: ['Rececao_FrontOffice', 'Direcao_Admin'],
      },
      {
        name: 'Hóspedes',
        url: '/hospedes',
        icon: Users,
        roles: ['Rececao_FrontOffice', 'Direcao_Admin'],
      },
      {
        name: 'Quartos',
        url: '/quartos',
        icon: BedDouble,
        roles: ['Rececao_FrontOffice', 'Manutencao_Oficina', 'Direcao_Admin'],
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
        roles: ['Lavanderia_Limpeza', 'Rececao_FrontOffice', 'Direcao_Admin'],
      },
      {
        name: 'Lavanderia',
        url: '/lavanderia',
        icon: Shirt,
        roles: ['Lavanderia_Limpeza', 'Direcao_Admin'],
      },
      {
        name: 'Achados e Perdidos',
        url: '/achados-perdidos',
        icon: SearchX,
        roles: ['Lavanderia_Limpeza', 'Rececao_FrontOffice', 'Direcao_Admin'],
      },
      {
        name: 'Amenities',
        url: '/minibar-amenities',
        icon: Package,
        roles: ['Lavanderia_Limpeza', 'Rececao_FrontOffice', 'Direcao_Admin'],
      },
      {
        name: 'F&B Básico',
        url: '/fnb',
        icon: Utensils,
        roles: ['Restaurante_Bar', 'Direcao_Admin'],
      },
      {
        name: 'F&B Operações',
        url: '/fb-ops',
        icon: UtensilsCrossed,
        roles: ['Restaurante_Bar', 'Direcao_Admin'],
      },
      {
        name: 'Spa & Wellness',
        url: '/spa',
        icon: Heart,
        roles: ['Spa_Wellness', 'Direcao_Admin'],
      },
      {
        name: 'Lazer & Piscinas',
        url: '/lazer',
        icon: Umbrella,
        roles: ['Spa_Wellness', 'Rececao_FrontOffice', 'Direcao_Admin'],
      },
      {
        name: 'Loja',
        url: '/loja',
        icon: ShoppingBag,
        roles: ['Rececao_FrontOffice', 'Restaurante_Bar', 'Direcao_Admin'],
      },
      {
        name: 'Manutenção',
        url: '/manutencao',
        icon: Wrench,
        roles: ['Manutencao_Oficina', 'Direcao_Admin'],
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
        roles: ['Rececao_FrontOffice', 'Direcao_Admin'],
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
        roles: ['Rececao_FrontOffice', 'Direcao_Admin'],
      },
      {
        name: 'Fidelidade',
        url: '/fidelidade-feedback',
        icon: Star,
        roles: ['Rececao_FrontOffice', 'Direcao_Admin'],
      },
      {
        name: 'Marketing',
        url: '/marketing',
        icon: Megaphone,
        roles: ['Rececao_FrontOffice', 'Direcao_Admin'],
      },
      {
        name: 'Eventos & MICE',
        url: '/eventos',
        icon: CalendarRange,
        roles: ['Rececao_FrontOffice', 'Direcao_Admin'],
      },
      {
        name: 'Grupos (MICE)',
        url: '/mice',
        icon: Building,
        roles: ['Rececao_FrontOffice', 'Direcao_Admin'],
      },
      {
        name: 'Concierge',
        url: '/concierge',
        icon: ConciergeBell,
        roles: ['Rececao_FrontOffice', 'Direcao_Admin'],
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
        roles: ['Rececao_FrontOffice', 'Direcao_Admin'],
      },
      {
        name: 'Omnichannel',
        url: '/comunicacao',
        icon: MessageSquare,
        roles: ['Rececao_FrontOffice', 'Direcao_Admin'],
      },
      {
        name: 'Comms Automáticas',
        url: '/guest-comms',
        icon: Mail,
        roles: ['Rececao_FrontOffice', 'Direcao_Admin'],
      },
      { name: 'Frota', url: '/frota', icon: Car, roles: ['Rececao_FrontOffice', 'Direcao_Admin'] },
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
  const { hasAccess, isManager } = useAccess()

  return (
    <Sidebar variant="sidebar" collapsible="offcanvas">
      <SidebarHeader className="h-16 flex items-center justify-center border-b px-4">
        <div className="flex items-center gap-2 w-full font-bold text-primary">
          <Hotel className="h-5 w-5 text-accent" />
          <span className="truncate tracking-tight">SKIP {selectedHotel.name.split(' ')[1]}</span>
        </div>
      </SidebarHeader>
      <SidebarContent>
        {navGroups.map((group, idx) => {
          const visibleItems = group.items.filter((item) => {
            if (item.requiresManager && !isManager()) return false
            return hasAccess(item.roles)
          })

          if (visibleItems.length === 0) return null

          return (
            <React.Fragment key={group.label}>
              <SidebarGroup>
                <SidebarGroupLabel className="text-xs uppercase tracking-widest text-slate-400 font-semibold mb-2">
                  {group.label}
                </SidebarGroupLabel>
                <SidebarGroupContent>
                  <SidebarMenu>
                    {visibleItems.map((item) => {
                      const isActive = location.pathname === item.url
                      return (
                        <SidebarMenuItem key={item.name}>
                          <SidebarMenuButton asChild isActive={isActive} tooltip={item.name}>
                            <Link to={item.url} className="flex items-center gap-3">
                              <item.icon className="h-4 w-4" />
                              <span className="font-medium">{item.name}</span>
                            </Link>
                          </SidebarMenuButton>
                        </SidebarMenuItem>
                      )
                    })}
                  </SidebarMenu>
                </SidebarGroupContent>
              </SidebarGroup>
              {idx < navGroups.length - 1 && (
                <SidebarSeparator className="mx-4 my-2 bg-slate-200" />
              )}
            </React.Fragment>
          )
        })}
      </SidebarContent>
    </Sidebar>
  )
}
