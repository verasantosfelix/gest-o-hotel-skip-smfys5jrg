migrate(
  (app) => {
    const col = app.findCollectionByNameOrId('rooms')

    if (!col.fields.getByName('discount_corporate')) {
      col.fields.add(new NumberField({ name: 'discount_corporate', min: 0, max: 100 }))
    }
    if (!col.fields.getByName('discount_group')) {
      col.fields.add(new NumberField({ name: 'discount_group', min: 0, max: 100 }))
    }
    if (!col.fields.getByName('discount_frequent')) {
      col.fields.add(new NumberField({ name: 'discount_frequent', min: 0, max: 100 }))
    }
    if (!col.fields.getByName('discount_custom')) {
      col.fields.add(new NumberField({ name: 'discount_custom', min: 0, max: 100 }))
    }

    app.save(col)
  },
  (app) => {
    const col = app.findCollectionByNameOrId('rooms')
    col.fields.removeByName('discount_corporate')
    col.fields.removeByName('discount_group')
    col.fields.removeByName('discount_frequent')
    col.fields.removeByName('discount_custom')
    app.save(col)
  },
)
