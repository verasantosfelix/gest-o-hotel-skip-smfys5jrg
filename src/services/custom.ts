import pb from '@/lib/pocketbase/client'
export const sendAIChat = (message: string) =>
  pb.send('/backend/v1/ai-chat', {
    method: 'POST',
    body: JSON.stringify({ message }),
    headers: { 'Content-Type': 'application/json' },
  })
export const completeNightAudit = () => pb.send('/backend/v1/night-audit', { method: 'POST' })
