import { useState } from 'react'
import { Search, AlertTriangle, PackageSearch } from 'lucide-react'
import { Input } from '@/components/ui/input'
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
import useInventoryStore from '@/stores/useInventoryStore'

export function InventoryManagement() {
  const { items } = useInventoryStore()
  const [search, setSearch] = useState('')

  const filteredItems = items.filter(
    (item) =>
      item.name.toLowerCase().includes(search.toLowerCase()) ||
      item.category.toLowerCase().includes(search.toLowerCase()),
  )

  return (
    <Card className="border-slate-200 shadow-sm animate-fade-in-up">
      <CardHeader>
        <CardTitle className="text-slate-800 font-display flex items-center gap-2">
          <PackageSearch className="w-5 h-5 text-primary" />
          Controle de Estoque e Reposição
        </CardTitle>
        <CardDescription>
          Monitore níveis de inventário com alertas automatizados para Minibar e Amenities.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="relative max-w-sm">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar item ou categoria..."
            className="pl-8 border-slate-300"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <div className="rounded-md border border-slate-200 overflow-hidden">
          <Table>
            <TableHeader className="bg-slate-50">
              <TableRow>
                <TableHead>Item</TableHead>
                <TableHead>Categoria</TableHead>
                <TableHead>Quantidade Atual</TableHead>
                <TableHead>Preço Base</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredItems.map((item) => {
                const isLowStock = item.quantity < item.threshold
                return (
                  <TableRow
                    key={item.id}
                    className={
                      isLowStock ? 'bg-amber-50/50 hover:bg-amber-50' : 'hover:bg-slate-50'
                    }
                  >
                    <TableCell className="font-medium text-slate-800">{item.name}</TableCell>
                    <TableCell className="text-slate-600">{item.category}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <span
                          className={`font-mono text-base ${
                            isLowStock ? 'text-rose-600 font-bold' : 'text-slate-700'
                          }`}
                        >
                          {item.quantity}
                        </span>
                        {isLowStock && (
                          <AlertTriangle className="w-4 h-4 text-rose-500 animate-pulse" />
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="text-slate-600">R$ {item.price.toFixed(2)}</TableCell>
                    <TableCell>
                      {isLowStock ? (
                        <Badge variant="destructive" className="bg-rose-500">
                          Reposição Necessária
                        </Badge>
                      ) : (
                        <Badge className="bg-emerald-500 hover:bg-emerald-600">
                          Estoque Nominal
                        </Badge>
                      )}
                    </TableCell>
                  </TableRow>
                )
              })}
              {filteredItems.length === 0 && (
                <TableRow>
                  <TableCell colSpan={5} className="h-24 text-center text-slate-500">
                    Nenhum item encontrado.
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
