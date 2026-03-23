import pb from '@/lib/pocketbase/client'

export interface OTAConnection {
  id: string
  channel_name: string
  sync_status: string
  last_sync: string
  created: string
  updated: string
}

export const getOTAConnections = () =>
  pb.collection('ota_connections').getFullList<OTAConnection>({ sort: 'channel_name' })

export const syncOTAConnection = (channelId?: string) =>
  pb.send('/backend/v1/ota/sync', {
    method: 'POST',
    body: JSON.stringify({ channelId }),
    headers: { 'Content-Type': 'application/json' },
  })
