import pb from '@/lib/pocketbase/client'

export interface LaundryLog {
  id: string
  type: string
  item: string
  quantity: number
  status: string
  staff_member: string
  location?: string
  urgency?: 'normal' | 'high'
  created: string
  updated: string
}

export const getLaundryLogs = (filter?: string) =>
  pb.collection('laundry_logs').getFullList<LaundryLog>({ sort: '-created', filter })

export const createLaundryLog = (data: Partial<LaundryLog>) =>
  pb.collection('laundry_logs').create<LaundryLog>(data)

export const updateLaundryLog = (id: string, data: Partial<LaundryLog>) =>
  pb.collection('laundry_logs').update<LaundryLog>(id, data)
