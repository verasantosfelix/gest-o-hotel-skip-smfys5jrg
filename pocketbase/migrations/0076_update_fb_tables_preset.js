migrate(
  (app) => {
    const col = app.findCollectionByNameOrId('fb_tables')
    if (!col.fields.getByName('preset_id')) {
      col.fields.add(
        new RelationField({
          name: 'preset_id',
          collectionId: app.findCollectionByNameOrId('fb_layout_presets').id,
          maxSelect: 1,
          cascadeDelete: true,
        }),
      )
      app.save(col)
    }
  },
  (app) => {
    const col = app.findCollectionByNameOrId('fb_tables')
    col.fields.removeByName('preset_id')
    app.save(col)
  },
)
