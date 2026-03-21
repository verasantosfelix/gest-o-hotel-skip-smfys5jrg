migrate(
  (app) => {
    const col = app.findCollectionByNameOrId('reservations')

    col.fields.add(
      new BoolField({
        name: 'is_corporate',
      }),
    )

    col.fields.add(
      new FileField({
        name: 'signature_file',
        maxSelect: 1,
        maxSize: 5242880,
        mimeTypes: ['image/png', 'image/jpeg', 'image/webp'],
      }),
    )

    app.save(col)

    // Seed data: Mark the first 'in_house' reservation as corporate for testing the new flow
    try {
      app
        .db()
        .newQuery("UPDATE reservations SET is_corporate = 1 WHERE status = 'in_house' LIMIT 1")
        .execute()
    } catch (e) {
      console.log('Failed to seed corporate reservation', e)
    }
  },
  (app) => {
    const col = app.findCollectionByNameOrId('reservations')
    col.fields.removeByName('is_corporate')
    col.fields.removeByName('signature_file')
    app.save(col)
  },
)
