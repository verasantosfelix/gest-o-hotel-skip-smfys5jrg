migrate(
  (app) => {
    const protCol = app.findCollectionByNameOrId('security_protocols')
    const incCol = app.findCollectionByNameOrId('security_incidents')
    const accCol = app.findCollectionByNameOrId('security_access_logs')

    const p1 = new Record(protCol)
    p1.set('name', 'Protocolo de Evacuação (Incêndio)')
    p1.set('type', 'fire')
    p1.set('steps', [
      { id: 1, task: 'Acionar alarme geral sonoro', done: false },
      { id: 2, task: 'Ligar para Bombeiros (193)', done: false },
      { id: 3, task: 'Desbloquear catracas e portas automáticas', done: false },
      { id: 4, task: 'Coordenar evacuação via escadas', done: false },
    ])
    p1.set('is_active', false)
    app.save(p1)

    const p2 = new Record(protCol)
    p2.set('name', 'Protocolo de Comportamento Suspeito')
    p2.set('type', 'security')
    p2.set('steps', [
      { id: 1, task: 'Isolar área via CFTV', done: false },
      { id: 2, task: 'Enviar equipe tática para verificação', done: false },
      { id: 3, task: 'Notificar gerência', done: false },
    ])
    p2.set('is_active', false)
    app.save(p2)

    const p3 = new Record(protCol)
    p3.set('name', 'Protocolo de Emergência Médica')
    p3.set('type', 'first_aid')
    p3.set('steps', [
      { id: 1, task: 'Acionar socorrista local', done: false },
      { id: 2, task: 'Ligar para SAMU (192) se necessário', done: false },
      { id: 3, task: 'Preparar DEA (Desfibrilador)', done: false },
    ])
    p3.set('is_active', false)
    app.save(p3)

    const i1 = new Record(incCol)
    i1.set('type', 'Furto/Perda')
    i1.set('location', 'Piscina Principal')
    i1.set('date_time', new Date().toISOString())
    i1.set('involved', 'Hóspede Quarto 304')
    i1.set('origin', 'Relato Front-Desk')
    i1.set('description', 'Hóspede relatou sumiço de óculos de sol próximo à espreguiçadeira.')
    i1.set('category', 'baixa')
    i1.set('status', 'pending')
    app.save(i1)

    const i2 = new Record(incCol)
    i2.set('type', 'Falha de Equipamento')
    i2.set('location', 'Servidor CPD')
    i2.set('date_time', new Date(Date.now() - 86400000).toISOString())
    i2.set('involved', 'Equipe TI')
    i2.set('origin', 'Alarme IoT')
    i2.set('description', 'Queda de energia no rack principal. Nobreak assumiu.')
    i2.set('category', 'alta')
    i2.set('status', 'investigation')
    app.save(i2)

    const a1 = new Record(accCol)
    a1.set('staff_name', 'Carlos (Governança)')
    a1.set('location', 'Almoxarifado Geral')
    a1.set('access_type', 'authorized')
    a1.set('device_source', 'keycard')
    a1.set('timestamp', new Date().toISOString())
    app.save(a1)

    const a2 = new Record(accCol)
    a2.set('staff_name', 'Visitante Desconhecido')
    a2.set('location', 'Acesso Servidores')
    a2.set('access_type', 'denied')
    a2.set('device_source', 'biometric')
    a2.set('timestamp', new Date(Date.now() - 3600000).toISOString())
    app.save(a2)
  },
  (app) => {
    app.db().newQuery('DELETE FROM security_access_logs').execute()
    app.db().newQuery('DELETE FROM security_incidents').execute()
    app.db().newQuery('DELETE FROM security_protocols').execute()
  },
)
