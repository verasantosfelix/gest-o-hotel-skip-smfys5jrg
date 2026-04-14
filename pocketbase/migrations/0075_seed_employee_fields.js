migrate(
  (app) => {
    try {
      const user = app.findAuthRecordByEmail('users', 'verasantos.cql@gmail.com')
      user.set('employee_number', 'EMP001')
      user.set('phone', '912345678')
      app.save(user)
    } catch (err) {
      console.log('Seed user not found, skipping.')
    }
  },
  (app) => {
    try {
      const user = app.findAuthRecordByEmail('users', 'verasantos.cql@gmail.com')
      user.set('employee_number', '')
      user.set('phone', '')
      app.save(user)
    } catch (err) {
      console.log('Seed user not found, skipping.')
    }
  },
)
