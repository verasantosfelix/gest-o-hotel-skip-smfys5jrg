import { useState } from 'react'
import { SearchX, CheckCircle, Package } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { useRealtime } from '@/hooks/use-realtime'
import { getLostAndFound, createLostAndFound, updateLostAndFound } from '@/services/lost_found'
import { toast } from '@/components/ui/use-toast'

export default function LostAndFound() {
  const [items, setItems] = useState<any[]>([])
  const [form, setForm] = useState({ description: '', location: '', guest_data: '' })

  const loadData = async () => {
    try {
      setItems(await getLostAndFound())
    } catch (e) {
      console.error(e)
    }
  }

  useRealtime('lost_found_items', () => {
    loadData()
  })

  const handleRegister = async () => {
    if (!form.description || !form.location) return
    try {
      await createLostAndFound({ ...form, status: 'Lost', date_found: new Date().toISOString() })
      toast({ title: 'Sucesso', description: 'Item registrado no Achados e Perdidos.' })
      setForm({ description: '', location: '', guest_data: '' })
    } catch (e) {
      toast({ title: 'Erro', variant: 'destructive' })
    }
  }

  const handleReturn = async (id: string) => {
    try {
      await updateLostAndFound(id, { status: 'Returned' })
      toast({ title: 'Sucesso', description: 'Item marcado como devolvido.' })
    } catch (e) {
      toast({ title: 'Erro', variant: 'destructive' })
    }
  }

  return (
    <div className="space-y-6 animate-fade-in pb-8">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900 flex items-center gap-2">
          <SearchX className="w-6 h-6 text-primary" /> Achados e Perdidos
        </h1>
        <p className="text-muted-foreground text-sm">
          Registro de objetos encontrados e fluxo de devolução.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card className="shadow-sm">
          <CardHeader>
            <CardTitle>Registrar Objeto</CardTitle>
            <CardDescription>Cadastre itens encontrados pelo hotel.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Descrição</Label>
              <Input
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                placeholder="Ex: Óculos escuros preto"
              />
            </div>
            <div className="space-y-2">
              <Label>Local Encontrado</Label>
              <Input
                value={form.location}
                onChange={(e) => setForm({ ...form, location: e.target.value })}
                placeholder="Ex: Piscina"
              />
            </div>
            <div className="space-y-2">
              <Label>Dados do Hóspede (Opcional se conhecido)</Label>
              <Input
                value={form.guest_data}
                onChange={(e) => setForm({ ...form, guest_data: e.target.value })}
              />
            </div>
            <Button onClick={handleRegister} className="w-full">
              <Package className="w-4 h-4 mr-2" /> Guardar Item
            </Button>
          </CardContent>
        </Card>

        <Card className="shadow-sm">
          <CardHeader>
            <CardTitle>Inventário Atual</CardTitle>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="lost">
              <TabsList className="mb-4">
                <TabsTrigger value="lost">Pendentes (Perdidos)</TabsTrigger>
                <TabsTrigger value="returned">Devolvidos / Outros</TabsTrigger>
              </TabsList>

              <TabsContent value="lost" className="space-y-3">
                {items
                  .filter((i) => i.status === 'Lost')
                  .map((item) => (
                    <div
                      key={item.id}
                      className="p-3 border rounded-lg bg-amber-50 flex justify-between items-center text-sm"
                    >
                      <div>
                        <p className="font-bold text-slate-800">{item.description}</p>
                        <p className="text-xs text-slate-500">Local: {item.location}</p>
                      </div>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleReturn(item.id)}
                        className="bg-white"
                      >
                        <CheckCircle className="w-4 h-4 mr-1 text-emerald-600" /> Devolver
                      </Button>
                    </div>
                  ))}
              </TabsContent>

              <TabsContent value="returned" className="space-y-3">
                {items
                  .filter((i) => i.status !== 'Lost')
                  .map((item) => (
                    <div
                      key={item.id}
                      className="p-3 border rounded-lg bg-slate-50 flex justify-between items-center text-sm"
                    >
                      <div>
                        <p className="font-medium text-slate-700 line-through">
                          {item.description}
                        </p>
                        <p className="text-xs text-slate-500">Local: {item.location}</p>
                      </div>
                      <span className="text-slate-500 font-mono text-xs uppercase">
                        {item.status}
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
