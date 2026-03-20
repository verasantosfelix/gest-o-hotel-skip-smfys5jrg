import { useState, useEffect } from 'react'
import { Heart, Activity, CheckSquare, Settings } from 'lucide-react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { useAccess } from '@/hooks/use-access'
import { RestrictedAccess } from '@/components/RestrictedAccess'

import { SpaAgenda } from '@/components/spa/SpaAgenda'
import { SpaRooms } from '@/components/spa/SpaRooms'
import { SpaInventory } from '@/components/spa/SpaInventory'
import { SpaRoutines } from '@/components/spa/SpaRoutines'
import { SpaKPIs } from '@/components/spa/SpaKPIs'

import { getSpaRooms, getUsers, getSpaAppointments } from '@/services/spa'
import { useRealtime } from '@/hooks/use-realtime'

export default function SpaWellness() {
  const { hasAccess } = useAccess()

  const [availableRooms, setAvailableRooms] = useState(0)
  const [availableTherapists, setAvailableTherapists] = useState(0)

  const loadHeaderData = async () => {
    try {
      const [rooms, users, appts] = await Promise.all([
        getSpaRooms(),
        getUsers(),
        getSpaAppointments(),
      ])
      setAvailableRooms(rooms.filter((r) => r.status === 'free').length)
      const busy = new Set(
        appts.filter((a) => a.status === 'in_progress').map((a) => a.therapist_id),
      ).size
      const totalT = users.length || 5
      setAvailableTherapists(Math.max(0, totalT - busy))
    } catch (e) {
      console.error(e)
    }
  }

  useEffect(() => {
    loadHeaderData()
  }, [])
  useRealtime('spa_rooms', loadHeaderData)
  useRealtime('spa_appointments', loadHeaderData)

  if (!hasAccess(['Spa_Wellness', 'Direcao_Admin'])) {
    return <RestrictedAccess requiredRoles={['Spa_Wellness', 'Direcao_Admin']} />
  }

  return (
    <div className="space-y-6 animate-fade-in pb-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-rose-100 rounded-full">
            <Heart className="w-6 h-6 text-rose-600" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-900">Spa & Wellness</h1>
            <p className="text-sm text-slate-500">Gestão de Agendas, Instalações e Faturamento</p>
          </div>
        </div>
        <div className="flex gap-4">
          <div className="bg-white border rounded-md px-4 py-2 shadow-sm text-center">
            <p className="text-[10px] uppercase font-bold text-slate-500">Salas Livres</p>
            <p className="text-xl font-black text-emerald-600 leading-tight">{availableRooms}</p>
          </div>
          <div className="bg-white border rounded-md px-4 py-2 shadow-sm text-center">
            <p className="text-[10px] uppercase font-bold text-slate-500">Terapeutas</p>
            <p className="text-xl font-black text-blue-600 leading-tight">{availableTherapists}</p>
          </div>
        </div>
      </div>

      <Tabs defaultValue="agenda" className="w-full">
        <TabsList className="mb-6 h-auto flex flex-wrap justify-start bg-slate-100 p-1 border">
          <TabsTrigger value="agenda" className="px-4 py-2 gap-2">
            <Heart className="w-4 h-4" /> Agenda do Dia
          </TabsTrigger>
          <TabsTrigger value="rooms" className="px-4 py-2 gap-2">
            <Settings className="w-4 h-4" /> Salas & Estoque
          </TabsTrigger>
          <TabsTrigger value="routines" className="px-4 py-2 gap-2">
            <CheckSquare className="w-4 h-4" /> Rotinas
          </TabsTrigger>
          <TabsTrigger value="kpis" className="px-4 py-2 gap-2">
            <Activity className="w-4 h-4" /> Performance
          </TabsTrigger>
        </TabsList>

        <TabsContent value="agenda" className="mt-0 outline-none">
          <SpaAgenda />
        </TabsContent>

        <TabsContent value="rooms" className="mt-0 outline-none">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
            <SpaRooms />
            <SpaInventory />
          </div>
        </TabsContent>

        <TabsContent value="routines" className="mt-0 outline-none">
          <SpaRoutines />
        </TabsContent>

        <TabsContent value="kpis" className="mt-0 outline-none">
          <SpaKPIs />
        </TabsContent>
      </Tabs>
    </div>
  )
}
