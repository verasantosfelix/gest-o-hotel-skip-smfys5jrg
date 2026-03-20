import pb from '@/lib/pocketbase/client'
export const getRoomInventory = () =>
  pb.collection('room_inventory').getFullList({ sort: '-created' })
export const createRoomInventory = (data: any) => pb.collection('room_inventory').create(data)
