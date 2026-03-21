migrate(
  (app) => {
    const profCol = app.findCollectionByNameOrId('profiles')
    const rec = new Record(profCol)
    rec.set('name', 'Front_Desk')
    rec.set(
      'allowed_actions',
      JSON.stringify([
        'housekeeping',
        'lost_found',
        'minibar',
        'basic_tickets',
        'reservations',
        'checkin',
        'checkout',
        'billing',
        'crm',
        'rooming_lists',
        'upsell',
        'fnb_basic',
        'spa_view',
        'spa_appointments',
        'fnb_reservations',
        'room_service',
        'maintenance_tickets_basic',
        'basic_guest',
        'mice_basic',
      ]),
    )
    rec.set(
      'denied_actions',
      JSON.stringify([
        'finance',
        'hr',
        'it',
        'inventory_deep',
        'rates',
        'admin_ops',
        'fnb_menu_edit',
        'pdf_publish',
        'fnb_ops',
        'audit_logs',
      ]),
    )
    app.save(rec)

    try {
      const users = app.findCollectionByNameOrId('users')
      const fdUser = new Record(users)
      fdUser.setEmail('frontdesk@skip.com')
      fdUser.setPassword('securepassword123')
      fdUser.setVerified(true)
      fdUser.set('name', 'Front Desk Test')
      fdUser.set('role', 'user')
      fdUser.set('profile', rec.id)
      app.save(fdUser)
    } catch (e) {
      console.log('Could not create test user for Front_Desk', e)
    }
  },
  (app) => {
    try {
      const user = app.findAuthRecordByEmail('users', 'frontdesk@skip.com')
      if (user) app.delete(user)
    } catch (e) {}
    const records = app.findRecordsByFilter('profiles', "name = 'Front_Desk'", '', 1, 0)
    if (records.length > 0) app.delete(records[0])
  },
)
