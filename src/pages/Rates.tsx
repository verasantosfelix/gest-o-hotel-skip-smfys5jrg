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
import { Checkbox } from '@/components/ui/checkbox'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogTrigger,
} from '@/components/ui/dialog'
import { getRooms, updateRoom, RoomRecord } from '@/services/rooms'
import { useRealtime } from '@/hooks/use-realtime'
import { useAccess } from '@/hooks/use-access'
import { toast } from '@/components/ui/use-toast'
import { ShieldAlert } from 'lucide-react'

const EditableCell = ({
  value,
  onSave,
  isPercent,
}: {
  value: number
  onSave: (v: number) => void
  isPercent?: boolean
}) => {
  const [editing, setEditing] = useState(false)
  const [val, setVal] = useState((value || 0).toString())

  const save = () => {
    setEditing(false)
    const num = parseFloat(val)
    if (!isNaN(num)) onSave(num)
    else setVal((value || 0).toString())
  }

  if (editing) {
    return (
      <Input
        autoFocus
        value={val}
        onChange={(e) => setVal(e.target.value)}
        onBlur={save}
        onKeyDown={(e) => e.key === 'Enter' && e.currentTarget.blur()}
        className="h-8 w-24 text-right ml-auto"
      />
    )
  }

  return (
    <div
      onClick={() => setEditing(true)}
      className="cursor-pointer hover:bg-slate-100 p-1.5 rounded min-w-[4rem] text-right font-medium text-slate-700"
    >
      {isPercent
        ? `${value || 0}%`
        : new Intl.NumberFormat('pt-AO', { style: 'currency', currency: 'AOA' }).format(value || 0)}
    </div>
  )
}

