migrate(
  (app) => {
    const col = app.findCollectionByNameOrId('ota_connections')

    const records = [
      { channel_name: 'Booking.com', sync_status: 'Active', last_sync: new Date().toISOString() },
      { channel_name: 'Expedia', sync_status: 'Active', last_sync: new Date().toISOString() },
      {
        channel_name: 'Airbnb',
        sync_status: 'Error',
        last_sync: new Date(Date.now() - 86400000 * 2).toISOString(),
      },
      {
        channel_name: 'Hotelbeds',
        sync_status: 'Active',
        last_sync: new Date(Date.now() - 3600000).toISOString(),
      },
    ]

    for (let data of records) {
      const record = new Record(col)
      record.load(data)
      app.save(record)
    }
  },
  (app) => {
    const records = app.findRecordsByFilter('ota_connections', '1=1', '', 100, 0)
    for (let r of records) {
      app.delete(r)
    }
  },
)
