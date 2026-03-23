onRecordCreateRequest((e) => {
  if (e.collection.name !== 'action_audit_logs' && e.collection.name !== 'notifications') {
    const auth = e.auth
    if (auth && auth.get('profile')) {
      try {
        const profile = $app.findRecordById('profiles', auth.get('profile'))
        if (profile && profile.get('role_level') === 'Director_Geral') {
          throw new Error('Director Geral possui acesso apenas de leitura.')
        }
      } catch (err) {
        if (err.message && err.message.includes('Director Geral')) {
          throw new ForbiddenError(err.message)
        }
      }
    }
  }
  e.next()
})

onRecordUpdateRequest((e) => {
  const auth = e.auth
  if (auth && auth.get('profile')) {
    try {
      const profile = $app.findRecordById('profiles', auth.get('profile'))
      if (profile && profile.get('role_level') === 'Director_Geral') {
        throw new Error('Director Geral possui acesso apenas de leitura.')
      }
    } catch (err) {
      if (err.message && err.message.includes('Director Geral')) {
        throw new ForbiddenError(err.message)
      }
    }
  }
  e.next()
})

onRecordDeleteRequest((e) => {
  const auth = e.auth
  if (auth && auth.get('profile')) {
    try {
      const profile = $app.findRecordById('profiles', auth.get('profile'))
      if (profile && profile.get('role_level') === 'Director_Geral') {
        throw new Error('Director Geral possui acesso apenas de leitura.')
      }
    } catch (err) {
      if (err.message && err.message.includes('Director Geral')) {
        throw new ForbiddenError(err.message)
      }
    }
  }
  e.next()
})
