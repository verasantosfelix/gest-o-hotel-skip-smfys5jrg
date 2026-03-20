migrate(
  (app) => {
    const rooms = app.findCollectionByNameOrId('rooms')

    const seedData = [
      { room_number: '101', status: 'available', floor: 1 },
      { room_number: '102', status: 'occupied', floor: 1 },
      {
        room_number: '103',
        status: 'maintenance',
        floor: 1,
        maintenance_description: 'Leaking faucet in the bathroom, requires immediate attention.',
        priority: 'medium',
      },
      { room_number: '104', status: 'cleaning', floor: 1 },
      {
        room_number: '201',
        status: 'maintenance',
        floor: 2,
        maintenance_description: 'AC unit failure, guest complained about strange noises.',
        priority: 'high',
      },
      { room_number: '202', status: 'available', floor: 2 },
      {
        room_number: '203',
        status: 'maintenance',
        floor: 2,
        maintenance_description: 'Broken window latch, security risk.',
        priority: 'high',
      },
      { room_number: '204', status: 'occupied', floor: 2 },
      {
        room_number: '301',
        status: 'maintenance',
        floor: 3,
        maintenance_description: 'Flickering lights and faulty switch near the entrance.',
        priority: 'low',
      },
      { room_number: '302', status: 'out_of_order', floor: 3 },
    ]

    for (const data of seedData) {
      const record = new Record(rooms)
      for (const [key, value] of Object.entries(data)) {
        record.set(key, value)
      }
      app.save(record)
    }
  },
  (app) => {
    const records = app.findRecordsByFilter('rooms', '1=1', '', 100, 0)
    for (const r of records) {
      app.delete(r)
    }
  },
)
