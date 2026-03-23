onRecordAfterUpdateSuccess((e) => {
  const newStatus = e.record.get('status')

  if (newStatus === 'checked_out') {
    const roomId = e.record.get('room_id')
    if (!roomId) return e.next()

    try {
      const existing = $app.findFirstRecordByFilter(
        'housekeeping_logs',
        "room_id = {:roomId} && type = 'checkout' && status = 'pending'",
        { roomId: roomId },
      )
      if (existing) return e.next()
    } catch (err) {
      // Not found, continue to create
    }

    try {
      const hkCol = $app.findCollectionByNameOrId('housekeeping_logs')
      const log = new Record(hkCol)
      log.set('room_id', roomId)
      log.set('type', 'checkout')
      log.set('status', 'pending')
      $app.save(log)

      const users = $app.findRecordsByFilter('users', "role = 'manager'", '-created', 5, 0)
      const notifCol = $app.findCollectionByNameOrId('notifications')

      const adminId = users.length > 0 ? users[0].id : e.record.get('id')

      for (const u of users) {
        const notif = new Record(notifCol)
        notif.set('recipient_id', u.id)
        notif.set('sender_id', adminId)
        notif.set('title', 'Limpeza de Check-out Necessária')
        notif.set('message', 'Um quarto foi liberado após check-out e requer limpeza imediata.')
        notif.set('type', 'urgent')
        notif.set('status', 'unread')
        notif.set('related_record_id', roomId)
        notif.set('link', '/governanca')
        $app.save(notif)
      }
    } catch (err) {
      console.log('Error creating housekeeping log or notification: ', err)
    }
  }

  e.next()
}, 'reservations')
