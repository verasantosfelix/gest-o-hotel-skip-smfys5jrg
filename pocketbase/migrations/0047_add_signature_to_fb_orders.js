migrate(
  (app) => {
    const col = app.findCollectionByNameOrId('fb_orders')

    if (!col.fields.getByName('payment_method')) {
      col.fields.add(
        new SelectField({
          name: 'payment_method',
          values: ['immediate', 'room_charge', 'deferred'],
          maxSelect: 1,
        }),
      )
    }

    if (!col.fields.getByName('signature_file')) {
      col.fields.add(
        new FileField({
          name: 'signature_file',
          maxSelect: 1,
          maxSize: 5242880,
          mimeTypes: ['image/png', 'image/jpeg'],
        }),
      )
    }

    // Allow F&B and Front Desk to update (needed to attach signature and close orders)
    col.updateRule = "@request.auth.id != ''"
    app.save(col)
  },
  (app) => {
    const col = app.findCollectionByNameOrId('fb_orders')
    col.fields.removeByName('payment_method')
    col.fields.removeByName('signature_file')
    col.updateRule = "@request.auth.id != '' && @request.auth.profile.name != 'Front_Desk'"
    app.save(col)
  },
)
