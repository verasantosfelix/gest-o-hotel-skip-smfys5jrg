import pb from '@/lib/pocketbase/client'
export const getLostAndFound = () =>
  pb.collection('lost_found_items').getFullList({ sort: '-created' })
export const createLostAndFound = (data: any) => pb.collection('lost_found_items').create(data)
export const updateLostAndFound = (id: string, data: any) =>
  pb.collection('lost_found_items').update(id, data)
