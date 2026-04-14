migrate(
  (app) => {
    // 1. Migrate existing status data
    app
      .db()
      .newQuery(
        "UPDATE rooms SET status = 'Disponível' WHERE status = 'available' OR status = 'vago_pronto'",
      )
      .execute()
    app
      .db()
      .newQuery(
        "UPDATE rooms SET status = 'Ocupado' WHERE status = 'occupied' OR status = 'ocupado_pronto'",
      )
      .execute()
    app
      .db()
      .newQuery(
        "UPDATE rooms SET status = 'Limpeza' WHERE status = 'cleaning' OR status = 'sujo' OR status = 'em_arrumacao'",
      )
      .execute()
    app
      .db()
      .newQuery(
        "UPDATE rooms SET status = 'Manutenção' WHERE status = 'maintenance' OR status = 'out_of_order'",
      )
      .execute()
    // fallback for any other status
    app
      .db()
      .newQuery(
        "UPDATE rooms SET status = 'Disponível' WHERE status NOT IN ('Disponível', 'Ocupado', 'Limpeza', 'Manutenção')",
      )
      .execute()

    // 2. Migrate existing room_type data
    app
      .db()
      .newQuery("UPDATE rooms SET room_type = 'Single' WHERE room_type = 'standard'")
      .execute()
    app.db().newQuery("UPDATE rooms SET room_type = 'Casal' WHERE room_type = 'luxo'").execute()
    app.db().newQuery("UPDATE rooms SET room_type = 'Especial' WHERE room_type = 'suite'").execute()
    app
      .db()
      .newQuery("UPDATE rooms SET room_type = 'Single' WHERE room_type IS NULL OR room_type = ''")
      .execute()
    app
      .db()
      .newQuery(
        "UPDATE rooms SET room_type = 'Single' WHERE room_type NOT IN ('Single', 'Duplo/Casal', 'Casal', 'Especial', 'Quádruplo', 'Vivenda T1', 'Vivenda T2')",
      )
      .execute()

    const col = app.findCollectionByNameOrId('rooms')

    const statusField = col.fields.getByName('status')
    if (statusField) {
      statusField.values = ['Disponível', 'Ocupado', 'Manutenção', 'Limpeza']
    }

    const typeField = col.fields.getByName('room_type')
    if (typeField) {
      typeField.values = [
        'Single',
        'Duplo/Casal',
        'Casal',
        'Especial',
        'Quádruplo',
        'Vivenda T1',
        'Vivenda T2',
      ]
    }

    if (!col.fields.getByName('max_occupancy'))
      col.fields.add(new NumberField({ name: 'max_occupancy' }))
    if (!col.fields.getByName('bed_count')) col.fields.add(new NumberField({ name: 'bed_count' }))
    if (!col.fields.getByName('allow_extra_bed'))
      col.fields.add(new BoolField({ name: 'allow_extra_bed' }))
    if (!col.fields.getByName('appliances')) col.fields.add(new JSONField({ name: 'appliances' }))
    if (!col.fields.getByName('base_rate')) col.fields.add(new NumberField({ name: 'base_rate' }))

    app.save(col)

    // 3. Set default values for existing records
    app
      .db()
      .newQuery(
        'UPDATE rooms SET max_occupancy = 2, bed_count = 1, allow_extra_bed = false, base_rate = 10000 WHERE max_occupancy IS NULL OR max_occupancy = 0',
      )
      .execute()
  },
  (app) => {
    const col = app.findCollectionByNameOrId('rooms')

    const statusField = col.fields.getByName('status')
    if (statusField) {
      statusField.values = [
        'available',
        'occupied',
        'cleaning',
        'maintenance',
        'out_of_order',
        'vago_pronto',
        'sujo',
        'em_arrumacao',
        'nao_perturbar',
        'ocupado_pronto',
      ]
    }

    const typeField = col.fields.getByName('room_type')
    if (typeField) {
      typeField.values = [
        'standard',
        'suite',
        'luxo',
        'Single',
        'Duplo/Casal',
        'Casal',
        'Especial',
        'Quádruplo',
        'Vivenda T1',
        'Vivenda T2',
      ]
    }

    col.fields.removeByName('max_occupancy')
    col.fields.removeByName('bed_count')
    col.fields.removeByName('allow_extra_bed')
    col.fields.removeByName('appliances')
    col.fields.removeByName('base_rate')

    app.save(col)
  },
)
