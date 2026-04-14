migrate(
  (app) => {
    // Update guest_loyalty
    const guests = app.findCollectionByNameOrId('guest_loyalty')

    if (!guests.fields.getByName('phone')) {
      guests.fields.add(new TextField({ name: 'phone' }))
    }
    if (!guests.fields.getByName('document_id')) {
      guests.fields.add(new TextField({ name: 'document_id' }))
    }
    app.save(guests)

    // Update reservations
    const reservations = app.findCollectionByNameOrId('reservations')
    if (!reservations.fields.getByName('guest_id')) {
      reservations.fields.add(
        new RelationField({
          name: 'guest_id',
          collectionId: guests.id,
          maxSelect: 1,
          cascadeDelete: false,
        }),
      )
    }
    if (!reservations.fields.getByName('total_value')) {
      reservations.fields.add(new NumberField({ name: 'total_value' }))
    }
    app.save(reservations)

    // Seed Data: Create a dummy guest and link existing reservations without a guest
    try {
      let guest
      try {
        guest = app.findFirstRecordByData('guest_loyalty', 'email', 'joao.silva@example.com')
      } catch (_) {
        guest = new Record(guests)
        guest.set('guest_name', 'João Silva')
        guest.set('email', 'joao.silva@example.com')
        guest.set('phone', '+55 11 99999-9999')
        guest.set('document_id', '123.456.789-00')
        guest.set('tier', 'Gold')
        app.save(guest)
      }

      app
        .db()
        .newQuery(`
        UPDATE reservations 
        SET 
          guest_id = {:guestId},
          total_value = CASE WHEN total_value IS NULL OR total_value = 0 THEN 1500.0 ELSE total_value END
        WHERE guest_id = '' OR guest_id IS NULL
      `)
        .bind({ guestId: guest.id })
        .execute()
    } catch (err) {
      console.log('Error seeding data:', err)
    }
  },
  (app) => {
    const guests = app.findCollectionByNameOrId('guest_loyalty')
    if (guests.fields.getByName('phone')) {
      guests.fields.removeByName('phone')
    }
    if (guests.fields.getByName('document_id')) {
      guests.fields.removeByName('document_id')
    }
    app.save(guests)

    const reservations = app.findCollectionByNameOrId('reservations')
    if (reservations.fields.getByName('guest_id')) {
      reservations.fields.removeByName('guest_id')
    }
    if (reservations.fields.getByName('total_value')) {
      reservations.fields.removeByName('total_value')
    }
    app.save(reservations)
  },
)
