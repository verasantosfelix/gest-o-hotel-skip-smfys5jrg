migrate(
  (app) => {
    const trainingsData = [
      {
        title: 'Excelência no Atendimento',
        description: 'Curso base para recepcionistas.',
        category: 'Front Desk',
      },
      {
        title: 'Higiene e Segurança',
        description: 'Protocolos atualizados.',
        category: 'Governança',
      },
    ]
    const trCol = app.findCollectionByNameOrId('hr_trainings')
    for (const d of trainingsData) {
      const rec = new Record(trCol)
      rec.set('title', d.title)
      rec.set('description', d.description)
      rec.set('category', d.category)
      app.save(rec)
    }

    const assetsData = [
      {
        name: 'Recepção POS 1',
        type: 'Desktop',
        serial: 'SN-981273',
        status: 'Ativo',
        last_maintenance: '2024-01-10',
      },
      {
        name: 'Tablet Governança A',
        type: 'Tablet',
        serial: 'TAB-001',
        status: 'Em Manutenção',
        last_maintenance: '2024-05-20',
      },
    ]
    const astCol = app.findCollectionByNameOrId('it_assets')
    for (const d of assetsData) {
      const rec = new Record(astCol)
      rec.set('name', d.name)
      rec.set('type', d.type)
      rec.set('serial', d.serial)
      rec.set('status', d.status)
      rec.set('last_maintenance', d.last_maintenance)
      app.save(rec)
    }

    const iotData = [
      {
        name: 'Termostato Quarto 204',
        type: 'Temperatura',
        current_value: 22.5,
        threshold: 26.0,
        status: 'Normal',
        unit: '°C',
      },
      {
        name: 'Sensor Inundação Lavanderia',
        type: 'Água',
        current_value: 0.8,
        threshold: 0.5,
        status: 'Alerta',
        unit: 'L',
      },
      {
        name: 'Medidor Ruído Hall',
        type: 'Som',
        current_value: 45,
        threshold: 80,
        status: 'Normal',
        unit: 'dB',
      },
    ]
    const iotCol = app.findCollectionByNameOrId('iot_sensors')
    for (const d of iotData) {
      const rec = new Record(iotCol)
      rec.set('name', d.name)
      rec.set('type', d.type)
      rec.set('current_value', d.current_value)
      rec.set('threshold', d.threshold)
      rec.set('status', d.status)
      rec.set('unit', d.unit)
      app.save(rec)
    }

    const fbEventsData = [
      {
        title: 'Noite de Vinhos e Massas',
        date: '2024-11-20T20:00:00Z',
        menu_details: 'Rodízio de massas artesanais com harmonização de vinhos.',
        price: 15000,
        currency: 'AOA',
      },
      {
        title: 'Brunch Executivo',
        date: '2024-11-25T10:00:00Z',
        menu_details: 'Buffet completo com mimosas.',
        price: 8000,
        currency: 'AOA',
      },
    ]
    const fbCol = app.findCollectionByNameOrId('fb_events')
    for (const d of fbEventsData) {
      const rec = new Record(fbCol)
      rec.set('title', d.title)
      rec.set('date', d.date)
      rec.set('menu_details', d.menu_details)
      rec.set('price', d.price)
      rec.set('currency', d.currency)
      app.save(rec)
    }

    const otaData = [
      { channel_name: 'Booking.com', sync_status: 'Online', last_sync: 'Agora' },
      { channel_name: 'Expedia', sync_status: 'Online', last_sync: 'Há 5 min' },
      { channel_name: 'Airbnb', sync_status: 'Aviso', last_sync: 'Há 2 horas' },
    ]
    const otaCol = app.findCollectionByNameOrId('ota_connections')
    for (const d of otaData) {
      const rec = new Record(otaCol)
      rec.set('channel_name', d.channel_name)
      rec.set('sync_status', d.sync_status)
      rec.set('last_sync', d.last_sync)
      app.save(rec)
    }

    const crmData = [
      { name: 'Empresa XPTO', contact: 'contato@xpto.com', score: 85, stage: 'Proposta' },
      { name: 'João Casamento', contact: 'joao@email.com', score: 40, stage: 'Lead' },
    ]
    const crmCol = app.findCollectionByNameOrId('crm_leads')
    for (const d of crmData) {
      const rec = new Record(crmCol)
      rec.set('name', d.name)
      rec.set('contact', d.contact)
      rec.set('score', d.score)
      rec.set('stage', d.stage)
      app.save(rec)
    }
  },
  (app) => {
    // Pass down
  },
)
