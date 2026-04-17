migrate(
  (app) => {
    const users = app.findCollectionByNameOrId('_pb_users_auth_')

    // Idempotent: skip if user already exists
    try {
      app.findAuthRecordByEmail('_pb_users_auth_', 'verasantos.cql@gmail.com')
      return // already seeded
    } catch (_) {}

    const record = new Record(users)
    record.setEmail('verasantos.cql@gmail.com')
    record.setPassword('Skip@Pass')
    record.setVerified(true)

    record.set('name', 'Vera Santos')
    record.set('role', 'manager')
    record.set('is_active', true)
    record.set('employee_number', 'EMP001')
    record.set('phone', '+351910000000')

    // Link to a profile with role_level "Gerente_Geral" if it exists
    try {
      const profile = app.findFirstRecordByData('profiles', 'role_level', 'Gerente_Geral')
      if (profile) {
        record.set('profile', profile.id)
      }
    } catch (_) {
      console.log("Could not find a 'Gerente_Geral' profile to link. Skipping profile association.")
    }

    app.save(record)
  },
  (app) => {
    try {
      const record = app.findAuthRecordByEmail('_pb_users_auth_', 'verasantos.cql@gmail.com')
      app.delete(record)
    } catch (_) {}
  },
)
