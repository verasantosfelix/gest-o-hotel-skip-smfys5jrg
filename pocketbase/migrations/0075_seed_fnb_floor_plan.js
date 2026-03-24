migrate(
  (app) => {
    // Create default preset
    const presetsCol = app.findCollectionByNameOrId('fb_layout_presets')
    const preset = new Record(presetsCol)
    preset.set('name', 'Layout Geral')
    preset.set('description', 'Layout principal padrão do restaurante')
    preset.set('is_active', true)
    app.save(preset)

    // Assign all existing tables to the new preset and set default grid positions
    const tables = app.findRecordsByFilter('fb_tables', '1=1', '+table_number', 1000, 0)
    for (let i = 0; i < tables.length; i++) {
      const t = tables[i]
      t.set('preset_id', preset.id)

      // Give tables a default position if they don't have one
      if (!t.get('pos_x') || t.get('pos_x') === 0) {
        const col = i % 5
        const row = Math.floor(i / 5)
        t.set('pos_x', 150 + col * 120)
        t.set('pos_y', 150 + row * 120)
        t.set('width', 80)
        t.set('height', 80)
        t.set('rotation', 0)
      }
      app.save(t)
    }

    // Add demo structural elements
    const elementsCol = app.findCollectionByNameOrId('fb_layout_elements')

    const door = new Record(elementsCol)
    door.set('type', 'door')
    door.set('label', 'Entrada Principal')
    door.set('pos_x', 350)
    door.set('pos_y', 50)
    door.set('width', 120)
    door.set('height', 20)
    door.set('rotation', 0)
    door.set('preset_id', preset.id)
    app.save(door)

    const bar = new Record(elementsCol)
    bar.set('type', 'counter')
    bar.set('label', 'Bar e Drinks')
    bar.set('pos_x', 50)
    bar.set('pos_y', 300)
    bar.set('width', 80)
    bar.set('height', 250)
    bar.set('rotation', 0)
    bar.set('preset_id', preset.id)
    app.save(bar)

    const kitchen = new Record(elementsCol)
    kitchen.set('type', 'wall')
    kitchen.set('label', 'Acesso Cozinha')
    kitchen.set('pos_x', 50)
    kitchen.set('pos_y', 50)
    kitchen.set('width', 250)
    kitchen.set('height', 20)
    kitchen.set('rotation', 0)
    kitchen.set('preset_id', preset.id)
    app.save(kitchen)
  },
  (app) => {
    // Reverting seed data is automatically handled when the collection is deleted in the 0074 down migration.
  },
)
