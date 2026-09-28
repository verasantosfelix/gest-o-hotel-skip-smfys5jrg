migrate(
  (app) => {
    // 1. Encontrar o perfil Direcao_Admin (perfil com acesso total e role_level Gerente_Geral)
    let adminProfile = null
    try {
      adminProfile = app.findFirstRecordByData('profiles', 'name', 'Direcao_Admin')
    } catch (_) {
      try {
        const profiles = app.findRecordsByFilter(
          'profiles',
          "role_level = 'Gerente_Geral'",
          '-created',
          1,
          0,
        )
        if (profiles && profiles.length > 0) {
          adminProfile = profiles[0]
        }
      } catch (e) {}
    }

    // 2. Limpar referências a utilizadores em tabelas relacionadas para preservar a integridade referencial
    const tablesToNullifyUser = [
      { table: 'profiles', column: 'manager_id' },
      { table: 'housekeeping_logs', column: 'staff_id' },
      { table: 'spa_appointments', column: 'therapist_id' },
      { table: 'action_audit_logs', column: 'user_id' },
      { table: 'rooms', column: 'assigned_staff' },
      { table: 'calendar_events', column: 'user_id' },
      { table: 'maintenance_tickets', column: 'technician_id' },
      { table: 'maintenance_tickets', column: 'created_by' },
      { table: 'laundry_logs', column: 'created_by' },
      { table: 'security_access_logs', column: 'user_id' },
      { table: 'security_audits', column: 'auditor_id' },
      { table: 'notifications', column: 'recipient_id' },
      { table: 'notifications', column: 'sender_id' },
      { table: 'staff_documents', column: 'staff_id' },
      { table: 'fb_pdf_versions', column: 'creator_id' },
      { table: 'fb_pdf_versions', column: 'approver_id' },
      { table: 'amenity_requests', column: 'created_by' },
      { table: 'guest_interactions', column: 'staff_id' },
    ]

    for (const item of tablesToNullifyUser) {
      try {
        if (app.hasTable(item.table)) {
          app
            .db()
            .newQuery(
              `UPDATE ${item.table} SET ${item.column} = '' WHERE ${item.column} IS NOT NULL AND ${item.column} != ''`,
            )
            .execute()
        }
      } catch (err) {
        console.log(`Aviso ao limpar ${item.table}.${item.column}: ` + err)
      }
    }

    // 3. Eliminar todos os utilizadores existentes
    try {
      app.db().newQuery('DELETE FROM users').execute()
    } catch (err) {
      console.log('Erro ao eliminar users via SQL direto: ' + err)
      // Fallback via PocketBase records
      try {
        const allUsers = app.findRecordsByFilter('users', '1=1', '', 500, 0)
        for (const u of allUsers) {
          try {
            app.delete(u)
          } catch (_) {}
        }
      } catch (_) {}
    }

    // 4. Criar o novo utilizador administrador
    const usersCollection = app.findCollectionByNameOrId('users')
    const adminUser = new Record(usersCollection)

    adminUser.setEmail('admin@gmail.com')
    adminUser.setPassword('12345678')
    adminUser.setVerified(true)
    adminUser.set('name', 'Administrador')
    adminUser.set('role', 'manager')
    adminUser.set('is_active', true)
    adminUser.set('employee_number', 'ADM001')
    adminUser.set('phone', '910000000')
    adminUser.set('first_login_completed', true)
    // Confirmação de credenciais finais

    if (adminProfile) {
      adminUser.set('profile', adminProfile.id)
    }

    app.save(adminUser)

    // Atualizar manager_id do perfil Direcao_Admin para o novo adminUser
    if (adminProfile) {
      try {
        adminProfile.set('manager_id', adminUser.id)
        app.save(adminProfile)
      } catch (err) {
        console.log('Aviso ao associar manager_id ao perfil Direcao_Admin: ' + err)
      }
    }
  },
  (app) => {
    // Reverter (opcional / noop)
    try {
      const u = app.findAuthRecordByEmail('users', 'admin@gmail.com')
      app.delete(u)
    } catch (_) {}
  },
)
