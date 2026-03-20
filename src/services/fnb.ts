import pb from '@/lib/pocketbase/client'
import { RoomRecord } from './rooms'
import { PBReservation } from './reservations'

export interface FBTable {
  id: string
  table_number: string
  status: 'free' | 'occupied' | 'reserved'
  capacity: number
  created: string
  updated: string
}

export interface FBProduct {
  id: string
  name: string
  category: string
  price: number
  is_available: boolean
}

export interface FBReservationFNB {
  id: string
  guest_name: string
  people_count: number
  reservation_time: string
  table_id: string
  status: 'confirmed' | 'arrived' | 'cancelled' | 'no_show'
  notes: string
  expand?: { table_id?: FBTable }
}

export interface FBOrder {
  id: string
  type: 'table' | 'room_service'
  status: 'pending' | 'preparing' | 'ready' | 'delivered' | 'closed' | 'cancelled'
  table_id?: string
  reservation_id?: string
  room_id?: string
  total_amount: number
  service_fee: number
  expand?: { table_id?: FBTable; room_id?: RoomRecord; reservation_id?: PBReservation }
  created: string
  updated: string
}

export interface FBOrderItem {
  id: string
  order_id: string
  product_id: string
  quantity: number
  price_at_time: number
  status: 'pending' | 'cooking' | 'finished'
  expand?: { order_id?: FBOrder; product_id?: FBProduct }
  created: string
  updated: string
}

export const getFBTables = () =>
  pb.collection('fb_tables').getFullList<FBTable>({ sort: 'table_number' })
export const updateFBTable = (id: string, data: Partial<FBTable>) =>
  pb.collection('fb_tables').update<FBTable>(id, data)

export const getFBProducts = () =>
  pb
    .collection('fb_products')
    .getFullList<FBProduct>({ filter: 'is_available = true', sort: 'category,name' })

export const getFBOrders = (filter?: string) =>
  pb
    .collection('fb_orders')
    .getFullList<FBOrder>({ filter, expand: 'table_id,room_id,reservation_id', sort: '-created' })
export const createFBOrder = (data: Partial<FBOrder>) =>
  pb.collection('fb_orders').create<FBOrder>(data)
export const updateFBOrder = (id: string, data: Partial<FBOrder>) =>
  pb.collection('fb_orders').update<FBOrder>(id, data)

export const getFBOrderItems = (filter?: string) =>
  pb
    .collection('fb_order_items')
    .getFullList<FBOrderItem>({
      filter,
      expand: 'product_id,order_id.table_id,order_id.room_id',
      sort: 'created',
    })
export const createFBOrderItem = (data: Partial<FBOrderItem>) =>
  pb.collection('fb_order_items').create<FBOrderItem>(data)
export const updateFBOrderItem = (id: string, data: Partial<FBOrderItem>) =>
  pb.collection('fb_order_items').update<FBOrderItem>(id, data)

export const getFBReservations = () =>
  pb
    .collection('fb_reservations_fnb')
    .getFullList<FBReservationFNB>({ expand: 'table_id', sort: 'reservation_time' })
export const createFBReservation = (data: Partial<FBReservationFNB>) =>
  pb.collection('fb_reservations_fnb').create<FBReservationFNB>(data)
export const updateFBReservation = (id: string, data: Partial<FBReservationFNB>) =>
  pb.collection('fb_reservations_fnb').update<FBReservationFNB>(id, data)
