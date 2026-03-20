const watchedCols = [
  'financial_docs',
  'budget_entries',
  'security_incidents',
  'hr_candidates',
  'maintenance_tickets',
]

onRecordAfterCreateSuccess(
  (e) => {
    const auth = e.requestInfo().auth
    if (!auth) {
      e.next()
      return
    }

    const role = auth.get('role') || 'user'

    const auditCol = $app.findCollectionByNameOrId('action_audit_logs')
    const logs = new Record(auditCol)
    logs.set('user_id', auth.id)
    logs.set('action_type', 'create')
    logs.set('module', e.collection.name)
    logs.set('details', JSON.stringify({ record_id: e.record.id, performer_role: role }))
    $app.saveNoValidate(logs)

    let profileId = auth.get('profile')
    if (profileId) {
      try {
        const profile = $app.findRecordById('profiles', profileId)
        const managerId = profile.get('manager_id')
        if (managerId && managerId !== auth.id) {
          if (
            e.collection.name === 'financial_docs' ||
            e.collection.name === 'security_incidents'
          ) {
            const notifCol = $app.findCollectionByNameOrId('notifications')
            const notif = new Record(notifCol)
            notif.set('recipient_id', managerId)
            notif.set('sender_id', auth.id)
            notif.set('title', 'Novo ' + e.collection.name)
            notif.set('message', `Um novo registro foi criado no módulo ${e.collection.name}.`)
            notif.set('type', 'info')
            notif.set('status', 'unread')
            notif.set('related_record_id', e.record.id)
            $app.saveNoValidate(notif)
          }
        }
      } catch (err) {
        console.log('Error in Create notif:', err)
      }
    }
    e.next()
  },
  ...watchedCols,
)

onRecordAfterUpdateSuccess(
  (e) => {
    const auth = e.requestInfo().auth
    if (!auth) {
      e.next()
      return
    }

    const status = e.record.get('status')
    const role = auth.get('role') || 'user'

    const auditCol = $app.findCollectionByNameOrId('action_audit_logs')
    const logs = new Record(auditCol)
    logs.set('user_id', auth.id)
    const isApproval = status === 'approved' || status === 'resolved'
    const isRejection = status === 'rejected' || status === 'closed'
    logs.set('action_type', isApproval ? 'approval' : isRejection ? 'rejection' : 'update')
    logs.set('module', e.collection.name)
    logs.set(
      'details',
      JSON.stringify({ record_id: e.record.id, performer_role: role, status: status }),
    )
    $app.saveNoValidate(logs)

    if (status === 'pending' || status === 'pending_approval' || status === 'open') {
      let profileId = auth.get('profile')
      if (profileId) {
        try {
          const profile = $app.findRecordById('profiles', profileId)
          const managerId = profile.get('manager_id')
          if (managerId && managerId !== auth.id) {
            const notifCol = $app.findCollectionByNameOrId('notifications')
            const notif = new Record(notifCol)
            notif.set('recipient_id', managerId)
            notif.set('sender_id', auth.id)
            notif.set('title', 'Aprovação Pendente')
            notif.set(
              'message',
              `Um registro no módulo ${e.collection.name} aguarda sua aprovação.`,
            )
            notif.set('type', 'approval_request')
            notif.set('status', 'unread')
            notif.set('related_record_id', e.record.id)
            $app.saveNoValidate(notif)
          }
        } catch (err) {
          console.log('Error in Update notif:', err)
        }
      }
    }

    e.next()
  },
  ...watchedCols,
)

onRecordAfterDeleteSuccess(
  (e) => {
    const auth = e.requestInfo().auth
    if (!auth) {
      e.next()
      return
    }

    const role = auth.get('role') || 'user'

    const auditCol = $app.findCollectionByNameOrId('action_audit_logs')
    const logs = new Record(auditCol)
    logs.set('user_id', auth.id)
    logs.set('action_type', 'delete')
    logs.set('module', e.collection.name)
    logs.set('details', JSON.stringify({ record_id: e.record.id, performer_role: role }))
    $app.saveNoValidate(logs)

    e.next()
  },
  ...watchedCols,
)
