migrate(
  (app) => {
    const users = app.findCollectionByNameOrId('users')
    users.addIndex('idx_users_employee_number', true, 'employee_number', "employee_number != ''")
    users.addIndex('idx_users_phone', true, 'phone', "phone != ''")
    app.save(users)
  },
  (app) => {
    const users = app.findCollectionByNameOrId('users')
    users.removeIndex('idx_users_employee_number')
    users.removeIndex('idx_users_phone')
    app.save(users)
  },
)
