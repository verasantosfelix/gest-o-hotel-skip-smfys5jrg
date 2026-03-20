migrate(
  (app) => {
    const users = app.findCollectionByNameOrId('users')
    if (!users.fields.getByName('profile')) {
      users.fields.add(
        new RelationField({
          name: 'profile',
          collectionId: app.findCollectionByNameOrId('profiles').id,
          maxSelect: 1,
          required: false,
        }),
      )
      app.save(users)
    }
  },
  (app) => {
    const users = app.findCollectionByNameOrId('users')
    if (users.fields.getByName('profile')) {
      users.fields.removeByName('profile')
      app.save(users)
    }
  },
)
