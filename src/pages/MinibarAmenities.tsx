import { useState } from 'react'
import { Package, Plus } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { useRealtime } from '@/hooks/use-realtime'
import { getRoomInventory, createRoomInventory } from '@/services/room_inventory'
import { toast } from '@/components/ui/use-toast'

export default function MinibarAmenities() {
  const [inventory, setInventory] = useState<any[]>([])
  const [form, setForm] = useState({ room: '', type: 'Minibar', item: '', qty: '1' })

  const loadData = async () => {
    try {
      setInventory(await getRoomInventory())
    } catch (e) {
      console.error(e)
    }
  }

  useRealtime('room_inventory', () => {
    loadData()
  })

  const handleReplenish = async () => {
    if (!form.room || !form.item) return
    try {
      await createRoomInventory({
        room_number: form.room,
        item_type: form.type,
        item_name: form.item,
        quantity: parseInt(form.qty),
      })
      toast({ title: 'Sucesso', description: 'Reposição/Consumo registrado no quarto.' })
      setForm({ ...form, item: '', qty: '1' })
    } catch (e) {
      toast({ title: 'Erro', variant: 'destructive' })
    }
  }

  return (
    <div className="space-y-6 animate-fade-in pb-8">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900 flex items-center gap-2">
          <Package className="w-6 h-6 text-primary" /> Minibar & Amenities
        </h1>
        <p className="text-muted-foreground text-sm">
          Controle de reposição de kits e consumo de minibar.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card className="shadow-sm">
          <CardHeader>
            <CardTitle>Ação de Quarto</CardTitle>
            <CardDescription>Registre reposições de amenities ou consumo.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Quarto</Label>
              <Input
                value={form.room}
                onChange={(e) => setForm({ ...form, room: e.target.value })}
                placeholder="Ex: 304"
              />
            </div>
            <div className="space-y-2">
              <Label>Tipo</Label>
              <select
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                value={form.type}
                onChange={(e) => setForm({ ...form, type: e.target.value })}
              >
                <option value="Minibar">Minibar</option>
                <option value="Amenity">Kit Amenity</option>
              </select>
            </div>
            <div className="space-y-2">
              <Label>Item / Kit</Label>
              <Input
                value={form.item}
                onChange={(e) => setForm({ ...form, item: e.target.value })}
                placeholder="Ex: Kit Luxo ou Água"
              />
            </div>
            <div className="space-y-2">
              <Label>Quantidade</Label>
              <Input
                type="number"
                value={form.qty}
                onChange={(e) => setForm({ ...form, qty: e.target.value })}
              />
            </div>
            <Button onClick={handleReplenish} className="w-full">
              <Plus className="w-4 h-4 mr-2" /> Confirmar Ação
            </Button>
          </CardContent>
        </Card>

        <Card className="shadow-sm">
          <CardHeader>
            <CardTitle>Inventário Registrado</CardTitle>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="minibar">
              <TabsList className="mb-4">
                <TabsTrigger value="minibar">Consumos Minibar</TabsTrigger>
                <TabsTrigger value="amenity">Reposições Amenities</TabsTrigger>
              </TabsList>

              <TabsContent value="minibar" className="space-y-2">
                {inventory
                  .filter((i) => i.item_type === 'Minibar')
                  .map((item) => (
                    <div key={item.id} className="p-2 border-b flex justify-between text-sm">
                      <span>
                        Q.{item.room_number}: {item.quantity}x {item.item_name}
                      </span>
                    </div>
                  ))}
              </TabsContent>
              <TabsContent value="amenity" className="space-y-2">
                {inventory
                  .filter((i) => i.item_type === 'Amenity')
                  .map((item) => (
                    <div key={item.id} className="p-2 border-b flex justify-between text-sm">
                      <span>
                        Q.{item.room_number}: {item.quantity}x {item.item_name}
                      </span>
                    </div>
                  ))}
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
