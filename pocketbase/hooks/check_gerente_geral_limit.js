onRecordCreateRequest((e) => {
  const body = e.requestInfo().body
  if (body.profile) {
    try {
      const profile = $app.findRecordById('profiles', body.profile)
      if (profile && profile.get('role_level') === 'Gerente_Geral') {
        const ggProfiles = $app.findRecordsByFilter(
          'profiles',
          "role_level = 'Gerente_Geral'",
          '',
          100,
          0,
        )
        if (ggProfiles.length > 0) {
          const query = ggProfiles.map((p) => `profile = '${p.id}'`).join(' || ')
          const users = $app.findRecordsByFilter('users', query, '', 100, 0)
          if (users.length >= 5) {
            throw new BadRequestError('Limite máximo de 5 Gerentes Gerais atingido.')
          }
        }
      }
    } catch (err) {
      if (err.message && err.message.includes('Limite')) throw new BadRequestError(err.message)
    }
  }
  e.next()
}, 'users')

onRecordUpdateRequest((e) => {
  const body = e.requestInfo().body
  if (body.profile && body.profile !== e.record.get('profile')) {
    try {
      const profile = $app.findRecordById('profiles', body.profile)
      if (profile && profile.get('role_level') === 'Gerente_Geral') {
        const ggProfiles = $app.findRecordsByFilter(
          'profiles',
          "role_level = 'Gerente_Geral'",
          '',
          100,
          0,
        )
        if (ggProfiles.length > 0) {
          const query = ggProfiles.map((p) => `profile = '${p.id}'`).join(' || ')
          const users = $app.findRecordsByFilter('users', query, '', 100, 0)
          if (users.length >= 5) {
            throw new BadRequestError('Limite máximo de 5 Gerentes Gerais atingido.')
          }
        }
      }
    } catch (err) {
      if (err.message && err.message.includes('Limite')) throw new BadRequestError(err.message)
    }
  }
  e.next()
}, 'users')

onRecordUpdateRequest((e) => {
  const body = e.requestInfo().body
  if (body.role_level === 'Gerente_Geral' && e.record.get('role_level') !== 'Gerente_Geral') {
    try {
      const ggProfiles = $app.findRecordsByFilter(
        'profiles',
        "role_level = 'Gerente_Geral'",
        '',
        100,
        0,
      )
      if (ggProfiles.length > 0) {
        const query = ggProfiles.map((p) => `profile = '${p.id}'`).join(' || ')
        const users = $app.findRecordsByFilter('users', query, '', 100, 0)
        if (users.length >= 5) {
          throw new BadRequestError(
            'Limite máximo de 5 Gerentes Gerais atingido. Não é possível alterar o perfil.',
          )
        }
      }
    } catch (err) {
      if (err.message && err.message.includes('Limite')) throw new BadRequestError(err.message)
    }
  }
  e.next()
}, 'profiles')
