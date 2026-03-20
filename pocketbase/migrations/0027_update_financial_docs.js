migrate(
  (app) => {
    const col = app.findCollectionByNameOrId('financial_docs')

    if (!col.fields.getByName('category')) {
      col.fields.add(
        new SelectField({ name: 'category', values: ['A/R', 'A/P', 'Other'], maxSelect: 1 }),
      )
    }
    if (!col.fields.getByName('issue_date')) {
      col.fields.add(new TextField({ name: 'issue_date' }))
    }
    if (!col.fields.getByName('notes')) {
      col.fields.add(new TextField({ name: 'notes' }))
    }
    if (!col.fields.getByName('document')) {
      col.fields.add(new FileField({ name: 'document', maxSelect: 1, maxSize: 5242880 }))
    }

    app.save(col)
  },
  (app) => {
    const col = app.findCollectionByNameOrId('financial_docs')
    col.fields.removeByName('category')
    col.fields.removeByName('issue_date')
    col.fields.removeByName('notes')
    col.fields.removeByName('document')
    app.save(col)
  },
)
