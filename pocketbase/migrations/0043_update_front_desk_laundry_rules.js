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
        'lavandaria.consultar_status',
        'lavandaria.abrir_pedido_lavandaria',
        'lavandaria.criar_pedido_para_hospede',
      ]

      const merged = [...new Set([...current, ...newActions])]
      rec.set('allowed_actions', JSON.stringify(merged))
      app.save(rec)
    }
  },
  (app) => {
    const records = app.findRecordsByFilter('profiles', "name = 'Front_Desk'", '', 1, 0)
    if (records.length > 0) {
      const rec = records[0]
      const currentStr = rec.get('allowed_actions') || '[]'
      let current = []
      try {
        current = JSON.parse(currentStr)
      } catch (e) {}

      const actionsToRemove = [
        'lavandaria.consultar_status',
        'lavandaria.abrir_pedido_lavandaria',
        'lavandaria.criar_pedido_para_hospede',
      ]

      const filtered = current.filter((a) => !actionsToRemove.includes(a))
      rec.set('allowed_actions', JSON.stringify(filtered))
      app.save(rec)
    }
  },
)
