migrate(
  (app) => {
    const records = app.findRecordsByFilter('profiles', "name = 'Front_Desk'", '', 1, 0)
    if (records.length > 0) {
      const rec = records[0]
      rec.set('allowed_actions', '[]')
      rec.set(
        'denied_actions',
        JSON.stringify([
          'Financeiro Corp',
          'Documentos',
          'Contratos',
          'Configurações',
          'Auditoria',
          'Eventos & MICE',
          'Segurança',
          'Marketing',
          'Analytics',
          'Relatórios',
          'Equipe & RH',
          'HR Intelligence',
        ]),
      )
      app.save(rec)
    }

    try {
      const fbProducts = app.findCollectionByNameOrId('fb_products')
      fbProducts.createRule = "@request.auth.id != '' && @request.auth.profile.name != 'Front_Desk'"
      app.save(fbProducts)
    } catch (e) {}
  },
  (app) => {
    const records = app.findRecordsByFilter('profiles', "name = 'Front_Desk'", '', 1, 0)
    if (records.length > 0) {
      const rec = records[0]
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
      app.save(rec)
    }
  },
)
