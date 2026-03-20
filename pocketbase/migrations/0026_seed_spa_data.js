migrate(
  (app) => {
    // 1. Services
    const svcs = app.findCollectionByNameOrId('spa_services')
    const dataSvcs = [
      { name: 'Massagem Relaxante', duration_minutes: 60, price: 15000, category: 'Massagens' },
      { name: 'Tratamento Facial', duration_minutes: 45, price: 12000, category: 'Estética' },
      { name: 'Pedra Quente', duration_minutes: 90, price: 20000, category: 'Terapias' },
    ]
    dataSvcs.forEach((d) => {
      const r = new Record(svcs)
      r.set('name', d.name)
      r.set('duration_minutes', d.duration_minutes)
      r.set('price', d.price)
      r.set('category', d.category)
      app.save(r)
    })

    // 2. Rooms
    const rooms = app.findCollectionByNameOrId('spa_rooms')
    const dataRooms = ['Sala Zen', 'Suite Casal', 'Sala Oásis']
    dataRooms.forEach((name) => {
      const r = new Record(rooms)
      r.set('name', name)
      r.set('status', 'free')
      app.save(r)
    })

    // 3. Inventory
    const inv = app.findCollectionByNameOrId('spa_inventory')
    const dataInv = [
      { item_name: 'Óleo Essencial Lavanda', quantity: 5, unit: 'frascos', min_threshold: 10 },
      { item_name: 'Creme Hidratante Corporal', quantity: 20, unit: 'potes', min_threshold: 15 },
      { item_name: 'Toalhas Rosto SPA', quantity: 50, unit: 'unid', min_threshold: 30 },
    ]
    dataInv.forEach((d) => {
      const r = new Record(inv)
      r.set('item_name', d.item_name)
      r.set('quantity', d.quantity)
      r.set('unit', d.unit)
      r.set('min_threshold', d.min_threshold)
      app.save(r)
    })

    // 4. Sample Appointment (if relations available)
    try {
      const resList = app.findRecordsByFilter('reservations', "status='in_house'", '-created', 1, 0)
      const userList = app.findRecordsByFilter('users', '', '-created', 1, 0)
      const roomList = app.findRecordsByFilter('spa_rooms', '', '-created', 1, 0)
      const svcList = app.findRecordsByFilter('spa_services', '', '-created', 1, 0)

      if (resList.length > 0 && userList.length > 0 && roomList.length > 0 && svcList.length > 0) {
        const appts = app.findCollectionByNameOrId('spa_appointments')
        const a1 = new Record(appts)
        a1.set('guest_name', resList[0].getString('guest_name'))
        a1.set('hotel_reservation_id', resList[0].id)
        a1.set('spa_room_id', roomList[0].id)
        a1.set('service_id', svcList[0].id)
        a1.set('therapist_id', userList[0].id)
        const now = new Date()
        a1.set('start_time', now.toISOString().slice(0, 16))
        now.setHours(now.getHours() + 1)
        a1.set('end_time', now.toISOString().slice(0, 16))
        a1.set('status', 'scheduled')
        a1.set('contraindications', 'Alergia a amêndoas')
        app.save(a1)
      }
    } catch (e) {
      // Ignore seeding appointment if no relations found
    }
  },
  (app) => {},
)
