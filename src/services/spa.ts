import pb from '@/lib/pocketbase/client'
import type { PBReservation } from './reservations'
import type { RoomRecord } from './rooms'

export interface SpaService {
  id: string
  name: string
  description?: string
  duration_minutes: number
  price: number
  category: string
  status: 'draft' | 'published'
  image?: string
  version?: number
  available?: boolean
  therapists?: string[]
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
  preparation_time_buffer?: number
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

export const getSpaAppointments = (filter?: string) =>
  pb.collection('spa_appointments').getFullList<SpaAppointment>({
    expand: 'hotel_reservation_id.room_id,spa_room_id,service_id,therapist_id',
    sort: '-start_time',
    filter,
  })

export const createSpaAppointment = (data: Partial<SpaAppointment>) =>
  pb.collection('spa_appointments').create<SpaAppointment>(data)

export const updateSpaAppointment = (id: string, data: Partial<SpaAppointment>) =>
  pb.collection('spa_appointments').update<SpaAppointment>(id, data)

export const deleteSpaAppointment = (id: string) => pb.collection('spa_appointments').delete(id)

export const getSpaRooms = () => pb.collection('spa_rooms').getFullList<SpaRoom>({ sort: 'name' })
export const updateSpaRoom = (id: string, data: Partial<SpaRoom>) =>
  pb.collection('spa_rooms').update<SpaRoom>(id, data)

export const getSpaServices = (filter?: string) =>
  pb.collection('spa_services').getFullList<SpaService>({ filter, sort: 'category,name' })
export const createSpaService = (data: FormData | Partial<SpaService>) =>
  pb.collection('spa_services').create<SpaService>(data)
export const updateSpaService = (id: string, data: FormData | Partial<SpaService>) =>
  pb.collection('spa_services').update<SpaService>(id, data)
export const deleteSpaService = (id: string) => pb.collection('spa_services').delete(id)

export const getSpaInventory = () => pb.collection('spa_inventory').getFullList<SpaInventory>()
export const updateSpaInventory = (id: string, data: Partial<SpaInventory>) =>
  pb.collection('spa_inventory').update<SpaInventory>(id, data)

export const getUsers = () => pb.collection('users').getFullList({ sort: 'name' })
export const getActiveReservations = () =>
  pb.collection('reservations').getFullList<PBReservation>({
    filter: "status='in_house'",
    expand: 'room_id',
  })

export const getSpaBlockouts = () =>
  pb.collection('calendar_events').getFullList({ filter: "sector='spa'", expand: 'user_id' })
export const createSpaBlockout = (data: any) => pb.collection('calendar_events').create(data)
export const deleteSpaBlockout = (id: string) => pb.collection('calendar_events').delete(id)
