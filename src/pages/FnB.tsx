import { Utensils } from 'lucide-react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { useAccess } from '@/hooks/use-access'
import useAuthStore from '@/stores/useAuthStore'
import { RestrictedAccess } from '@/components/RestrictedAccess'
import { useLocation } from 'react-router-dom'

import { FnBDashboard } from '@/components/fnb/FnBDashboard'
import { FnBOrderManagement } from '@/components/fnb/FnBOrderManagement'
import { FnBKDS } from '@/components/fnb/FnBKDS'
import { FnBRoomService } from '@/components/fnb/FnBRoomService'
import { FnBReservations } from '@/components/fnb/FnBReservations'
import { FnBRoutines } from '@/components/fnb/FnBRoutines'
import { FnBKPIs } from '@/components/fnb/FnBKPIs'

export default function FnB() {
  const { hasAccess } = useAccess()
  const { profile } = useAuthStore()
  const location = useLocation()

  if (!hasAccess([], 'F&B Básico')) {
    return <RestrictedAccess />
  }

  const isStaff = profile?.role_level === 'Atendente'
  const isFrontDeskManager =
    (profile?.name === 'Front_Desk' || profile?.name === 'Rececao_FrontOffice') &&
    ['Gerente_Area', 'Responsavel_Equipa'].includes(profile?.role_level || '')

  const defaultTab = location.pathname.includes('/fb/room-service')
    ? 'room_service'
    : isStaff || isFrontDeskManager
      ? 'orders'
      : 'dashboard'

  const showDashboard = !isStaff && !isFrontDeskManager
  const showKds = !isFrontDeskManager
  const showRoutines = !isStaff && !isFrontDeskManager
  const showKpis = !isStaff && !isFrontDeskManager

  return (
    <div className="space-y-6 animate-fade-in pb-8">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-3 bg-orange-100 rounded-lg shadow-sm border border-orange-200">
          <Utensils className="w-6 h-6 text-orange-700" />
        </div>
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            {isFrontDeskManager ? 'Operações F&B (Front Desk)' : 'Restaurante & Bar Operacional'}
          </h1>
          <p className="text-sm text-slate-500">
            {isFrontDeskManager
              ? 'Gestão rápida de Room Service e Mesas'
              : 'Gestão Integrada de F&B, KDS Cozinha e Lançamento PMS'}
          </p>
        </div>
      </div>

      <Tabs defaultValue={defaultTab} className="w-full">
        <TabsList className="mb-6 h-auto bg-slate-100 flex flex-wrap justify-start border border-slate-200 shadow-sm p-1 rounded-md">
          {showDashboard && (
            <TabsTrigger value="dashboard" className="px-4 py-2 font-medium">
              Dashboard
            </TabsTrigger>
          )}
          <TabsTrigger value="orders" className="px-4 py-2 font-medium">
            Mesas & Pedidos
          </TabsTrigger>
          {showKds && (
            <TabsTrigger value="kds" className="px-4 py-2 font-medium">
              KDS (Cozinha)
            </TabsTrigger>
          )}
          <TabsTrigger value="room_service" className="px-4 py-2 font-medium">
            Room Service
          </TabsTrigger>
          {!isStaff && (
            <TabsTrigger value="reservations" className="px-4 py-2 font-medium">
              Reservas
            </TabsTrigger>
          )}
          {showRoutines && (
            <TabsTrigger value="routines" className="px-4 py-2 font-medium">
              Rotinas
            </TabsTrigger>
          )}
          {showKpis && (
            <TabsTrigger value="kpis" className="px-4 py-2 font-medium">
              Analytics
            </TabsTrigger>
          )}
        </TabsList>

        {showDashboard && (
          <TabsContent value="dashboard" className="mt-0 outline-none">
            <FnBDashboard />
          </TabsContent>
        )}
        <TabsContent value="orders" className="mt-0 outline-none">
          <FnBOrderManagement />
        </TabsContent>
        {showKds && (
          <TabsContent value="kds" className="mt-0 outline-none">
            <FnBKDS />
          </TabsContent>
        )}
        <TabsContent value="room_service" className="mt-0 outline-none">
          <FnBRoomService />
        </TabsContent>
        {!isStaff && (
          <TabsContent value="reservations" className="mt-0 outline-none">
            <FnBReservations />
          </TabsContent>
        )}
        {showRoutines && (
          <TabsContent value="routines" className="mt-0 outline-none">
            <FnBRoutines />
          </TabsContent>
        )}
        {showKpis && (
          <TabsContent value="kpis" className="mt-0 outline-none">
            <FnBKPIs />
          </TabsContent>
        )}
      </Tabs>
    </div>
  )
}
