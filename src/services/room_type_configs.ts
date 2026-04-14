import pb from '@/lib/pocketbase/client'

export interface RoomTypeConfig {
  id: string
  name: string
  base_price: number
  created: string
  updated: string
}

export const getRoomTypeConfigs = async (): Promise<RoomTypeConfig[]> => {
  return pb.collection('room_type_configs').getFullList({ sort: 'name' })
}

export const updateRoomTypeConfig = async (
  id: string,
  data: Partial<RoomTypeConfig>,
): Promise<RoomTypeConfig> => {
  return pb.collection('room_type_configs').update(id, data)
}
