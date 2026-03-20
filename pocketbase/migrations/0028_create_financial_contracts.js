migrate(
  (app) => {
    const collection = new Collection({
      name: 'financial_contracts',
      type: 'base',
      listRule: "@request.auth.id != ''",
      viewRule: "@request.auth.id != ''",
      createRule: "@request.auth.id != ''",
      updateRule: "@request.auth.id != ''",
      deleteRule: "@request.auth.id != ''",
      fields: [
        { name: 'name', type: 'text', required: true },
        {
          name: 'type',
          type: 'select',
          required: true,
          values: ['corporate', 'supplier', 'service'],
          maxSelect: 1,
        },
        { name: 'entity_name', type: 'text', required: true },
        { name: 'start_date', type: 'text', required: true },
        { name: 'end_date', type: 'text', required: true },
        { name: 'value', type: 'number' },
        { name: 'currency', type: 'text' },
        {
          name: 'status',
          type: 'select',
          values: ['active', 'expired', 'terminated'],
          maxSelect: 1,
        },
        { name: 'document', type: 'file', maxSelect: 1, maxSize: 5242880 },
        { name: 'created', type: 'autodate', onCreate: true, onUpdate: false },
        { name: 'updated', type: 'autodate', onCreate: true, onUpdate: true },
      ],
    })
    app.save(collection)
  },
  (app) => {
    const collection = app.findCollectionByNameOrId('financial_contracts')
    app.delete(collection)
  },
)
