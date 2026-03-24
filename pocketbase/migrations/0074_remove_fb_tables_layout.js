migrate(
  (app) => {
    const col = app.findCollectionByNameOrId('fb_tables')

    if (col.fields.getByName('pos_x')) col.fields.removeByName('pos_x')
    if (col.fields.getByName('pos_y')) col.fields.removeByName('pos_y')
    if (col.fields.getByName('width')) col.fields.removeByName('width')
    if (col.fields.getByName('height')) col.fields.removeByName('height')
    if (col.fields.getByName('rotation')) col.fields.removeByName('rotation')

    app.save(col)
  },
  (app) => {
    const col = app.findCollectionByNameOrId('fb_tables')

    if (!col.fields.getByName('pos_x')) col.fields.add(new NumberField({ name: 'pos_x' }))
    if (!col.fields.getByName('pos_y')) col.fields.add(new NumberField({ name: 'pos_y' }))
    if (!col.fields.getByName('width')) col.fields.add(new NumberField({ name: 'width' }))
    if (!col.fields.getByName('height')) col.fields.add(new NumberField({ name: 'height' }))
    if (!col.fields.getByName('rotation')) col.fields.add(new NumberField({ name: 'rotation' }))

    app.save(col)
  },
)
