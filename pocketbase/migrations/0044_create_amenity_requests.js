migrate(
  (app) => {
    const amenityRequests = new Collection({
      name: 'amenity_requests',
      type: 'base',
      listRule: "@request.auth.id != ''",
      viewRule: "@request.auth.id != ''",
      createRule: "@request.auth.id != ''",
      updateRule: "@request.auth.id != '' && @request.auth.profile.name != 'Front_Desk'",
      deleteRule: "@request.auth.id != '' && @request.auth.profile.name != 'Front_Desk'",
      fields: [
        {
          name: 'room_id',
          type: 'relation',
          required: true,
          collectionId: app.findCollectionByNameOrId('rooms').id,
          cascadeDelete: false,
          minSelect: 1,
          maxSelect: 1,
        },
        { name: 'guest_name', type: 'text', required: true },
        {
          name: 'item',
          type: 'select',
          required: true,
          values: [
            'sabonete',
            'shampoo',
            'condicionador',
            'gel_banho',
            'kit_dentes',
            'kit_barbeado',
            'kit_costura',
            'toalhas_extra',
            'albornoz',
            'pantufas',
            'kit_infantil',
            'chá / café',
            'água',
          ],
          maxSelect: 1,
        },
        { name: 'quantity', type: 'number', required: true, min: 1 },
        { name: 'description', type: 'text', required: false },
        {
          name: 'priority',
          type: 'select',
          required: true,
          values: ['normal', 'urgente'],
          maxSelect: 1,
        },
        {
          name: 'status',
          type: 'select',
          required: true,
          values: ['pending', 'in_transit', 'delivered'],
          maxSelect: 1,
        },
        { name: 'created', type: 'autodate', onCreate: true, onUpdate: false },
        { name: 'updated', type: 'autodate', onCreate: true, onUpdate: true },
      ],
    })
    app.save(amenityRequests)

    const updateProfileRule = (colName) => {
      try {
        const col = app.findCollectionByNameOrId(colName)
        col.updateRule = "@request.auth.id != '' && @request.auth.profile.name != 'Front_Desk'"
        col.deleteRule = "@request.auth.id != '' && @request.auth.profile.name != 'Front_Desk'"
        app.save(col)
      } catch (e) {}
    }

    updateProfileRule('fb_orders')
    updateProfileRule('laundry_logs')
    updateProfileRule('spa_appointments')
  },
  (app) => {
    try {
      const amenityRequests = app.findCollectionByNameOrId('amenity_requests')
      app.delete(amenityRequests)
    } catch (e) {}

    const revertProfileRule = (colName) => {
      try {
        const col = app.findCollectionByNameOrId(colName)
        col.updateRule = "@request.auth.id != ''"
        col.deleteRule = "@request.auth.id != ''"
        app.save(col)
      } catch (e) {}
    }

    revertProfileRule('fb_orders')
    revertProfileRule('laundry_logs')
    revertProfileRule('spa_appointments')
  },
)
