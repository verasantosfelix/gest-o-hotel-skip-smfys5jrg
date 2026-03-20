import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { getFBTables, getFBOrders, FBTable, FBOrder } from '@/services/fnb'
import { useRealtime } from '@/hooks/use-realtime'
import { Utensils, Users, Clock, Flame, Database, CheckCircle2 } from 'lucide-react'

export function FnBDashboard() {
  const [tables, setTables] = useState<FBTable[]>([])
  const [orders, setOrders] = useState<FBOrder[]>([])

  const loadData = async () => {
    try {
      const [t, o] = await Promise.all([
        getFBTables(),
        getFBOrders(`status != 'closed' && status != 'cancelled'`),
      ])
      setTables(t)
      setOrders(o)
    } catch (e) {
      console.error(e)
    }
  }

  useEffect(() => {
    loadData()
  }, [])
  useRealtime('fb_tables', loadData)
  useRealtime('fb_orders', loadData)

  const occupied = tables.filter((t) => t.status === 'occupied').length
  const free = tables.filter((t) => t.status === 'free').length
  const pending = orders.filter((o) => o.status === 'pending').length
  const preparing = orders.filter((o) => o.status === 'preparing').length

  return (
    <div className="space-y-6 animate-fade-in-up">
      <h2 className="text-lg font-bold text-slate-800">Status Operacional</h2>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="border-slate-200">
          <CardContent className="p-5 flex items-center gap-4">
            <div className="bg-orange-100 p-3 rounded-full">
              <Users className="w-5 h-5 text-orange-600" />
            </div>
            <div>
              <p className="text-xs text-slate-500 font-bold uppercase">Mesas Ocupadas</p>
              <p className="text-2xl font-black text-slate-800">
                {occupied} / {tables.length}
              </p>
            </div>
          </CardContent>
        </Card>
        <Card className="border-slate-200">
          <CardContent className="p-5 flex items-center gap-4">
            <div className="bg-emerald-100 p-3 rounded-full">
              <Utensils className="w-5 h-5 text-emerald-600" />
            </div>
            <div>
              <p className="text-xs text-slate-500 font-bold uppercase">Mesas Livres</p>
              <p className="text-2xl font-black text-slate-800">{free}</p>
            </div>
          </CardContent>
        </Card>
        <Card className="border-slate-200">
          <CardContent className="p-5 flex items-center gap-4">
            <div className="bg-slate-100 p-3 rounded-full">
              <Clock className="w-5 h-5 text-slate-600" />
            </div>
            <div>
              <p className="text-xs text-slate-500 font-bold uppercase">Aguardando Cozinha</p>
              <p className="text-2xl font-black text-slate-800">{pending}</p>
            </div>
          </CardContent>
        </Card>
        <Card className="border-slate-200">
          <CardContent className="p-5 flex items-center gap-4">
            <div className="bg-rose-100 p-3 rounded-full">
              <Flame className="w-5 h-5 text-rose-600" />
            </div>
            <div>
              <p className="text-xs text-slate-500 font-bold uppercase">Em Preparação</p>
              <p className="text-2xl font-black text-slate-800">{preparing}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="border-slate-200 shadow-sm">
          <CardHeader className="bg-slate-50 border-b pb-4">
            <CardTitle className="text-base flex items-center gap-2">
              <Database className="w-4 h-4 text-primary" /> Painel de Integrações
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0 divide-y">
            <div className="flex justify-between items-center p-4">
              <span className="text-sm font-medium text-slate-700">PMS Lançamento de Quartos</span>
              <span className="flex items-center gap-1 text-emerald-600 text-xs font-bold">
                <CheckCircle2 className="w-4 h-4" /> Online
              </span>
            </div>
            <div className="flex justify-between items-center p-4">
              <span className="text-sm font-medium text-slate-700">
                Sistema KDS (Kitchen Display)
              </span>
              <span className="flex items-center gap-1 text-emerald-600 text-xs font-bold">
                <CheckCircle2 className="w-4 h-4" /> Online
              </span>
            </div>
            <div className="flex justify-between items-center p-4">
              <span className="text-sm font-medium text-slate-700">
                Controle de Estoque & Inventário
              </span>
              <span className="flex items-center gap-1 text-amber-600 text-xs font-bold">
                <Clock className="w-4 h-4" /> Sync Pendente
              </span>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
