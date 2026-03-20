migrate(
  (app) => {
    const collections = [
      new Collection({
        name: 'fb_tables',
        type: 'base',
        listRule: "@request.auth.id != ''",
        viewRule: "@request.auth.id != ''",
        createRule: "@request.auth.id != ''",
        updateRule: "@request.auth.id != ''",
        deleteRule: "@request.auth.id != ''",
        fields: [
          { name: 'table_number', type: 'text', required: true },
          {
            name: 'status',
            type: 'select',
            required: true,
            values: ['free', 'occupied', 'reserved'],
          },
          { name: 'capacity', type: 'number', required: true },
          { name: 'created', type: 'autodate', onCreate: true, onUpdate: false },
          { name: 'updated', type: 'autodate', onCreate: true, onUpdate: true },
        ],
      }),
      new Collection({
        name: 'fb_products',
        type: 'base',
        listRule: "@request.auth.id != ''",
        viewRule: "@request.auth.id != ''",
        createRule: "@request.auth.id != ''",
        updateRule: "@request.auth.id != ''",
        deleteRule: "@request.auth.id != ''",
        fields: [
          { name: 'name', type: 'text', required: true },
          { name: 'category', type: 'text', required: true },
          { name: 'price', type: 'number', required: true },
          { name: 'is_available', type: 'bool' },
          { name: 'created', type: 'autodate', onCreate: true, onUpdate: false },
          { name: 'updated', type: 'autodate', onCreate: true, onUpdate: true },
        ],
      }),
    ]
    collections.forEach((c) => app.save(c))

    const resFnb = new Collection({
      name: 'fb_reservations_fnb',
      type: 'base',
      listRule: "@request.auth.id != ''",
      viewRule: "@request.auth.id != ''",
      createRule: "@request.auth.id != ''",
      updateRule: "@request.auth.id != ''",
      deleteRule: "@request.auth.id != ''",
      fields: [
        { name: 'guest_name', type: 'text', required: true },
        { name: 'people_count', type: 'number', required: true },
        { name: 'reservation_time', type: 'text', required: true },
        {
          name: 'table_id',
          type: 'relation',
          collectionId: app.findCollectionByNameOrId('fb_tables').id,
          maxSelect: 1,
        },
        {
          name: 'status',
          type: 'select',
          required: true,
          values: ['confirmed', 'arrived', 'cancelled', 'no_show'],
        },
        { name: 'notes', type: 'text' },
        { name: 'created', type: 'autodate', onCreate: true, onUpdate: false },
        { name: 'updated', type: 'autodate', onCreate: true, onUpdate: true },
      ],
    })
    app.save(resFnb)

    const fbOrders = new Collection({
      name: 'fb_orders',
      type: 'base',
      listRule: "@request.auth.id != ''",
      viewRule: "@request.auth.id != ''",
      createRule: "@request.auth.id != ''",
      updateRule: "@request.auth.id != ''",
      deleteRule: "@request.auth.id != ''",
      fields: [
        { name: 'type', type: 'select', required: true, values: ['table', 'room_service'] },
        {
          name: 'status',
          type: 'select',
          required: true,
          values: ['pending', 'preparing', 'ready', 'delivered', 'closed', 'cancelled'],
        },
        {
          name: 'table_id',
          type: 'relation',
          collectionId: app.findCollectionByNameOrId('fb_tables').id,
          maxSelect: 1,
        },
        {
          name: 'reservation_id',
          type: 'relation',
          collectionId: app.findCollectionByNameOrId('reservations').id,
          maxSelect: 1,
        },
        {
          name: 'room_id',
          type: 'relation',
          collectionId: app.findCollectionByNameOrId('rooms').id,
          maxSelect: 1,
        },
        { name: 'total_amount', type: 'number', required: true },
        { name: 'service_fee', type: 'number' },
        { name: 'created', type: 'autodate', onCreate: true, onUpdate: false },
        { name: 'updated', type: 'autodate', onCreate: true, onUpdate: true },
      ],
    })
    app.save(fbOrders)

    const fbOrderItems = new Collection({
      name: 'fb_order_items',
      type: 'base',
      listRule: "@request.auth.id != ''",
      viewRule: "@request.auth.id != ''",
      createRule: "@request.auth.id != ''",
      updateRule: "@request.auth.id != ''",
      deleteRule: "@request.auth.id != ''",
      fields: [
        {
          name: 'order_id',
          type: 'relation',
          collectionId: app.findCollectionByNameOrId('fb_orders').id,
          required: true,
          maxSelect: 1,
        },
        {
          name: 'product_id',
          type: 'relation',
          collectionId: app.findCollectionByNameOrId('fb_products').id,
          required: true,
          maxSelect: 1,
        },
        { name: 'quantity', type: 'number', required: true },
        { name: 'price_at_time', type: 'number', required: true },
        {
          name: 'status',
          type: 'select',
          required: true,
          values: ['pending', 'cooking', 'finished'],
        },
        { name: 'created', type: 'autodate', onCreate: true, onUpdate: false },
        { name: 'updated', type: 'autodate', onCreate: true, onUpdate: true },
      ],
    })
    app.save(fbOrderItems)
  },
  (app) => {
    ;['fb_order_items', 'fb_orders', 'fb_reservations_fnb', 'fb_products', 'fb_tables'].forEach(
      (name) => {
        try {
          app.delete(app.findCollectionByNameOrId(name))
        } catch (_) {}
      },
    )
  },
)
