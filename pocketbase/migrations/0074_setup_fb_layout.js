migrate(
  (app) => {
    const col = app.findCollectionByNameOrId('fb_tables')

    if (!col.fields.getByName('position_x')) {
      col.fields.add(new NumberField({ name: 'position_x', required: false }))
    }
    if (!col.fields.getByName('position_y')) {
      col.fields.add(new NumberField({ name: 'position_y', required: false }))
    }
    if (!col.fields.getByName('width')) {
      col.fields.add(new NumberField({ name: 'width', required: false }))
    }
    if (!col.fields.getByName('height')) {
      col.fields.add(new NumberField({ name: 'height', required: false }))
    }
    if (!col.fields.getByName('shape')) {
      col.fields.add(
        new SelectField({
          name: 'shape',
          values: ['rectangle', 'circle', 'square'],
          required: false,
          maxSelect: 1,
        }),
      )
    }

    const rotField = col.fields.getByName('rotation')
    if (!rotField) {
      col.fields.add(new NumberField({ name: 'rotation', required: false }))
    } else {
      rotField.required = false
    }

    app.save(col)
  },
  (app) => {
    try {
      const col = app.findCollectionByNameOrId('fb_tables')
      col.fields.removeByName('position_x')
      col.fields.removeByName('position_y')
      col.fields.removeByName('width')
      col.fields.removeByName('height')
      col.fields.removeByName('shape')
      col.fields.removeByName('rotation')
      app.save(col)
    } catch (e) {
      // Ignore if already removed or table doesn't exist
    }
  },
)
