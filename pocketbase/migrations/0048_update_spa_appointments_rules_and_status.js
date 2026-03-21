migrate(
  (app) => {
    const col = app.findCollectionByNameOrId('spa_appointments')
    const statusField = col.fields.getByName('status')

    // Add pending_approval to the allowed values
    statusField.values = [
      'scheduled',
      'checked_in',
      'in_progress',
      'completed',
      'cancelled',
      'pending_approval',
    ]

    // Use a simple, supported auth rule instead of complex body parsing
    col.updateRule = "@request.auth.id != ''"

    app.save(col)
  },
  (app) => {
    const col = app.findCollectionByNameOrId('spa_appointments')
    const statusField = col.fields.getByName('status')

    // Revert back
    statusField.values = ['scheduled', 'checked_in', 'in_progress', 'completed', 'cancelled']

    col.updateRule = "@request.auth.id != ''"

    app.save(col)
  },
)
