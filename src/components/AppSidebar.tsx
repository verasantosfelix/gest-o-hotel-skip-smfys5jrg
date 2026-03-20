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
import useAuthStore from '@/stores/useAuthStore'

const navOperacional = [
  { name: 'Dashboard', url: '/', icon: LayoutDashboard },
  { name: 'Reservas', url: '/reservas', icon: CalendarDays },
  { name: 'Hóspedes', url: '/hospedes', icon: Users },
]

const navEstrategico = [
  { name: 'Analytics & BI', url: '/analytics', icon: BarChart },
  { name: 'Vendas & Distribuição', url: '/sales-crm', icon: LineChart },
  { name: 'Relatórios (AI)', url: '/relatorios', icon: FileText },
  { name: 'Revenue Mgmt', url: '/revenue', icon: TrendingUp },
  { name: 'Governança IA', url: '/ia-governanca', icon: Bot },
  { name: 'CRM & Experiência', url: '/crm', icon: HeartHandshake },
  { name: 'Marketing', url: '/marketing', icon: Megaphone },
  { name: 'Eventos', url: '/eventos', icon: CalendarRange },
  { name: 'Integrações', url: '/integracoes', icon: Plug },
  { name: 'Comunicação Omnichannel', url: '/comunicacao', icon: MessageSquare },
  { name: 'Fidelidade & Feedback', url: '/fidelidade-feedback', icon: Star },
  { name: 'Comms Automáticas', url: '/guest-comms', icon: Mail },
]

const navServicos = [
  { name: 'Busca de Hóspedes', url: '/busca-hospedes', icon: Search },
  { name: 'Lançamentos', url: '/lancamento-servicos', icon: Receipt },
  { name: 'Guest Journey', url: '/guest-journey', icon: Compass },
  { name: 'Tech Mobility', url: '/mobilidade', icon: Smartphone },
  { name: 'Concierge Avançado', url: '/concierge', icon: ConciergeBell },
  { name: 'IA Concierge', url: '/ai-concierge', icon: BotMessageSquare },
  { name: 'Minibar & Amenities', url: '/minibar-amenities', icon: Package },
  { name: 'Spa & Bem-estar', url: '/spa', icon: Heart },
  { name: 'Lazer & Piscinas', url: '/lazer', icon: Umbrella },
  { name: 'Frota & Transfers', url: '/frota', icon: Car },
  { name: 'Loja & Conveniência', url: '/loja', icon: ShoppingBag },
]

