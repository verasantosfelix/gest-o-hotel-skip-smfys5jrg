import { useState } from 'react'
import { RoomRecord } from '@/services/rooms'
import { RoomCard } from './RoomCard'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Filter } from 'lucide-react'

interface HousekeepingGridProps {
  rooms: RoomRecord[]
  onAction: (type: 'checklist' | 'maintenance' | 'minibar' | 'lost_found', room: RoomRecord) => void
}

export function HousekeepingGrid({ rooms, onAction }: HousekeepingGridProps) {
  const [filterStatus, setFilterStatus] = useState<string>('all')
  const [filterFloor, setFilterFloor] = useState<string>('all')
  const [search, setSearch] = useState('')

  const floors = Array.from(new Set(rooms.map((r) => r.floor.toString()))).sort()

  const filtered = rooms.filter((r) => {
    if (filterStatus !== 'all' && r.status !== filterStatus) return false
    if (filterFloor !== 'all' && r.floor.toString() !== filterFloor) return false
    if (search && !r.room_number.includes(search)) return false
    return true
  })

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="bg-white p-4 rounded-lg border border-slate-200 shadow-sm flex flex-col sm:flex-row gap-4 items-center justify-between">
        <div className="flex items-center gap-2 text-slate-700 font-medium">
          <Filter className="w-5 h-5" /> Filtros Operacionais
        </div>
        <div className="flex flex-wrap gap-3 w-full sm:w-auto">
          <Input
            placeholder="Buscar Qto..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full sm:w-32 bg-slate-50"
          />
          <Select value={filterStatus} onValueChange={setFilterStatus}>
            <SelectTrigger className="w-full sm:w-[160px] bg-slate-50">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos Status</SelectItem>
              <SelectItem value="sujo">Sujo</SelectItem>
              <SelectItem value="em_arrumacao">Em Arrumação</SelectItem>
              <SelectItem value="vago_pronto">Vago Pronto</SelectItem>
              <SelectItem value="ocupado_pronto">Ocupado Pronto</SelectItem>
              <SelectItem value="manutencao">Manutenção</SelectItem>
              <SelectItem value="nao_perturbar">Não Perturbe</SelectItem>
            </SelectContent>
          </Select>
          <Select value={filterFloor} onValueChange={setFilterFloor}>
            <SelectTrigger className="w-full sm:w-[120px] bg-slate-50">
              <SelectValue placeholder="Andar" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos Andares</SelectItem>
              {floors.map((f) => (
                <SelectItem key={f} value={f}>
                  Andar {f}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="text-center py-20 text-slate-500 bg-slate-50 rounded-lg border border-dashed border-slate-300">
          Nenhum quarto encontrado com os filtros atuais.
        </div>
      ) : (
        <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4">
          {filtered.map((room) => (
            <RoomCard key={room.id} room={room} onAction={onAction} />
          ))}
        </div>
      )}
    </div>
  )
}
