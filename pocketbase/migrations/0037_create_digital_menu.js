migrate(
  (app) => {
    const categories = new Collection({
      name: 'fb_menu_categories',
      type: 'base',
      listRule: '',
      viewRule: '',
      createRule: "@request.auth.id != ''",
      updateRule: "@request.auth.id != ''",
      deleteRule: "@request.auth.id != ''",
      fields: [
        { name: 'name', type: 'text', required: true },
        { name: 'order', type: 'number', required: true },
        { name: 'created', type: 'autodate', onCreate: true, onUpdate: false },
        { name: 'updated', type: 'autodate', onCreate: true, onUpdate: true },
      ],
    })
    app.save(categories)

    const products = app.findCollectionByNameOrId('fb_products')

    if (!products.fields.getByName('description')) {
      products.fields.add(new TextField({ name: 'description' }))
      products.fields.add(
        new FileField({
          name: 'image',
          maxSelect: 1,
          maxSize: 5242880,
          mimeTypes: ['image/jpeg', 'image/png', 'image/webp'],
        }),
      )
      products.fields.add(new JSONField({ name: 'tags' }))
      products.fields.add(new TextField({ name: 'restrictions' }))
      products.fields.add(new NumberField({ name: 'order' }))
      products.fields.add(
        new SelectField({ name: 'status', values: ['draft', 'published', 'archived'] }),
      )
      products.fields.add(
        new RelationField({ name: 'category_id', collectionId: categories.id, maxSelect: 1 }),
      )
    }

    products.listRule = ''
    products.viewRule = ''

    app.save(products)
  },
  (app) => {
    const products = app.findCollectionByNameOrId('fb_products')
    products.fields.removeByName('description')
    products.fields.removeByName('image')
    products.fields.removeByName('tags')
    products.fields.removeByName('restrictions')
    products.fields.removeByName('order')
    products.fields.removeByName('status')
    products.fields.removeByName('category_id')
    products.listRule = "@request.auth.id != ''"
    products.viewRule = "@request.auth.id != ''"
    app.save(products)

    const categories = app.findCollectionByNameOrId('fb_menu_categories')
    app.delete(categories)
  },
)
