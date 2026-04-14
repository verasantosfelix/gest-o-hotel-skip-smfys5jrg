import React, { useEffect, useState } from 'react'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { useRealtime } from '@/hooks/use-realtime'
import { useAccess } from '@/hooks/use-access'
import { toast } from '@/components/ui/use-toast'
import { ShieldAlert, Plus, Trash2, Printer, Pencil } from 'lucide-react'
import {
  getRoomTypeConfigs,
  updateRoomTypeConfig,
  RoomTypeConfig,
} from '@/services/room_type_configs'
import {
  getRoomDiscounts,
  createRoomDiscount,
  updateRoomDiscount,
  deleteRoomDiscount,
  RoomDiscount,
} from '@/services/room_discounts'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

const formatAKZ = (val: number) => {
  return new Intl.NumberFormat('pt-AO', { style: 'currency', currency: 'AOA' }).format(val)
}

const EditableCell = ({ value, onSave }: { value: number; onSave: (v: number) => void }) => {
  const [editing, setEditing] = useState(false)
  const [val, setVal] = useState((value || 0).toString())

  useEffect(() => {
    setVal((value || 0).toString())
  }, [value])

  const save = () => {
    setEditing(false)
    const num = parseFloat(val)
    if (!isNaN(num) && num >= 0) {
      onSave(num)
    } else {
      setVal((value || 0).toString())
    }
  }

  if (editing) {
    return (
      <Input
        type="number"
        autoFocus
        value={val}
        onChange={(e) => setVal(e.target.value)}
        onBlur={save}
        onKeyDown={(e) => {
          if (e.key === 'Enter') save()
          if (e.key === 'Escape') {
            setVal((value || 0).toString())
            setEditing(false)
          }
        }}
        className="h-8 w-32 text-right ml-auto"
      />
    )
  }

  return (
    <div
      onClick={() => setEditing(true)}
      className="cursor-pointer hover:bg-slate-100 p-1.5 rounded min-w-[6rem] text-right font-medium text-slate-700 transition-colors"
      title="Clique para editar"
    >
      {formatAKZ(value || 0)}
    </div>
  )
}

