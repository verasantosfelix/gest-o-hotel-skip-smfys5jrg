import { useState, useEffect } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { getFBTables, FBTable } from '@/services/fnb'
import { useRealtime } from '@/hooks/use-realtime'
import { FnBTableDialog } from './FnBTableDialog'
import { FnBFloorPlan } from './FnBFloorPlan'
import useAuthStore from '@/stores/useAuthStore'
import { useAccess } from '@/hooks/use-access'
import { LayoutGrid, Map } from 'lucide-react'

export function FnBOrderManagement() {
  const { profile } = useAuthStore()
  const { isManager } = useAccess()
  const isFrontDeskProfile =
    profile?.name === 'Front_Desk' || profile?.name === 'Rececao_FrontOffice'
  const isFrontDeskStaffOnly = isFrontDeskProfile && !isManager()

  const [tables, setTables] = useState<FBTable[]>([])
  const [selectedTable, setSelectedTable] = useState<FBTable | null>(null)
  const [viewMode, setViewMode] = useState<'grid' | 'map'>('grid')

  const loadData = async () => {
    try {
      setTables(await getFBTables())
    } catch (e) {
      console.error(e)
    }
  }

  useEffect(() => {
    loadData()
  }, [])
  useRealtime('fb_tables', loadData)

  return (
    <div className="space-y-4 animate-fade-in-up">
      <Tabs value={viewMode} onValueChange={(v: any) => setViewMode(v)} className="w-full">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 gap-4">
          <h2 className="text-lg font-bold text-slate-800">Layout & Mapa de Mesas</h2>
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 w-full sm:w-auto">
            <div className="flex gap-2 text-xs">
              <Badge
                variant="outline"
                className="bg-emerald-50 border-emerald-200 text-emerald-700"
              >
                Livre
              </Badge>
              <Badge variant="outline" className="bg-rose-50 border-rose-200 text-rose-700">
                Ocupada
              </Badge>
              <Badge variant="outline" className="bg-orange-50 border-orange-200 text-orange-700">
                Reservada
              </Badge>
            </div>
            <TabsList className="bg-slate-100 border border-slate-200 h-auto p-1">
              <TabsTrigger value="grid" className="gap-2 px-4 py-2 font-medium">
                <LayoutGrid className="w-4 h-4" /> Lista
              </TabsTrigger>
              <TabsTrigger value="map" className="gap-2 px-4 py-2 font-medium">
                <Map className="w-4 h-4" /> Planta 2D
              </TabsTrigger>
            </TabsList>
          </div>
        </div>

        <TabsContent value="grid" className="mt-0 outline-none">
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {tables.map((t) => {
              const isOcc = t.status === 'occupied'
              const isRes = t.status === 'reserved'
              return (
                <Card
                  key={t.id}
                  className={`cursor-pointer transition-all hover:-translate-y-1 hover:shadow-lg ${isOcc ? 'border-rose-300 bg-rose-50/50' : isRes ? 'border-orange-300 bg-orange-50/50' : 'border-emerald-200 bg-emerald-50/20'}`}
                  onClick={() => {
                    if (!isFrontDeskStaffOnly) setSelectedTable(t)
                  }}
                >
                  <CardContent className="p-6 text-center flex flex-col items-center">
                    <div
                      className={`w-12 h-12 rounded-full flex items-center justify-center mb-3 ${isOcc ? 'bg-rose-200 text-rose-800' : isRes ? 'bg-orange-200 text-orange-800' : 'bg-emerald-200 text-emerald-800'}`}
                    >
                      <span className="font-black text-xl">{t.table_number.replace('T', '')}</span>
                    </div>
                    <h3 className="text-sm font-bold text-slate-800">Mesa {t.table_number}</h3>
                    <Badge
                      variant="outline"
                      className="mt-2 text-[10px] uppercase tracking-widest bg-white"
                    >
                      {t.status}
                    </Badge>
                    <p className="text-xs text-slate-400 mt-2">{t.capacity} lugares</p>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        </TabsContent>

        <TabsContent value="map" className="mt-0 outline-none">
          <FnBFloorPlan
            tables={tables}
            onTableClick={(t) => {
              if (!isFrontDeskStaffOnly) setSelectedTable(t)
            }}
            canEdit={!isFrontDeskStaffOnly}
          />
        </TabsContent>
      </Tabs>

      {selectedTable && (
        <FnBTableDialog table={selectedTable} onClose={() => setSelectedTable(null)} />
      )}
    </div>
  )
}
