import pb from '@/lib/pocketbase/client'

export type SecurityIncident = {
  id: string
  type: string
  location: string
  date_time: string
  involved?: string
  origin?: string
  description: string
  category: string
  status: 'pending' | 'investigation' | 'resolved' | 'closed'
  intervention_details?: string
  area_isolated?: boolean
  management_notified?: boolean
  protocol_id?: string
  resolution?: string
  preventive_measures?: string
  created: string
  updated: string
}

export type ProtocolStep = { id: number; task: string; done: boolean }

export type SecurityProtocol = {
  id: string
  name: string
  type: string
  steps: ProtocolStep[]
  is_active: boolean
  created: string
  updated: string
}

export type SecurityAccessLog = {
  id: string
  user_id?: string
  staff_name?: string
  location: string
  access_type: 'authorized' | 'denied' | 'bypass'
  device_source: 'keycard' | 'elevator' | 'biometric'
  timestamp: string
  created: string
}

export type SecurityAudit = {
  id: string
  title: string
  type: 'shift' | 'compliance' | 'equipment'
  findings?: string
  anomalies_detected?: boolean
  auditor_id?: string
  created: string
}

export const getIncidents = () =>
  pb.collection('security_incidents').getFullList<SecurityIncident>({ sort: '-created' })
export const createIncident = (data: Partial<SecurityIncident>) =>
  pb.collection('security_incidents').create(data)
export const updateIncident = (id: string, data: Partial<SecurityIncident>) =>
  pb.collection('security_incidents').update(id, data)

export const getProtocols = () =>
  pb.collection('security_protocols').getFullList<SecurityProtocol>({ sort: 'name' })
export const updateProtocol = (id: string, data: Partial<SecurityProtocol>) =>
  pb.collection('security_protocols').update(id, data)

export const getAccessLogs = () =>
  pb.collection('security_access_logs').getFullList<SecurityAccessLog>({ sort: '-timestamp' })
export const createAccessLog = (data: Partial<SecurityAccessLog>) =>
  pb.collection('security_access_logs').create(data)

export const getAudits = () =>
  pb.collection('security_audits').getFullList<SecurityAudit>({ sort: '-created' })
export const createAudit = (data: Partial<SecurityAudit>) =>
  pb.collection('security_audits').create(data)
