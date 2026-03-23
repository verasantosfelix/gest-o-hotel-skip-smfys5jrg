migrate(
  (app) => {
    const interactions = new Collection({
      name: 'guest_interactions',
      type: 'base',
      listRule: "@request.auth.id != ''",
      viewRule: "@request.auth.id != ''",
      createRule: "@request.auth.id != ''",
      updateRule: "@request.auth.id != ''",
      deleteRule:
        "@request.auth.role = 'manager' || @request.auth.profile.role_level = 'Administrativo_Geral' || @request.auth.profile.role_level = 'Gerente_Geral'",
      fields: [
        {
          name: 'guest_id',
          type: 'relation',
          required: true,
          collectionId: app.findCollectionByNameOrId('guest_loyalty').id,
          cascadeDelete: true,
          maxSelect: 1,
        },
        {
          name: 'type',
          type: 'select',
          required: true,
          values: ['note', 'preference', 'incident', 'interaction'],
        },
        { name: 'details', type: 'text', required: true },
        {
          name: 'staff_id',
          type: 'relation',
          required: true,
          collectionId: '_pb_users_auth_',
          maxSelect: 1,
        },
        { name: 'created', type: 'autodate', onCreate: true, onUpdate: false },
        { name: 'updated', type: 'autodate', onCreate: true, onUpdate: true },
      ],
      indexes: [
        'CREATE INDEX idx_guest_interactions_guest ON guest_interactions (guest_id)',
        'CREATE INDEX idx_guest_interactions_type ON guest_interactions (type)',
      ],
    })
    app.save(interactions)
  },
  (app) => {
    const col = app.findCollectionByNameOrId('guest_interactions')
    app.delete(col)
  },
)
