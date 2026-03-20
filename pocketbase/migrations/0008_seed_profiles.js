migrate(
  (app) => {
    const profilesData = [
      {
        name: 'Lavanderia_Limpeza',
        allowed: ['housekeeping', 'lost_found', 'minibar', 'basic_tickets'],
        denied: ['finance', 'hr', 'it', 'rates', 'inventory_deep', 'guest_personal'],
      },
      {
        name: 'Restaurante_Bar',
        allowed: ['fnb', 'kds', 'pos', 'fnb_reservations', 'guest_preferences'],
        denied: ['finance', 'rates', 'reception_ops'],
      },
      {
        name: 'Spa_Wellness',
        allowed: ['spa_scheduling', 'therapists', 'spa_consumption', 'basic_guest'],
        denied: ['finance_deep', 'rates', 'admin_ops'],
      },
      {
        name: 'Rececao_FrontOffice',
        allowed: [
          'reservations',
          'checkin',
          'checkout',
          'billing',
          'crm',
          'rooming_lists',
          'upsell',
        ],
        denied: ['hr', 'it', 'deep_inventory'],
      },
      {
        name: 'Administrativo_Financeiro',
        allowed: ['reports', 'ap_ar', 'audit', 'contracts', 'hr', 'night_audit'],
        denied: ['create_reservation', 'update_room'],
      },
      {
        name: 'Manutencao_Oficina',
        allowed: ['maintenance', 'os', 'iot', 'preventive', 'room_status'],
        denied: ['finance', 'rates', 'guest_data'],
      },
      {
        name: 'Tecnologia_TI',
        allowed: ['it_inventory', 'iot', 'logs', 'access_control', 'helpdesk'],
        denied: ['finance', 'fnb', 'laundry', 'reservations'],
      },
      { name: 'Direcao_Admin', allowed: ['*'], denied: [] },
    ]

    const profCol = app.findCollectionByNameOrId('profiles')
    const profileIds = {}

    for (const p of profilesData) {
      const rec = new Record(profCol)
      rec.set('name', p.name)
      rec.set('allowed_actions', JSON.stringify(p.allowed))
      rec.set('denied_actions', JSON.stringify(p.denied))
      app.save(rec)
      profileIds[p.name] = rec.id
    }

    try {
      const user = app.findAuthRecordByEmail('users', 'verasantos.cql@gmail.com')
      if (user && profileIds['Direcao_Admin']) {
        user.set('profile', profileIds['Direcao_Admin'])
        app.save(user)
      }
    } catch (e) {
      console.log('Default admin user not found for profile assignment.')
    }
  },
  (app) => {
    const records = app.findRecordsByFilter('profiles', '1=1', '', 100, 0)
    for (const r of records) {
      app.delete(r)
    }
  },
)
