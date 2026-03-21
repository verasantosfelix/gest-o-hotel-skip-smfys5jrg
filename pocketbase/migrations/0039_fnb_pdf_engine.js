migrate(
  (app) => {
    const templates = new Collection({
      name: 'fb_pdf_templates',
      type: 'base',
      listRule: "@request.auth.id != ''",
      viewRule: "@request.auth.id != ''",
      createRule: "@request.auth.id != ''",
      updateRule: "@request.auth.id != ''",
      deleteRule: "@request.auth.id != ''",
      fields: [
        { name: 'name', type: 'text', required: true },
        {
          name: 'layout',
          type: 'select',
          values: ['layout1', 'layout2', 'layout3', 'layout4'],
          required: true,
        },
        { name: 'format', type: 'select', values: ['A4', 'A5', 'Letter'], required: true },
        { name: 'orientation', type: 'select', values: ['vertical', 'horizontal'], required: true },
        { name: 'primary_color', type: 'text', required: true },
        { name: 'secondary_color', type: 'text', required: true },
        { name: 'font_family', type: 'text', required: true },
        { name: 'base_font_size', type: 'number', required: true },
        { name: 'show_logo', type: 'bool' },
        { name: 'show_images', type: 'bool' },
        { name: 'language', type: 'select', values: ['PT', 'EN', 'ES', 'FR'], required: true },
        { name: 'mode', type: 'select', values: ['full', 'room_service'], required: true },
        { name: 'created', type: 'autodate', onCreate: true, onUpdate: false },
        { name: 'updated', type: 'autodate', onCreate: true, onUpdate: true },
      ],
    })
    app.save(templates)

    const versions = new Collection({
      name: 'fb_pdf_versions',
      type: 'base',
      listRule: "@request.auth.id != ''",
      viewRule: "@request.auth.id != ''",
      createRule: "@request.auth.id != ''",
      updateRule: "@request.auth.id != ''",
      deleteRule: "@request.auth.id != ''",
      fields: [
        { name: 'version', type: 'text', required: true },
        {
          name: 'status',
          type: 'select',
          values: ['draft', 'pending_approval', 'approved'],
          required: true,
        },
        {
          name: 'file',
          type: 'file',
          maxSelect: 1,
          maxSize: 52428800,
          mimeTypes: ['application/pdf'],
        },
        {
          name: 'template_id',
          type: 'relation',
          collectionId: templates.id,
          required: true,
          maxSelect: 1,
        },
        {
          name: 'creator_id',
          type: 'relation',
          collectionId: '_pb_users_auth_',
          required: false,
          maxSelect: 1,
        },
        {
          name: 'approver_id',
          type: 'relation',
          collectionId: '_pb_users_auth_',
          required: false,
          maxSelect: 1,
        },
        { name: 'created', type: 'autodate', onCreate: true, onUpdate: false },
        { name: 'updated', type: 'autodate', onCreate: true, onUpdate: true },
      ],
    })
    app.save(versions)

    const schedules = new Collection({
      name: 'fb_pdf_schedules',
      type: 'base',
      listRule: "@request.auth.id != ''",
      viewRule: "@request.auth.id != ''",
      createRule: "@request.auth.id != ''",
      updateRule: "@request.auth.id != ''",
      deleteRule: "@request.auth.id != ''",
      fields: [
        { name: 'name', type: 'text', required: true },
        {
          name: 'frequency',
          type: 'select',
          values: ['daily', 'weekly', 'monthly'],
          required: true,
        },
        { name: 'time', type: 'text', required: true },
        { name: 'day_value', type: 'text', required: false },
        {
          name: 'template_id',
          type: 'relation',
          collectionId: templates.id,
          required: true,
          maxSelect: 1,
        },
        { name: 'target_printers', type: 'json', required: false },
        { name: 'is_active', type: 'bool' },
        { name: 'created', type: 'autodate', onCreate: true, onUpdate: false },
        { name: 'updated', type: 'autodate', onCreate: true, onUpdate: true },
      ],
    })
    app.save(schedules)

    // Seed Data
    const tRecord = new Record(templates)
    tRecord.set('name', 'Elegante Minimalista (A4)')
    tRecord.set('layout', 'layout1')
    tRecord.set('format', 'A4')
    tRecord.set('orientation', 'vertical')
    tRecord.set('primary_color', '#0f172a')
    tRecord.set('secondary_color', '#64748b')
    tRecord.set('font_family', 'Montserrat')
    tRecord.set('base_font_size', 12)
    tRecord.set('show_logo', true)
    tRecord.set('show_images', false)
    tRecord.set('language', 'PT')
    tRecord.set('mode', 'full')
    app.save(tRecord)

    const sRecord = new Record(schedules)
    sRecord.set('name', 'Impressão Semanal (Salão)')
    sRecord.set('frequency', 'weekly')
    sRecord.set('time', '07:00')
    sRecord.set('day_value', 'Monday')
    sRecord.set('template_id', tRecord.id)
    sRecord.set('target_printers', JSON.stringify(['impressora_salao']))
    sRecord.set('is_active', true)
    app.save(sRecord)
  },
  (app) => {
    try {
      app.delete(app.findCollectionByNameOrId('fb_pdf_schedules'))
    } catch (e) {}
    try {
      app.delete(app.findCollectionByNameOrId('fb_pdf_versions'))
    } catch (e) {}
    try {
      app.delete(app.findCollectionByNameOrId('fb_pdf_templates'))
    } catch (e) {}
  },
)
