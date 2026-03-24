migrate(
  (app) => {
    const presetsCollection = new Collection({
      name: 'fb_layout_presets',
      type: 'base',
      listRule: "@request.auth.id != ''",
      viewRule: "@request.auth.id != ''",
      createRule: "@request.auth.id != ''",
      updateRule: "@request.auth.id != ''",
      deleteRule: "@request.auth.id != ''",
      fields: [
        { name: 'name', type: 'text', required: true },
        { name: 'description', type: 'text' },
        { name: 'is_active', type: 'bool' },
        { name: 'created', type: 'autodate', onCreate: true, onUpdate: false },
        { name: 'updated', type: 'autodate', onCreate: true, onUpdate: true },
      ],
    })
    app.save(presetsCollection)

    const elementsCollection = new Collection({
      name: 'fb_layout_elements',
      type: 'base',
      listRule: "@request.auth.id != ''",
      viewRule: "@request.auth.id != ''",
      createRule: "@request.auth.id != ''",
      updateRule: "@request.auth.id != ''",
      deleteRule: "@request.auth.id != ''",
      fields: [
        { name: 'name', type: 'text' },
        { name: 'label', type: 'text' },
        {
          name: 'type',
          type: 'select',
          required: true,
          values: ['wall', 'door', 'window', 'column', 'bar', 'counter', 'area', 'staircase'],
        },
        { name: 'pos_x', type: 'number', required: true },
        { name: 'pos_y', type: 'number', required: true },
        { name: 'width', type: 'number', required: true },
        { name: 'height', type: 'number', required: true },
        { name: 'rotation', type: 'number' },
        {
          name: 'preset_id',
          type: 'relation',
          required: true,
          collectionId: presetsCollection.id,
          cascadeDelete: true,
          maxSelect: 1,
        },
        { name: 'created', type: 'autodate', onCreate: true, onUpdate: false },
        { name: 'updated', type: 'autodate', onCreate: true, onUpdate: true },
      ],
    })
    app.save(elementsCollection)

    const tablesCollection = app.findCollectionByNameOrId('fb_tables')
    if (!tablesCollection.fields.getByName('preset_id')) {
      tablesCollection.fields.add(
        new RelationField({
          name: 'preset_id',
          collectionId: presetsCollection.id,
          cascadeDelete: false,
          maxSelect: 1,
        }),
      )
      app.save(tablesCollection)
    }
  },
  (app) => {
    const tablesCollection = app.findCollectionByNameOrId('fb_tables')
    if (tablesCollection.fields.getByName('preset_id')) {
      tablesCollection.fields.removeByName('preset_id')
      app.save(tablesCollection)
    }

    try {
      const elementsCollection = app.findCollectionByNameOrId('fb_layout_elements')
      app.delete(elementsCollection)
    } catch (err) {
      // ignore
    }

    try {
      const presetsCollection = app.findCollectionByNameOrId('fb_layout_presets')
      app.delete(presetsCollection)
    } catch (err) {
      // ignore
    }
  },
)
