import pb from '@/lib/pocketbase/client'
import { RoomRecord } from './rooms'

export interface AmenityRequest {
  id: string
  room_id: string
  guest_name: string
  item: string
  quantity: number
  description: string
  priority: 'normal' | 'urgente'
  status: 'pending' | 'in_transit' | 'delivered' | 'pending_approval' | 'rejected'
  created_by?: string
  created: string
  updated: string
  expand?: {
    room_id?: RoomRecord
    created_by?: any
  }
}

export const getAmenityRequests = () =>
  pb.collection('amenity_requests').getFullList<AmenityRequest>({
    expand: 'room_id,created_by',
    sort: '-created',
  })

export const createAmenityRequest = (data: Partial<AmenityRequest>) =>
  pb.collection('amenity_requests').create<AmenityRequest>(data)

export const updateAmenityRequest = (id: string, data: Partial<AmenityRequest>) =>
  pb.collection('amenity_requests').update<AmenityRequest>(id, data)

export const deleteAmenityRequest = (id: string) => pb.collection('amenity_requests').delete(id)
