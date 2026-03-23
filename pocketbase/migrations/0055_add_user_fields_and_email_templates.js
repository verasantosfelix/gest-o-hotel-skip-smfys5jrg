migrate(
  (app) => {
    const users = app.findCollectionByNameOrId('users')
    if (!users.fields.getByName('last_login')) {
      users.fields.add(new DateField({ name: 'last_login' }))
    }
    if (!users.fields.getByName('is_active')) {
      users.fields.add(new BoolField({ name: 'is_active' }))
    }
    app.save(users)

    // Set default is_active to true for existing users
    app.db().newQuery('UPDATE users SET is_active = 1').execute()

    const emailTemplates = new Collection({
      name: 'email_templates',
      type: 'base',
      listRule: "@request.auth.id != ''",
      viewRule: "@request.auth.id != ''",
      createRule: "@request.auth.role = 'manager'",
      updateRule: "@request.auth.role = 'manager'",
      deleteRule: "@request.auth.role = 'manager'",
      fields: [
        { name: 'name', type: 'text', required: true },
        { name: 'slug', type: 'text', required: true },
        { name: 'subject', type: 'text', required: true },
        { name: 'content', type: 'editor', required: true },
        { name: 'created', type: 'autodate', onCreate: true, onUpdate: false },
        { name: 'updated', type: 'autodate', onCreate: true, onUpdate: true },
      ],
      indexes: ['CREATE UNIQUE INDEX idx_email_templates_slug ON email_templates (slug)'],
    })
    app.save(emailTemplates)
  },
  (app) => {
    const users = app.findCollectionByNameOrId('users')
    users.fields.removeByName('last_login')
    users.fields.removeByName('is_active')
    app.save(users)

    const emailTemplates = app.findCollectionByNameOrId('email_templates')
    app.delete(emailTemplates)
  },
)
