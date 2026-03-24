migrate(
  (app) => {
    const presetCol = app.findCollectionByNameOrId('fb_layout_presets')
    const presetRecord = new Record(presetCol)
    presetRecord.set('name', 'Configuração Base')
    presetRecord.set('is_active', true)
    app.save(presetRecord)

    const tablesCol = app.findCollectionByNameOrId('fb_tables')
    const tables = app.findRecordsByFilter(tablesCol.id, '1=1', '', 1000, 0)
    for (const table of tables) {
      table.set('preset_id', presetRecord.id)
      app.save(table)
    }

    const elementsCol = app.findCollectionByNameOrId('fb_layout_elements')
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
    const presetCol = app.findCollectionByNameOrId('fb_layout_presets')
    const presets = app.findRecordsByFilter(presetCol.id, "name = 'Configuração Base'", '', 1, 0)
    if (presets.length > 0) {
      app.delete(presets[0])
    }
  },
)
