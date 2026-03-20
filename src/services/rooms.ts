import pb from '@/lib/pocketbase/client'

export interface RoomRecord {
  id: string
  room_number: string
  status: 'available' | 'occupied' | 'cleaning' | 'maintenance' | 'out_of_order'
  maintenance_description?: string
  priority?: 'low' | 'medium' | 'high' | ''
  floor: number
  created: string
  updated: string
}

export const getRooms = () =>
  pb.collection('rooms').getFullList<RoomRecord>({ sort: 'floor,room_number' })

export const updateRoom = (id: string, data: Partial<RoomRecord>) =>
  pb.collection('rooms').update<RoomRecord>(id, data)
