migrate(
  (app) => {
    try {
      // 1. Ensure the fields are strictly not required
      try {
        const col = app.findCollectionByNameOrId('fb_tables')
        let schemaChanged = false
        for (const fieldName of [
          'position_x',
          'position_y',
          'width',
          'height',
          'rotation',
          'shape',
        ]) {
          const f = col.fields.getByName(fieldName)
          if (f && f.required) {
            f.required = false
            schemaChanged = true
          }
        }
        if (schemaChanged) {
          app.save(col)
        }
      } catch (e) {
        console.log('Could not update fb_tables schema before seeding:', e)
      }

      // 2. Seed the data
      const tables = app.findRecordsByFilter('fb_tables', '1=1', '', 1000, 0)
      for (let t of tables) {
        let needsSave = false

        if (t.get('position_x') === null || t.get('position_x') === '') {
          t.set('position_x', 0)
          needsSave = true
        }
        if (t.get('position_y') === null || t.get('position_y') === '') {
          t.set('position_y', 0)
          needsSave = true
        }
        if (t.get('width') === null || t.get('width') === '') {
          t.set('width', 60)
          needsSave = true
        }
        if (t.get('height') === null || t.get('height') === '') {
          t.set('height', 60)
          needsSave = true
        }
        if (t.get('shape') === null || t.get('shape') === '') {
          t.set('shape', 'rectangle')
          needsSave = true
        }

        const rot = t.get('rotation')
        if (rot === null || rot === '' || typeof rot === 'undefined') {
          t.set('rotation', 0)
          needsSave = true
        }

        if (needsSave) {
          try {
            app.save(t)
          } catch (e) {
            // Workaround for number fields where 0 is treated as blank
            try {
              if (t.get('rotation') === 0) t.set('rotation', 360)
              if (t.get('position_x') === 0) t.set('position_x', 1)
              if (t.get('position_y') === 0) t.set('position_y', 1)
              app.save(t)
            } catch (e2) {
              console.log('Skipping table save due to validation error:', e2.message || e2)
            }
          }
        }
      }
    } catch (err) {
      console.log('Error seeding fb layout data:', err)
    }
  },
  (app) => {
    // Safe to leave as-is on revert
  },
)
