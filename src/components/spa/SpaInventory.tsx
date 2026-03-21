import { useState, useEffect } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Package, Plus, Minus, AlertCircle } from 'lucide-react'
import { getSpaInventory, updateSpaInventory, SpaInventory as ISpaInv } from '@/services/spa'
import { useRealtime } from '@/hooks/use-realtime'
import useAuthStore from '@/stores/useAuthStore'

export function SpaInventory() {
  const { userRole } = useAuthStore()
  const isFrontDesk = userRole === 'Front_Desk'

  const [items, setItems] = useState<ISpaInv[]>([])

  const loadData = async () => {
    const data = await getSpaInventory()
    setItems(data)
  }

  useEffect(() => {
    loadData()
  }, [])
  useRealtime('spa_inventory', loadData)

  const handleQty = async (id: string, newQty: number) => {
    if (newQty < 0) return
    try {
      await updateSpaInventory(id, { quantity: newQty })
    } catch (e) {
      console.error(e)
    }
  }

  return (
    <div className="space-y-4 mt-8 md:mt-0">
      <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
        <Package className="w-5 h-5" /> Controle de Consumíveis
      </h3>
      <Card className="border-slate-200 shadow-sm overflow-hidden">
        <CardContent className="p-0">
          <Table>
            <TableHeader className="bg-slate-50">
              <TableRow>
                <TableHead className="pl-4">Item</TableHead>
                <TableHead className="text-center">Quantidade</TableHead>
                {!isFrontDesk && <TableHead className="text-right pr-4">Ação</TableHead>}
              </TableRow>
            </TableHeader>
            <TableBody>
              {items.map((i) => {
                const isLow = i.quantity <= i.min_threshold
                return (
                  <TableRow key={i.id} className={isLow ? 'bg-rose-50/50' : ''}>
                    <TableCell className="pl-4">
                      <div className="font-medium text-slate-800 flex items-center gap-2">
                        {isLow && <AlertCircle className="w-4 h-4 text-rose-500" />}
                        {i.item_name}
                      </div>
                      <div className="text-xs text-slate-500">Unidade: {i.unit}</div>
                    </TableCell>
                    <TableCell className="text-center">
                      <span
                        className={`font-mono text-lg ${isLow ? 'text-rose-600 font-bold' : ''}`}
                      >
                        {i.quantity}
                      </span>
                    </TableCell>
                    {!isFrontDesk && (
                      <TableCell className="text-right pr-4">
                        <div className="flex justify-end gap-1">
                          <Button
                            variant="outline"
                            size="icon"
                            className="h-8 w-8"
                            onClick={() => handleQty(i.id, i.quantity - 1)}
                          >
                            <Minus className="w-3 h-3" />
                          </Button>
                          <Button
                            variant="outline"
                            size="icon"
                            className="h-8 w-8"
                            onClick={() => handleQty(i.id, i.quantity + 1)}
                          >
                            <Plus className="w-3 h-3" />
                          </Button>
                        </div>
                      </TableCell>
                    )}
                  </TableRow>
                )
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
