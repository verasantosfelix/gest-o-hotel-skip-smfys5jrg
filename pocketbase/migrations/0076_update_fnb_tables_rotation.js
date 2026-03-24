migrate(
  (app) => {
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

    // Ensure all tables have a valid rotation
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
