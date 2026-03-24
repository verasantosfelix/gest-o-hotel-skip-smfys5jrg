import { useState, useEffect } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { getFBTables, FBTable, createFBTable, deleteFBTable } from '@/services/fnb'
import { useRealtime } from '@/hooks/use-realtime'
import { FnBTableDialog } from './FnBTableDialog'
import useAuthStore from '@/stores/useAuthStore'
import { useAccess } from '@/hooks/use-access'
import { LayoutGrid, Plus, Trash2 } from 'lucide-react'
import { toast } from '@/components/ui/use-toast'

export function FnBOrderManagement() {
  const { profile } = useAuthStore()
  const { isManager } = useAccess()
  const isFrontDeskProfile =
    profile?.name === 'Front_Desk' || profile?.name === 'Rececao_FrontOffice'
  const isFrontDeskStaffOnly = isFrontDeskProfile && !isManager()

  const [tables, setTables] = useState<FBTable[]>([])
  const [selectedTable, setSelectedTable] = useState<FBTable | null>(null)

  const [showNewTable, setShowNewTable] = useState(false)
  const [newTable, setNewTable] = useState({ number: '', capacity: '4' })

  const loadData = async () => {
    try {
      const data = await getFBTables()
      setTables(data)
    } catch (e) {
      console.error(e)
    }
  }

  useEffect(() => {
    loadData()
  }, [])

  useRealtime('fb_tables', loadData)

  const handleCreateTable = async () => {
    if (!newTable.number)
      return toast({ title: 'Informe o número da mesa', variant: 'destructive' })
    try {
      await createFBTable({
        table_number: newTable.number,
        capacity: parseInt(newTable.capacity) || 4,
        status: 'free',
      })
      toast({ title: 'Mesa criada com sucesso' })
      setShowNewTable(false)
      setNewTable({ number: '', capacity: '4' })
      loadData()
    } catch (e) {
      console.error(e)
      toast({ title: 'Erro ao criar mesa', variant: 'destructive' })
    }
  }

  const handleDeleteTable = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation()
    if (!confirm('Deseja realmente remover esta mesa? As operações vinculadas podem ser afetadas.'))
      return
    try {
      await deleteFBTable(id)
      toast({ title: 'Mesa removida com sucesso' })
      loadData()
    } catch (error) {
      console.error(error)
      toast({ title: 'Erro ao remover mesa', variant: 'destructive' })
    }
  }

  return (
    <div className="space-y-6 animate-fade-in-up">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white p-4 rounded-lg border border-slate-200 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="bg-blue-100 p-2 rounded-md">
            <LayoutGrid className="w-5 h-5 text-blue-600" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-slate-800">Gestão de Mesas</h2>
            <p className="text-sm text-slate-500">
              Selecione uma mesa para abrir pedidos ou processar o pagamento
            </p>
          </div>
        </div>

        <div className="flex items-center gap-4 w-full sm:w-auto">
          <div className="flex gap-2 text-xs font-medium bg-slate-50 px-3 py-1.5 rounded-md border border-slate-200">
            <Badge variant="outline" className="bg-emerald-50 border-emerald-200 text-emerald-700">
              Livre
            </Badge>
            <Badge variant="outline" className="bg-rose-50 border-rose-200 text-rose-700">
              Ocupada
            </Badge>
            <Badge variant="outline" className="bg-orange-50 border-orange-200 text-orange-700">
              Reservada
            </Badge>
          </div>
          {!isFrontDeskStaffOnly && (
            <Button
              onClick={() => setShowNewTable(true)}
              size="sm"
              className="bg-slate-900 hover:bg-black text-white whitespace-nowrap"
            >
              <Plus className="w-4 h-4 mr-2" /> Nova Mesa
            </Button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
        {tables.map((t) => {
          const isOcc = t.status === 'occupied'
          const isRes = t.status === 'reserved'
          return (
            <Card
              key={t.id}
              className={`relative cursor-pointer transition-all hover:-translate-y-1 hover:shadow-lg ${
                isOcc
                  ? 'border-rose-300 bg-rose-50/50'
                  : isRes
                    ? 'border-orange-300 bg-orange-50/50'
                    : 'border-emerald-200 bg-emerald-50/20'
              }`}
              onClick={() => {
                if (!isFrontDeskStaffOnly) setSelectedTable(t)
              }}
            >
              <CardContent className="p-6 text-center flex flex-col items-center">
                <div
                  className={`w-14 h-14 rounded-full flex items-center justify-center mb-3 shadow-sm ${
                    isOcc
                      ? 'bg-rose-200 text-rose-800'
                      : isRes
                        ? 'bg-orange-200 text-orange-800'
                        : 'bg-emerald-200 text-emerald-800'
                  }`}
                >
                  <span className="font-black text-2xl">{t.table_number.replace('T', '')}</span>
                </div>
                <h3 className="text-sm font-bold text-slate-800 line-clamp-1">
                  Mesa {t.table_number}
                </h3>
                <Badge
                  variant="outline"
                  className="mt-2 text-[10px] uppercase tracking-widest bg-white shadow-sm border-slate-200"
                >
                  {t.status}
                </Badge>
                <p className="text-xs text-slate-400 mt-3 font-medium flex items-center gap-1">
                  {t.capacity} lugares
                </p>

                {!isFrontDeskStaffOnly && t.status === 'free' && (
                  <button
                    onClick={(e) => handleDeleteTable(e, t.id)}
                    className="absolute top-2 right-2 p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-md transition-colors"
                    title="Remover Mesa"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </CardContent>
            </Card>
          )
        })}
        {tables.length === 0 && (
          <div className="col-span-full py-16 text-center border-2 border-dashed border-slate-200 rounded-lg text-slate-500 bg-slate-50/50">
            <LayoutGrid className="w-10 h-10 mx-auto mb-4 opacity-40" />
            <p className="font-medium text-slate-600">Nenhuma mesa cadastrada no sistema.</p>
            {!isFrontDeskStaffOnly && (
              <p className="text-sm mt-1">
                Clique em "Nova Mesa" para começar a estruturar o salão.
              </p>
            )}
          </div>
        )}
      </div>

      {selectedTable && (
        <FnBTableDialog
          table={selectedTable}
          onClose={() => {
            setSelectedTable(null)
            loadData()
          }}
        />
      )}

      <Dialog open={showNewTable} onOpenChange={setShowNewTable}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Cadastrar Nova Mesa</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 pt-4">
            <div className="space-y-2">
              <Label>Número ou Identificação</Label>
              <Input
                placeholder="Ex: 12 ou T12"
                value={newTable.number}
                onChange={(e) => setNewTable({ ...newTable, number: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label>Capacidade (Lugares)</Label>
              <Input
                type="number"
                min="1"
                placeholder="4"
                value={newTable.capacity}
                onChange={(e) => setNewTable({ ...newTable, capacity: e.target.value })}
              />
            </div>
          </div>
          <DialogFooter className="mt-6">
            <Button variant="ghost" onClick={() => setShowNewTable(false)}>
              Cancelar
            </Button>
            <Button onClick={handleCreateTable} className="bg-slate-900 hover:bg-black text-white">
              Criar Mesa
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
