migrate(
  (app) => {
    const collection = app.findCollectionByNameOrId('profiles')

    if (!collection.fields.getByName('slug')) {
      collection.fields.add(
        new TextField({
          name: 'slug',
          required: false,
        }),
      )
    }

    if (!collection.fields.getByName('category')) {
      collection.fields.add(
        new SelectField({
          name: 'category',
          values: ['Operacionais', 'Managers', 'Administrativos', 'Direção', 'Especiais', 'Outros'],
          required: false,
        }),
      )
    }

    app.save(collection)

    try {
      app
        .db()
        .newQuery(
          "CREATE UNIQUE INDEX IF NOT EXISTS idx_profiles_slug ON profiles (slug) WHERE slug != ''",
        )
        .execute()
    } catch (e) {
      console.log('Index creation issue:', e.message)
    }
  },
  (app) => {
    const collection = app.findCollectionByNameOrId('profiles')
    if (collection.fields.getByName('slug')) collection.fields.removeByName('slug')
    if (collection.fields.getByName('category')) collection.fields.removeByName('category')
    app.save(collection)
  },
)
