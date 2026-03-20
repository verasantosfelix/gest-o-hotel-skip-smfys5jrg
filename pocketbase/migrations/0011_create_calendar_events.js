migrate(
  (app) => {
    const collection = new Collection({
      name: 'calendar_events',
      type: 'base',
      listRule: "@request.auth.id != ''",
      viewRule: "@request.auth.id != ''",
      createRule: "@request.auth.id != ''",
      updateRule: "@request.auth.id != ''",
      deleteRule: "@request.auth.id != ''",
      fields: [
        { name: 'title', type: 'text', required: true },
        { name: 'description', type: 'text', required: false },
        { name: 'start_date', type: 'text', required: true },
        { name: 'end_date', type: 'text', required: true },
        {
          name: 'type',
          type: 'select',
          values: ['task', 'training', 'blockout', 'maintenance', 'urgent'],
          maxSelect: 1,
          required: true,
        },
        { name: 'sector', type: 'text', required: true },
        { name: 'created', type: 'autodate', onCreate: true, onUpdate: false },
        { name: 'updated', type: 'autodate', onCreate: true, onUpdate: true },
      ],
      indexes: ['CREATE INDEX idx_calendar_events_sector ON calendar_events (sector)'],
    })
    app.save(collection)
  },
  (app) => {
    const collection = app.findCollectionByNameOrId('calendar_events')
    app.delete(collection)
  },
)
