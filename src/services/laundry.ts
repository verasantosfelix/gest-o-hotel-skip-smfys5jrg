import pb from '@/lib/pocketbase/client'
export const getLaundryLogs = () => pb.collection('laundry_logs').getFullList({ sort: '-created' })
export const createLaundryLog = (data: any) => pb.collection('laundry_logs').create(data)
