migrate(
  (app) => {
    const profiles = app.findCollectionByNameOrId('profiles')
    const field = profiles.fields.getByName('role_level')
    if (field) {
      field.values = [
        'Gerente_Geral',
        'Director_Geral',
        'Administrativo_Geral',
        'Administrativo',
        'Gerente_Area',
        'Responsavel_Equipa',
        'Atendente',
      ]
      app.save(profiles)
    }
  },
  (app) => {
    const profiles = app.findCollectionByNameOrId('profiles')
    const field = profiles.fields.getByName('role_level')
    if (field) {
      field.values = [
        'Gerente_Geral',
        'Director_Geral',
        'Gerente_Area',
        'Responsavel_Equipa',
        'Atendente',
      ]
      app.save(profiles)
    }
  },
)
