routerAdd(
  'POST',
  '/backend/v1/users/resend-access',
  (e) => {
    const authRecord = e.auth
    if (!authRecord || authRecord.get('role') !== 'manager') {
      throw new ForbiddenError('Only managers can perform this action.')
    }

    const body = e.requestInfo().body || {}
    const userId = body.userId

    if (!userId) {
      throw new BadRequestError('userId is required.')
    }

    let targetUser
    try {
      targetUser = $app.findRecordById('users', userId)
    } catch (err) {
      throw new NotFoundError('User not found.')
    }

    const email = targetUser.get('email')
    const name = targetUser.get('name') || email

    try {
      let templateRecord = null
      try {
        templateRecord = $app.findFirstRecordByData('email_templates', 'slug', 'welcome-email')
      } catch (err) {}

      let subject = 'Welcome to the Team'
      let content = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2>Welcome to the team!</h2>
          <p>We are excited to have you on board. You are receiving this email with instructions to access the system.</p>
          <p>Please login at: <a href="https://catc.goskip.app">https://catc.goskip.app</a></p>
          <p>If you don't know your password, please use the "Forgot Password" feature on the login page to securely set a new one.</p>
          <br/>
          <p>Best regards,<br/>The Management Team</p>
        </div>
      `

      if (templateRecord) {
        subject = templateRecord.get('subject')
        content = templateRecord.get('content')
      }

      // Replace variables
      subject = subject
        .replace(/{{name}}/g, name)
        .replace(/{{email}}/g, email)
        .replace(/{{password}}/g, '*(Sua senha atual ou redefina no acesso)*')
        .replace(/{{login_url}}/g, 'https://catc.goskip.app')
        .replace(/{{hotel_name}}/g, 'Gestão Hotel SKIP')

      content = content
        .replace(/{{name}}/g, name)
        .replace(/{{email}}/g, email)
        .replace(/{{password}}/g, '*(Sua senha atual ou redefina no acesso)*')
        .replace(/{{login_url}}/g, 'https://catc.goskip.app')
        .replace(/{{hotel_name}}/g, 'Gestão Hotel SKIP')

      const message = new MailerMessage({
        from: {
          address: $app.settings().meta.senderAddress || 'noreply@hotel.com',
          name: 'Gestão Hotel SKIP',
        },
        to: [{ address: email }],
        subject: subject,
        html: content,
      })
      $app.newMailClient().send(message)
    } catch (err) {
      console.log('Notice: Failed to send access email: ' + err)
      throw new BadRequestError('smtp_error')
    }

    try {
      const auditCollection = $app.findCollectionByNameOrId('action_audit_logs')
      const auditRecord = new Record(auditCollection)
      auditRecord.set('user_id', authRecord.id)
      auditRecord.set('action_type', 'email_resend')
      auditRecord.set('module', 'Equipe & RH')
      auditRecord.set('details', { target_user_id: userId, target_email: email })
      $app.save(auditRecord)
    } catch (err) {
      console.log('Failed to create audit log: ' + err)
    }

    return e.json(200, { message: 'Email sent successfully', email: email })
  },
  $apis.requireAuth(),
)
