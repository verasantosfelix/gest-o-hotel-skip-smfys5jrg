migrate(
  (app) => {
    const auditLogs = new Collection({
      name: 'action_audit_logs',
      type: 'base',
      listRule: "@request.auth.id != ''",
      viewRule: "@request.auth.id != ''",
      createRule: "@request.auth.id != ''",
      updateRule: null,
      deleteRule: null,
      fields: [
        {
          name: 'user_id',
          type: 'relation',
          required: true,
          collectionId: '_pb_users_auth_',
          maxSelect: 1,
        },
        { name: 'action_type', type: 'text', required: true },
        { name: 'module', type: 'text', required: true },
        { name: 'details', type: 'json', required: false },
        { name: 'created', type: 'autodate', onCreate: true },
        { name: 'updated', type: 'autodate', onCreate: true, onUpdate: true },
      ],
    })
    app.save(auditLogs)

    const notifications = new Collection({
      name: 'notifications',
      type: 'base',
      listRule: "@request.auth.id != '' && recipient_id = @request.auth.id",
      viewRule: "@request.auth.id != '' && recipient_id = @request.auth.id",
      createRule: "@request.auth.id != ''",
      updateRule: "@request.auth.id != '' && recipient_id = @request.auth.id",
      deleteRule: "@request.auth.id != '' && recipient_id = @request.auth.id",
      fields: [
        {
          name: 'recipient_id',
          type: 'relation',
          required: true,
          collectionId: '_pb_users_auth_',
          maxSelect: 1,
        },
        {
          name: 'sender_id',
          type: 'relation',
          required: true,
          collectionId: '_pb_users_auth_',
          maxSelect: 1,
        },
        { name: 'title', type: 'text', required: true },
        { name: 'message', type: 'text', required: true },
        {
          name: 'type',
          type: 'select',
          required: true,
          values: ['info', 'approval_request', 'urgent'],
          maxSelect: 1,
        },
        {
          name: 'status',
          type: 'select',
          required: true,
          values: ['unread', 'read'],
          maxSelect: 1,
        },
        { name: 'related_record_id', type: 'text', required: false },
        { name: 'link', type: 'text', required: false },
        { name: 'created', type: 'autodate', onCreate: true },
        { name: 'updated', type: 'autodate', onCreate: true, onUpdate: true },
      ],
    })
    app.save(notifications)

    try {
      auditLogs.addIndex('idx_audit_logs_user', false, 'user_id', '')
      app.save(auditLogs)
    } catch (e) {}

    try {
      notifications.addIndex('idx_notif_recipient', false, 'recipient_id', '')
      app.save(notifications)
    } catch (e) {}
  },
  (app) => {
    try {
      const auditLogs = app.findCollectionByNameOrId('action_audit_logs')
      app.delete(auditLogs)
    } catch (e) {}
    try {
      const notifications = app.findCollectionByNameOrId('notifications')
      app.delete(notifications)
    } catch (e) {}
  },
)
