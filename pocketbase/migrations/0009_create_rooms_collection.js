migrate(
  (app) => {
    const collection = new Collection({
      name: 'rooms',
      type: 'base',
      listRule: "@request.auth.id != ''",
      viewRule: "@request.auth.id != ''",
      createRule: "@request.auth.id != ''",
      updateRule: "@request.auth.id != ''",
      deleteRule: "@request.auth.id != ''",
      fields: [
        { name: 'room_number', type: 'text', required: true },
        { name: 'status', type: 'text', required: true },
        { name: 'maintenance_description', type: 'text' },
        { name: 'priority', type: 'text' },
        { name: 'floor', type: 'number', required: true },
        { name: 'created', type: 'autodate', onCreate: true, onUpdate: false },
        { name: 'updated', type: 'autodate', onCreate: true, onUpdate: true },
      ],
      indexes: ['CREATE UNIQUE INDEX idx_rooms_number ON rooms (room_number)'],
    })
    app.save(collection)
  },
  (app) => {
    const collection = app.findCollectionByNameOrId('rooms')
    app.delete(collection)
  },
)
