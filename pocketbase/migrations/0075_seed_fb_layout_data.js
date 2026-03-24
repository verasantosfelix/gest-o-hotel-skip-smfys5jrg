migrate(
  (app) => {
    const presetsCollection = app.findCollectionByNameOrId('fb_layout_presets')

    const preset = new Record(presetsCollection)
    preset.set('name', 'Padrão Salão')
    preset.set('is_active', true)
    app.save(preset)

    const elementsCollection = app.findCollectionByNameOrId('fb_layout_elements')

    const elements = [
      { type: 'wall', pos_x: 50, pos_y: 50, width: 400, height: 20, rotation: 0 },
      { type: 'wall', pos_x: 50, pos_y: 50, width: 20, height: 300, rotation: 0 },
      {
        type: 'counter',
        pos_x: 100,
        pos_y: 100,
        width: 200,
        height: 60,
        rotation: 0,
        label: 'Bar',
      },
    ]

    for (const data of elements) {
      const el = new Record(elementsCollection)
      el.set('type', data.type)
      el.set('pos_x', data.pos_x)
      el.set('pos_y', data.pos_y)
      el.set('width', data.width)
      el.set('height', data.height)
      el.set('rotation', data.rotation)
      if (data.label) el.set('label', data.label)
      el.set('preset_id', preset.id)
      app.save(el)
    }

    const tablesCollection = app.findCollectionByNameOrId('fb_tables')
    const tables = app.findRecordsByFilter('fb_tables', '1=1', '', 100, 0)

    let startX = 150
    let startY = 200
    for (let i = 0; i < tables.length; i++) {
      const t = tables[i]
      t.set('preset_id', preset.id)
      t.set('pos_x', startX + (i % 4) * 100)
      t.set('pos_y', startY + Math.floor(i / 4) * 100)
      t.set('width', 80)
      t.set('height', 80)
      t.set('rotation', 0) // Explicit 0 instead of leaving it blank
      app.save(t)
    }
  },
  (app) => {
    const presets = app.findRecordsByFilter('fb_layout_presets', "name='Padrão Salão'", '', 1, 0)
    if (presets.length > 0) {
      app.delete(presets[0])
    }
  },
)
