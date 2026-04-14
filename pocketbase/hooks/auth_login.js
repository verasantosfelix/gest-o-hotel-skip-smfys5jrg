routerAdd('POST', '/backend/v1/auth/login', (e) => {
  const body = e.requestInfo().body || {}
  const identifier = (body.identifier || '').trim()
  const password = body.password || ''

  if (!identifier || !password) {
    return e.badRequestError('Missing credentials')
  }

  let user
  try {
    if (identifier.includes('@')) {
      user = $app.findAuthRecordByEmail('users', identifier)
    } else {
      try {
        user = $app.findFirstRecordByData('users', 'employee_number', identifier)
      } catch (_) {
        try {
          user = $app.findFirstRecordByData('users', 'phone', identifier)
        } catch (_) {
          return e.badRequestError('Invalid credentials.')
        }
      }
    }
  } catch (_) {
    return e.badRequestError('Invalid credentials.')
  }

  if (!user.validatePassword(password)) {
    return e.badRequestError('Invalid credentials.')
  }

  if (user.getBool('is_active') === false) {
    return e.forbiddenError('Account suspended.')
  }

  return $apis.recordAuthResponse($app, e, user)
})
