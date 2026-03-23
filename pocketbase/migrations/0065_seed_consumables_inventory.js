migrate(
  (app) => {
    const coll = app.findCollectionByNameOrId('consumables_inventory')
    const items = [
      {
        item_name: 'Água 0.5L',
        category: 'minibar',
        stock_quantity: 50,
        unit_price: 500,
        min_threshold: 10,
      },
      {
        item_name: 'Cerveja Local',
        category: 'minibar',
        stock_quantity: 24,
        unit_price: 1200,
        min_threshold: 5,
      },
      {
        item_name: 'Amendoim',
        category: 'minibar',
        stock_quantity: 30,
        unit_price: 800,
        min_threshold: 10,
      },
      {
        item_name: 'Kit Dentes',
        category: 'hygiene',
        stock_quantity: 100,
        unit_price: 1500,
        min_threshold: 20,
      },
      {
        item_name: 'Sabonete Líquido',
        category: 'hygiene',
        stock_quantity: 200,
        unit_price: 300,
        min_threshold: 50,
      },
    ]

    for (const data of items) {
      const record = new Record(coll)
      record.set('item_name', data.item_name)
      record.set('category', data.category)
      record.set('stock_quantity', data.stock_quantity)
      record.set('unit_price', data.unit_price)
      record.set('min_threshold', data.min_threshold)
      app.save(record)
    }
  },
  (app) => {
    const items = app.findRecordsByFilter('consumables_inventory', '1=1', '', 100, 0)
    for (const item of items) {
      app.delete(item)
    }
  },
)
