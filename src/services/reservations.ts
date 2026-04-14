import pb from '@/lib/pocketbase/client'
import { RoomRecord } from './rooms'

export interface PBReservation {
  id: string
  guest_name: string
  room_id: string
  check_in: string
  check_out: string
  status: 'previsto' | 'in_house' | 'checked_out' | 'cancelado' | 'no_show'
  is_vip: boolean
  is_corporate?: boolean
  billing_type?: 'hospede' | 'empresa' | 'ambos'
  applied_rate_type?: string
  company_id?: string
  guest_id?: string
  additional_guests?: string[]
  signature_file?: string
  balance: number
  total_value?: number
  guests_count?: number
  document_digitalization?: string
  created: string
  updated: string
  expand?: {
    room_id?: RoomRecord
    company_id?: any
    additional_guests?: any[]
  }
}

export interface PBConsumption {
  id: string
  reservation_id: string
  type:
    | 'minibar'
    | 'spa'
    | 'restaurante'
    | 'lavandaria'
    | 'room_service'
    | 'estacionamento'
    | 'transfer'
    | 'taxas'
  amount: number
  description: string
  created: string
  updated: string
}

export const getReservations = () =>
  pb
    .collection('reservations')
    .getFullList<PBReservation>({ expand: 'room_id,company_id,additional_guests' })

export const updateReservation = (id: string, data: FormData | Partial<PBReservation>) =>
  pb.collection('reservations').update<PBReservation>(id, data)

export const createReservation = (data: Partial<PBReservation>) =>
  pb.collection('reservations').create<PBReservation>(data)

export const getConsumptions = (resId: string) =>
  pb
    .collection('consumptions')
    .getFullList<PBConsumption>({ filter: `reservation_id = "${resId}"` })

export const createConsumption = (data: Partial<PBConsumption>) =>
  pb.collection('consumptions').create<PBConsumption>(data)
