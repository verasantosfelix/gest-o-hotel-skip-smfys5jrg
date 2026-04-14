onRecordCreate((e) => {
  const roomType = e.record.getString('room_type')
  if (!roomType) return e.next()

  try {
    const config = $app.findFirstRecordByData('room_type_configs', 'name', roomType)
    const basePrice = config.getFloat('base_price')

    if (e.record.getFloat('base_rate') === 0) {
      e.record.set('base_rate', basePrice)
    }
  } catch (err) {
    // Config not found or query failed, safely ignore
  }

  return e.next()
}, 'rooms')
