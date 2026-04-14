migrate(
  (app) => {
    const users = app.findCollectionByNameOrId('users')

    if (!users.fields.getByName('employee_number')) {
      users.fields.add(
        new TextField({
          name: 'employee_number',
          required: false,
        }),
      )
    }

    if (!users.fields.getByName('phone')) {
      users.fields.add(
        new TextField({
          name: 'phone',
          required: false,
        }),
      )
    }

    app.save(users)

    const updatedUsers = app.findCollectionByNameOrId('users')
    updatedUsers.addIndex(
      'idx_users_employee_number',
      true,
      'employee_number',
      "employee_number != ''",
    )
    updatedUsers.addIndex('idx_users_phone', true, 'phone', "phone != ''")

    app.save(updatedUsers)
  },
  (app) => {
    const users = app.findCollectionByNameOrId('users')

    users.removeIndex('idx_users_employee_number')
    users.removeIndex('idx_users_phone')

    const empField = users.fields.getByName('employee_number')
    if (empField) users.fields.removeById(empField.id)

    const phoneField = users.fields.getByName('phone')
    if (phoneField) users.fields.removeById(phoneField.id)

    app.save(users)
  },
)
