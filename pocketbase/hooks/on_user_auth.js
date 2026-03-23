onRecordAuthRequest((e) => {
  const isActive = e.record.get('is_active')
  // Older records might have undefined, so check explicitly for false
  if (isActive === false) {
    throw new ForbiddenError('A sua conta está suspensa. Por favor, contacte o administrador.')
  }

  e.next()

  try {
    e.record.set('last_login', new Date().toISOString())
    $app.saveNoValidate(e.record)
  } catch (err) {
    console.log('Failed to update last_login: ' + err)
  }
}, 'users')
