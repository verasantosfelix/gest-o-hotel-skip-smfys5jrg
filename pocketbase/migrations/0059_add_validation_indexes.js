migrate(
  (app) => {
    const reservations = app.findCollectionByNameOrId('reservations')
    reservations.addIndex('idx_res_availability', false, 'room_id, check_in, check_out', '')
    app.save(reservations)

    const rooms = app.findCollectionByNameOrId('rooms')
    rooms.addIndex('idx_rooms_status_validation', false, 'status', '')
    app.save(rooms)
  },
  (app) => {
    const reservations = app.findCollectionByNameOrId('reservations')
    reservations.removeIndex('idx_res_availability')
    app.save(reservations)

    const rooms = app.findCollectionByNameOrId('rooms')
    rooms.removeIndex('idx_rooms_status_validation')
    app.save(rooms)
  },
)
