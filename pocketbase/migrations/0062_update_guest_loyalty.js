migrate(
  (app) => {
    const col = app.findCollectionByNameOrId('guest_loyalty')

    if (!col.fields.getByName('company_name')) {
      col.fields.add(new TextField({ name: 'company_name' }))
    }

    if (!col.fields.getByName('vat_number')) {
      col.fields.add(new TextField({ name: 'vat_number' }))
    }

    app.save(col)
  },
  (app) => {
    const col = app.findCollectionByNameOrId('guest_loyalty')
    col.fields.removeByName('company_name')
    col.fields.removeByName('vat_number')
    app.save(col)
  },
)
