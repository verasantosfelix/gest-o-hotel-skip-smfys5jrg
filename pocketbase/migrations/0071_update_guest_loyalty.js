migrate(
  (app) => {
    const col = app.findCollectionByNameOrId('guest_loyalty')

    if (!col.fields.getByName('marketing_consent')) {
      col.fields.add(new BoolField({ name: 'marketing_consent' }))
    }
    if (!col.fields.getByName('consent_signature')) {
      col.fields.add(
        new FileField({
          name: 'consent_signature',
          maxSelect: 1,
          maxSize: 5242880,
          mimeTypes: ['image/jpeg', 'image/png', 'image/svg+xml'],
        }),
      )
    }
    if (!col.fields.getByName('last_interaction_date')) {
      col.fields.add(new DateField({ name: 'last_interaction_date' }))
    }

    app.save(col)
  },
  (app) => {
    const col = app.findCollectionByNameOrId('guest_loyalty')

    col.fields.removeByName('marketing_consent')
    col.fields.removeByName('consent_signature')
    col.fields.removeByName('last_interaction_date')

    app.save(col)
  },
)
