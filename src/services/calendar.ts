import pb from '@/lib/pocketbase/client'

export interface CalendarEvent {
  id: string
  title: string
  description: string
  start_date: string
  end_date: string
  type: 'task' | 'training' | 'blockout' | 'maintenance' | 'urgent'
  sector: string
  created?: string
  updated?: string
}

export const getCalendarEvents = async (sector: string) => {
  return pb.collection('calendar_events').getFullList<CalendarEvent>({
    filter: pb.filter('sector = {:sector}', { sector }),
    sort: '-start_date',
  })
}

export const createCalendarEvent = async (data: Partial<CalendarEvent>) => {
  return pb.collection('calendar_events').create<CalendarEvent>(data)
}
