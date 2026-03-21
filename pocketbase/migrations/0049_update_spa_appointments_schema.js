migrate(
  (app) => {
    const col = app.findCollectionByNameOrId('spa_appointments')
    col.fields.add(new TextField({ name: 'guest_phone' }))
    app.save(col)
  },
  (app) => {
    const col = app.findCollectionByNameOrId('spa_appointments')
    col.fields.removeByName('guest_phone')
    app.save(col)
  },
)
