migrate(
  (app) => {
    // 1. Create presets collection
    const presetsCol = new Collection({
      id: 'fblayoutpresets',
      name: 'fb_layout_presets',
      type: 'base',
      listRule: "@request.auth.id != ''",
      viewRule: "@request.auth.id != ''",
      createRule: "@request.auth.id != ''",
      updateRule: "@request.auth.id != ''",
      deleteRule: "@request.auth.id != ''",
      fields: [
        { name: 'name', type: 'text', required: true },
        { name: 'is_active', type: 'bool' },
        { name: 'created', type: 'autodate', onCreate: true, onUpdate: false },
        { name: 'updated', type: 'autodate', onCreate: true, onUpdate: true },
      ],
    })
    app.save(presetsCol)

    // 2. Create elements collection
    const elementsCol = new Collection({
      id: 'fblayoutelement',
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
          collectionId: presetsCol.id,
          cascadeDelete: true,
          maxSelect: 1,
        },
        { name: 'created', type: 'autodate', onCreate: true, onUpdate: false },
        { name: 'updated', type: 'autodate', onCreate: true, onUpdate: true },
      ],
    })
    app.save(elementsCol)

    // 3. Update fb_tables relation
    const tablesCol = app.findCollectionByNameOrId('fb_tables')
    if (!tablesCol.fields.getByName('preset_id')) {
      tablesCol.fields.add(
        new RelationField({
          name: 'preset_id',
          collectionId: presetsCol.id,
          maxSelect: 1,
          cascadeDelete: true,
        }),
      )
      app.save(tablesCol)
    }

    // 4. Seed Data: Base Preset
    const presetRecord = new Record(presetsCol)
    presetRecord.set('name', 'Configuração Base')
    presetRecord.set('is_active', true)
    app.save(presetRecord)

    // 5. Link existing tables to preset and set defaults
    const tables = app.findRecordsByFilter(tablesCol.id, '1=1', '', 1000, 0)
    let defaultX = 50
    let defaultY = 50

    for (const table of tables) {
      table.set('preset_id', presetRecord.id)

      const rot = table.get('rotation')
      if (rot === null || rot === undefined || rot === '') table.set('rotation', 0)

      const w = table.get('width')
      if (w === null || w === undefined || w === '') table.set('width', 80)

      const h = table.get('height')
      if (h === null || h === undefined || h === '') table.set('height', 80)

      const px = table.get('pos_x')
      if (px === null || px === undefined || px === '') {
        table.set('pos_x', defaultX)
        defaultX += 100
        if (defaultX > 800) {
          defaultX = 50
          defaultY += 100
        }
      }

      const py = table.get('pos_y')
      if (py === null || py === undefined || py === '') table.set('pos_y', defaultY)

      app.save(table)
    }

    // 6. Seed Elements
    const el1 = new Record(elementsCol)
    el1.set('type', 'counter')
    el1.set('label', 'Balcão Principal')
    el1.set('pos_x', 100)
    el1.set('pos_y', 100)
    el1.set('width', 300)
    el1.set('height', 80)
    el1.set('rotation', 0)
    el1.set('preset_id', presetRecord.id)
    app.save(el1)

    const el2 = new Record(elementsCol)
    el2.set('type', 'wall')
    el2.set('label', 'Entrada')
    el2.set('pos_x', 10)
    el2.set('pos_y', 10)
    el2.set('width', 20)
    el2.set('height', 500)
    el2.set('rotation', 0)
    el2.set('preset_id', presetRecord.id)
    app.save(el2)
  },
  (app) => {
    try {
      app.delete(app.findCollectionByNameOrId('fb_layout_elements'))
    } catch (e) {}

    try {
      app.delete(app.findCollectionByNameOrId('fb_layout_presets'))
    } catch (e) {}

    try {
      const tablesCol = app.findCollectionByNameOrId('fb_tables')
      tablesCol.fields.removeByName('preset_id')
      app.save(tablesCol)
    } catch (e) {}
  },
)
