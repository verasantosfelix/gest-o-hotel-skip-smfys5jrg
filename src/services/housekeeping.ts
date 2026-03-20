import pb from '@/lib/pocketbase/client'

export interface MaintenanceTicket {
  id?: string
  room_id: string
  description: string
  priority: 'low' | 'medium' | 'high' | 'urgent'
  status: 'open' | 'in_progress' | 'resolved'
}

export interface HousekeepingLog {
  id?: string
  room_id: string
  staff_id?: string
  type: 'checkout' | 'stayover' | 'deep_cleaning' | 'vip'
  checklist_progress: any
  status: 'pending' | 'in_progress' | 'completed'
  started_at?: string
  completed_at?: string
}

export const getMaintenanceTickets = () =>
  pb.collection('maintenance_tickets').getFullList<MaintenanceTicket>({ sort: '-created' })

export const createMaintenanceTicket = (data: MaintenanceTicket) =>
  pb.collection('maintenance_tickets').create(data)

export const updateMaintenanceTicket = (id: string, data: Partial<MaintenanceTicket>) =>
  pb.collection('maintenance_tickets').update(id, data)

export const getHousekeepingLogs = () =>
  pb.collection('housekeeping_logs').getFullList<HousekeepingLog>({ sort: '-created' })

export const createHousekeepingLog = (data: HousekeepingLog) =>
  pb.collection('housekeeping_logs').create(data)

export const updateHousekeepingLog = (id: string, data: Partial<HousekeepingLog>) =>
  pb.collection('housekeeping_logs').update(id, data)
