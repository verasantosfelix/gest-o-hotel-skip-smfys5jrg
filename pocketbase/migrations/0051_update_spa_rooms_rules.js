migrate(
  (app) => {
    const col = app.findCollectionByNameOrId('spa_rooms')
    if (col) {
      const rule = "@request.auth.id != '' && @request.auth.profile.name != 'Front_Desk'"
      col.listRule = rule
      col.viewRule = rule
      col.createRule = rule
      col.updateRule = rule
      col.deleteRule = rule
      app.save(col)
    }
  },
  (app) => {
    const col = app.findCollectionByNameOrId('spa_rooms')
    if (col) {
      const oldRule = "@request.auth.id != ''"
      col.listRule = oldRule
      col.viewRule = oldRule
      col.createRule = oldRule
      col.updateRule = oldRule
      col.deleteRule = oldRule
      app.save(col)
    }
  },
)
