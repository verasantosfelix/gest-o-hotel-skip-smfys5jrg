migrate(
  (app) => {
    const staffDocuments = new Collection({
      name: 'staff_documents',
      type: 'base',
      listRule: "@request.auth.id != ''",
      viewRule: "@request.auth.id != ''",
      createRule: "@request.auth.id != '' && @request.auth.role = 'manager'",
      updateRule: "@request.auth.id != '' && @request.auth.role = 'manager'",
      deleteRule: "@request.auth.id != '' && @request.auth.role = 'manager'",
      fields: [
        {
          name: 'staff_id',
          type: 'relation',
          required: true,
          collectionId: '_pb_users_auth_',
          cascadeDelete: true,
          maxSelect: 1,
        },
        { name: 'title', type: 'text', required: true },
        { name: 'document_file', type: 'file', required: true, maxSelect: 1, maxSize: 10485760 },
        {
          name: 'category',
          type: 'select',
          required: true,
          values: ['contract', 'certificate', 'identification', 'training', 'other'],
          maxSelect: 1,
        },
        { name: 'created', type: 'autodate', onCreate: true, onUpdate: false },
        { name: 'updated', type: 'autodate', onCreate: true, onUpdate: true },
      ],
    })
    app.save(staffDocuments)

    try {
      staffDocuments.addIndex('idx_staff_documents_staff_id', false, 'staff_id', '')
      app.save(staffDocuments)
    } catch (e) {}
  },
  (app) => {
    try {
      const col = app.findCollectionByNameOrId('staff_documents')
      app.delete(col)
    } catch (e) {}
  },
)
