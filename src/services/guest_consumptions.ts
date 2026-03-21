import pb from '@/lib/pocketbase/client'

export interface ConsolidatedData {
  fb: any[]
  cons: any[]
  spa: any[]
  amenities: any[]
  laundry: any[]
}

export const getConsolidatedReport = async (
  resId: string,
  roomId?: string,
  roomNumber?: string,
): Promise<ConsolidatedData> => {
  const [fb, cons, spa, amenities, laundry] = await Promise.all([
    pb
      .collection('fb_orders')
      .getFullList({ filter: `reservation_id = "${resId}"`, sort: '-created' })
      .catch(() => []),
    pb
      .collection('consumptions')
      .getFullList({ filter: `reservation_id = "${resId}"`, sort: '-created' })
      .catch(() => []),
    pb
      .collection('spa_appointments')
      .getFullList({
        filter: `hotel_reservation_id = "${resId}"`,
        expand: 'service_id',
        sort: '-start_time',
      })
      .catch(() => []),
    roomId.length > 0
      ? pb
          .collection('amenity_requests')
          .getFullList({ filter: `room_id = "${roomId}"`, sort: '-created' })
          .catch(() => [])
      : Promise.resolve([]),
    roomNumber
      ? pb
          .collection('laundry_logs')
          .getFullList({ filter: `location = "${roomNumber}"`, sort: '-created' })
          .catch(() => [])
      : Promise.resolve([]),
  ])

  return { fb, cons, spa, amenities, laundry }
}

export const getActiveReservations = () =>
  pb.collection('reservations').getFullList({
    filter: "status='in_house' || status='checked_out'",
    expand: 'room_id',
    sort: '-created',
  })
