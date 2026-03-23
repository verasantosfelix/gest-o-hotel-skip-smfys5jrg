migrate(
  (app) => {
    const profiles = app.findCollectionByNameOrId('profiles')
    if (!profiles.fields.getByName('role_level')) {
      profiles.fields.add(
        new SelectField({
          name: 'role_level',
          values: [
            'Gerente_Geral',
            'Director_Geral',
            'Gerente_Area',
            'Responsavel_Equipa',
            'Atendente',
          ],
          maxSelect: 1,
          required: false,
        }),
      )
      app.save(profiles)
    }

    const records = app.findRecordsByFilter('profiles', '1=1', '', 1000, 0)
    for (const r of records) {
      if (!r.get('role_level')) {
        const name = r.get('name') || ''
        if (name.includes('Admin') || name.includes('Diretor')) {
          r.set('role_level', 'Gerente_Geral')
          r.set('allowed_actions', ['*'])
        } else {
          r.set('role_level', 'Gerente_Area')
        }
        app.saveNoValidate(r)
      }
    }
  },
  (app) => {
    const profiles = app.findCollectionByNameOrId('profiles')
    if (profiles.fields.getByName('role_level')) {
      profiles.fields.removeByName('role_level')
      app.save(profiles)
    }
  },
)
