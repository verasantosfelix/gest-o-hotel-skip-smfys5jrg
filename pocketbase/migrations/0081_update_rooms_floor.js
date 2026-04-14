migrate(
  (app) => {
    const col = app.findCollectionByNameOrId('rooms')
    const field = col.fields.getByName('floor')
    if (field) {
      field.required = false
      app.save(col)
    }
  },
  (app) => {
    const col = app.findCollectionByNameOrId('rooms')
    const field = col.fields.getByName('floor')
    if (field) {
      field.required = true
      app.save(col)
    }
  },
)
