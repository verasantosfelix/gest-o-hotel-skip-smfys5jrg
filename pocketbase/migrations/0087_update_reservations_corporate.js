migrate(
  (app) => {
    const collection = app.findCollectionByNameOrId('reservations')

    if (!collection.fields.getByName('additional_guests')) {
      collection.fields.add(
        new RelationField({
          name: 'additional_guests',
          type: 'relation',
          collectionId: app.findCollectionByNameOrId('guest_loyalty').id,
          cascadeDelete: false,
          maxSelect: 999,
        }),
      )
    }

    app.save(collection)
  },
  (app) => {
    const collection = app.findCollectionByNameOrId('reservations')
    if (collection.fields.getByName('additional_guests')) {
      collection.fields.removeByName('additional_guests')
    }
    app.save(collection)
  },
)
