onRecordCreateRequest((e) => {
  const body = e.requestInfo().body
  const password = body.password || ''
  const email = body.email || ''
  const name = body.name || email

  // Let PocketBase save the new user record first
  e.next()

  // After successful save, attempt to send the welcome email
  try {
    let templateRecord = null
    try {
      templateRecord = $app.findFirstRecordByData('email_templates', 'slug', 'welcome-email')
    } catch (err) {}

    let subject = 'Welcome to the [Hotel Name] Team'
    let content = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2>Welcome to the team!</h2>
        <p>We are excited to have you on board. Your account has been successfully created.</p>
        <p>Your temporary login credentials are:</p>
        <ul>
          <li><strong>Email:</strong> ${email}</li>
          <li><strong>Password:</strong> ${password}</li>
        </ul>
        <p>Please login at: <a href="https://catc.goskip.app">https://catc.goskip.app</a></p>
        <p><em>Important: Please change your password immediately upon your first login for security reasons.</em></p>
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
      .replace(/{{password}}/g, password)
      .replace(/{{login_url}}/g, 'https://catc.goskip.app')
      .replace(/{{hotel_name}}/g, 'Gestão Hotel SKIP')

    content = content
      .replace(/{{name}}/g, name)
      .replace(/{{email}}/g, email)
      .replace(/{{password}}/g, password)
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
    console.log('Notice: Failed to send welcome email. SMTP might not be configured. Error: ' + err)
  }
}, 'users')
