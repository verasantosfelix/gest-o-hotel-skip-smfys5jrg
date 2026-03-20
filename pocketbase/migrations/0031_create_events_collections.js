migrate(
  (app) => {
    const spaces = new Collection({
      name: 'event_spaces',
      type: 'base',
      listRule: "@request.auth.id != ''",
      viewRule: "@request.auth.id != ''",
      createRule: "@request.auth.id != ''",
      updateRule: "@request.auth.id != ''",
      deleteRule: "@request.auth.id != ''",
      fields: [
        { name: 'name', type: 'text', required: true },
        {
          name: 'type',
          type: 'select',
          values: ['meeting_room', 'ballroom', 'garden', 'rooftop'],
          required: true,
        },
        { name: 'capacity_formats', type: 'json' },
        {
          name: 'status',
          type: 'select',
          values: ['available', 'occupied', 'setup', 'maintenance'],
          required: true,
        },
        { name: 'current_layout', type: 'text' },
        { name: 'created', type: 'autodate', onCreate: true, onUpdate: false },
        { name: 'updated', type: 'autodate', onCreate: true, onUpdate: true },
      ],
    })
    app.save(spaces)

    const events = new Collection({
      name: 'events',
      type: 'base',
      listRule: "@request.auth.id != ''",
      viewRule: "@request.auth.id != ''",
      createRule: "@request.auth.id != ''",
      updateRule: "@request.auth.id != ''",
      deleteRule: "@request.auth.id != ''",
      fields: [
        { name: 'title', type: 'text', required: true },
        {
          name: 'type',
          type: 'select',
          values: ['corporate', 'wedding', 'social', 'conference'],
          required: true,
        },
        { name: 'client_name', type: 'text', required: true },
        { name: 'contact_info', type: 'text' },
        { name: 'start_time', type: 'text' },
        { name: 'end_time', type: 'text' },
        { name: 'space_id', type: 'relation', collectionId: spaces.id, maxSelect: 1 },
        {
          name: 'status',
          type: 'select',
          values: ['pending', 'preparation', 'ongoing', 'finished', 'cancelled'],
          required: true,
        },
        { name: 'participants_count', type: 'number' },
        { name: 'technical_requirements', type: 'json' },
        { name: 'catering_details', type: 'json' },
        { name: 'total_budget', type: 'number' },
        { name: 'contract_file', type: 'file', maxSelect: 1, maxSize: 5242880 },
        { name: 'created', type: 'autodate', onCreate: true, onUpdate: false },
        { name: 'updated', type: 'autodate', onCreate: true, onUpdate: true },
      ],
    })
    app.save(events)

    const consumptions = new Collection({
      name: 'event_consumptions',
      type: 'base',
      listRule: "@request.auth.id != ''",
      viewRule: "@request.auth.id != ''",
      createRule: "@request.auth.id != ''",
      updateRule: "@request.auth.id != ''",
      deleteRule: "@request.auth.id != ''",
      fields: [
        {
          name: 'event_id',
          type: 'relation',
          collectionId: events.id,
          maxSelect: 1,
          required: true,
        },
        { name: 'item_description', type: 'text', required: true },
        { name: 'quantity', type: 'number', required: true },
        { name: 'unit_price', type: 'number', required: true },
        {
          name: 'category',
          type: 'select',
          values: ['fb', 'equipment', 'staff', 'extra'],
          required: true,
        },
        { name: 'created', type: 'autodate', onCreate: true, onUpdate: false },
        { name: 'updated', type: 'autodate', onCreate: true, onUpdate: true },
      ],
    })
    app.save(consumptions)

    const space1 = new Record(spaces)
    space1.set('name', 'Grande Auditório')
    space1.set('type', 'ballroom')
    space1.set('capacity_formats', { theater: 300, banquet: 150 })
    space1.set('status', 'available')
    space1.set('current_layout', 'theater')
    app.save(space1)

    const space2 = new Record(spaces)
    space2.set('name', 'Sala de Conferências A')
    space2.set('type', 'meeting_room')
    space2.set('capacity_formats', { u_shape: 25, boardroom: 20 })
    space2.set('status', 'available')
    space2.set('current_layout', 'boardroom')
    app.save(space2)

    const space3 = new Record(spaces)
    space3.set('name', 'Jardim de Inverno')
    space3.set('type', 'garden')
    space3.set('capacity_formats', { cocktail: 100 })
    space3.set('status', 'setup')
    space3.set('current_layout', 'cocktail')
    app.save(space3)

    const evt1 = new Record(events)
    evt1.set('title', 'Tech Conference 2024')
    evt1.set('type', 'conference')
    evt1.set('client_name', 'Tech Corp Ltd')
    evt1.set('contact_info', 'events@techcorp.com')
    evt1.set('start_time', '2024-11-15T09:00:00Z')
    evt1.set('end_time', '2024-11-15T18:00:00Z')
    evt1.set('space_id', space1.id)
    evt1.set('status', 'preparation')
    evt1.set('participants_count', 250)
    evt1.set('technical_requirements', { projector: 2, mics: 4, translation: true })
    evt1.set('catering_details', { coffee_breaks: 2, lunch: 'buffet' })
    evt1.set('total_budget', 15000)
    app.save(evt1)

    const evt2 = new Record(events)
    evt2.set('title', 'Reunião de Conselho Q3')
    evt2.set('type', 'corporate')
    evt2.set('client_name', 'InvestBank')
    evt2.set('contact_info', 'board@investbank.com')
    evt2.set('start_time', '2024-10-20T10:00:00Z')
    evt2.set('end_time', '2024-10-20T13:00:00Z')
    evt2.set('space_id', space2.id)
    evt2.set('status', 'ongoing')
    evt2.set('participants_count', 15)
    evt2.set('technical_requirements', { screen: 1 })
    evt2.set('catering_details', { water: 'continuous', coffee: 'premium' })
    evt2.set('total_budget', 2000)
    app.save(evt2)
  },
  (app) => {
    try {
      app.delete(app.findCollectionByNameOrId('event_consumptions'))
      app.delete(app.findCollectionByNameOrId('events'))
      app.delete(app.findCollectionByNameOrId('event_spaces'))
    } catch (e) {}
  },
)
