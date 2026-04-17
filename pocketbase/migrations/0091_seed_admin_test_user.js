migrate(
  (app) => {
    const users = app.findCollectionByNameOrId('_pb_users_auth_')

    // Idempotent: skip if user already exists
    try {
      app.findAuthRecordByEmail('_pb_users_auth_', 'admin@gmail.com')
      return // already seeded
    } catch (_) {}

    const record = new Record(users)
    record.setEmail('admin@gmail.com')
    record.setPassword('12345678')
    record.setVerified(true)
    record.set('name', 'Admin Test')
    record.set('role', 'manager')
    record.set('is_active', true)
    record.set('first_login_completed', false)

    try {
      const profiles = app.findRecordsByFilter(
        'profiles',
        "role_level = 'Gerente_Geral' || role_level = 'Administrativo_Geral'",
        '',
        1,
        0,
      )

      if (profiles.length > 0) {
        record.set('profile', profiles[0].id)
      } else {
        const profilesCol = app.findCollectionByNameOrId('profiles')
        const newProfile = new Record(profilesCol)
        newProfile.set('name', 'Admin Test Profile')
        newProfile.set('role_level', 'Gerente_Geral')
        newProfile.set('category', 'Direção')
        app.save(newProfile)
        record.set('profile', newProfile.id)
      }
    } catch (err) {
      console.log('Error assigning profile to test user:', err)
    }

    app.save(record)
  },
  (app) => {
    try {
      const record = app.findAuthRecordByEmail('_pb_users_auth_', 'admin@gmail.com')
      app.delete(record)
    } catch (_) {}
  },
)
