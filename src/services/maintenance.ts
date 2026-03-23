import pb from '@/lib/pocketbase/client'

export interface MaintenanceTicket {
  id: string
  room_id: string
  description: string
  priority: 'low' | 'medium' | 'high' | 'urgent'
  status: 'open' | 'in_progress' | 'resolved' | 'pending_approval' | 'rejected'
  created_by?: string
  technician_id?: string
  used_materials?: any
  initial_photo?: string
  completion_photo?: string
  location_details?: string
  response_start_at?: string
  resolved_at?: string
  problem_type?: string
  origin?: string
  planned_intervention?: string
  created: string
  updated: string
  expand?: any
}

export const getMaintenanceTickets = () =>
  pb.collection('maintenance_tickets').getFullList<MaintenanceTicket>({
    expand: 'room_id,technician_id,created_by',
    sort: '-created',
  })

export const createMaintenanceTicket = (data: Partial<MaintenanceTicket>) =>
  pb.collection('maintenance_tickets').create<MaintenanceTicket>(data)

export const updateMaintenanceTicket = (id: string, data: Partial<MaintenanceTicket>) =>
  pb.collection('maintenance_tickets').update<MaintenanceTicket>(id, data)
