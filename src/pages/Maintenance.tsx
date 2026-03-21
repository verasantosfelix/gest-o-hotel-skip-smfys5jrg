import { useState, useEffect } from 'react'
import {
  Wrench,
  LayoutDashboard,
  ClipboardList,
  Cpu,
  Settings,
  Route as RouteIcon,
} from 'lucide-react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { useAccess } from '@/hooks/use-access'
import useAuthStore from '@/stores/useAuthStore'
import { RestrictedAccess } from '@/components/RestrictedAccess'

import { MaintenanceDashboard } from '@/components/maintenance/MaintenanceDashboard'
import { MaintenanceOS } from '@/components/maintenance/MaintenanceOS'
import { MaintenanceIoT } from '@/components/maintenance/MaintenanceIoT'
import { MaintenanceInventory } from '@/components/maintenance/MaintenanceInventory'
import { MaintenanceShifts } from '@/components/maintenance/MaintenanceShifts'

import { useRealtime } from '@/hooks/use-realtime'
import { getMaintenanceTickets } from '@/services/maintenance'
import { getIotSensors, getAssets } from '@/services/it'
import { getRooms, RoomRecord } from '@/services/rooms'

export default function Maintenance() {
  const { hasAccess } = useAccess()
  const { userRole } = useAuthStore()
  const isFrontDesk = userRole === 'Front_Desk'

  const [tickets, setTickets] = useState<any[]>([])
  const [sensors, setSensors] = useState<any[]>([])
  const [assets, setAssets] = useState<any[]>([])
  const [rooms, setRooms] = useState<RoomRecord[]>([])

  const loadData = async () => {
    try {
      const [tData, sData, aData, rData] = await Promise.all([
        getMaintenanceTickets(),
        getIotSensors(),
        getAssets(),
        getRooms(),
      ])
      setTickets(tData)
      setSensors(sData)
      setAssets(aData)
      setRooms(rData)
    } catch (e) {
      console.error(e)
    }
  }

  useEffect(() => {
    loadData()
  }, [])

  useRealtime('maintenance_tickets', loadData)
  useRealtime('iot_sensors', loadData)
  useRealtime('it_assets', loadData)
  useRealtime('rooms', loadData)

  if (!hasAccess(['Manutencao_Oficina', 'Direcao_Admin', 'Front_Desk'], 'Manutenção')) {
    return (
      <RestrictedAccess requiredRoles={['Manutencao_Oficina', 'Direcao_Admin', 'Front_Desk']} />
    )
  }

  return (
    <div className="space-y-6 animate-fade-in pb-20">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-3 bg-red-100 rounded-lg shadow-sm">
          <Wrench className="w-6 h-6 text-red-700" />
        </div>
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            Facilities & Manutenção
          </h1>
          <p className="text-sm text-slate-500">Gestão Adaptativa de Ativos e Operações</p>
        </div>
      </div>

      <Tabs defaultValue="dashboard" className="w-full">
        <TabsList className="mb-6 h-12 w-full sm:w-auto bg-slate-100 flex overflow-x-auto justify-start border border-slate-200 shadow-sm">
          <TabsTrigger value="dashboard" className="flex items-center gap-2 h-9 px-4">
            <LayoutDashboard className="w-4 h-4" /> Painel Operacional
          </TabsTrigger>
          <TabsTrigger value="os" className="flex items-center gap-2 h-9 px-4">
            <ClipboardList className="w-4 h-4" /> Ordens de Serviço
          </TabsTrigger>
          <TabsTrigger value="iot" className="flex items-center gap-2 h-9 px-4">
            <Cpu className="w-4 h-4" /> Sensores IoT
          </TabsTrigger>
          <TabsTrigger value="inventario" className="flex items-center gap-2 h-9 px-4">
            <Settings className="w-4 h-4" /> Ativos & Preventiva
          </TabsTrigger>
          {!isFrontDesk && (
            <TabsTrigger value="turnos" className="flex items-center gap-2 h-9 px-4">
              <RouteIcon className="w-4 h-4" /> Rotinas de Turno
            </TabsTrigger>
          )}
        </TabsList>

        <TabsContent value="dashboard" className="mt-0 outline-none">
          <MaintenanceDashboard tickets={tickets} sensors={sensors} />
        </TabsContent>
        <TabsContent value="os" className="mt-0 outline-none">
          <MaintenanceOS tickets={tickets} rooms={rooms} />
        </TabsContent>
        <TabsContent value="iot" className="mt-0 outline-none">
          <MaintenanceIoT sensors={sensors} />
        </TabsContent>
        <TabsContent value="inventario" className="mt-0 outline-none">
          <MaintenanceInventory assets={assets} />
        </TabsContent>
        {!isFrontDesk && (
          <TabsContent value="turnos" className="mt-0 outline-none">
            <MaintenanceShifts />
          </TabsContent>
        )}
      </Tabs>
    </div>
  )
}
