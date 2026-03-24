migrate(
  (app) => {
    try {
      const col = app.findCollectionByNameOrId('fb_tables')

      if (!col.fields.getByName('rotation')) {
        return // Fields not present, skip seeding
      }

      const tables = app.findRecordsByFilter('fb_tables', '1=1', '', 1000, 0)
      for (const table of tables) {
        if (!table.get('pos_x')) table.set('pos_x', 0)
        if (!table.get('pos_y')) table.set('pos_y', 0)
        if (!table.get('width')) table.set('width', 60)
        if (!table.get('height')) table.set('height', 60)

        const rot = table.get('rotation')
        if (rot === null || rot === '' || rot === undefined) {
          table.set('rotation', 0)
        }

        app.save(table)
      }
    } catch (e) {
      // Ignore error
    }
  },
  (app) => {},
)
