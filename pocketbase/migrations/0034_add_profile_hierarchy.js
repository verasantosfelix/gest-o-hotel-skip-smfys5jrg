migrate(
  (app) => {
    const users = app.findCollectionByNameOrId('_pb_users_auth_')

    if (!users.fields.getByName('role')) {
      users.fields.add(
        new SelectField({
          name: 'role',
          values: ['manager', 'user'],
          maxSelect: 1,
          required: true,
        }),
      )
    }

    users.listRule = "@request.auth.id != ''"
    users.viewRule = "@request.auth.id != ''"
    users.updateRule = "@request.auth.id != ''"
    app.save(users)

    try {
      users.addIndex('idx_users_role', false, 'role', '')
      app.save(users)
    } catch (e) {
      console.log(e)
    }

    const profiles = app.findCollectionByNameOrId('profiles')
    if (!profiles.fields.getByName('manager_id')) {
      profiles.fields.add(
        new RelationField({
          name: 'manager_id',
          collectionId: users.id,
          maxSelect: 1,
          required: false,
        }),
      )
    }
    profiles.updateRule = "@request.auth.id != ''"
    app.save(profiles)

    try {
      profiles.addIndex('idx_profiles_manager', false, 'manager_id', '')
      app.save(profiles)
    } catch (e) {
      console.log(e)
    }

    const allUsers = app.findRecordsByFilter('_pb_users_auth_', '1=1', '', 1000, 0)
    for (let u of allUsers) {
      if (u.get('email') === 'verasantos.cql@gmail.com') {
        u.set('role', 'manager')
      } else {
        if (!u.get('role')) {
          u.set('role', 'user')
        }
      }
      app.saveNoValidate(u)
    }
  },
  (app) => {
    const users = app.findCollectionByNameOrId('_pb_users_auth_')
    try {
      users.removeIndex('idx_users_role')
    } catch (e) {}
    if (users.fields.getByName('role')) {
      users.fields.removeByName('role')
    }
    users.listRule = 'id = @request.auth.id'
    users.viewRule = 'id = @request.auth.id'
    users.updateRule = 'id = @request.auth.id'
    app.save(users)

    const profiles = app.findCollectionByNameOrId('profiles')
    try {
      profiles.removeIndex('idx_profiles_manager')
    } catch (e) {}
    if (profiles.fields.getByName('manager_id')) {
      profiles.fields.removeByName('manager_id')
    }
    profiles.updateRule = null
    app.save(profiles)
  },
)
