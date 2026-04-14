import pb from '@/lib/pocketbase/client'

export interface RoomRecord {
  id: string
  room_number: string
  status: 'Disponível' | 'Ocupado' | 'Manutenção' | 'Limpeza'
  maintenance_description?: string
  priority?: 'low' | 'medium' | 'high' | ''
  housekeeping_priority?: 'normal' | 'vip' | 'early_checkin' | 'late_checkout'
  room_type?:
    | 'Single'
    | 'Duplo/Casal'
    | 'Casal'
    | 'Especial'
    | 'Quádruplo'
    | 'Vivenda T1'
    | 'Vivenda T2'
    | string
  bloco: 'A' | 'B' | 'V' | string
  floor: number
  assigned_staff?: string
  max_occupancy?: number
  bed_count?: number
  allow_extra_bed?: boolean
  appliances?: string[]
  base_rate?: number
  discount_corporate?: number
  discount_group?: number
  discount_frequent?: number
  discount_custom?: number
  created: string
  updated: string
}

export const getRooms = () =>
  pb.collection('rooms').getFullList<RoomRecord>({ sort: 'bloco,floor,room_number' })

export const updateRoom = (id: string, data: Partial<RoomRecord>) =>
  pb.collection('rooms').update<RoomRecord>(id, data)

export const createRoom = (data: Partial<RoomRecord>) =>
  pb.collection('rooms').create<RoomRecord>(data)

export const deleteRoom = (id: string) => pb.collection('rooms').delete(id)
