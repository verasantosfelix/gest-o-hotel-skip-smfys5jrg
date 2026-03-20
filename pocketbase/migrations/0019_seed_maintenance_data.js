migrate(
  (app) => {
    const rooms = app.findRecordsByFilter('rooms', '1=1', '-created', 5, 0)
    let room1 = rooms.length > 0 ? rooms[0].id : null
    let room2 = rooms.length > 1 ? rooms[1].id : null

    if (room1) {
      const tickets = app.findCollectionByNameOrId('maintenance_tickets')
      const t1 = new Record(tickets)
      t1.set('room_id', room1)
      t1.set('description', 'Vazamento na pia do banheiro')
      t1.set('priority', 'urgent')
      t1.set('status', 'open')
      t1.set('location_details', 'Banheiro Principal')
      t1.set('problem_type', 'Hidráulica')
      t1.set('origin', 'Governança')
      app.save(t1)

      const t2 = new Record(tickets)
      t2.set('room_id', room2 || room1)
      t2.set('description', 'Ar condicionado não gela')
      t2.set('priority', 'high')
      t2.set('status', 'in_progress')
      t2.set('location_details', 'Quarto')
      t2.set('problem_type', 'Climatização')
      t2.set('origin', 'Recepção')
      t2.set('response_start_at', new Date().toISOString())
      app.save(t2)
    }

    const iot = app.findCollectionByNameOrId('iot_sensors')
    const s1 = new Record(iot)
    s1.set('name', 'Sensor Temp - Boiler A')
    s1.set('type', 'temperature')
    s1.set('current_value', 85)
    s1.set('threshold', 75)
    s1.set('status', 'alert')
    s1.set('unit', 'C')
    app.save(s1)

    const s2 = new Record(iot)
    s2.set('name', 'Sensor Vazamento - Casa Máquinas')
    s2.set('type', 'leak')
    s2.set('current_value', 1)
    s2.set('threshold', 1)
    s2.set('status', 'alert')
    s2.set('unit', 'bool')
    app.save(s2)

    const s3 = new Record(iot)
    s3.set('name', 'Quadro Energia Principal')
    s3.set('type', 'power')
    s3.set('current_value', 220)
    s3.set('threshold', 200)
    s3.set('status', 'normal')
    s3.set('unit', 'V')
    app.save(s3)

    const assets = app.findCollectionByNameOrId('it_assets')
    const a1 = new Record(assets)
    a1.set('name', 'Elevador Social 1')
    a1.set('type', 'Elevator')
    a1.set('serial', 'ELV-001')
    a1.set('status', 'online')
    a1.set('last_maintenance', '2023-10-01')
    a1.set('next_maintenance_date', '2024-04-01')
    a1.set('location', 'Lobby Principal')
    app.save(a1)

    const a2 = new Record(assets)
    a2.set('name', 'Bomba de Água Central')
    a2.set('type', 'Plumbing')
    a2.set('serial', 'BMB-302')
    a2.set('status', 'online')
    a2.set('last_maintenance', '2023-11-20')
    a2.set('next_maintenance_date', '2024-05-20')
    a2.set('location', 'Subsolo')
    app.save(a2)
  },
  (app) => {
    // Ignored for down
  },
)
