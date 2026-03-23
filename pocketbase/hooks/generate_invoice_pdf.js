routerAdd(
  'POST',
  '/backend/v1/reservations/{id}/invoice-request',
  (e) => {
    const id = e.request.pathValue('id')
    const res = $app.findRecordById('reservations', id)
    const body = e.requestInfo().body

    let companyName = body.company_name || ''
    let vatNumber = body.vat_number || ''

    if (!companyName || !vatNumber) {
      try {
        const loyalty = $app.findFirstRecordByData(
          'guest_loyalty',
          'guest_name',
          res.get('guest_name'),
        )
        companyName = companyName || loyalty.get('company_name') || ''
        vatNumber = vatNumber || loyalty.get('vat_number') || ''
      } catch (err) {
        // Ignored
      }
    }

    if (res.get('is_corporate') === true && (!companyName || !vatNumber)) {
      throw new BadRequestError('Company Name and VAT Number are required for corporate invoices.')
    }

    const cons = $app.findRecordsByFilter(
      'consumptions',
      `reservation_id = '${id}'`,
      '-created',
      100,
      0,
    )

    let invoiceText = `===== FATURA ${res.get('is_corporate') ? 'CORPORATIVA' : 'HÓSPEDE'} / INVOICE REQUEST =====\n\n`
    invoiceText += `Reserva ID: ${id}\n`
    invoiceText += `Hóspede: ${res.get('guest_name')}\n`
    if (companyName || vatNumber) {
      invoiceText += `Empresa: ${companyName}\n`
      invoiceText += `NIF/VAT: ${vatNumber}\n`
    }
    invoiceText += `Data de Check-in: ${res.get('check_in')}\n`
    invoiceText += `Data de Check-out: ${res.get('check_out')}\n\n`
    invoiceText += `--- DETALHE DE CONSUMOS ---\n`

    let totalCons = 0
    cons.forEach((c) => {
      invoiceText += `- ${c.get('description')} (${c.get('type')}): ${c.get('amount').toFixed(2)}\n`
      totalCons += c.get('amount')
    })

    const baseRate = res.get('balance') || 0
    const grandTotal = baseRate + totalCons

    invoiceText += `\nSaldo Acomodação: ${baseRate.toFixed(2)}\n`
    invoiceText += `Total Extras: ${totalCons.toFixed(2)}\n`
    invoiceText += `------------------------------------------------\n`
    invoiceText += `TOTAL GERAL A FATURAR: ${grandTotal.toFixed(2)}\n`
    invoiceText += `================================================\n`

    try {
      const users = $app.findRecordsByFilter(
        'users',
        "role = 'manager' || profile.role_level = 'Administrativo' || profile.role_level = 'Administrativo_Geral'",
        '',
        50,
        0,
      )
      const notifCol = $app.findCollectionByNameOrId('notifications')

      users.forEach((u) => {
        const notif = new Record(notifCol)
        notif.set('recipient_id', u.id)
        notif.set('sender_id', e.auth?.id || u.id)
        notif.set('title', 'Novo Pedido de Fatura')
        notif.set(
          'message',
          `Fatura solicitada para ${res.get('guest_name')}${companyName ? ` (${companyName})` : ''}.`,
        )
        notif.set('type', 'approval_request')
        notif.set('status', 'unread')
        $app.save(notif)
      })
    } catch (err) {
      console.log('Error sending invoice notifications', err)
    }

    return e.json(200, {
      success: true,
      invoice_text: invoiceText,
      total_amount: grandTotal,
      company_name: companyName,
      vat_number: vatNumber,
    })
  },
  $apis.requireAuth(),
)
