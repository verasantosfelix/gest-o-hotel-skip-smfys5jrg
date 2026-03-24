migrate(
  (app) => {
    try {
      const tables = app.findRecordsByFilter('fb_tables', '1=1', '', 1000, 0)
      for (let t of tables) {
        if (t.get('position_x') === null || t.get('position_x') === '') t.set('position_x', 0)
        if (t.get('position_y') === null || t.get('position_y') === '') t.set('position_y', 0)
        if (t.get('width') === null || t.get('width') === '') t.set('width', 60)
        if (t.get('height') === null || t.get('height') === '') t.set('height', 60)
        if (t.get('shape') === null || t.get('shape') === '') t.set('shape', 'rectangle')

        const rot = t.get('rotation')
        if (rot === null || rot === '' || typeof rot === 'undefined') {
          t.set('rotation', 0)
        }

        app.save(t)
      }
    } catch (err) {
      console.log('Error seeding fb layout data:', err)
    }
  },
  (app) => {
    // Safe to leave as-is on revert
  },
)
