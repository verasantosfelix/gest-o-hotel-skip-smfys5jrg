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
import { useRealtime } from '@/hooks/use-realtime'
import { useAccess } from '@/hooks/use-access'
import { toast } from '@/components/ui/use-toast'
import { ShieldAlert } from 'lucide-react'
import {
  getRoomTypeConfigs,
  updateRoomTypeConfig,
  RoomTypeConfig,
} from '@/services/room_type_configs'

const formatAKZ = (val: number) => {
  const formatted = new Intl.NumberFormat('pt-PT', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(val)
  return `${formatted} AKZ`
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

  const hasPageAccess =
    isManager() ||
    ['Gerente_Geral', 'Director_Geral', 'Administrativo_Geral', 'Gerente_Area'].includes(
      effectiveRoleLevel,
    )

  const load = async () => {
    try {
      setConfigs(await getRoomTypeConfigs())
    } catch (err) {
      console.error(err)
    }
  }

  useEffect(() => {
    if (hasPageAccess) load()
  }, [hasPageAccess])

  useRealtime('room_type_configs', load, hasPageAccess)

  if (!hasPageAccess) {
    return (
      <div className="flex flex-col items-center justify-center h-full p-8 text-center space-y-4 animate-fade-in">
        <ShieldAlert className="w-16 h-16 text-rose-500" />
        <h2 className="text-2xl font-bold text-slate-800">Acesso Restrito</h2>
        <p className="text-slate-500">Esta página é restrita à Direção e Gestão Geral.</p>
      </div>
    )
  }

  const handleSave = async (id: string, value: number) => {
    setConfigs((prev) => prev.map((c) => (c.id === id ? { ...c, base_price: value } : c)))

    try {
      await updateRoomTypeConfig(id, { base_price: value })
      toast({
        title: 'Tarifa atualizada',
        description: 'O preço base foi salvo e será aplicado aos novos quartos.',
      })
    } catch (e) {
      toast({
        title: 'Erro ao salvar',
        description: 'Não foi possível atualizar a tarifa.',
        variant: 'destructive',
      })
      load() // revert on fail
    }
  }

  return (
    <div className="p-6 h-full flex flex-col space-y-6 max-w-5xl mx-auto animate-fade-in">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-slate-900">Tarifário Base</h1>
        <p className="text-slate-500 mt-1">
          Gerencie os preços base para cada tipologia. Novos quartos adotarão estes valores
          automaticamente.
        </p>
      </div>

      <Card className="overflow-hidden border shadow-sm">
        <Table>
          <TableHeader className="bg-slate-50">
            <TableRow>
              <TableHead className="font-semibold text-slate-700">Tipologia</TableHead>
              <TableHead className="text-right font-semibold text-slate-700">
                Preço Base (AKZ)
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {configs.map((config) => (
              <TableRow key={config.id} className="group hover:bg-slate-50/50">
                <TableCell className="font-medium text-slate-900">{config.name}</TableCell>
                <TableCell>
                  <EditableCell
                    value={config.base_price}
                    onSave={(v) => handleSave(config.id, v)}
                  />
                </TableCell>
              </TableRow>
            ))}
            {configs.length === 0 && (
              <TableRow>
                <TableCell colSpan={2} className="text-center h-24 text-slate-500">
                  Nenhuma tipologia encontrada.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </Card>
    </div>
  )
}
