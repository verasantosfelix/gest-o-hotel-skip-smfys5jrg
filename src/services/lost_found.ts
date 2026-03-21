import pb from '@/lib/pocketbase/client'

export interface LostFoundItem {
  id: string
  description: string
  location: string
  date_found: string
  status: string
  guest_data: string
  created: string
  updated: string
}

export const getLostFoundItems = () =>
  pb.collection('lost_found_items').getFullList<LostFoundItem>({ sort: '-created' })

export const createLostFoundItem = (data: Partial<LostFoundItem>) =>
  pb.collection('lost_found_items').create<LostFoundItem>(data)

export const createLostAndFound = createLostFoundItem

export const updateLostFoundItem = (id: string, data: Partial<LostFoundItem>) =>
  pb.collection('lost_found_items').update<LostFoundItem>(id, data)

export const deleteLostFoundItem = (id: string) => pb.collection('lost_found_items').delete(id)
