import { useState, useEffect } from 'react'
import { Search, AlertTriangle, PackageSearch, Plus, Minus } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { formatCurrency } from '@/lib/utils'
import { useRealtime } from '@/hooks/use-realtime'
import { getConsumables, updateConsumable, ConsumableItem } from '@/services/consumables'

export function InventoryManagement() {
  const [items, setItems] = useState<ConsumableItem[]>([])
  const [search, setSearch] = useState('')

  const loadData = async () => {
    try {
      const data = await getConsumables()
      setItems(data)
    } catch (err) {
      console.error(err)
    }
  }

  useEffect(() => {
    loadData()
  }, [])

  useRealtime('consumables_inventory', loadData)

  const handleAdjustStock = async (id: string, current: number, change: number) => {
    const newQty = Math.max(0, current + change)
    try {
      await updateConsumable(id, { stock_quantity: newQty })
    } catch (e) {
      console.error(e)
    }
  }

  const filteredItems = items.filter(
    (item) =>
      item.item_name.toLowerCase().includes(search.toLowerCase()) ||
      item.category.toLowerCase().includes(search.toLowerCase()),
  )

  return (
    <Card className="border-slate-200 shadow-sm animate-fade-in-up">
      <CardHeader className="flex flex-row items-start justify-between">
        <div>
          <CardTitle className="text-slate-800 font-display flex items-center gap-2">
            <PackageSearch className="w-5 h-5 text-emerald-600" />
            Controle de Estoque e Reposição
          </CardTitle>
          <CardDescription className="mt-1">
            Monitore níveis de inventário com deduções automatizadas.
          </CardDescription>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex gap-4 items-center">
          <div className="relative max-w-sm flex-1">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar item ou categoria..."
              className="pl-9 border-slate-300"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>

        <div className="rounded-md border border-slate-200 overflow-hidden bg-white">
          <Table>
            <TableHeader className="bg-slate-50">
              <TableRow>
                <TableHead>Item</TableHead>
                <TableHead>Categoria</TableHead>
                <TableHead className="text-center">Estoque Atual</TableHead>
                <TableHead>Preço Unit.</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Ajuste Rápido</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredItems.map((item) => {
                const isLowStock = item.stock_quantity <= item.min_threshold
                return (
                  <TableRow
                    key={item.id}
                    className={
                      isLowStock ? 'bg-rose-50/50 hover:bg-rose-50' : 'hover:bg-slate-50/50'
                    }
                  >
                    <TableCell className="font-semibold text-slate-800">{item.item_name}</TableCell>
                    <TableCell className="capitalize text-slate-600">
                      {item.category === 'hygiene' ? 'Higiene/Amenities' : 'Minibar'}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center justify-center gap-2">
                        <span
                          className={`font-mono text-base ${
                            isLowStock ? 'text-rose-700 font-bold' : 'text-slate-700 font-medium'
                          }`}
                        >
                          {item.stock_quantity}
                        </span>
                        {isLowStock && (
                          <AlertTriangle className="w-4 h-4 text-rose-500 animate-pulse" />
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="text-slate-600 font-mono">
                      {formatCurrency(item.unit_price, 'AOA')}
                    </TableCell>
                    <TableCell>
                      {isLowStock ? (
                        <Badge
                          variant="destructive"
                          className="bg-rose-100 text-rose-800 border-rose-200 hover:bg-rose-200"
                        >
                          Reposição Necessária
                        </Badge>
                      ) : (
                        <Badge
                          variant="outline"
                          className="bg-emerald-50 text-emerald-700 border-emerald-200"
                        >
                          Estoque Nominal
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-1">
                        <Button
                          variant="outline"
                          size="icon"
                          className="h-8 w-8 text-slate-600 border-slate-300"
                          onClick={() => handleAdjustStock(item.id, item.stock_quantity, -1)}
                          disabled={item.stock_quantity <= 0}
                        >
                          <Minus className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="icon"
                          className="h-8 w-8 text-slate-600 border-slate-300"
                          onClick={() => handleAdjustStock(item.id, item.stock_quantity, 1)}
                        >
                          <Plus className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                )
              })}
              {filteredItems.length === 0 && (
                <TableRow>
                  <TableCell colSpan={6} className="h-24 text-center text-slate-500">
                    Nenhum item encontrado no inventário.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  )
}
