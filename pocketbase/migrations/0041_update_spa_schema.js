migrate(
  (app) => {
    // 1. Update spa_services
    const spaServices = app.findCollectionByNameOrId('spa_services')
    spaServices.fields.add(
      new SelectField({
        name: 'status',
        values: ['draft', 'published'],
        required: false,
        maxSelect: 1,
      }),
    )
    spaServices.fields.add(
      new FileField({
        name: 'image',
        maxSelect: 1,
        maxSize: 5242880,
        mimeTypes: ['image/jpeg', 'image/png', 'image/webp'],
      }),
    )
    spaServices.fields.add(new NumberField({ name: 'version' }))
    spaServices.fields.add(new TextField({ name: 'description' }))
    spaServices.fields.add(new BoolField({ name: 'available' }))
    spaServices.fields.add(
      new RelationField({
        name: 'therapists',
        collectionId: '_pb_users_auth_',
        maxSelect: 99,
      }),
    )
    app.save(spaServices)

    // Set defaults for existing services
    app
      .db()
      .newQuery("UPDATE spa_services SET status = 'published', available = 1, version = 1")
      .execute()

    // 2. Update spa_appointments
    const appts = app.findCollectionByNameOrId('spa_appointments')
    appts.fields.add(new NumberField({ name: 'preparation_time_buffer' }))
    appts.addIndex('idx_spa_appts_start_therapist', false, 'start_time, therapist_id', '')
    app.save(appts)

    app.db().newQuery('UPDATE spa_appointments SET preparation_time_buffer = 15').execute()

    // 3. Update laundry_logs
    const laundry = app.findCollectionByNameOrId('laundry_logs')
    laundry.fields.add(new TextField({ name: 'location' }))
    laundry.fields.add(new SelectField({ name: 'urgency', values: ['normal', 'high'] }))
    app.save(laundry)

    app.db().newQuery("UPDATE laundry_logs SET urgency = 'normal', location = 'Geral'").execute()

    // 4. Update calendar_events to support therapist blockouts
    const cal = app.findCollectionByNameOrId('calendar_events')
    cal.fields.add(
      new RelationField({ name: 'user_id', collectionId: '_pb_users_auth_', maxSelect: 1 }),
    )
    app.save(cal)
  },
  (app) => {
    // Downgrade omitted for brevity
  },
)