export default function Rates() {
  const { isManager } = useAccess()
  const [rooms, setRooms] = useState<RoomRecord[]>([])
  const [selected, setSelected] = useState<Set<string>>(new Set())
  const [bulkField, setBulkField] = useState('discount_corporate')
  const [bulkValue, setBulkValue] = useState('')
  const [dialogOpen, setDialogOpen] = useState(false)

  const load = async () => setRooms(await getRooms())
  useEffect(() => {
    if (isManager()) load()
  }, [isManager])
  useRealtime('rooms', load, isManager())

  if (!isManager()) {
    return (
      <div className="flex flex-col items-center justify-center h-full p-8 text-center space-y-4">
        <ShieldAlert className="w-16 h-16 text-rose-500" />
        <h2 className="text-2xl font-bold text-slate-800">Acesso Negado</h2>
        <p className="text-slate-500">Página restrita a Gestores e Diretores.</p>
      </div>
    )
  }

  const handleSave = async (id: string, field: keyof RoomRecord, value: number) => {
    if (value < 0 || (field !== 'base_rate' && value > 100)) {
      return toast({
        title: 'Valor inválido',
        description: 'Por favor insira um valor válido.',
        variant: 'destructive',
      })
    }

    // Optimistic update
    setRooms((prev) => prev.map((r) => (r.id === id ? { ...r, [field]: value } : r)))

    try {
      await updateRoom(id, { [field]: value })
    } catch (e) {
      toast({ title: 'Erro ao salvar', variant: 'destructive' })
      load() // revert on fail
    }
  }

  const handleBulk = async () => {
    const val = parseFloat(bulkValue)
    if (isNaN(val) || val < 0 || val > 100) {
      return toast({ title: 'Valor inválido', variant: 'destructive' })
    }
    try {
      await Promise.all(Array.from(selected).map((id) => updateRoom(id, { [bulkField]: val })))
      setDialogOpen(false)
      setSelected(new Set())
      setBulkValue('')
      toast({ title: 'Sucesso', description: `${selected.size} quartos atualizados com sucesso.` })
    } catch (e) {
      toast({ title: 'Erro ao atualizar em massa', variant: 'destructive' })
    }
  }

  const toggleAll = () =>
    setSelected(selected.size === rooms.length ? new Set() : new Set(rooms.map((r) => r.id)))
  const toggleRow = (id: string) => {
    const s = new Set(selected)
    s.has(id) ? s.delete(id) : s.add(id)
    setSelected(s)
  }

  return (
    <div className="p-6 h-full flex flex-col space-y-4 max-w-7xl mx-auto animate-fade-in">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900">Gestão de Tarifas</h1>
          <p className="text-slate-500 mt-1">Gerencie preços base e descontos do inventário.</p>
        </div>
        {selected.size > 0 && (
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="default" className="bg-indigo-600 hover:bg-indigo-700">
                Aplicar Desconto em Massa ({selected.size})
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Aplicar Desconto em Massa</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <Select value={bulkField} onValueChange={setBulkField}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione a categoria" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="discount_corporate">Corporate (%)</SelectItem>
                    <SelectItem value="discount_group">Grupo (%)</SelectItem>
                    <SelectItem value="discount_frequent">Hóspede Frequente (%)</SelectItem>
                    <SelectItem value="discount_custom">Outro (%)</SelectItem>
                  </SelectContent>
                </Select>
                <Input
                  type="number"
                  placeholder="Valor do Desconto (%)"
                  value={bulkValue}
                  onChange={(e) => setBulkValue(e.target.value)}
                />
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setDialogOpen(false)}>
                  Cancelar
                </Button>
                <Button onClick={handleBulk}>Aplicar a {selected.size} Quartos</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        )}
      </div>
      <Card className="flex-1 overflow-hidden flex flex-col border shadow-sm">
        <div className="overflow-auto flex-1">
          <Table>
            <TableHeader className="bg-slate-50 sticky top-0 z-10 shadow-sm">
              <TableRow>
                <TableHead className="w-12">
                  <Checkbox
                    checked={selected.size === rooms.length && rooms.length > 0}
                    onCheckedChange={toggleAll}
                  />
                </TableHead>
                <TableHead className="font-semibold text-slate-700">Quarto</TableHead>
                <TableHead className="font-semibold text-slate-700">Tipo</TableHead>
                <TableHead className="text-right font-semibold text-slate-700">
                  Tarifa Base (AKZ)
                </TableHead>
                <TableHead className="text-right font-semibold text-slate-700">
                  Corporate (%)
                </TableHead>
                <TableHead className="text-right font-semibold text-slate-700">Grupo (%)</TableHead>
                <TableHead className="text-right font-semibold text-slate-700">
                  Frequente (%)
                </TableHead>
                <TableHead className="text-right font-semibold text-slate-700">Outro (%)</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rooms.map((room) => (
                <TableRow key={room.id} className="group hover:bg-slate-50/50">
                  <TableCell>
                    <Checkbox
                      checked={selected.has(room.id)}
                      onCheckedChange={() => toggleRow(room.id)}
                    />
                  </TableCell>
                  <TableCell className="font-medium text-slate-900">
                    {room.bloco}-{room.room_number}
                  </TableCell>
                  <TableCell className="text-slate-500">{room.room_type || 'N/A'}</TableCell>
                  <TableCell>
                    <EditableCell
                      value={room.base_rate || 0}
                      onSave={(v) => handleSave(room.id, 'base_rate', v)}
                    />
                  </TableCell>
                  <TableCell>
                    <EditableCell
                      isPercent
                      value={room.discount_corporate || 0}
                      onSave={(v) => handleSave(room.id, 'discount_corporate', v)}
                    />
                  </TableCell>
                  <TableCell>
                    <EditableCell
                      isPercent
                      value={room.discount_group || 0}
                      onSave={(v) => handleSave(room.id, 'discount_group', v)}
                    />
                  </TableCell>
                  <TableCell>
                    <EditableCell
                      isPercent
                      value={room.discount_frequent || 0}
                      onSave={(v) => handleSave(room.id, 'discount_frequent', v)}
                    />
                  </TableCell>
                  <TableCell>
                    <EditableCell
                      isPercent
                      value={room.discount_custom || 0}
                      onSave={(v) => handleSave(room.id, 'discount_custom', v)}
                    />
                  </TableCell>
                </TableRow>
              ))}
              {rooms.length === 0 && (
                <TableRow>
                  <TableCell colSpan={8} className="text-center h-24 text-slate-500">
                    Nenhum quarto encontrado.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </Card>
    </div>
  )
}
