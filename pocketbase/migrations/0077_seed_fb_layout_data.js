migrate(
  (app) => {
    const elementsCol = app.findCollectionByNameOrId('fb_layout_elements')
    const presetsCol = app.findCollectionByNameOrId('fb_layout_presets')

    let preset
    try {
      preset = app.findFirstRecordByData('fb_layout_presets', 'name', 'Layout Geral')
    } catch (err) {
      preset = new Record(presetsCol)
      preset.set('name', 'Layout Geral')
      preset.set('is_active', true)
      app.save(preset)
    }

    const existing = app.findRecordsByFilter('fb_layout_elements', '1=1', '', 1, 0)
    if (existing.length === 0) {
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
    }

    // Ensure all layout elements have a valid rotation to avoid "cannot be blank" errors
    try {
      const allElements = app.findRecordsByFilter('fb_layout_elements', '1=1', '', 1000, 0)
      for (let i = 0; i < allElements.length; i++) {
        const el = allElements[i]
        if (
          el.get('rotation') === null ||
          el.get('rotation') === undefined ||
          el.get('rotation') === ''
        ) {
          el.set('rotation', 0)
          app.save(el)
        }
      }
    } catch (err) {
      // Ignore if no elements
    }

    // Ensure all tables have a valid rotation to avoid "cannot be blank" errors
    try {
      const tables = app.findRecordsByFilter('fb_tables', '1=1', '', 1000, 0)
      for (let i = 0; i < tables.length; i++) {
        const table = tables[i]
        if (
          table.get('rotation') === null ||
          table.get('rotation') === undefined ||
          table.get('rotation') === ''
        ) {
          table.set('rotation', 0)
          app.save(table)
        }
      }
    } catch (err) {
      // Ignore if no tables
    }
  },
  (app) => {
    // Revert not required
  },
)
