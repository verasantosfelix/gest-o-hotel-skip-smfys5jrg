migrate(
  (app) => {
    const rooms = app.findCollectionByNameOrId('rooms')
    rooms.fields.add(
      new SelectField({
        name: 'room_type',
        values: [
          'standard',
          'suite',
          'luxo',
          'Single',
          'Duplo/Casal',
          'Casal',
          'Especial',
          'Quádruplo',
          'Vivenda T1',
          'Vivenda T2',
        ],
        maxSelect: 1,
      }),
    )
    app.save(rooms)

    const reservations = app.findCollectionByNameOrId('reservations')
    if (!reservations.fields.getByName('guests_count')) {
      reservations.fields.add(new NumberField({ name: 'guests_count', min: 1 }))
      app.save(reservations)
    }
  },
  (app) => {
    const rooms = app.findCollectionByNameOrId('rooms')
    rooms.fields.add(
      new SelectField({
        name: 'room_type',
        values: ['standard', 'suite', 'luxo'],
        maxSelect: 1,
      }),
    )
    app.save(rooms)

    const reservations = app.findCollectionByNameOrId('reservations')
    const guestsCountField = reservations.fields.getByName('guests_count')
    if (guestsCountField) {
      reservations.fields.removeByName('guests_count')
      app.save(reservations)
    }
  },
)
