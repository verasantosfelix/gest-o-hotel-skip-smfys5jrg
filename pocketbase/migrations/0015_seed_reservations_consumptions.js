migrate(
  (app) => {
    const rooms = app.findRecordsByFilter('rooms', '', '', 10, 0)
    const reservationsCol = app.findCollectionByNameOrId('reservations')

    const today = new Date()
    const format = (d) => {
      const y = d.getFullYear()
      const m = String(d.getMonth() + 1).padStart(2, '0')
      const day = String(d.getDate()).padStart(2, '0')
      return `${y}-${m}-${day}`
    }

    const dToday = format(today)
    const dTomorrow = format(new Date(today.getTime() + 86400000))
    const dYesterday = format(new Date(today.getTime() - 86400000))

    const resData = [
      {
        guest_name: 'Alice Marques',
        room_id: rooms[0]?.id || '',
        check_in: dToday,
        check_out: dTomorrow,
        status: 'previsto',
        is_vip: true,
        balance: 0,
      },
      {
        guest_name: 'Bob Costa',
        room_id: rooms[1]?.id || '',
        check_in: dYesterday,
        check_out: dToday,
        status: 'in_house',
        is_vip: false,
        balance: 150,
      },
      {
        guest_name: 'Carlos Ferreira',
        room_id: rooms[2]?.id || '',
        check_in: dToday,
        check_out: new Date(today.getTime() + 86400000 * 3).toISOString().split('T')[0],
        status: 'previsto',
        is_vip: false,
        balance: 0,
      },
    ]

    for (const r of resData) {
      if (!r.room_id) continue
      const record = new Record(reservationsCol)
      for (const [key, value] of Object.entries(r)) {
        record.set(key, value)
      }
      app.save(record)
    }
  },
  (app) => {
    const recs = app.findRecordsByFilter('reservations', '1=1', '', 100, 0)
    for (const r of recs) {
      app.delete(r)
    }
  },
)
