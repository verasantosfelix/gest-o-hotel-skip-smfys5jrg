import { Building2, Bell, ShieldCheck, User } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { SidebarTrigger } from '@/components/ui/sidebar'
import useHotelStore from '@/stores/useHotelStore'

export function AppHeader() {
  const { hotels, selectedHotel, setSelectedHotel } = useHotelStore()

  return (
    <header className="sticky top-0 z-30 flex h-16 w-full items-center justify-between border-b bg-background px-4 shadow-sm">
      <div className="flex items-center gap-4">
        <SidebarTrigger />
        <div className="hidden md:flex items-center gap-2">
          <Building2 className="h-4 w-4 text-muted-foreground" />
          <Select
            value={selectedHotel.id}
            onValueChange={(val) => {
              const hotel = hotels.find((h) => h.id === val)
              if (hotel) setSelectedHotel(hotel)
            }}
          >
            <SelectTrigger className="w-[220px] h-9 border-none bg-transparent shadow-none font-medium focus:ring-0">
              <SelectValue placeholder="Selecione o Hotel" />
            </SelectTrigger>
            <SelectContent>
              {hotels.map((hotel) => (
                <SelectItem key={hotel.id} value={hotel.id}>
                  {hotel.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <div className="hidden md:flex items-center gap-2 text-sm text-muted-foreground mr-4">
          <span className="flex h-2 w-2 rounded-full bg-accent animate-pulse"></span>
          Sistema Operacional
        </div>
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-5 w-5" />
          <span className="absolute top-2 right-2 h-2 w-2 rounded-full bg-destructive border-2 border-background"></span>
        </Button>
        <Button variant="outline" size="sm" className="gap-2 hidden sm:flex">
          <ShieldCheck className="h-4 w-4 text-accent" />
          Admin
        </Button>
        <Button variant="secondary" size="icon" className="rounded-full">
          <User className="h-4 w-4" />
        </Button>
      </div>
    </header>
  )
}
