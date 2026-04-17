routerAdd('POST', '/backend/v1/auth/login', (e) => {
  const body = e.requestInfo().body || {}
  const email = (body.email || '').trim()
  const password = body.password || ''

  if (!email || !password) {
    return e.badRequestError('Missing credentials')
  }

  let user
  try {
    user = $app.findAuthRecordByEmail('users', email)
  } catch (_) {
    return e.badRequestError('Invalid email or password.')
  }

  if (!user.validatePassword(password)) {
    return e.badRequestError('Invalid email or password.')
  }

  if (user.getBool('is_active') === false) {
    return e.forbiddenError('Account suspended.')
  }

  return $apis.recordAuthResponse($app, e, user)
})
