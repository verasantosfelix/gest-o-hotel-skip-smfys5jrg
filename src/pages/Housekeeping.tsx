import { useState, useEffect } from 'react'
import { SprayCan, ListTodo, Activity, Route as RouteIcon } from 'lucide-react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { useAccess } from '@/hooks/use-access'
import { RestrictedAccess } from '@/components/RestrictedAccess'
import { getRooms, RoomRecord } from '@/services/rooms'
import { useRealtime } from '@/hooks/use-realtime'
import { HousekeepingGrid } from '@/components/housekeeping/HousekeepingGrid'
import { ChecklistModal } from '@/components/housekeeping/ChecklistModal'
import {
  MaintenanceModal,
  MinibarModal,
  LostFoundModal,
} from '@/components/housekeeping/ActionModals'
import { ShiftRoutines } from '@/components/housekeeping/ShiftRoutines'
import { KPIPanel } from '@/components/housekeeping/KPIPanel'

type ActionState = {
  type: 'checklist' | 'maintenance' | 'minibar' | 'lost_found' | ''
  room: RoomRecord | null
}

export default function Housekeeping() {
  const { hasAccess } = useAccess()
  const [rooms, setRooms] = useState<RoomRecord[]>([])
  const [action, setAction] = useState<ActionState>({ type: '', room: null })

  const loadData = async () => {
    try {
      setRooms(await getRooms())
    } catch (e) {
      console.error(e)
    }
  }

  useEffect(() => {
    loadData()
  }, [])
  useRealtime('rooms', loadData)

  if (!hasAccess([], 'Governança')) {
    return <RestrictedAccess />
  }

  const handleAction = (type: ActionState['type'], room: RoomRecord) => setAction({ type, room })
  const closeAction = () => setAction({ type: '', room: null })

  return (
    <div className="space-y-6 animate-fade-in pb-20">
      <div className="flex items-center gap-3">
        <div className="p-3 bg-emerald-100 rounded-lg">
          <SprayCan className="w-6 h-6 text-emerald-700" />
        </div>
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            Dashboard de Governança
          </h1>
          <p className="text-sm text-slate-500">Gestão operacional de limpeza e protocolos</p>
        </div>
      </div>

      <Tabs defaultValue="operacao" className="w-full">
        <TabsList className="mb-6 h-12 w-full sm:w-auto bg-slate-100 flex overflow-x-auto justify-start border border-slate-200">
          <TabsTrigger value="operacao" className="flex items-center gap-2 h-9 px-4">
            <ListTodo className="w-4 h-4" /> Operação e Quartos
          </TabsTrigger>
          <TabsTrigger value="turnos" className="flex items-center gap-2 h-9 px-4">
            <RouteIcon className="w-4 h-4" /> Rotinas por Turno
          </TabsTrigger>
          <TabsTrigger value="kpis" className="flex items-center gap-2 h-9 px-4">
            <Activity className="w-4 h-4" /> Performance (KPIs)
          </TabsTrigger>
        </TabsList>

        <TabsContent value="operacao" className="mt-0 outline-none">
          <HousekeepingGrid rooms={rooms} onAction={handleAction} />
        </TabsContent>

        <TabsContent value="turnos" className="mt-0 outline-none">
          <ShiftRoutines />
        </TabsContent>

        <TabsContent value="kpis" className="mt-0 outline-none">
          <KPIPanel rooms={rooms} />
        </TabsContent>
      </Tabs>

      {action.type === 'checklist' && <ChecklistModal room={action.room} onClose={closeAction} />}
      {action.type === 'maintenance' && (
        <MaintenanceModal room={action.room} onClose={closeAction} />
      )}
      {action.type === 'minibar' && <MinibarModal room={action.room} onClose={closeAction} />}
      {action.type === 'lost_found' && <LostFoundModal room={action.room} onClose={closeAction} />}
    </div>
  )
}
