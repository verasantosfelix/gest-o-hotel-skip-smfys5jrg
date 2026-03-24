migrate(
  (app) => {
    const collection = new Collection({
      name: 'fb_layout_elements',
      type: 'base',
      listRule: "@request.auth.id != ''",
      viewRule: "@request.auth.id != ''",
      createRule: "@request.auth.id != ''",
      updateRule: "@request.auth.id != ''",
      deleteRule: "@request.auth.id != ''",
      fields: [
        {
          name: 'type',
          type: 'select',
          required: true,
          values: ['wall', 'column', 'counter', 'door', 'window', 'staircase'],
        },
        { name: 'label', type: 'text' },
        { name: 'pos_x', type: 'number', required: true },
        { name: 'pos_y', type: 'number', required: true },
        { name: 'width', type: 'number', required: true },
        { name: 'height', type: 'number', required: true },
        { name: 'rotation', type: 'number', required: true },
        {
          name: 'preset_id',
          type: 'relation',
          required: true,
          collectionId: app.findCollectionByNameOrId('fb_layout_presets').id,
          cascadeDelete: true,
          maxSelect: 1,
        },
        { name: 'created', type: 'autodate', onCreate: true, onUpdate: false },
        { name: 'updated', type: 'autodate', onCreate: true, onUpdate: true },
      ],
    })
    app.save(collection)
  },
  (app) => {
    const collection = app.findCollectionByNameOrId('fb_layout_elements')
    app.delete(collection)
  },
)
