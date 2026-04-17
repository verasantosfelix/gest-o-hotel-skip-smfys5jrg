migrate(
  (app) => {
    const col = app.findCollectionByNameOrId('_pb_users_auth_')

    if (!col.fields.getByName('first_login_completed')) {
      col.fields.add(new BoolField({ name: 'first_login_completed' }))
      app.save(col)
    }

    // Update existing records to default false
    app
      .db()
      .newQuery('UPDATE users SET first_login_completed = 0 WHERE first_login_completed IS NULL')
      .execute()
  },
  (app) => {
    const col = app.findCollectionByNameOrId('_pb_users_auth_')

    if (col.fields.getByName('first_login_completed')) {
      col.fields.removeByName('first_login_completed')
      app.save(col)
    }
  },
)
