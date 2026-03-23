onRecordAfterCreateSuccess((e) => {
  const record = e.record
  try {
    const guest = $app.findRecordById('guest_loyalty', record.get('guest_id'))
    guest.set('last_interaction_date', new Date().toISOString())
    $app.save(guest)
  } catch (err) {
    console.log('Failed to update last_interaction_date', err)
  }
  e.next()
}, 'guest_interactions')
