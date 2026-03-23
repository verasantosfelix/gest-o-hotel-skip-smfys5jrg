onRecordAfterCreateSuccess((e) => {
  const res = e.record

  try {
    let roomNumber = ''
    try {
      const room = $app.findRecordById('rooms', res.get('room_id'))
      roomNumber = room.get('room_number')
    } catch (er) {}

    let email = ''
    try {
      const guest = $app.findFirstRecordByData('guest_loyalty', 'guest_name', res.get('guest_name'))
      email = guest.get('email')
    } catch (er) {}

    if (email) {
      const template = $app.findFirstRecordByData(
        'email_templates',
        'slug',
        'reservation-confirmation',
      )
      let content = template.get('content')
      content = content.replace('{guest_name}', res.get('guest_name') || '')
      content = content.replace('{room_number}', roomNumber || '')
      content = content.replace('{check_in}', res.get('check_in') || '')
      content = content.replace('{check_out}', res.get('check_out') || '')
      content = content.replace('{total_amount}', res.get('balance') || '0')

      const subject = template.get('subject')

      const message = new MailerMessage({
        from: {
          address: $app.settings().meta.senderAddress || 'reservas@hotelskip.com',
          name: $app.settings().meta.senderName || 'Hotel SKIP',
        },
        to: [{ address: email }],
        subject: subject,
        html: content,
      })

      $app.newMailClient().send(message)

      try {
        const notifCol = $app.findCollectionByNameOrId('notifications')
        const users = $app.findRecordsByFilter('users', "role = 'manager'", '-created', 1, 0)
        if (users.length > 0) {
          const notif = new Record(notifCol)
          notif.set('recipient_id', users[0].id)
          notif.set('sender_id', users[0].id)
          notif.set('title', 'Email de Confirmação Enviado')
          notif.set(
            'message',
            `Email de confirmação enviado para ${res.get('guest_name')} (${email})`,
          )
          notif.set('type', 'info')
          notif.set('status', 'unread')
          notif.set('related_record_id', res.id)
          notif.set('link', '/reservas')
          $app.save(notif)
        }
      } catch (ne) {
        console.log('Error saving notif', ne)
      }
    }
  } catch (err) {
    console.log('Error in reservation created hook:', err)
  }

  e.next()
}, 'reservations')
