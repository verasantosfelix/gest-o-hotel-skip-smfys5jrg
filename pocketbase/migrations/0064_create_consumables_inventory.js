migrate(
  (app) => {
    const collection = new Collection({
      name: 'consumables_inventory',
      type: 'base',
      listRule: "@request.auth.id != ''",
      viewRule: "@request.auth.id != ''",
      createRule: "@request.auth.id != ''",
      updateRule: "@request.auth.id != ''",
      deleteRule: "@request.auth.id != ''",
      fields: [
        { name: 'item_name', type: 'text', required: true },
        { name: 'category', type: 'select', required: true, values: ['minibar', 'hygiene'] },
        { name: 'stock_quantity', type: 'number', required: true },
        { name: 'unit_price', type: 'number', required: true },
        { name: 'min_threshold', type: 'number' },
        { name: 'created', type: 'autodate', onCreate: true, onUpdate: false },
        { name: 'updated', type: 'autodate', onCreate: true, onUpdate: true },
      ],
    })
    app.save(collection)
  },
  (app) => {
    const collection = app.findCollectionByNameOrId('consumables_inventory')
    app.delete(collection)
  },
)
