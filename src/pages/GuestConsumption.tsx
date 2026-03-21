import { useState, useEffect } from 'react'
import { Printer, ReceiptText } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Button } from '@/components/ui/button'
import { useAccess } from '@/hooks/use-access'
import { RestrictedAccess } from '@/components/RestrictedAccess'
import { formatCurrency } from '@/lib/utils'
import {
  getConsolidatedReport,
  getActiveReservations,
  ConsolidatedData,
} from '@/services/guest_consumptions'

export default function GuestConsumption() {
  const { hasAccess } = useAccess()
  const [reservations, setReservations] = useState<any[]>([])
  const [selectedId, setSelectedId] = useState('')
  const [data, setData] = useState<ConsolidatedData | null>(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    getActiveReservations().then(setReservations).catch(console.error)
  }, [])

  useEffect(() => {
    if (!selectedId) return
    const fetchReport = async () => {
      setLoading(true)
      const res = reservations.find((r) => r.id === selectedId)
      if (res) {
        const report = await getConsolidatedReport(
          res.id,
          res.room_id,
          res.expand?.room_id?.room_number,
        )
        setData(report)
      }
      setLoading(false)
    }
    fetchReport()
  }, [selectedId, reservations])

  if (!hasAccess(['Front_Desk', 'Rececao_FrontOffice', 'Direcao_Admin'])) {
    return <RestrictedAccess requiredRoles={['Front_Desk', 'Rececao_FrontOffice']} />
  }

  const combinedCharges = data
    ? [
        ...data.fb.map((f) => ({
          id: f.id,
          date: f.created,
          desc: `F&B Order (${f.type})`,
          amount: f.total_amount,
          source: 'F&B',
        })),
        ...data.cons.map((c) => ({
          id: c.id,
          date: c.created,
          desc: c.description || c.type,
          amount: c.amount,
          source: 'Geral',
        })),
      ].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    : []

  const totalPending = combinedCharges.reduce((acc, curr) => acc + curr.amount, 0)
  const f = (d: string) => new Date(d).toLocaleDateString('pt-PT')

  return (
    <div className="space-y-6 animate-fade-in pb-8 print:p-0">
      <div className="flex justify-between items-center print:hidden">
        <h1 className="text-2xl font-bold flex items-center gap-2 text-slate-900">
          <ReceiptText className="text-primary" /> Extrato Consolidado do Hóspede
        </h1>
        <Button onClick={() => window.print()} variant="outline" className="gap-2" disabled={!data}>
          <Printer className="w-4 h-4" /> Imprimir Extrato
        </Button>
      </div>

      <div className="print:hidden max-w-md">
        <Select value={selectedId} onValueChange={setSelectedId}>
          <SelectTrigger className="bg-white">
            <SelectValue placeholder="Selecione uma reserva..." />
          </SelectTrigger>
          <SelectContent>
            {reservations.map((r) => (
              <SelectItem key={r.id} value={r.id}>
                {r.guest_name} - Quarto {r.expand?.room_id?.room_number || 'N/A'}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {loading && (
        <div className="text-center py-10 text-slate-500 print:hidden">Carregando dados...</div>
      )}

      {data && !loading && (
        <div className="space-y-6">
          <Card className="print:border-none print:shadow-none">
            <CardHeader className="pb-4">
              <CardTitle>Resumo Financeiro</CardTitle>
              <CardDescription>
                Total consolidado de todos os departamentos (F&B e Consumos Gerais)
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-4xl font-bold text-slate-900 mb-6">
                {formatCurrency(totalPending, 'AOA')}
              </div>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Data</TableHead>
                    <TableHead>Origem</TableHead>
                    <TableHead>Descrição</TableHead>
                    <TableHead className="text-right">Valor</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {combinedCharges.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={4} className="text-center text-muted-foreground">
                        Nenhum consumo registado.
                      </TableCell>
                    </TableRow>
                  )}
                  {combinedCharges.map((c) => (
                    <TableRow key={c.id}>
                      <TableCell>{f(c.date)}</TableCell>
                      <TableCell>
                        <Badge variant="outline">{c.source}</Badge>
                      </TableCell>
                      <TableCell className="capitalize">{c.desc}</TableCell>
                      <TableCell className="text-right font-medium">
                        {formatCurrency(c.amount, 'AOA')}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          <Tabs defaultValue="spa" className="mt-6 print:hidden">
            <TabsList className="bg-white border">
              <TabsTrigger value="spa">SPA & Wellness</TabsTrigger>
              <TabsTrigger value="amenities">Amenities</TabsTrigger>
              <TabsTrigger value="laundry">Lavanderia</TabsTrigger>
            </TabsList>
            <TabsContent value="spa">
              <Card>
                <CardContent className="pt-6">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Data</TableHead>
                        <TableHead>Serviço</TableHead>
                        <TableHead>Status</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {data.spa.map((s) => (
                        <TableRow key={s.id}>
                          <TableCell>{new Date(s.start_time).toLocaleString('pt-PT')}</TableCell>
                          <TableCell>{s.expand?.service_id?.name || 'N/A'}</TableCell>
                          <TableCell>
                            <Badge>{s.status}</Badge>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </TabsContent>
            <TabsContent value="amenities">
              <Card>
                <CardContent className="pt-6">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Data</TableHead>
                        <TableHead>Item</TableHead>
                        <TableHead>Qtd</TableHead>
                        <TableHead>Status</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {data.amenities.map((a) => (
                        <TableRow key={a.id}>
                          <TableCell>{f(a.created)}</TableCell>
                          <TableCell className="capitalize">{a.item.replace('_', ' ')}</TableCell>
                          <TableCell>{a.quantity}</TableCell>
                          <TableCell>
                            <Badge variant="outline">{a.status}</Badge>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </TabsContent>
            <TabsContent value="laundry">
              <Card>
                <CardContent className="pt-6">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Data</TableHead>
                        <TableHead>Item</TableHead>
                        <TableHead>Qtd</TableHead>
                        <TableHead>Status</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {data.laundry.map((l) => (
                        <TableRow key={l.id}>
                          <TableCell>{f(l.created)}</TableCell>
                          <TableCell>{l.item}</TableCell>
                          <TableCell>{l.quantity}</TableCell>
                          <TableCell>
                            <Badge variant="secondary">{l.status}</Badge>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      )}
    </div>
  )
}
