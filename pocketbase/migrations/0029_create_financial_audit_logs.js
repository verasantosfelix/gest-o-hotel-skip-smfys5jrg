migrate(
  (app) => {
    const collection = new Collection({
      name: 'financial_audit_logs',
      type: 'base',
      listRule: "@request.auth.id != ''",
      viewRule: "@request.auth.id != ''",
      createRule: "@request.auth.id != ''",
      updateRule: "@request.auth.id != ''",
      deleteRule: "@request.auth.id != ''",
      fields: [
        { name: 'type', type: 'text' },
        { name: 'status', type: 'text' },
        { name: 'details', type: 'json' },
        { name: 'error_count', type: 'number' },
        { name: 'created', type: 'autodate', onCreate: true, onUpdate: false },
        { name: 'updated', type: 'autodate', onCreate: true, onUpdate: true },
      ],
    })
    app.save(collection)
  },
  (app) => {
    const collection = app.findCollectionByNameOrId('financial_audit_logs')
    app.delete(collection)
  },
)
