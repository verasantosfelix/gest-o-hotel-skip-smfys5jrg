import pb from '@/lib/pocketbase/client'

export const getFbEvents = () => pb.collection('fb_events').getFullList()
// Dummy booking service for events
export const createEventBooking = async (eventId: string, details: any) => {
  console.log('Booked event:', eventId, details)
  return { success: true }
}
