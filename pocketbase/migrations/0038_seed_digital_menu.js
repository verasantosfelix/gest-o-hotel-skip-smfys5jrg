migrate(
  (app) => {
    app.truncateCollection(app.findCollectionByNameOrId('fb_products'))

    const catsColl = app.findCollectionByNameOrId('fb_menu_categories')
    const prodsColl = app.findCollectionByNameOrId('fb_products')

    const catsData = [
      { name: 'Entradas', order: 1 },
      { name: 'Pratos Principais', order: 2 },
      { name: 'Sobremesas', order: 3 },
      { name: 'Bebidas', order: 4 },
    ]

    const catIds = {}
    for (const c of catsData) {
      const rec = new Record(catsColl)
      rec.set('name', c.name)
      rec.set('order', c.order)
      app.save(rec)
      catIds[c.name] = rec.id
    }

    const productsData = [
      {
        name: 'Bruschetta Tradicional',
        category: 'Food',
        price: 6.5,
        description: 'Pão italiano tostado com tomates frescos, manjericão e alho.',
        tags: ['vegetariano'],
        is_available: true,
        status: 'published',
        category_id: catIds['Entradas'],
        order: 1,
      },
      {
        name: 'Sopa do Dia',
        category: 'Food',
        price: 5.0,
        description: 'Creme de legumes da estação.',
        tags: ['vegetariano', 'vegano'],
        is_available: true,
        status: 'published',
        category_id: catIds['Entradas'],
        order: 2,
      },
      {
        name: 'Risoto de Cogumelos',
        category: 'Food',
        price: 14.9,
        description: 'Risoto cremoso com mix de cogumelos silvestres e azeite trufado.',
        tags: ['vegetariano', 'sem_gluten'],
        is_available: true,
        status: 'published',
        category_id: catIds['Pratos Principais'],
        order: 1,
      },
      {
        name: 'Bife Angus Grelhado',
        category: 'Food',
        price: 19.9,
        description: 'Corte premium grelhado na brasa com batatas rústicas e alecrim.',
        tags: ['sem_gluten'],
        is_available: true,
        status: 'published',
        category_id: catIds['Pratos Principais'],
        order: 2,
      },
      {
        name: 'Cheesecake de Frutos Vermelhos',
        category: 'Food',
        price: 6.0,
        description: 'Cheesecake clássico com calda caseira de frutas do bosque.',
        tags: [],
        is_available: true,
        status: 'published',
        category_id: catIds['Sobremesas'],
        order: 1,
      },
      {
        name: 'Água Mineral',
        category: 'Drinks',
        price: 2.0,
        description: 'Garrafa 500ml.',
        tags: [],
        is_available: true,
        status: 'published',
        category_id: catIds['Bebidas'],
        order: 1,
      },
      {
        name: 'Vinho Tinto Seleção',
        category: 'Drinks',
        price: 5.5,
        description: 'Taça de vinho tinto encorpado da nossa adega.',
        tags: [],
        restrictions: '18+',
        is_available: true,
        status: 'published',
        category_id: catIds['Bebidas'],
        order: 2,
      },
    ]

    for (const p of productsData) {
      const rec = new Record(prodsColl)
      rec.set('name', p.name)
      rec.set('category', p.category)
      rec.set('price', p.price)
      rec.set('description', p.description)
      rec.set('tags', p.tags)
      if (p.restrictions) rec.set('restrictions', p.restrictions)
      rec.set('is_available', p.is_available)
      rec.set('status', p.status)
      rec.set('category_id', p.category_id)
      rec.set('order', p.order)
      app.save(rec)
    }
  },
  (app) => {
    app.truncateCollection(app.findCollectionByNameOrId('fb_products'))
    app.truncateCollection(app.findCollectionByNameOrId('fb_menu_categories'))
  },
)
