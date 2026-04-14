migrate(
  (app) => {
    const col = app.findCollectionByNameOrId('room_type_configs')
    const roomTypes = [
      { name: 'Single', base_price: 35000 },
      { name: 'Duplo/Casal', base_price: 50000 },
      { name: 'Casal', base_price: 50000 },
      { name: 'Especial', base_price: 75000 },
      { name: 'Quádruplo', base_price: 90000 },
      { name: 'Vivenda T1', base_price: 120000 },
      { name: 'Vivenda T2', base_price: 180000 },
    ]

    for (const rt of roomTypes) {
      try {
        app.findFirstRecordByData('room_type_configs', 'name', rt.name)
      } catch (_) {
        const record = new Record(col)
        record.set('name', rt.name)
        record.set('base_price', rt.base_price)
        app.save(record)
      }
    }
  },
  (app) => {},
)
