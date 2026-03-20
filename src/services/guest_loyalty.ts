import pb from '@/lib/pocketbase/client'
export const getLoyalty = () => pb.collection('guest_loyalty').getFullList({ sort: '-created' })
export const createLoyalty = (data: any) => pb.collection('guest_loyalty').create(data)
