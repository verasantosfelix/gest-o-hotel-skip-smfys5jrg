migrate(
  (app) => {
    const tables = app.findCollectionByNameOrId('fb_tables')
    for (let i = 1; i <= 10; i++) {
      const rec = new Record(tables)
      rec.set('table_number', 'T' + i)
      rec.set('status', 'free')
      rec.set('capacity', i % 2 === 0 ? 4 : 2)
      app.save(rec)
    }

    const productsData = [
      { name: 'Breakfast Buffet', category: 'Food', price: 4500, is_available: true },
      { name: 'Burger Artesanal', category: 'Food', price: 3200, is_available: true },
      { name: 'Club Sandwich', category: 'Food', price: 2800, is_available: true },
      { name: 'Vinho Tinto Reserva', category: 'Drinks', price: 8500, is_available: true },
      { name: 'Cerveja Local', category: 'Drinks', price: 600, is_available: true },
      { name: 'Café Expresso', category: 'Drinks', price: 500, is_available: true },
      { name: 'Água Mineral', category: 'Drinks', price: 400, is_available: true },
    ]

    const products = app.findCollectionByNameOrId('fb_products')
    productsData.forEach((p) => {
      const rec = new Record(products)
      rec.set('name', p.name)
      rec.set('category', p.category)
      rec.set('price', p.price)
      rec.set('is_available', p.is_available)
      app.save(rec)
    })
  },
  (app) => {},
)
