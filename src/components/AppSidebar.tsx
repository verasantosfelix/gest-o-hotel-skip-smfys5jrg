import React, { useEffect, useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import {
  LayoutDashboard,
  CalendarDays,
  BedDouble,
  Tags,
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
  Droplets,
  WashingMachine,
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
import pb from '@/lib/pocketbase/client'
import { useRealtime } from '@/hooks/use-realtime'

type NavItem = {
  name: string
  url: string
  icon: any
  requiresManager?: boolean
}

const quickAccessItems: NavItem[] = [
  { name: 'Nova Reserva', url: '/reservations/new', icon: CalendarPlus },
  { name: 'Novo Ticket Manut.', url: '/maintenance/new', icon: PenTool },
  { name: 'Agendamento Spa', url: '/spa/agenda', icon: CalendarHeart },
  { name: 'Room Service', url: '/fb/room-service', icon: BellRing },
]

const navGroups = [
  {
    label: 'Front Office',
    items: [
      { name: 'Dashboard', url: '/', icon: LayoutDashboard },
      { name: 'Reservas', url: '/reservas', icon: CalendarDays },
      { name: 'Hóspedes', url: '/hospedes', icon: Users },
      { name: 'Fidelidade', url: '/fidelidade-feedback', icon: Star },
      { name: 'Lançamentos Rápidos', url: '/lancamento-servicos', icon: Receipt },
      { name: 'Busca Hóspedes', url: '/busca-hospedes', icon: Search },
      { name: 'Concierge', url: '/concierge', icon: ConciergeBell },
      { name: 'Guest Journey', url: '/guest-journey', icon: Compass },
      { name: 'CRM', url: '/crm', icon: HeartHandshake },
      { name: 'Omnichannel', url: '/comunicacao', icon: MessageSquare },
      { name: 'Comms Automáticas', url: '/guest-comms', icon: Mail },
      { name: 'IA Concierge', url: '/ai-concierge', icon: BotMessageSquare },
    ],
  },
  {
    label: 'Operations',
    items: [
      { name: 'Quartos', url: '/quartos', icon: BedDouble },
      { name: 'Governança', url: '/governanca', icon: Sparkles },
      { name: 'Manutenção', url: '/manutencao', icon: Wrench },
      { name: 'Achados e Perdidos', url: '/achados-perdidos', icon: SearchX },
      { name: 'Amenities', url: '/minibar-amenities', icon: Package },
      { name: 'Lavanderia Geral', url: '/lavanderia', icon: WashingMachine },
      { name: 'Frota', url: '/frota', icon: Car },
      { name: 'Mobilidade', url: '/mobilidade', icon: Smartphone },
      { name: 'Auditoria Noturna', url: '/auditoria-noturna', icon: MoonStar },
    ],
  },
  {
    label: 'Services',
    items: [
      { name: 'F&B Básico', url: '/fnb', icon: Utensils },
      { name: 'F&B Operações', url: '/fb-ops', icon: UtensilsCrossed },
      { name: 'Menu Digital', url: '/restaurante/menu-digital', icon: BookOpen },
      { name: 'Menu Impresso (PDF)', url: '/restaurante/menu-pdf', icon: FileText },
      { name: 'Loja', url: '/loja', icon: ShoppingBag },
      { name: 'Agenda Diária', url: '/spa/agenda', icon: CalendarHeart },
      { name: 'Agenda Mensal', url: '/spa/mensal', icon: CalendarDays },
      { name: 'Catálogo de Serviços', url: '/spa/catalogo', icon: BookOpen },
      { name: 'Operações & Salas', url: '/spa/operacoes', icon: Settings },
      { name: 'Lavanderia SPA', url: '/spa/lavanderia', icon: Shirt },
      { name: 'Lazer & Piscinas', url: '/lazer', icon: Droplets },
      { name: 'Eventos & MICE', url: '/eventos', icon: CalendarRange },
      { name: 'Grupos (MICE)', url: '/mice', icon: Building },
    ],
  },
  {
    label: 'Management',
    items: [
      { name: 'Equipe & RH', url: '/equipe', icon: Briefcase, requiresManager: true },
      { name: 'HR Intelligence', url: '/hr', icon: UserCog, requiresManager: true },
      { name: 'Financeiro Corp', url: '/financeiro-corp', icon: Landmark, requiresManager: true },
      { name: 'Pagamentos', url: '/pagamentos', icon: CreditCard, requiresManager: true },
      { name: 'IT Admin', url: '/it-admin', icon: Server, requiresManager: true },
      { name: 'Segurança', url: '/seguranca', icon: ShieldAlert, requiresManager: true },
      { name: 'Auditoria', url: '/auditoria', icon: History, requiresManager: true },
      { name: 'Relatórios', url: '/relatorios', icon: FileText, requiresManager: true },
      { name: 'Tarifas', url: '/tarifas', icon: Tags, requiresManager: true },
      { name: 'Tarifário', url: '/tarifario', icon: Landmark, requiresManager: true },
      { name: 'Alçadas (Aprovações)', url: '/alcadas', icon: ShieldCheck, requiresManager: true },
      { name: 'Analytics', url: '/analytics', icon: BarChart, requiresManager: true },
      { name: 'Revenue Mgmt', url: '/revenue', icon: TrendingUp, requiresManager: true },
      { name: 'Vendas & Distribuição', url: '/sales-crm', icon: LineChart, requiresManager: true },
      {
        name: 'Documentos',
        url: '/documentos-contratos',
        icon: FileSignature,
        requiresManager: true,
      },
      { name: 'Integrações', url: '/integracoes', icon: Plug, requiresManager: true },
      { name: 'ChatOps', url: '/chatops', icon: Terminal, requiresManager: true },
      { name: 'Governança IA', url: '/ia-governanca', icon: Bot, requiresManager: true },
      { name: 'Configurações', url: '/configuracoes', icon: Settings, requiresManager: true },
    ],
  },
]

export function AppSidebar() {
  const location = useLocation()
  const { selectedHotel } = useHotelStore()
  const { isManager, hasAccess } = useAccess()

  const [accordionValue, setAccordionValue] = useState<string>('')
  const [openMaintenance, setOpenMaintenance] = useState(0)
  const [pendingPdf, setPendingPdf] = useState(0)
  const [pendingSpaLaundry, setPendingSpaLaundry] = useState(0)

  const loadBadgeCounts = async () => {
    if (!pb.authStore.isValid) return

    try {
      if (hasAccess([], 'Manutenção')) {
        const maint = await pb
          .collection('maintenance_tickets')
          .getList(1, 1, { filter: 'status = "open"' })
        setOpenMaintenance(maint.totalItems)
      }
    } catch (e) {
      console.error(e)
    }

    try {
      if (hasAccess([], 'Menu Impresso (PDF)')) {
        const pdfs = await pb
          .collection('fb_pdf_versions')
          .getList(1, 1, { filter: 'status = "pending_approval"' })
        setPendingPdf(pdfs.totalItems)
      }
    } catch (e) {
      console.error(e)
    }

    try {
      if (hasAccess([], 'Lavanderia SPA')) {
        const laundry = await pb
          .collection('laundry_logs')
          .getList(1, 1, { filter: 'location = "SPA" && status != "Entregue"' })
        setPendingSpaLaundry(laundry.totalItems)
      }
    } catch (e) {
      console.error(e)
    }
  }

  useEffect(() => {
    loadBadgeCounts()
  }, [])

  useRealtime('maintenance_tickets', loadBadgeCounts)
  useRealtime('fb_pdf_versions', loadBadgeCounts)
  useRealtime('laundry_logs', loadBadgeCounts)

  useEffect(() => {
    const activeGroup = navGroups.find((group) =>
      group.items.some((item) => item.url === location.pathname),
    )
    if (activeGroup && accordionValue !== activeGroup.label) {
      setAccordionValue(activeGroup.label)
    }
  }, [location.pathname])

  const hasModuleAccess = (item: NavItem) => {
    if (item.requiresManager && !isManager()) return false
    return hasAccess([], item.name)
  }

  const quickAccessVisible = quickAccessItems.filter((item) => {
    if (item.name === 'Nova Reserva') return hasAccess([], 'Reservas')
    if (item.name === 'Novo Ticket Manut.') return hasAccess([], 'Manutenção')
    if (item.name === 'Agendamento Spa') return hasAccess([], 'Agenda Diária')
    if (item.name === 'Room Service') return hasAccess([], 'F&B Básico')
    return false
  })

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
                  className={`hover:bg-sidebar-accent hover:text-sidebar-accent-foreground py-2 px-2 rounded-md hover:no-underline text-sm font-medium ${isGroupActive ? 'text-primary font-semibold' : ''}`}
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
                      } else if (item.name === 'Lavanderia SPA') {
                        badgeCount = pendingSpaLaundry
                        badgeColor = 'bg-blue-500 text-white'
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
                              className={`rounded-full px-1.5 min-w-5 flex justify-center text-[10px] ${badgeColor}`}
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
