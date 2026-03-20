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
    const d2 = format(new Date(today.getTime() + 86400000))
    const d3 = format(new Date(today.getTime() + 86400000 * 3))

    const seedData = [
      {
        title: 'Treinamento de Segurança',
        description: 'Obrigatório para toda a equipe.',
        start_date: d2,
        end_date: d2,
        type: 'training',
        sector: 'hr',
      },
      {
        title: 'Manutenção Preventiva Cozinha',
        description: 'Limpeza de exaustores industriais.',
        start_date: d1,
        end_date: d1,
        type: 'maintenance',
        sector: 'maintenance',
      },
      {
        title: 'Atualização de Servidores',
        description: 'Downtime previsto de 2h na madrugada.',
        start_date: d3,
        end_date: d3,
        type: 'blockout',
        sector: 'it',
      },
      {
        title: 'Revisão de Estoque',
        description: 'Contagem geral de enxovais.',
        start_date: d2,
        end_date: d2,
        type: 'task',
        sector: 'laundry',
      },
      {
        title: 'Limpeza Choque Piscinas',
        description: 'Tratamento de choque de cloro.',
        start_date: d1,
        end_date: d1,
        type: 'maintenance',
        sector: 'leisure',
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
    const records = app.findRecordsByFilter('calendar_events', '1=1', '', 100, 0)
    for (const r of records) {
      app.delete(r)
    }
  },
)
