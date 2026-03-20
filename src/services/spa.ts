import pb from '@/lib/pocketbase/client'
import type { PBReservation } from './reservations'
import type { RoomRecord } from './rooms'

export interface SpaService {
  id: string
  name: string
  duration_minutes: number
  price: number
  category: string
}

export interface SpaRoom {
  id: string
  name: string
  status: 'free' | 'occupied' | 'cleaning' | 'maintenance'
}

export interface SpaInventory {
  id: string
  item_name: string
  quantity: number
  unit: string
  min_threshold: number
}

export interface SpaAppointment {
  id: string
  guest_name: string
  hotel_reservation_id?: string
  spa_room_id: string
  service_id: string
  therapist_id: string
  start_time: string
  end_time: string
  status: 'scheduled' | 'checked_in' | 'in_progress' | 'completed' | 'cancelled'
  contraindications: string
  notes: string
  expand?: {
    hotel_reservation_id?: PBReservation & { expand?: { room_id?: RoomRecord } }
    spa_room_id?: SpaRoom
    service_id?: SpaService
    therapist_id?: { id: string; name: string; avatar: string }
  }
}

export const getSpaAppointments = () =>
  pb.collection('spa_appointments').getFullList<SpaAppointment>({
    expand: 'hotel_reservation_id.room_id,spa_room_id,service_id,therapist_id',
    sort: '-start_time',
  })

export const createSpaAppointment = (data: Partial<SpaAppointment>) =>
  pb.collection('spa_appointments').create<SpaAppointment>(data)

export const updateSpaAppointment = (id: string, data: Partial<SpaAppointment>) =>
  pb.collection('spa_appointments').update<SpaAppointment>(id, data)

export const deleteSpaAppointment = (id: string) => pb.collection('spa_appointments').delete(id)

export const getSpaRooms = () => pb.collection('spa_rooms').getFullList<SpaRoom>()
export const updateSpaRoom = (id: string, data: Partial<SpaRoom>) =>
  pb.collection('spa_rooms').update<SpaRoom>(id, data)

export const getSpaServices = () => pb.collection('spa_services').getFullList<SpaService>()

export const getSpaInventory = () => pb.collection('spa_inventory').getFullList<SpaInventory>()
export const updateSpaInventory = (id: string, data: Partial<SpaInventory>) =>
  pb.collection('spa_inventory').update<SpaInventory>(id, data)

export const getUsers = () => pb.collection('users').getFullList()
export const getActiveReservations = () =>
  pb.collection('reservations').getFullList<PBReservation>({
    filter: "status='in_house'",
    expand: 'room_id',
  })
