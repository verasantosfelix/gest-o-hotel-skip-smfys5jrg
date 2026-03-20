import pb from '@/lib/pocketbase/client'

export const getAssets = () => pb.collection('it_assets').getFullList({ sort: '-created' })

export const createAsset = (data: {
  name: string
  type: string
  serial: string
  status: string
  last_maintenance?: string
  next_maintenance_date?: string
  location?: string
}) => pb.collection('it_assets').create(data)

export const updateAsset = (id: string, data: any) => pb.collection('it_assets').update(id, data)

export const getAccessRequests = () => pb.collection('it_access_requests').getFullList()
export const createAccessRequest = (data: {
  user_name: string
  system_name: string
  status: string
  auditor_name?: string
}) => pb.collection('it_access_requests').create(data)

export const getIotSensors = () => pb.collection('iot_sensors').getFullList({ sort: '-created' })
export const updateIotSensor = (id: string, data: any) =>
  pb.collection('iot_sensors').update(id, data)

export const getTickets = () => pb.collection('it_tickets').getFullList({ sort: '-created' })
export const createTicket = (data: {
  requester_name: string
  category: string
  description: string
  status: string
  sla_deadline: string
}) => pb.collection('it_tickets').create(data)
