migrate(
  (app) => {
    const tickets = app.findCollectionByNameOrId('maintenance_tickets')

    tickets.fields.add(
      new RelationField({ name: 'technician_id', collectionId: '_pb_users_auth_', maxSelect: 1 }),
    )
    tickets.fields.add(new JSONField({ name: 'used_materials' }))
    tickets.fields.add(new FileField({ name: 'initial_photo', maxSelect: 1, maxSize: 5242880 }))
    tickets.fields.add(new FileField({ name: 'completion_photo', maxSelect: 1, maxSize: 5242880 }))
    tickets.fields.add(new TextField({ name: 'location_details' }))
    tickets.fields.add(new TextField({ name: 'response_start_at' }))
    tickets.fields.add(new TextField({ name: 'resolved_at' }))
    tickets.fields.add(new TextField({ name: 'problem_type' }))
    tickets.fields.add(new TextField({ name: 'origin' }))
    tickets.fields.add(new TextField({ name: 'planned_intervention' }))

    app.save(tickets)

    const assets = app.findCollectionByNameOrId('it_assets')
    assets.fields.add(new TextField({ name: 'next_maintenance_date' }))
    assets.fields.add(new TextField({ name: 'location' }))

    app.save(assets)
  },
  (app) => {
    const tickets = app.findCollectionByNameOrId('maintenance_tickets')
    tickets.fields.removeByName('technician_id')
    tickets.fields.removeByName('used_materials')
    tickets.fields.removeByName('initial_photo')
    tickets.fields.removeByName('completion_photo')
    tickets.fields.removeByName('location_details')
    tickets.fields.removeByName('response_start_at')
    tickets.fields.removeByName('resolved_at')
    tickets.fields.removeByName('problem_type')
    tickets.fields.removeByName('origin')
    tickets.fields.removeByName('planned_intervention')
    app.save(tickets)

    const assets = app.findCollectionByNameOrId('it_assets')
    assets.fields.removeByName('next_maintenance_date')
    assets.fields.removeByName('location')
    app.save(assets)
  },
)
