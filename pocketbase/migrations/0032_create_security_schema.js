migrate(
  (app) => {
    const inc = new Collection({
      name: 'security_incidents',
      type: 'base',
      listRule: "@request.auth.id != ''",
      viewRule: "@request.auth.id != ''",
      createRule: "@request.auth.id != ''",
      updateRule: "@request.auth.id != ''",
      deleteRule: "@request.auth.id != ''",
      fields: [
        { name: 'type', type: 'text', required: true },
        { name: 'location', type: 'text', required: true },
        { name: 'date_time', type: 'text', required: true },
        { name: 'involved', type: 'text' },
        { name: 'origin', type: 'text' },
        { name: 'description', type: 'text', required: true },
        { name: 'category', type: 'text', required: true },
        {
          name: 'status',
          type: 'select',
          values: ['pending', 'investigation', 'resolved', 'closed'],
          required: true,
        },
        { name: 'intervention_details', type: 'text' },
        { name: 'area_isolated', type: 'bool' },
        { name: 'management_notified', type: 'bool' },
        { name: 'resolution', type: 'text' },
        { name: 'preventive_measures', type: 'text' },
        { name: 'created', type: 'autodate', onCreate: true, onUpdate: false },
        { name: 'updated', type: 'autodate', onCreate: true, onUpdate: true },
      ],
    })
    app.save(inc)

    const prot = new Collection({
      name: 'security_protocols',
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
          values: ['emergency', 'fire', 'first_aid', 'security', 'loss'],
          required: true,
        },
        { name: 'steps', type: 'json' },
        { name: 'is_active', type: 'bool' },
        { name: 'created', type: 'autodate', onCreate: true, onUpdate: false },
        { name: 'updated', type: 'autodate', onCreate: true, onUpdate: true },
      ],
    })
    app.save(prot)

    inc.fields.add(
      new RelationField({
        name: 'protocol_id',
        collectionId: prot.id,
        maxSelect: 1,
      }),
    )
    app.save(inc)

    const users = app.findCollectionByNameOrId('users')

    const acc = new Collection({
      name: 'security_access_logs',
      type: 'base',
      listRule: "@request.auth.id != ''",
      viewRule: "@request.auth.id != ''",
      createRule: "@request.auth.id != ''",
      updateRule: "@request.auth.id != ''",
      deleteRule: "@request.auth.id != ''",
      fields: [
        { name: 'user_id', type: 'relation', collectionId: users.id, maxSelect: 1 },
        { name: 'staff_name', type: 'text' },
        { name: 'location', type: 'text', required: true },
        {
          name: 'access_type',
          type: 'select',
          values: ['authorized', 'denied', 'bypass'],
          required: true,
        },
        {
          name: 'device_source',
          type: 'select',
          values: ['keycard', 'elevator', 'biometric'],
          required: true,
        },
        { name: 'timestamp', type: 'text', required: true },
        { name: 'created', type: 'autodate', onCreate: true, onUpdate: false },
        { name: 'updated', type: 'autodate', onCreate: true, onUpdate: true },
      ],
    })
    app.save(acc)

    const aud = new Collection({
      name: 'security_audits',
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
          values: ['shift', 'compliance', 'equipment'],
          required: true,
        },
        { name: 'findings', type: 'text' },
        { name: 'anomalies_detected', type: 'bool' },
        { name: 'auditor_id', type: 'relation', collectionId: users.id, maxSelect: 1 },
        { name: 'created', type: 'autodate', onCreate: true, onUpdate: false },
        { name: 'updated', type: 'autodate', onCreate: true, onUpdate: true },
      ],
    })
    app.save(aud)
  },
  (app) => {
    app.delete(app.findCollectionByNameOrId('security_audits'))
    app.delete(app.findCollectionByNameOrId('security_access_logs'))
    app.delete(app.findCollectionByNameOrId('security_incidents'))
    app.delete(app.findCollectionByNameOrId('security_protocols'))
  },
)
