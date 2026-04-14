routerAdd('POST', '/backend/v1/auth/login', (e) => {
  const body = e.requestInfo().body
  let identifier = body.identifier
  const password = body.password

  if (!identifier || !password) {
    throw new BadRequestError('Credenciais inválidas.')
  }

  if (identifier.includes('@')) {
    identifier = identifier.toLowerCase()
  }

  let userRecord
  try {
    userRecord = $app.findFirstRecordByFilter(
      'users',
      'email = {:id} || employee_number = {:id} || phone = {:id}',
      { id: identifier },
    )
  } catch (err) {
    throw new BadRequestError('Credenciais inválidas. Verifique os seus dados.')
  }

  const identity = userRecord.get('email') || userRecord.get('username')

  let url = $secrets.get('PB_INSTANCE_URL')
  if (!url) {
    throw new InternalServerError('PB_INSTANCE_URL not configured')
  }
  if (url.endsWith('/')) url = url.slice(0, -1)

  const res = $http.send({
    url: url + '/api/collections/users/auth-with-password',
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ identity: identity, password: password }),
    timeout: 15,
  })

  if (res.statusCode !== 200) {
    if (res.statusCode === 403) {
      throw new ForbiddenError('A sua conta está suspensa. Por favor, contacte o administrador.')
    }
    throw new BadRequestError('Credenciais inválidas. Verifique os seus dados.')
  }

  return e.json(200, res.json)
})
