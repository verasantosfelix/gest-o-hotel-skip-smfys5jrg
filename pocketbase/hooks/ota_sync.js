routerAdd(
  'POST',
  '/backend/v1/ota/sync',
  (e) => {
    const body = e.requestInfo().body || {}
    const channelId = body.channelId

    let filter = '1=1'
    if (channelId) {
      filter = `id = '${channelId}'`
    }

    try {
      const records = $app.findRecordsByFilter('ota_connections', filter, '', 100, 0)
      for (let r of records) {
        r.set('last_sync', new Date().toISOString())
        r.set('sync_status', 'Active')
        $app.save(r)
      }
      return e.json(200, { success: true, count: records.length })
    } catch (err) {
      throw new InternalServerError('Failed to sync channels.')
    }
  },
  $apis.requireAuth(),
)
