import pb from '@/lib/pocketbase/client'

export interface GuestLoyalty {
  id: string
  guest_name: string
  email?: string
  points?: number
  tier?: string
  company_name?: string
  vat_number?: string
  marketing_consent?: boolean
  consent_signature?: string
  room_preferences?: string
  created: string
  updated: string
}

export const getLoyalty = () =>
  pb.collection('guest_loyalty').getFullList<GuestLoyalty>({ sort: '-created' })

export const createLoyalty = (data: Partial<GuestLoyalty>) =>
  pb.collection('guest_loyalty').create<GuestLoyalty>(data)

export const updateLoyalty = (id: string, data: Partial<GuestLoyalty> | FormData) =>
  pb.collection('guest_loyalty').update<GuestLoyalty>(id, data)
