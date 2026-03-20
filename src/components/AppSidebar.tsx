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
} from '@/components/ui/sidebar'
import useHotelStore from '@/stores/useHotelStore'

const navigation = [
  { name: 'Início', url: '/', icon: LayoutDashboard },
  { name: 'Reservas', url: '/reservas', icon: CalendarDays },
  { name: 'Quartos', url: '/quartos', icon: BedDouble },
  { name: 'Hóspedes', url: '/hospedes', icon: Users },
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
          <span className="truncate">SKIP {selectedHotel.name.split(' ')[1]}</span>
        </div>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Módulos Operacionais</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {navigation.map((item) => {
                const isActive = location.pathname === item.url
                return (
                  <SidebarMenuItem key={item.name}>
                    <SidebarMenuButton asChild isActive={isActive} tooltip={item.name}>
                      <Link to={item.url} className="flex items-center gap-3">
                        <item.icon className="h-4 w-4" />
                        <span>{item.name}</span>
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
