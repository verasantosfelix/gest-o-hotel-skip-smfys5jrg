import { useState, useEffect } from 'react'
import { Shirt, Send, Inbox, UserCheck } from 'lucide-react'
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
import { getLaundryLogs, createLaundryLog } from '@/services/laundry'
import { toast } from '@/components/ui/use-toast'

export default function Laundry() {
  const [logs, setLogs] = useState<any[]>([])
  const [item, setItem] = useState('')
  const [quantity, setQuantity] = useState('1')
  const [staff, setStaff] = useState('')

  const loadData = async () => {
    try {
      const data = await getLaundryLogs()
      setLogs(data)
    } catch (e) {
      console.error(e)
    }
  }

  useEffect(() => {
    loadData()
  }, [])

  const handleAction = async (type: string, status: string) => {
    if (!item || !quantity) return
    try {
      await createLaundryLog({
        type,
        item,
        quantity: parseInt(quantity),
        status,
        staff_member: staff,
      })
      toast({ title: 'Sucesso', description: 'Registro de lavanderia efetuado.' })
      setItem('')
      setQuantity('1')
      setStaff('')
      loadData()
    } catch (e) {
      toast({ title: 'Erro', description: 'Falha ao registrar', variant: 'destructive' })
    }
  }

  return (
    <div className="space-y-6 animate-fade-in pb-8">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900 flex items-center gap-2">
          <Shirt className="w-6 h-6 text-primary" />
          Lavanderia & Uniformes
        </h1>
        <p className="text-muted-foreground text-sm">
          Controle de enxoval, uniformes e serviços externos.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card className="shadow-sm">
          <CardHeader>
            <CardTitle>Operações de Enxoval</CardTitle>
            <CardDescription>Envie para lavagem ou receba itens limpos.</CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="enviar">
              <TabsList className="mb-4">
                <TabsTrigger value="enviar">
                  <Send className="w-4 h-4 mr-2" /> Enviar
                </TabsTrigger>
                <TabsTrigger value="receber">
                  <Inbox className="w-4 h-4 mr-2" /> Receber
                </TabsTrigger>
                <TabsTrigger value="uniforme">
                  <UserCheck className="w-4 h-4 mr-2" /> Uniformes
                </TabsTrigger>
              </TabsList>

              <TabsContent value="enviar" className="space-y-4">
                <div className="space-y-2">
                  <Label>Item (Ex: Toalhas, Lençóis)</Label>
                  <Input value={item} onChange={(e) => setItem(e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label>Quantidade</Label>
                  <Input
                    type="number"
                    value={quantity}
                    onChange={(e) => setQuantity(e.target.value)}
                  />
                </div>
                <Button onClick={() => handleAction('send', 'Sent to Wash')} className="w-full">
                  Registrar Envio
                </Button>
              </TabsContent>

              <TabsContent value="receber" className="space-y-4">
                <div className="space-y-2">
                  <Label>Item Recebido</Label>
                  <Input value={item} onChange={(e) => setItem(e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label>Quantidade Limpa</Label>
                  <Input
                    type="number"
                    value={quantity}
                    onChange={(e) => setQuantity(e.target.value)}
                  />
                </div>
                <Button
                  onClick={() => handleAction('receive', 'Available')}
                  className="w-full bg-emerald-600 hover:bg-emerald-700 text-white"
                >
                  Receber no Estoque
                </Button>
              </TabsContent>

              <TabsContent value="uniforme" className="space-y-4">
                <div className="space-y-2">
                  <Label>Colaborador</Label>
                  <Input value={staff} onChange={(e) => setStaff(e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label>Tipo de Uniforme</Label>
                  <Input value={item} onChange={(e) => setItem(e.target.value)} />
                </div>
                <Button onClick={() => handleAction('uniform', 'Delivered')} className="w-full">
                  Registrar Entrega
                </Button>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>

        <Card className="shadow-sm">
          <CardHeader>
            <CardTitle>Histórico Recente</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {logs.map((log) => (
              <div
                key={log.id}
                className="p-3 border rounded-lg bg-slate-50 flex justify-between items-center text-sm"
              >
                <div>
                  <span className="font-bold text-slate-800 uppercase tracking-wider text-xs mr-2">
                    {log.type}
                  </span>
                  {log.quantity}x {log.item} {log.staff_member && `(${log.staff_member})`}
                </div>
                <span className="text-slate-500 font-mono">{log.status}</span>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
