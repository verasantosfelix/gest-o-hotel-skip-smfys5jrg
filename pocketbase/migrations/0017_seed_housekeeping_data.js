migrate(
  (app) => {
    const rooms = app.findRecordsByFilter('rooms', '1=1', '', 100, 0)
    const statuses = [
      'vago_pronto',
      'sujo',
      'em_arrumacao',
      'manutencao',
      'nao_perturbar',
      'ocupado_pronto',
    ]
    const priorities = ['normal', 'vip', 'early_checkin', 'late_checkout']

    rooms.forEach((r, i) => {
      r.set('status', statuses[i % statuses.length])
      r.set('housekeeping_priority', priorities[i % priorities.length])
      if (!r.get('room_type')) r.set('room_type', i % 3 === 0 ? 'suite' : 'standard')
      app.saveNoValidate(r)
    })
  },
  (app) => {},
)
