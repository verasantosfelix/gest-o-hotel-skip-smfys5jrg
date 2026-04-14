migrate(
  (app) => {
    const collection = new Collection({
      name: 'room_type_configs',
      type: 'base',
      listRule: "@request.auth.id != ''",
      viewRule: "@request.auth.id != ''",
      createRule: null,
      updateRule: "@request.auth.id != ''",
      deleteRule: null,
      fields: [
        { name: 'name', type: 'text', required: true },
        { name: 'base_price', type: 'number' },
        { name: 'created', type: 'autodate', onCreate: true, onUpdate: false },
        { name: 'updated', type: 'autodate', onCreate: true, onUpdate: true },
      ],
      indexes: ['CREATE UNIQUE INDEX idx_room_type_configs_name ON room_type_configs (name)'],
    })
    app.save(collection)

    const typologies = [
      'Single',
      'Duplo/Casal',
      'Casal',
      'Especial',
      'Quádruplo',
      'Vivenda T1',
      'Vivenda T2',
    ]

    typologies.forEach((name) => {
      const record = new Record(collection)
      record.set('name', name)
      record.set('base_price', 0)
      app.save(record)
    })
  },
  (app) => {
    const collection = app.findCollectionByNameOrId('room_type_configs')
    app.delete(collection)
  },
)