export default function Tarifario() {
  const { isManager, effectiveRoleLevel } = useAccess()
  const [configs, setConfigs] = useState<RoomTypeConfig[]>([])
  const [discounts, setDiscounts] = useState<RoomDiscount[]>([])

  const [discountDialogOpen, setDiscountDialogOpen] = useState(false)
  const [editingDiscount, setEditingDiscount] = useState<Partial<RoomDiscount> | null>(null)

  const hasPageAccess =
    isManager() ||
    ['Gerente_Geral', 'Director_Geral', 'Administrativo_Geral', 'Gerente_Area'].includes(
      effectiveRoleLevel,
    )

  const load = async () => {
    try {
      const [c, d] = await Promise.all([getRoomTypeConfigs(), getRoomDiscounts()])
      setConfigs(c)
      setDiscounts(d)
    } catch (err) {
      console.error(err)
    }
  }

  useEffect(() => {
    if (hasPageAccess) load()
  }, [hasPageAccess])

  useRealtime('room_type_configs', load, hasPageAccess)
  useRealtime('room_discounts', load, hasPageAccess)

  if (!hasPageAccess) {
    return (
      <div className="flex flex-col items-center justify-center h-full p-8 text-center space-y-4 animate-fade-in">
        <ShieldAlert className="w-16 h-16 text-rose-500" />
        <h2 className="text-2xl font-bold text-slate-800">Acesso Restrito</h2>
        <p className="text-slate-500">Esta página é restrita à Direção e Gestão Geral.</p>
      </div>
    )
  }

  const handleSavePrice = async (id: string, value: number) => {
    try {
      await updateRoomTypeConfig(id, { base_price: value })
      toast({ title: 'Tarifa atualizada' })
    } catch (e) {
      toast({ title: 'Erro ao salvar', variant: 'destructive' })
    }
  }

  const handleSaveDiscount = async () => {
    if (!editingDiscount?.name || editingDiscount.value === undefined) return
    try {
      if (editingDiscount.id) {
        await updateRoomDiscount(editingDiscount.id, editingDiscount)
      } else {
        await createRoomDiscount(editingDiscount)
      }
      setDiscountDialogOpen(false)
      toast({ title: 'Desconto salvo com sucesso' })
    } catch (e) {
      toast({ title: 'Erro ao salvar', variant: 'destructive' })
    }
  }

  const handleDeleteDiscount = async (id: string) => {
    if (!confirm('Remover este desconto?')) return
    try {
      await deleteRoomDiscount(id)
      toast({ title: 'Removido com sucesso' })
    } catch (e) {
      toast({ title: 'Erro ao remover', variant: 'destructive' })
    }
  }

  const handlePrint = () => {
    window.print()
  }

  return (
    <>
      <style>{`
        @media print {
          body * { visibility: hidden; }
          .print-section, .print-section * { visibility: visible; }
          .print-section { position: absolute; left: 0; top: 0; width: 100%; margin: 0; padding: 20px; }
        }
      `}</style>

      <div className="p-6 h-full flex flex-col space-y-8 max-w-6xl mx-auto animate-fade-in pb-20 print:hidden">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900">Tarifário Central</h1>
          <p className="text-slate-500 mt-1">
            Gerencie os preços base para cada tipologia e regras de descontos globais.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Tipologias */}
          <Card className="overflow-hidden border shadow-sm flex flex-col">
            <div className="p-4 bg-slate-50 border-b">
              <h2 className="text-lg font-semibold text-slate-800">Tipologias de Quarto</h2>
              <p className="text-sm text-slate-500">Preços base para reservas sem desconto.</p>
            </div>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="font-semibold">Tipologia</TableHead>
                  <TableHead className="text-right font-semibold">Preço Base (AKZ)</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {configs.map((config) => (
                  <TableRow key={config.id} className="group hover:bg-slate-50/50">
                    <TableCell className="font-medium text-slate-900">{config.name}</TableCell>
                    <TableCell>
                      <EditableCell
                        value={config.base_price}
                        onSave={(v) => handleSavePrice(config.id, v)}
                      />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Card>

          {/* Descontos */}
          <Card className="overflow-hidden border shadow-sm flex flex-col">
            <div className="p-4 bg-slate-50 border-b flex justify-between items-center">
              <div>
                <h2 className="text-lg font-semibold text-slate-800">Regras de Desconto</h2>
                <p className="text-sm text-slate-500">Promoções e descontos corporativos.</p>
              </div>
              <Button
                size="sm"
                onClick={() => {
                  setEditingDiscount({ type: 'percentage', value: 0 })
                  setDiscountDialogOpen(true)
                }}
              >
                <Plus className="w-4 h-4 mr-2" /> Novo
              </Button>
            </div>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="font-semibold">Nome</TableHead>
                  <TableHead className="font-semibold">Tipo</TableHead>
                  <TableHead className="text-right font-semibold">Valor</TableHead>
                  <TableHead className="w-16"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {discounts.map((d) => (
                  <TableRow key={d.id} className="group hover:bg-slate-50/50">
                    <TableCell className="font-medium">{d.name}</TableCell>
                    <TableCell>
                      {d.type === 'percentage' ? 'Percentagem (%)' : 'Fixo (AKZ)'}
                    </TableCell>
                    <TableCell className="text-right">
                      {d.type === 'percentage' ? `${d.value}%` : formatAKZ(d.value)}
                    </TableCell>
                    <TableCell>
                      <div className="flex justify-end space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8"
                          onClick={() => {
                            setEditingDiscount(d)
                            setDiscountDialogOpen(true)
                          }}
                        >
                          <Pencil className="w-4 h-4 text-slate-500" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-rose-500"
                          onClick={() => handleDeleteDiscount(d.id)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
                {discounts.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center h-24 text-slate-500">
                      Nenhum desconto configurado.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </Card>
        </div>

        {/* Matriz */}
        <Card className="border shadow-sm p-0 overflow-hidden">
          <div className="p-4 bg-slate-50 border-b flex justify-between items-center">
            <div>
              <h2 className="text-lg font-semibold text-slate-800">Matriz de Preços Calculados</h2>
              <p className="text-sm text-slate-500">
                Valores finais para cada tipologia por desconto aplicado.
              </p>
            </div>
            <Button variant="outline" onClick={handlePrint} className="bg-white">
              <Printer className="w-4 h-4 mr-2" /> Imprimir Matriz
            </Button>
          </div>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader className="bg-white">
                <TableRow>
                  <TableHead className="min-w-[150px]">Tipologia</TableHead>
                  <TableHead className="text-right border-r">Tarifa Base</TableHead>
                  {discounts.map((d) => (
                    <TableHead key={d.id} className="text-right whitespace-nowrap">
                      {d.name}{' '}
                      <span className="text-slate-400 font-normal text-xs ml-1">
                        ({d.type === 'percentage' ? `${d.value}%` : formatAKZ(d.value)})
                      </span>
                    </TableHead>
                  ))}
                </TableRow>
              </TableHeader>
              <TableBody>
                {configs.map((c) => (
                  <TableRow key={c.id}>
                    <TableCell className="font-medium text-slate-900">{c.name}</TableCell>
                    <TableCell className="text-right font-semibold border-r">
                      {formatAKZ(c.base_price)}
                    </TableCell>
                    {discounts.map((d) => {
                      const finalPrice =
                        d.type === 'percentage'
                          ? c.base_price * (1 - d.value / 100)
                          : Math.max(0, c.base_price - d.value)
                      return (
                        <TableCell key={d.id} className="text-right text-slate-600">
                          {formatAKZ(finalPrice)}
                        </TableCell>
                      )
                    })}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </Card>
      </div>

      {/* Seção Imprimível */}
      <div className="print-section hidden print:block">
        <h1 className="text-2xl font-bold mb-6 text-center text-black">
          Matriz de Tarifário Base e Descontos
        </h1>
        <table className="w-full border-collapse text-sm text-black">
          <thead>
            <tr>
              <th className="border border-black p-2 text-left bg-gray-100">Tipologia</th>
              <th className="border border-black p-2 text-right bg-gray-100">Tarifa Base</th>
              {discounts.map((d) => (
                <th key={d.id} className="border border-black p-2 text-right bg-gray-100">
                  {d.name}
                  <br />
                  <span className="text-xs font-normal">
                    ({d.type === 'percentage' ? `${d.value}%` : formatAKZ(d.value)})
                  </span>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {configs.map((c) => (
              <tr key={c.id}>
                <td className="border border-black p-2 font-bold">{c.name}</td>
                <td className="border border-black p-2 text-right font-bold">
                  {formatAKZ(c.base_price)}
                </td>
                {discounts.map((d) => {
                  const finalPrice =
                    d.type === 'percentage'
                      ? c.base_price * (1 - d.value / 100)
                      : Math.max(0, c.base_price - d.value)
                  return (
                    <td key={d.id} className="border border-black p-2 text-right">
                      {formatAKZ(finalPrice)}
                    </td>
                  )
                })}
              </tr>
            ))}
          </tbody>
        </table>
        <div className="mt-8 text-xs text-center text-gray-500">
          Documento gerado pelo sistema. Valores sujeitos a alteração.
        </div>
      </div>

      <Dialog open={discountDialogOpen} onOpenChange={setDiscountDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingDiscount?.id ? 'Editar Desconto' : 'Novo Desconto'}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Nome do Desconto</Label>
              <Input
                value={editingDiscount?.name || ''}
                onChange={(e) => setEditingDiscount((prev) => ({ ...prev!, name: e.target.value }))}
                placeholder="Ex: Corporativo 10%"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Tipo</Label>
                <Select
                  value={editingDiscount?.type || 'percentage'}
                  onValueChange={(v: any) => setEditingDiscount((prev) => ({ ...prev!, type: v }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="percentage">Percentagem (%)</SelectItem>
                    <SelectItem value="fixed_amount">Valor Fixo (AKZ)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Valor</Label>
                <Input
                  type="number"
                  min={0}
                  step="any"
                  value={editingDiscount?.value === undefined ? '' : editingDiscount.value}
                  onChange={(e) =>
                    setEditingDiscount((prev) => ({
                      ...prev!,
                      value: parseFloat(e.target.value) || 0,
                    }))
                  }
                />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDiscountDialogOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={handleSaveDiscount}>Salvar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
