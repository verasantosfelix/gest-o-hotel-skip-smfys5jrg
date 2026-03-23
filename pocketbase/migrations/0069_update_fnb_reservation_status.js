migrate(
  (app) => {
    const col = app.findCollectionByNameOrId('fb_reservations_fnb')
    const field = col.fields.getByName('status')
    field.values = ['pending', 'confirmed', 'arrived', 'cancelled', 'no_show']
    app.save(col)
  },
  (app) => {
    const col = app.findCollectionByNameOrId('fb_reservations_fnb')
    const field = col.fields.getByName('status')
    field.values = ['confirmed', 'arrived', 'cancelled', 'no_show']
    app.save(col)
  },
)
