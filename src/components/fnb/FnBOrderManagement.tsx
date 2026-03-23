import { useState, useEffect } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { getFBTables, FBTable } from '@/services/fnb'
import { useRealtime } from '@/hooks/use-realtime'
import { FnBTableDialog } from './FnBTableDialog'
import useAuthStore from '@/stores/useAuthStore'
import { useAccess } from '@/hooks/use-access'

export function FnBOrderManagement() {
  const { profile } = useAuthStore()
  const { isManager } = useAccess()
  const isFrontDeskProfile =
    profile?.name === 'Front_Desk' || profile?.name === 'Rececao_FrontOffice'
  const isFrontDeskStaffOnly = isFrontDeskProfile && !isManager()

  const [tables, setTables] = useState<FBTable[]>([])
  const [selectedTable, setSelectedTable] = useState<FBTable | null>(null)

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
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-bold text-slate-800">Mapa de Mesas</h2>
        <div className="flex gap-2 text-xs">
          <Badge variant="outline" className="bg-emerald-50">
            Livre
          </Badge>
          <Badge variant="outline" className="bg-orange-50">
            Ocupada
          </Badge>
          <Badge variant="outline" className="bg-blue-50">
            Reservada
          </Badge>
        </div>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
        {tables.map((t) => {
          const isOcc = t.status === 'occupied'
          const isRes = t.status === 'reserved'
          return (
            <Card
              key={t.id}
              className={`cursor-pointer transition-all hover:-translate-y-1 hover:shadow-lg ${isOcc ? 'border-orange-300 bg-orange-50/50' : isRes ? 'border-blue-300 bg-blue-50/50' : 'border-emerald-200 bg-emerald-50/20'}`}
              onClick={() => {
                if (!isFrontDeskStaffOnly) setSelectedTable(t)
              }}
            >
              <CardContent className="p-6 text-center flex flex-col items-center">
                <div
                  className={`w-12 h-12 rounded-full flex items-center justify-center mb-3 ${isOcc ? 'bg-orange-200 text-orange-800' : isRes ? 'bg-blue-200 text-blue-800' : 'bg-emerald-200 text-emerald-800'}`}
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
      {selectedTable && (
        <FnBTableDialog table={selectedTable} onClose={() => setSelectedTable(null)} />
      )}
    </div>
  )
}
