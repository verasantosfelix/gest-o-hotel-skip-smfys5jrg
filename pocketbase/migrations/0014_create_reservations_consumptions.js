migrate(
  (app) => {
    const reservations = new Collection({
      name: 'reservations',
      type: 'base',
      listRule: "@request.auth.id != ''",
      viewRule: "@request.auth.id != ''",
      createRule: "@request.auth.id != ''",
      updateRule: "@request.auth.id != ''",
      deleteRule: "@request.auth.id != ''",
      fields: [
        { name: 'guest_name', type: 'text', required: true },
        {
          name: 'room_id',
          type: 'relation',
          required: false,
          collectionId: app.findCollectionByNameOrId('rooms').id,
          maxSelect: 1,
          cascadeDelete: false,
        },
        { name: 'check_in', type: 'text', required: true },
        { name: 'check_out', type: 'text', required: true },
        {
          name: 'status',
          type: 'select',
          required: true,
          values: ['previsto', 'in_house', 'checked_out', 'cancelado', 'no_show'],
        },
        { name: 'is_vip', type: 'bool', required: false },
        { name: 'balance', type: 'number', required: false },
        {
          name: 'document_digitalization',
          type: 'file',
          required: false,
          maxSelect: 1,
          maxSize: 5242880,
        },
        { name: 'created', type: 'autodate', onCreate: true, onUpdate: false },
        { name: 'updated', type: 'autodate', onCreate: true, onUpdate: true },
      ],
    })
    app.save(reservations)

    const consumptions = new Collection({
      name: 'consumptions',
      type: 'base',
      listRule: "@request.auth.id != ''",
      viewRule: "@request.auth.id != ''",
      createRule: "@request.auth.id != ''",
      updateRule: "@request.auth.id != ''",
      deleteRule: "@request.auth.id != ''",
      fields: [
        {
          name: 'reservation_id',
          type: 'relation',
          required: true,
          collectionId: reservations.id,
          maxSelect: 1,
          cascadeDelete: true,
        },
        {
          name: 'type',
          type: 'select',
          required: true,
          values: [
            'minibar',
            'spa',
            'restaurante',
            'lavandaria',
            'room_service',
            'estacionamento',
            'transfer',
            'taxas',
          ],
        },
        { name: 'amount', type: 'number', required: true },
        { name: 'description', type: 'text', required: false },
        { name: 'created', type: 'autodate', onCreate: true, onUpdate: false },
        { name: 'updated', type: 'autodate', onCreate: true, onUpdate: true },
      ],
    })
    app.save(consumptions)
  },
  (app) => {
    try {
      app.delete(app.findCollectionByNameOrId('consumptions'))
    } catch (_) {}
    try {
      app.delete(app.findCollectionByNameOrId('reservations'))
    } catch (_) {}
  },
)
