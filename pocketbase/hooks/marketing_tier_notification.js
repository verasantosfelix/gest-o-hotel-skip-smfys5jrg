onRecordAfterUpdateSuccess((e) => {
  const record = e.record
  const original = e.original

  if (record.get('tier') && record.get('tier') !== original.get('tier')) {
    if (record.get('marketing_consent') === true) {
      try {
        const notifCol = $app.findCollectionByNameOrId('notifications')
        const users = $app.findRecordsByFilter(
          'users',
          "role = 'manager' || profile.role_level = 'Administrativo_Geral'",
          '',
          5,
          0,
        )

        users.forEach((u) => {
          const notif = new Record(notifCol)
          notif.set('recipient_id', u.id)
          notif.set('sender_id', u.id)
          notif.set('title', 'Automação de Marketing Executada')
          notif.set(
            'message',
            `Email 'Tier Upgrade Welcome' simulado para ${record.get('guest_name')} (Nível: ${record.get('tier')}). Consentimento verificado.`,
          )
          notif.set('type', 'info')
          notif.set('status', 'unread')
          $app.save(notif)
        })
      } catch (err) {
        console.log('Failed to send marketing notification', err)
      }
    } else {
      console.log(
        `Marketing consent denied for ${record.get('guest_name')}. Skipping tier upgrade email.`,
      )
    }
  }
  e.next()
}, 'guest_loyalty')
