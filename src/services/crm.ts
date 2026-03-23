import pb from '@/lib/pocketbase/client'

export interface GuestInteraction {
  id: string
  guest_id: string
  type: 'note' | 'preference' | 'incident' | 'interaction'
  details: string
  staff_id: string
  created: string
  updated: string
  expand?: {
    staff_id?: { name: string; avatar?: string }
    guest_id?: { guest_name: string }
  }
}

export const getGuestInteractions = (guestId?: string) => {
  const options: any = { expand: 'staff_id,guest_id', sort: '-created' }
  if (guestId) {
    options.filter = `guest_id = '${guestId}'`
  }
  return pb.collection('guest_interactions').getFullList<GuestInteraction>(options)
}

export const createGuestInteraction = (data: Partial<GuestInteraction>) =>
  pb.collection('guest_interactions').create<GuestInteraction>(data)

export const deleteGuestInteraction = (id: string) => pb.collection('guest_interactions').delete(id)
