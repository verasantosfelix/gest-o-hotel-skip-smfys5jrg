onRecordAfterUpdateSuccess((e) => {
  const record = e.record
  const original = e.record.originalCopy()

  if (record.get('status') === 'checked_out' && original.get('status') !== 'checked_out') {
    const guestName = record.get('guest_name')
    const balance = record.get('balance') || 0
    const earnedPoints = Math.floor(balance / 10)

    if (earnedPoints > 0 && guestName) {
      try {
        const loyalty = $app.findFirstRecordByData('guest_loyalty', 'guest_name', guestName)
        let currentPoints = loyalty.get('points') || 0
        currentPoints += earnedPoints

        let tier = 'Silver'
        if (currentPoints > 500 && currentPoints <= 1500) {
          tier = 'Gold'
        } else if (currentPoints > 1500) {
          tier = 'Platinum'
        }

        loyalty.set('points', currentPoints)
        loyalty.set('tier', tier)
        $app.save(loyalty)
      } catch (err) {
        console.log('Guest loyalty record not found, points not updated for:', guestName)
      }
    }
  }

  e.next()
}, 'reservations')
