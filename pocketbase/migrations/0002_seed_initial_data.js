migrate(
  (app) => {
    const users = app.findCollectionByNameOrId('_pb_users_auth_')
    try {
      app.findAuthRecordByEmail('_pb_users_auth_', 'verasantos.cql@gmail.com')
    } catch (e) {
      const record = new Record(users)
      record.setEmail('verasantos.cql@gmail.com')
      record.setPassword('securepassword123')
      record.setVerified(true)
      app.save(record)
    }

    const lfCol = app.findCollectionByNameOrId('lost_found_items')
    const r1 = new Record(lfCol)
    r1.set('description', 'Relógio de Pulso Prata')
    r1.set('location', 'Piscina Principal')
    r1.set('status', 'Lost')
    r1.set('date_found', '2024-03-20')
    app.save(r1)

    const glCol = app.findCollectionByNameOrId('guest_loyalty')
    const r2 = new Record(glCol)
    r2.set('guest_name', 'João Silva')
    r2.set('email', 'joao@email.com')
    r2.set('points', 1500)
    r2.set('tier', 'Gold')
    app.save(r2)
  },
  (app) => {},
)
