migrate(
  (app) => {
    const col = app.findCollectionByNameOrId('email_templates')

    const t1 = new Record(col)
    t1.set('name', 'Tier Upgrade Welcome')
    t1.set('slug', 'tier_upgrade_welcome')
    t1.set('subject', 'Parabéns pelo novo nível de Fidelidade!')
    t1.set(
      'content',
      '<p>Prezado hóspede,</p><p>Bem-vindo ao seu novo nível! Aproveite benefícios exclusivos na sua próxima estadia.</p>',
    )
    app.save(t1)

    const t2 = new Record(col)
    t2.set('name', 'Promotional Offers')
    t2.set('slug', 'promotional_offers')
    t2.set('subject', 'Ofertas Exclusivas de Verão')
    t2.set(
      'content',
      '<p>Olá,</p><p>Aproveite 20% de desconto no nosso SPA durante todo o mês. Reserve já!</p>',
    )
    app.save(t2)
  },
  (app) => {
    try {
      const t1 = app.findFirstRecordByData('email_templates', 'slug', 'tier_upgrade_welcome')
      app.delete(t1)
    } catch (e) {}
    try {
      const t2 = app.findFirstRecordByData('email_templates', 'slug', 'promotional_offers')
      app.delete(t2)
    } catch (e) {}
  },
)
