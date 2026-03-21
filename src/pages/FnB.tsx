import { Utensils } from 'lucide-react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { useAccess } from '@/hooks/use-access'
import useAuthStore from '@/stores/useAuthStore'
import { RestrictedAccess } from '@/components/RestrictedAccess'

import { FnBDashboard } from '@/components/fnb/FnBDashboard'
import { FnBOrderManagement } from '@/components/fnb/FnBOrderManagement'
import { FnBKDS } from '@/components/fnb/FnBKDS'
import { FnBRoomService } from '@/components/fnb/FnBRoomService'
import { FnBReservations } from '@/components/fnb/FnBReservations'
import { FnBRoutines } from '@/components/fnb/FnBRoutines'
import { FnBKPIs } from '@/components/fnb/FnBKPIs'

export default function FnB() {
  const { hasAccess } = useAccess()
  const { userRole } = useAuthStore()
  const isFrontDesk = userRole === 'Front_Desk'

  if (!hasAccess(['Restaurante_Bar', 'Direcao_Admin', 'Front_Desk'])) {
    return <RestrictedAccess requiredRoles={['Restaurante_Bar', 'Direcao_Admin', 'Front_Desk']} />
  }

  return (
    <div className="space-y-6 animate-fade-in pb-8">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-3 bg-orange-100 rounded-lg shadow-sm border border-orange-200">
          <Utensils className="w-6 h-6 text-orange-700" />
        </div>
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            Restaurante & Bar Operacional
          </h1>
          <p className="text-sm text-slate-500">
            Gestão Integrada de F&B, KDS Cozinha e Lançamento PMS
          </p>
        </div>
      </div>

      <Tabs defaultValue="dashboard" className="w-full">
        <TabsList className="mb-6 h-auto bg-slate-100 flex flex-wrap justify-start border border-slate-200 shadow-sm p-1 rounded-md">
          <TabsTrigger value="dashboard" className="px-4 py-2 font-medium">
            Dashboard
          </TabsTrigger>
          <TabsTrigger value="orders" className="px-4 py-2 font-medium">
            Mesas & Pedidos
          </TabsTrigger>
          {!isFrontDesk && (
            <TabsTrigger value="kds" className="px-4 py-2 font-medium">
              KDS (Cozinha)
            </TabsTrigger>
          )}
          <TabsTrigger value="room_service" className="px-4 py-2 font-medium">
            Room Service
          </TabsTrigger>
          <TabsTrigger value="reservations" className="px-4 py-2 font-medium">
            Reservas
          </TabsTrigger>
          {!isFrontDesk && (
            <TabsTrigger value="routines" className="px-4 py-2 font-medium">
              Rotinas
            </TabsTrigger>
          )}
          {!isFrontDesk && (
            <TabsTrigger value="kpis" className="px-4 py-2 font-medium">
              Analytics
            </TabsTrigger>
          )}
        </TabsList>

        <TabsContent value="dashboard" className="mt-0 outline-none">
          <FnBDashboard />
        </TabsContent>
        <TabsContent value="orders" className="mt-0 outline-none">
          <FnBOrderManagement />
        </TabsContent>
        {!isFrontDesk && (
          <TabsContent value="kds" className="mt-0 outline-none">
            <FnBKDS />
          </TabsContent>
        )}
        <TabsContent value="room_service" className="mt-0 outline-none">
          <FnBRoomService />
        </TabsContent>
        <TabsContent value="reservations" className="mt-0 outline-none">
          <FnBReservations />
        </TabsContent>
        {!isFrontDesk && (
          <TabsContent value="routines" className="mt-0 outline-none">
            <FnBRoutines />
          </TabsContent>
        )}
        {!isFrontDesk && (
          <TabsContent value="kpis" className="mt-0 outline-none">
            <FnBKPIs />
          </TabsContent>
        )}
      </Tabs>
    </div>
  )
}
