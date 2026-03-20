import pb from '@/lib/pocketbase/client'

export const getLeads = () => pb.collection('crm_leads').getFullList()
export const updateLeadStage = (id: string, stage: string) =>
  pb.collection('crm_leads').update(id, { stage })

export const getOtaConnections = () => pb.collection('ota_connections').getFullList()
