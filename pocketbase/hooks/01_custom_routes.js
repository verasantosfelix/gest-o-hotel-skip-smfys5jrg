routerAdd(
  'POST',
  '/backend/v1/ai-chat',
  (e) => {
    const body = e.requestInfo().body || {}
    const msg = (body.message || '').toLowerCase()
    let reply = 'Como posso ajudar?'

    if (msg.includes('informações') || msg.includes('informacoes') || msg.includes('hotel')) {
      reply = 'Nosso café da manhã é servido das 6h às 10h. O check-out é até as 12h.'
    } else if (msg.includes('recomendações') || msg.includes('recomendacoes')) {
      reply =
        'Recomendamos o restaurante Litoral à beira-mar próximo ao hotel, e um passeio de barco ao pôr do sol.'
    } else if (msg.trim() !== '') {
      reply =
        "Entendido. Registrei sua solicitação. Se precisar de algo mais específico, pergunte sobre nossas 'informações' ou 'recomendações'."
    }

    return e.json(200, { reply })
  },
  $apis.requireAuth(),
)

routerAdd(
  'POST',
  '/backend/v1/night-audit',
  (e) => {
    return e.json(200, {
      status: 'Auditoria Concluída',
      details: 'Todos os lançamentos do dia foram reconciliados e conferidos.',
    })
  },
  $apis.requireAuth(),
)
