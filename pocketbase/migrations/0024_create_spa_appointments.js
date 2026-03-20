migrate(
  (app) => {
    const res = app.findCollectionByNameOrId('reservations')
    const rooms = app.findCollectionByNameOrId('spa_rooms')
    const svcs = app.findCollectionByNameOrId('spa_services')
    const users = app.findCollectionByNameOrId('users')

    const col = new Collection({
      name: 'spa_appointments',
      type: 'base',
      listRule: "@request.auth.id != ''",
      viewRule: "@request.auth.id != ''",
      createRule: "@request.auth.id != ''",
      updateRule: "@request.auth.id != ''",
      deleteRule: "@request.auth.id != ''",
      fields: [
        { name: 'guest_name', type: 'text', required: true },
        { name: 'hotel_reservation_id', type: 'relation', collectionId: res.id, maxSelect: 1 },
        { name: 'spa_room_id', type: 'relation', collectionId: rooms.id, maxSelect: 1 },
        { name: 'service_id', type: 'relation', collectionId: svcs.id, maxSelect: 1 },
        { name: 'therapist_id', type: 'relation', collectionId: users.id, maxSelect: 1 },
        { name: 'start_time', type: 'text', required: true },
        { name: 'end_time', type: 'text', required: true },
        {
          name: 'status',
          type: 'select',
          values: ['scheduled', 'checked_in', 'in_progress', 'completed', 'cancelled'],
          required: true,
        },
        { name: 'contraindications', type: 'text' },
        { name: 'notes', type: 'text' },
        { name: 'created', type: 'autodate', onCreate: true },
        { name: 'updated', type: 'autodate', onCreate: true, onUpdate: true },
      ],
    })
    app.save(col)
  },
  (app) => {
    const col = app.findCollectionByNameOrId('spa_appointments')
    app.delete(col)
  },
)
