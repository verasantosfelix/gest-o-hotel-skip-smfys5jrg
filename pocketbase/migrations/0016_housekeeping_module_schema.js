migrate(
  (app) => {
    const rooms = app.findCollectionByNameOrId('rooms')
    let changed = false

    if (!rooms.fields.getByName('assigned_staff')) {
      rooms.fields.add(
        new RelationField({
          name: 'assigned_staff',
          collectionId: '_pb_users_auth_',
          maxSelect: 1,
        }),
      )
      changed = true
    }
    if (!rooms.fields.getByName('housekeeping_priority')) {
      rooms.fields.add(
        new SelectField({
          name: 'housekeeping_priority',
          values: ['normal', 'vip', 'early_checkin', 'late_checkout'],
        }),
      )
      changed = true
    }
    if (!rooms.fields.getByName('room_type')) {
      rooms.fields.add(
        new SelectField({ name: 'room_type', values: ['standard', 'suite', 'luxo'] }),
      )
      changed = true
    }

    if (changed) app.save(rooms)

    if (!app.hasTable('maintenance_tickets')) {
      const mt = new Collection({
        name: 'maintenance_tickets',
        type: 'base',
        listRule: "@request.auth.id != ''",
        viewRule: "@request.auth.id != ''",
        createRule: "@request.auth.id != ''",
        updateRule: "@request.auth.id != ''",
        deleteRule: "@request.auth.id != ''",
        fields: [
          {
            name: 'room_id',
            type: 'relation',
            required: true,
            collectionId: rooms.id,
            maxSelect: 1,
          },
          { name: 'description', type: 'text', required: true },
          {
            name: 'priority',
            type: 'select',
            values: ['low', 'medium', 'high', 'urgent'],
            required: true,
          },
          {
            name: 'status',
            type: 'select',
            values: ['open', 'in_progress', 'resolved'],
            required: true,
          },
          { name: 'created', type: 'autodate', onCreate: true, onUpdate: false },
          { name: 'updated', type: 'autodate', onCreate: true, onUpdate: true },
        ],
      })
      app.save(mt)
    }

    if (!app.hasTable('housekeeping_logs')) {
      const hk = new Collection({
        name: 'housekeeping_logs',
        type: 'base',
        listRule: "@request.auth.id != ''",
        viewRule: "@request.auth.id != ''",
        createRule: "@request.auth.id != ''",
        updateRule: "@request.auth.id != ''",
        deleteRule: "@request.auth.id != ''",
        fields: [
          {
            name: 'room_id',
            type: 'relation',
            required: true,
            collectionId: rooms.id,
            maxSelect: 1,
          },
          {
            name: 'staff_id',
            type: 'relation',
            required: false,
            collectionId: '_pb_users_auth_',
            maxSelect: 1,
          },
          {
            name: 'type',
            type: 'select',
            values: ['checkout', 'stayover', 'deep_cleaning', 'vip'],
            required: true,
          },
          { name: 'checklist_progress', type: 'json', required: false },
          {
            name: 'status',
            type: 'select',
            values: ['pending', 'in_progress', 'completed'],
            required: true,
          },
          { name: 'started_at', type: 'text', required: false },
          { name: 'completed_at', type: 'text', required: false },
          { name: 'created', type: 'autodate', onCreate: true, onUpdate: false },
          { name: 'updated', type: 'autodate', onCreate: true, onUpdate: true },
        ],
      })
      app.save(hk)
    }
  },
  (app) => {
    try {
      app.delete(app.findCollectionByNameOrId('housekeeping_logs'))
    } catch (e) {}
    try {
      app.delete(app.findCollectionByNameOrId('maintenance_tickets'))
    } catch (e) {}
  },
)
