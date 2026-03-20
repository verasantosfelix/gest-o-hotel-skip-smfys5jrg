migrate(
  (app) => {
    const events = app.findCollectionByNameOrId('calendar_events')
    const today = new Date()

    const format = (d) => {
      const y = d.getFullYear()
      const m = String(d.getMonth() + 1).padStart(2, '0')
      const day = String(d.getDate()).padStart(2, '0')
      return `${y}-${m}-${day}`
    }

    const d1 = format(today)
    const d2 = format(new Date(today.getTime() + 86400000 * 2))

    const seedData = [
      {
        title: 'Limpeza Profunda Jacuzzi',
        description: 'Manutenção periódica, substituição de filtros e higienização geral.',
        start_date: d1,
        end_date: d1,
        type: 'maintenance',
        sector: 'spa',
      },
      {
        title: 'Formação Massagem Geotermal',
        description: 'Treinamento de equipe para novas técnicas com pedras quentes.',
        start_date: d2,
        end_date: d2,
        type: 'training',
        sector: 'spa',
      },
    ]

    for (const data of seedData) {
      const record = new Record(events)
      for (const [key, value] of Object.entries(data)) {
        record.set(key, value)
      }
      app.save(record)
    }
  },
  (app) => {
    const records = app.findRecordsByFilter('calendar_events', "sector = 'spa'", '', 100, 0)
    for (const r of records) {
      app.delete(r)
    }
  },
)
