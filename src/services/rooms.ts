import pb from '@/lib/pocketbase/client'

export interface RoomRecord {
  id: string
  room_number: string
  status:
    | 'available'
    | 'occupied'
    | 'cleaning'
    | 'maintenance'
    | 'out_of_order'
    | 'vago_pronto'
    | 'sujo'
    | 'em_arrumacao'
    | 'nao_perturbar'
    | 'ocupado_pronto'
  maintenance_description?: string
  priority?: 'low' | 'medium' | 'high' | ''
  housekeeping_priority?: 'normal' | 'vip' | 'early_checkin' | 'late_checkout'
  room_type?:
    | 'standard'
    | 'suite'
    | 'luxo'
    | 'Single'
    | 'Duplo/Casal'
    | 'Casal'
    | 'Especial'
    | 'Quádruplo'
    | 'Vivenda T1'
    | 'Vivenda T2'
    | string
  floor: number
  assigned_staff?: string
  created: string
  updated: string
}

export const getRooms = () =>
  pb.collection('rooms').getFullList<RoomRecord>({ sort: 'floor,room_number' })

export const updateRoom = (id: string, data: Partial<RoomRecord>) =>
  pb.collection('rooms').update<RoomRecord>(id, data)
