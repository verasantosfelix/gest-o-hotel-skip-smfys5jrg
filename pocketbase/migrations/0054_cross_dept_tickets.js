migrate(
  (app) => {
    const usersCol = app.findCollectionByNameOrId('users')

    // Maintenance
    const maint = app.findCollectionByNameOrId('maintenance_tickets')
    if (maint) {
      const maintStatus = maint.fields.getByName('status')
      if (maintStatus && !maintStatus.values.includes('pending_approval')) {
        maintStatus.values = [...maintStatus.values, 'pending_approval', 'rejected']
      }
      if (!maint.fields.getByName('created_by')) {
        maint.fields.add(
          new RelationField({ name: 'created_by', collectionId: usersCol.id, maxSelect: 1 }),
        )
      }
      app.save(maint)
    }

    // Amenities
    const amenity = app.findCollectionByNameOrId('amenity_requests')
    if (amenity) {
      const amenityStatus = amenity.fields.getByName('status')
      if (amenityStatus && !amenityStatus.values.includes('pending_approval')) {
        amenityStatus.values = [...amenityStatus.values, 'pending_approval', 'rejected']
      }
      if (!amenity.fields.getByName('created_by')) {
        amenity.fields.add(
          new RelationField({ name: 'created_by', collectionId: usersCol.id, maxSelect: 1 }),
        )
      }
      app.save(amenity)
    }

    // Laundry
    const laundry = app.findCollectionByNameOrId('laundry_logs')
    if (laundry) {
      laundry.fields.removeByName('status')
      laundry.fields.add(
        new SelectField({
          name: 'status',
          values: [
            'pending_approval',
            'pending',
            'in_progress',
            'completed',
            'rejected',
            'Pendente',
            'Entregue',
          ],
        }),
      )
      if (!laundry.fields.getByName('created_by')) {
        laundry.fields.add(
          new RelationField({ name: 'created_by', collectionId: usersCol.id, maxSelect: 1 }),
        )
      }
      app.save(laundry)
    }
  },
  (app) => {
    // Revert logic
    const maint = app.findCollectionByNameOrId('maintenance_tickets')
    if (maint) {
      maint.fields.removeByName('created_by')
      app.save(maint)
    }
    const amenity = app.findCollectionByNameOrId('amenity_requests')
    if (amenity) {
      amenity.fields.removeByName('created_by')
      app.save(amenity)
    }
    const laundry = app.findCollectionByNameOrId('laundry_logs')
    if (laundry) {
      laundry.fields.removeByName('created_by')
      app.save(laundry)
    }
  },
)
