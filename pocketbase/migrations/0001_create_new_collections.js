migrate(
  (app) => {
    const collections = [
      new Collection({
        name: 'laundry_logs',
        type: 'base',
        listRule: "@request.auth.id != ''",
        viewRule: "@request.auth.id != ''",
        createRule: "@request.auth.id != ''",
        updateRule: "@request.auth.id != ''",
        deleteRule: "@request.auth.id != ''",
        fields: [
          { name: 'type', type: 'text', required: true },
          { name: 'item', type: 'text', required: true },
          { name: 'quantity', type: 'number', required: true },
          { name: 'status', type: 'text' },
          { name: 'staff_member', type: 'text' },
          { name: 'created', type: 'autodate', onCreate: true, onUpdate: false },
          { name: 'updated', type: 'autodate', onCreate: true, onUpdate: true },
        ],
      }),
      new Collection({
        name: 'lost_found_items',
        type: 'base',
        listRule: "@request.auth.id != ''",
        viewRule: "@request.auth.id != ''",
        createRule: "@request.auth.id != ''",
        updateRule: "@request.auth.id != ''",
        deleteRule: "@request.auth.id != ''",
        fields: [
          { name: 'description', type: 'text', required: true },
          { name: 'location', type: 'text', required: true },
          { name: 'date_found', type: 'text' },
          { name: 'status', type: 'text', required: true },
          { name: 'guest_data', type: 'text' },
          { name: 'created', type: 'autodate', onCreate: true, onUpdate: false },
          { name: 'updated', type: 'autodate', onCreate: true, onUpdate: true },
        ],
      }),
      new Collection({
        name: 'room_inventory',
        type: 'base',
        listRule: "@request.auth.id != ''",
        viewRule: "@request.auth.id != ''",
        createRule: "@request.auth.id != ''",
        updateRule: "@request.auth.id != ''",
        deleteRule: "@request.auth.id != ''",
        fields: [
          { name: 'room_number', type: 'text', required: true },
          { name: 'item_type', type: 'text', required: true },
          { name: 'item_name', type: 'text', required: true },
          { name: 'quantity', type: 'number', required: true },
          { name: 'created', type: 'autodate', onCreate: true, onUpdate: false },
          { name: 'updated', type: 'autodate', onCreate: true, onUpdate: true },
        ],
      }),
      new Collection({
        name: 'guest_loyalty',
        type: 'base',
        listRule: "@request.auth.id != ''",
        viewRule: "@request.auth.id != ''",
        createRule: "@request.auth.id != ''",
        updateRule: "@request.auth.id != ''",
        deleteRule: "@request.auth.id != ''",
        fields: [
          { name: 'guest_name', type: 'text', required: true },
          { name: 'email', type: 'text' },
          { name: 'points', type: 'number' },
          { name: 'tier', type: 'text' },
          { name: 'created', type: 'autodate', onCreate: true, onUpdate: false },
          { name: 'updated', type: 'autodate', onCreate: true, onUpdate: true },
        ],
      }),
      new Collection({
        name: 'feedback_reviews',
        type: 'base',
        listRule: "@request.auth.id != ''",
        viewRule: "@request.auth.id != ''",
        createRule: "@request.auth.id != ''",
        updateRule: "@request.auth.id != ''",
        deleteRule: "@request.auth.id != ''",
        fields: [
          { name: 'guest_name', type: 'text' },
          { name: 'rating', type: 'number' },
          { name: 'comments', type: 'text' },
          { name: 'polarity', type: 'text' },
          { name: 'created', type: 'autodate', onCreate: true, onUpdate: false },
          { name: 'updated', type: 'autodate', onCreate: true, onUpdate: true },
        ],
      }),
      new Collection({
        name: 'financial_docs',
        type: 'base',
        listRule: "@request.auth.id != ''",
        viewRule: "@request.auth.id != ''",
        createRule: "@request.auth.id != ''",
        updateRule: "@request.auth.id != ''",
        deleteRule: "@request.auth.id != ''",
        fields: [
          { name: 'doc_type', type: 'text', required: true },
          { name: 'amount', type: 'number', required: true },
          { name: 'due_date', type: 'text' },
          { name: 'status', type: 'text' },
          { name: 'entity_name', type: 'text' },
          { name: 'created', type: 'autodate', onCreate: true, onUpdate: false },
          { name: 'updated', type: 'autodate', onCreate: true, onUpdate: true },
        ],
      }),
      new Collection({
        name: 'budget_entries',
        type: 'base',
        listRule: "@request.auth.id != ''",
        viewRule: "@request.auth.id != ''",
        createRule: "@request.auth.id != ''",
        updateRule: "@request.auth.id != ''",
        deleteRule: "@request.auth.id != ''",
        fields: [
          { name: 'year', type: 'number', required: true },
          { name: 'cost_center', type: 'text', required: true },
          { name: 'category', type: 'text', required: true },
          { name: 'amount', type: 'number', required: true },
          { name: 'created', type: 'autodate', onCreate: true, onUpdate: false },
          { name: 'updated', type: 'autodate', onCreate: true, onUpdate: true },
        ],
      }),
    ]

    for (const c of collections) {
      app.save(c)
    }
  },
  (app) => {
    const names = [
      'laundry_logs',
      'lost_found_items',
      'room_inventory',
      'guest_loyalty',
      'feedback_reviews',
      'financial_docs',
      'budget_entries',
    ]
    for (const name of names) {
      try {
        app.delete(app.findCollectionByNameOrId(name))
      } catch (e) {}
    }
  },
)
