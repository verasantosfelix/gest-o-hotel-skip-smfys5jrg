import { useState } from 'react'
import { ShoppingBag, Package, CreditCard, CheckCircle } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'

export default function GiftShop() {
  const [output, setOutput] = useState('')
  const [item, setItem] = useState('')
  const [qty, setQty] = useState('1')

  const handleSale = (e: React.FormEvent) => {
    e.preventDefault()
    if (!item) return
    setOutput(
      `<OUTPUT>\n  <status>Venda concluída</status>\n  <item_id>${item}</item_id>\n  <quantidade>${qty}</quantidade>\n  <lancamento_conta>Sucesso</lancamento_conta>\n</OUTPUT>`,
    )
  }

  const catalog = [
    { id: 'S01', name: 'Caneca Térmica SKIP', price: 85.0, stock: 12 },
    { id: 'S02', name: 'Roupão Premium', price: 250.0, stock: 4 },
    { id: 'S03', name: 'Protetor Solar 50 FPS', price: 65.0, stock: 22 },
  ]

  return (
    <div className="space-y-6 animate-fade-in pb-8">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900 flex items-center gap-2">
          <ShoppingBag className="w-6 h-6 text-primary" />
          Gift Shop & Conveniência
        </h1>
        <p className="text-muted-foreground text-sm">
          PDV rápido para loja do hotel, controle de estoque e lançamento em conta.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card className="border-slate-200 shadow-sm">
          <CardHeader>
            <CardTitle>Terminal PDV</CardTitle>
            <CardDescription>Registre vendas rapidamente.</CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="vendas" className="w-full">
              <TabsList className="mb-4 bg-slate-100 flex flex-wrap h-auto p-1">
                <TabsTrigger value="vendas" className="flex-1">
                  Catálogo & Vendas
                </TabsTrigger>
                <TabsTrigger value="estoque" className="flex-1">
                  Estoque
                </TabsTrigger>
              </TabsList>

              <TabsContent value="vendas">
                <form onSubmit={handleSale} className="space-y-4">
                  <div className="space-y-2">
                    <Label>Produto</Label>
                    <Select value={item} onValueChange={setItem} required>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione um produto..." />
                      </SelectTrigger>
                      <SelectContent>
                        {catalog.map((c) => (
                          <SelectItem key={c.id} value={c.id}>
                            {c.name} - R$ {c.price.toFixed(2)}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Quantidade</Label>
                      <Input
                        type="number"
                        min="1"
                        value={qty}
                        onChange={(e) => setQty(e.target.value)}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>ID da Reserva (Opcional)</Label>
                      <Input placeholder="Ex: 12345" />
                    </div>
                  </div>
                  <Button
                    type="submit"
                    className="w-full gap-2 bg-slate-900 text-white hover:bg-slate-800"
                  >
                    <CreditCard className="w-4 h-4" /> Processar Venda
                  </Button>
                </form>
              </TabsContent>

              <TabsContent value="estoque" className="space-y-4">
                <div className="grid gap-3">
                  {catalog.map((c) => (
                    <div
                      key={c.id}
                      className="p-3 border rounded-lg bg-slate-50 flex items-center justify-between"
                    >
                      <div className="flex items-center gap-3">
                        <Package className="w-5 h-5 text-slate-400" />
                        <div>
                          <p className="font-bold text-slate-900">{c.name}</p>
                          <p className="text-xs text-slate-500">SKU: {c.id}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <Badge variant={c.stock < 5 ? 'destructive' : 'secondary'}>
                          {c.stock} em estoque
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>

        <div>
          {output && (
            <Card className="border-emerald-500/20 bg-emerald-50 shadow-sm animate-fade-in-up">
              <CardHeader>
                <CardTitle className="text-emerald-700 font-display text-base flex items-center gap-2">
                  <CheckCircle className="w-4 h-4" /> Recibo de Operação
                </CardTitle>
              </CardHeader>
              <CardContent>
                <pre className="bg-slate-900 text-emerald-400 p-4 rounded-md font-mono text-sm overflow-x-auto shadow-inner whitespace-pre-wrap">
                  {output}
                </pre>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}
