migrate(
  (app) => {
    const collection = app.findCollectionByNameOrId('email_templates')
    try {
      app.findFirstRecordByData('email_templates', 'slug', 'reservation-confirmation')
    } catch (e) {
      const record = new Record(collection)
      record.set('name', 'Confirmação de Reserva')
      record.set('slug', 'reservation-confirmation')
      record.set('subject', 'A sua reserva no Hotel SKIP está confirmada!')
      record.set(
        'content',
        `<p>Olá {guest_name},</p>
<p>Sua reserva foi confirmada com sucesso.</p>
<ul>
<li><strong>Quarto:</strong> {room_number}</li>
<li><strong>Check-in:</strong> {check_in}</li>
<li><strong>Check-out:</strong> {check_out}</li>
<li><strong>Total:</strong> {total_amount}</li>
</ul>
<p>Aguardamos a sua visita!</p>`,
      )
      app.save(record)
    }
  },
  (app) => {
    try {
      const record = app.findFirstRecordByData(
        'email_templates',
        'slug',
        'reservation-confirmation',
      )
      app.delete(record)
    } catch (e) {}
  },
)
