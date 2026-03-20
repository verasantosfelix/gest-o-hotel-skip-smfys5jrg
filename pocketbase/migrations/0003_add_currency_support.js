migrate(
  (app) => {
    const finCol = app.findCollectionByNameOrId('financial_docs')
    if (!finCol.fields.getByName('currency')) {
      finCol.fields.add(new TextField({ name: 'currency' }))
    }
    app.save(finCol)

    const budgetCol = app.findCollectionByNameOrId('budget_entries')
    if (!budgetCol.fields.getByName('currency')) {
      budgetCol.fields.add(new TextField({ name: 'currency' }))
    }
    app.save(budgetCol)

    app
      .db()
      .newQuery(
        "UPDATE financial_docs SET currency = 'AOA' WHERE currency IS NULL OR currency = ''",
      )
      .execute()
    app
      .db()
      .newQuery(
        "UPDATE budget_entries SET currency = 'AOA' WHERE currency IS NULL OR currency = ''",
      )
      .execute()
  },
  (app) => {
    const finCol = app.findCollectionByNameOrId('financial_docs')
    if (finCol.fields.getByName('currency')) {
      finCol.fields.removeByName('currency')
      app.save(finCol)
    }

    const budgetCol = app.findCollectionByNameOrId('budget_entries')
    if (budgetCol.fields.getByName('currency')) {
      budgetCol.fields.removeByName('currency')
      app.save(budgetCol)
    }
  },
)
