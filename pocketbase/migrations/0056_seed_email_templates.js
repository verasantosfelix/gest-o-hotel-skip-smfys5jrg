migrate(
  (app) => {
    const collection = app.findCollectionByNameOrId('email_templates')
    const record = new Record(collection)
    record.set('name', 'Welcome Email')
    record.set('slug', 'welcome-email')
    record.set('subject', 'Welcome to the {{hotel_name}} Team')
    record.set(
      'content',
      `<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
  <h2>Welcome to the team, {{name}}!</h2>
  <p>We are excited to have you on board. Your account has been successfully created.</p>
  <p>Your login credentials are:</p>
  <ul>
    <li><strong>Email:</strong> {{email}}</li>
    <li><strong>Password:</strong> {{password}}</li>
  </ul>
  <p>Please login at: <a href="{{login_url}}">{{login_url}}</a></p>
  <p><em>Important: Please change your password immediately upon your first login for security reasons.</em></p>
  <br/>
  <p>Best regards,<br/>The Management Team</p>
</div>`,
    )
    app.save(record)
  },
  (app) => {
    try {
      const record = app.findFirstRecordByData('email_templates', 'slug', 'welcome-email')
      if (record) app.delete(record)
    } catch (e) {}
  },
)
