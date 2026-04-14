import pb from '@/lib/pocketbase/client'

export interface RoomDiscount {
  id: string
  name: string
  type: 'percentage' | 'fixed_amount'
  value: number
  created: string
  updated: string
}

export const getRoomDiscounts = async (): Promise<RoomDiscount[]> => {
  return pb.collection('room_discounts').getFullList({ sort: 'name' })
}

export const createRoomDiscount = async (data: Partial<RoomDiscount>): Promise<RoomDiscount> => {
  return pb.collection('room_discounts').create(data)
}

export const updateRoomDiscount = async (
  id: string,
  data: Partial<RoomDiscount>,
): Promise<RoomDiscount> => {
  return pb.collection('room_discounts').update(id, data)
}

export const deleteRoomDiscount = async (id: string): Promise<void> => {
  return pb.collection('room_discounts').delete(id)
}