export function AppSidebar() {
  const location = useLocation()
  const { selectedHotel } = useHotelStore()
  const { userRole, allowReports } = useAuthStore()

  const isManager = userRole === 'Admin' || userRole === 'Administrativa'
  const isLimpeza = userRole === 'Limpeza'
  const isFnB = userRole === 'Restaurante' || userRole === 'Bar'

  const navGestao = []

  if (!isLimpeza) {
    navGestao.push({ name: 'Quartos', url: '/quartos', icon: BedDouble })
  }

  navGestao.push({ name: 'Governança', url: '/governanca', icon: Sparkles })

  if (isManager) {
    navGestao.push({ name: 'HR Intelligence', url: '/hr', icon: UserCog })
    navGestao.push({ name: 'IT & Infraestrutura', url: '/it-admin', icon: Server })
    navGestao.push({ name: 'Equipe & RH', url: '/equipe', icon: Briefcase })
    navGestao.push({ name: 'Manutenção', url: '/manutencao', icon: Wrench })
    navGestao.push({ name: 'Segurança', url: '/seguranca', icon: ShieldAlert })
    navGestao.push({ name: 'Contratos & Docs', url: '/documentos-contratos', icon: FileSignature })
    navGestao.push({ name: 'Grupos & MICE', url: '/mice', icon: Building })
    navGestao.push({ name: 'Lavanderia & Uniformes', url: '/lavanderia', icon: Shirt })
    navGestao.push({ name: 'Achados e Perdidos', url: '/achados-perdidos', icon: SearchX })
    navGestao.push({ name: 'Financeiro B2B', url: '/financeiro-corp', icon: Landmark })
    navGestao.push({ name: 'Auditoria Noturna', url: '/auditoria-noturna', icon: MoonStar })
    navGestao.push({ name: 'ChatOps Interno', url: '/chatops', icon: Terminal })
    navGestao.push({ name: 'Pagamentos / Gateway', url: '/pagamentos', icon: CreditCard })
  }

  if (userRole === 'Admin' || (userRole === 'Administrativa' && allowReports)) {
    navGestao.push({ name: 'Rastreabilidade', url: '/auditoria', icon: History })
  }

  if (userRole === 'Admin') {
    navGestao.push({ name: 'Configurações', url: '/configuracoes', icon: Settings })
  }

  return (
    <Sidebar variant="sidebar" collapsible="offcanvas">
      <SidebarHeader className="h-16 flex items-center justify-center border-b px-4">
        <div className="flex items-center gap-2 w-full font-bold text-primary">
          <Hotel className="h-5 w-5 text-accent" />
          <span className="truncate tracking-tight">SKIP {selectedHotel.name.split(' ')[1]}</span>
        </div>
      </SidebarHeader>
      <SidebarContent>
        {isManager && (
          <>
            <SidebarGroup>
              <SidebarGroupLabel className="text-xs uppercase tracking-widest text-slate-400 font-semibold mb-2">
                Operacional
              </SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu>
                  {navOperacional.map((item) => {
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
            <SidebarSeparator className="mx-4 my-2 bg-slate-200" />
            <SidebarGroup>
              <SidebarGroupLabel className="text-xs uppercase tracking-widest text-slate-400 font-semibold mb-2">
                Estratégico
              </SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu>
                  {navEstrategico.map((item) => {
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
            <SidebarSeparator className="mx-4 my-2 bg-slate-200" />
          </>
        )}

        {(isManager || isLimpeza) && (
          <SidebarGroup>
            <SidebarGroupLabel className="text-xs uppercase tracking-widest text-slate-400 font-semibold mb-2">
              Gestão
            </SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {navGestao.map((item) => {
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
        )}

        {!isManager && !isLimpeza && (
          <SidebarGroup>
            <SidebarGroupLabel className="text-xs uppercase tracking-widest text-slate-400 font-semibold mb-2">
              Serviços ({userRole})
            </SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {navServicos.map((item) => {
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
                {isFnB && (
                  <SidebarMenuItem>
                    <SidebarMenuButton
                      asChild
                      isActive={location.pathname === '/fnb' || location.pathname === '/fb-ops'}
                      tooltip="F&B"
                    >
                      <Link to="/fb-ops" className="flex items-center gap-3">
                        <UtensilsCrossed className="h-4 w-4" />
                        <span className="font-medium">F&B Restaurante</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                )}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        )}

        {isManager && (
          <SidebarGroup>
            <SidebarGroupLabel className="text-xs uppercase tracking-widest text-slate-400 font-semibold mb-2">
              Extras & Operações
            </SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                <SidebarMenuItem>
                  <SidebarMenuButton
                    asChild
                    isActive={location.pathname === '/fb-ops'}
                    tooltip="F&B Ops"
                  >
                    <Link to="/fb-ops" className="flex items-center gap-3">
                      <UtensilsCrossed className="h-4 w-4" />
                      <span className="font-medium">F&B Ops Avançado</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
                <SidebarMenuItem>
                  <SidebarMenuButton
                    asChild
                    isActive={location.pathname === '/fnb'}
                    tooltip="F&B Básicos"
                  >
                    <Link to="/fnb" className="flex items-center gap-3">
                      <Utensils className="h-4 w-4" />
                      <span className="font-medium">F&B Lançamentos</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
                {navServicos.slice(4).map((item) => {
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
        )}
      </SidebarContent>
    </Sidebar>
  )
}
