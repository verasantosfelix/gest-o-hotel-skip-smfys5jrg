import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import useAuthStore, { Role } from '@/stores/useAuthStore'
import { UserCircle, Shield } from 'lucide-react'
import { SidebarTrigger } from '@/components/ui/sidebar'

export function AppHeader() {
  const { userRole, setUserRole, userName } = useAuthStore()

  return (
    <header className="h-16 border-b bg-white flex items-center justify-between px-4 sm:px-6 shadow-sm z-10 sticky top-0">
      <div className="flex items-center gap-4">
        <SidebarTrigger />
      </div>
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2 text-sm text-slate-600 bg-slate-50 px-3 py-1.5 rounded-full border border-slate-100">
          <UserCircle className="w-4 h-4" />
          <span className="font-medium hidden sm:inline-block">{userName}</span>
        </div>
        <div className="flex items-center gap-2">
          <Shield className="w-4 h-4 text-slate-400 hidden sm:block" />
          <Select value={userRole} onValueChange={(v) => setUserRole(v as Role)}>
            <SelectTrigger className="w-[160px] h-9 text-xs font-medium border-slate-200 focus:ring-slate-300">
              <SelectValue placeholder="Perfil" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Admin" className="text-xs">
                Admin (Gerência)
              </SelectItem>
              <SelectItem value="Administrativa" className="text-xs">
                Administrativa
              </SelectItem>
              <SelectItem value="Restaurante" className="text-xs">
                Restaurante
              </SelectItem>
              <SelectItem value="Bar" className="text-xs">
                Bar
              </SelectItem>
              <SelectItem value="Spa" className="text-xs">
                Spa
              </SelectItem>
              <SelectItem value="Limpeza" className="text-xs">
                Limpeza/Lavanderia
              </SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
    </header>
  )
}
