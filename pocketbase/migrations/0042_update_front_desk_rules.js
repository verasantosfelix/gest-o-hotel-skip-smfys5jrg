migrate(
  (app) => {
    const records = app.findRecordsByFilter('profiles', "name = 'Front_Desk'", '', 1, 0)
    if (records.length > 0) {
      const rec = records[0]
      const currentStr = rec.get('allowed_actions') || '[]'
      let current = []
      try {
        current = JSON.parse(currentStr)
      } catch (e) {}

      const newActions = [
        'restaurant_bar.dashboard_disponibilidade',
        'restaurant_bar.dashboard_tempos',
        'restaurant_bar.ver_reservas',
        'restaurant_bar.criar_reserva',
        'room_service.consultar_menu',
        'room_service.criar_pedido_em_nome_hospede',
        'room_service.consultar_status_pedido',
        'reservas.consultar_reservas',
        'reservas.criar_reservation_restaurante',
        'faturacao.consultar_comandas_quarto',
        'faturacao.ver_valor_pedido',
        'faturacao.ver_status_pagamento',
        'lavandaria.consultar_status',
        'spa_wellness.consultar_agenda',
        'spa_wellness.marcar_servico_em_nome_cliente',
        'spa_wellness.consultar_servicos',
        'spa_wellness.ver_disponibilidade',
        'fnb.consultar_mesas',
        'fnb.horarios_funcionamento',
      ]

      const merged = [...new Set([...current, ...newActions])]
      const filtered = merged.filter(
        (a) => !['mice_basic', 'events', 'Eventos & MICE', 'Grupos (MICE)'].includes(a),
      )

      rec.set('allowed_actions', JSON.stringify(filtered))
      app.save(rec)
    }

    try {
      const fbProducts = app.findCollectionByNameOrId('fb_products')
      fbProducts.updateRule = "@request.auth.id != '' && @request.auth.profile.name != 'Front_Desk'"
      fbProducts.deleteRule = "@request.auth.id != '' && @request.auth.profile.name != 'Front_Desk'"
      app.save(fbProducts)
    } catch (e) {}

    try {
      const finDocs = app.findCollectionByNameOrId('financial_docs')
      finDocs.updateRule = "@request.auth.id != '' && @request.auth.profile.name != 'Front_Desk'"
      finDocs.deleteRule = "@request.auth.id != '' && @request.auth.profile.name != 'Front_Desk'"
      app.save(finDocs)
    } catch (e) {}

    try {
      const auditLogs = app.findCollectionByNameOrId('action_audit_logs')
      auditLogs.updateRule = null
      auditLogs.deleteRule = null
      app.save(auditLogs)
    } catch (e) {}
  },
  (app) => {
    try {
      const fbProducts = app.findCollectionByNameOrId('fb_products')
      fbProducts.updateRule = "@request.auth.id != ''"
      fbProducts.deleteRule = "@request.auth.id != ''"
      app.save(fbProducts)
    } catch (e) {}

    try {
      const finDocs = app.findCollectionByNameOrId('financial_docs')
      finDocs.updateRule = "@request.auth.id != ''"
      finDocs.deleteRule = "@request.auth.id != ''"
      app.save(finDocs)
    } catch (e) {}
  },
)
