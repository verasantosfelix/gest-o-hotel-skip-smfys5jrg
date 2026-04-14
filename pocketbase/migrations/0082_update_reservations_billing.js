migrate(
  (app) => {
    const col = app.findCollectionByNameOrId('reservations')

    // Add applied_rate_type
    if (!col.fields.getByName('applied_rate_type')) {
      col.fields.add(
        new SelectField({
          name: 'applied_rate_type',
          maxSelect: 1,
          values: [
            'Single',
            'Duplo/Casal',
            'Casal',
            'Especial',
            'Quádruplo',
            'Vivenda T1',
            'Vivenda T2',
            'standard',
            'suite',
            'luxo',
          ],
        }),
      )
    }

    // Add billing_type
    if (!col.fields.getByName('billing_type')) {
      col.fields.add(
        new SelectField({
          name: 'billing_type',
          maxSelect: 1,
          values: ['hospede', 'empresa', 'ambos'],
        }),
      )
    }

    // Add company_id relation
    if (!col.fields.getByName('company_id')) {
      col.fields.add(
        new RelationField({
          name: 'company_id',
          collectionId: app.findCollectionByNameOrId('guest_loyalty').id,
          maxSelect: 1,
          cascadeDelete: false,
        }),
      )
    }

    app.save(col)
  },
  (app) => {
    const col = app.findCollectionByNameOrId('reservations')
    col.fields.removeByName('applied_rate_type')
    col.fields.removeByName('billing_type')
    col.fields.removeByName('company_id')
    app.save(col)
  },
)
