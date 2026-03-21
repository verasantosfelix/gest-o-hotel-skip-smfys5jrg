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

    // Update the API rules to restrict Front_Desk from modifying core scheduling fields
    // Front Desk can still update things like notes, but not room, status, service, therapist, or time.
    col.updateRule =
      "@request.auth.id != '' && (@request.auth.profile.name != 'Front_Desk' || (@request.body.spa_room_id:isset = false && @request.body.status:isset = false && @request.body.service_id:isset = false && @request.body.therapist_id:isset = false && @request.body.start_time:isset = false))"

    app.save(col)
  },
  (app) => {
    const col = app.findCollectionByNameOrId('spa_appointments')
    const statusField = col.fields.getByName('status')

    // Revert back
    statusField.values = ['scheduled', 'checked_in', 'in_progress', 'completed', 'cancelled']

    // Revert API rule
    col.updateRule = "@request.auth.id != '' && @request.auth.profile.name != 'Front_Desk'"

    app.save(col)
  },
)
