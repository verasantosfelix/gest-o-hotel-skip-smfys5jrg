migrate(
  (app) => {
    const col = new Collection({
      name: 'spa_inventory',
      type: 'base',
      listRule: "@request.auth.id != ''",
      viewRule: "@request.auth.id != ''",
      createRule: "@request.auth.id != ''",
      updateRule: "@request.auth.id != ''",
      deleteRule: "@request.auth.id != ''",
      fields: [
        { name: 'item_name', type: 'text', required: true },
        { name: 'quantity', type: 'number', required: true },
        { name: 'unit', type: 'text', required: true },
        { name: 'min_threshold', type: 'number', required: true },
        { name: 'created', type: 'autodate', onCreate: true },
        { name: 'updated', type: 'autodate', onCreate: true, onUpdate: true },
      ],
    })
    app.save(col)
  },
  (app) => {
    const col = app.findCollectionByNameOrId('spa_inventory')
    app.delete(col)
  },
)
