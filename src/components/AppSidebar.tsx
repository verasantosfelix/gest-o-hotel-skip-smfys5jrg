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

const navOperacional = [
  { name: 'Dashboard', url: '/', icon: LayoutDashboard },
  { name: 'Reservas', url: '/reservas', icon: CalendarDays },
  { name: 'Hóspedes', url: '/hospedes', icon: Users },
]

const navGestao = [
  { name: 'Quartos', url: '/quartos', icon: BedDouble },
  { name: 'Governança', url: '/governanca', icon: Sparkles },
  { name: 'Rastreabilidade', url: '/auditoria', icon: History },
  { name: 'Configurações', url: '/configuracoes', icon: Settings },
]

export function AppSidebar() {
  const location = useLocation()
  const { selectedHotel } = useHotelStore()

  return (
    <Sidebar variant="sidebar" collapsible="offcanvas">
      <SidebarHeader className="h-16 flex items-center justify-center border-b px-4">
        <div className="flex items-center gap-2 w-full font-bold text-primary">
          <Hotel className="h-5 w-5 text-accent" />
          <span className="truncate tracking-tight">SKIP {selectedHotel.name.split(' ')[1]}</span>
        </div>
      </SidebarHeader>
      <SidebarContent>
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
      </SidebarContent>
    </Sidebar>
  )
}
