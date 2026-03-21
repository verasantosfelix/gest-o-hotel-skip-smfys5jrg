onRecordAfterCreateSuccess((e) => {
  handleSpaAuditAndNotif(e, $app)
  e.next()
}, 'spa_appointments')

onRecordAfterUpdateSuccess((e) => {
  handleSpaAuditAndNotif(e, $app)
  e.next()
}, 'spa_appointments')

function handleSpaAuditAndNotif(e, app) {
  const status = e.record.get('status')
  const auth = e.requestInfo().auth
  const userId = auth ? auth.id : ''

  let actionType = 'update'
  if (e.action === 'create') actionType = 'create'
  if (status === 'scheduled' && actionType !== 'create') actionType = 'approval'
  if (status === 'cancelled') actionType = 'rejection'

  // 1. Audit Log
  try {
    const auditCol = app.findCollectionByNameOrId('action_audit_logs')
    const log = new Record(auditCol)
    log.set('user_id', userId)
    log.set('action_type', actionType)
    log.set('module', 'spa_appointments')

    let serviceName = 'Serviço SPA'
    try {
      const svcId = e.record.get('service_id')
      if (svcId) {
        const svc = app.findRecordById('spa_services', svcId)
        serviceName = svc.get('name')
      }
    } catch (err) {}

    log.set(
      'details',
      JSON.stringify({
        record_id: e.record.id,
        status: status,
        guest_name: e.record.get('guest_name'),
        service_name: serviceName,
      }),
    )

    if (userId) {
      app.saveNoValidate(log)
    }
  } catch (err) {
    console.log('Error saving spa audit log', err)
  }

  // 2. Notifications for managers
  if (status === 'pending_approval') {
    try {
      const managers = app.findRecordsByFilter('users', "role = 'manager'", '-created', 100, 0)
      const notifCol = app.findCollectionByNameOrId('notifications')

      let serviceName = 'Serviço'
      try {
        const svcId = e.record.get('service_id')
        if (svcId) {
          const svc = app.findRecordById('spa_services', svcId)
          serviceName = svc.get('name')
        }
      } catch (err) {}

      const guestName = e.record.get('guest_name') || 'Hóspede'

      for (let i = 0; i < managers.length; i++) {
        const manager = managers[i]
        const notif = new Record(notifCol)
        notif.set('recipient_id', manager.id)
        notif.set('sender_id', userId || manager.id)
        notif.set('title', 'Nova Reserva de SPA Pendente')
        notif.set(
          'message',
          `O hóspede ${guestName} solicitou o serviço ${serviceName} e aguarda aprovação.`,
        )
        notif.set('type', 'approval_request')
        notif.set('status', 'unread')
        notif.set('related_record_id', e.record.id)
        notif.set('link', `/spa/agenda?id=${e.record.id}`)
        app.saveNoValidate(notif)
      }
    } catch (err) {
      console.log('Error creating spa notifications', err)
    }
  }
}
