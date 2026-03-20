import pb from '@/lib/pocketbase/client'

export interface EventSpace {
  id: string
  name: string
  type: 'meeting_room' | 'ballroom' | 'garden' | 'rooftop' | string
  capacity_formats: any
  status: 'available' | 'occupied' | 'setup' | 'maintenance' | string
  current_layout: string
  created: string
  updated: string
}

export interface HotelEvent {
  id: string
  title: string
  type: 'corporate' | 'wedding' | 'social' | 'conference' | string
  client_name: string
  contact_info: string
  start_time: string
  end_time: string
  space_id: string
  status: 'pending' | 'preparation' | 'ongoing' | 'finished' | 'cancelled' | string
  participants_count: number
  technical_requirements: any
  catering_details: any
  total_budget: number
  expand?: { space_id?: EventSpace }
  created: string
  updated: string
}

export interface EventConsumption {
  id: string
  event_id: string
  item_description: string
  quantity: number
  unit_price: number
  category: 'fb' | 'equipment' | 'staff' | 'extra' | string
  created: string
  updated: string
}

export const getEventSpaces = () =>
  pb.collection('event_spaces').getFullList<EventSpace>({ sort: 'name' })
export const updateEventSpace = (id: string, data: Partial<EventSpace>) =>
  pb.collection('event_spaces').update<EventSpace>(id, data)

export const getEvents = () =>
  pb.collection('events').getFullList<HotelEvent>({ expand: 'space_id', sort: '-created' })
export const createEvent = (data: Partial<HotelEvent>) =>
  pb.collection('events').create<HotelEvent>(data)
export const updateEvent = (id: string, data: Partial<HotelEvent>) =>
  pb.collection('events').update<HotelEvent>(id, data)

export const getEventConsumptions = (eventId: string) =>
  pb
    .collection('event_consumptions')
    .getFullList<EventConsumption>({ filter: `event_id = "${eventId}"` })
export const createEventConsumption = (data: Partial<EventConsumption>) =>
  pb.collection('event_consumptions').create<EventConsumption>(data)
