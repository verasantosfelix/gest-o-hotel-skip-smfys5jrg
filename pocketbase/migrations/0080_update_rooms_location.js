migrate(
  (app) => {
    const col = app.findCollectionByNameOrId('rooms')

    if (!col.fields.getByName('bloco')) {
      col.fields.add(
        new SelectField({
          name: 'bloco',
          required: true,
          values: ['A', 'B', 'V'],
          maxSelect: 1,
        }),
      )
    }

    col.addIndex('idx_rooms_location', false, 'bloco, floor', '')

    app.save(col)

    // Update existing records to default 'bloco' so they satisfy the required constraint
    app.db().newQuery("UPDATE rooms SET bloco = 'A' WHERE bloco = '' OR bloco IS NULL").execute()
  },
  (app) => {
    const col = app.findCollectionByNameOrId('rooms')

    if (col.fields.getByName('bloco')) {
      col.fields.removeByName('bloco')
    }
    col.removeIndex('idx_rooms_location')

    app.save(col)
  },
)
