require('dotenv').config();
const nodemailer = require('nodemailer');

(async () => {
  try {
  const user = process.env.EMAIL || process.env.GMAIL_USER || process.env.GMAIL_EMAIL;
  const pass = process.env.EMAIL_PASSWORD || process.env.GMAIL_APP_PASS || process.env.GMAIL_PASS;
    if (!user || !pass) {
      console.error('MISSING_CREDENTIALS');
      process.exit(2);
    }

    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: { user, pass },
    });

    // verify
    await transporter.verify();
    console.log('VERIFY_OK');

    // send test mail
    const info = await transporter.sendMail({
      from: user,
      to: user,
      subject: 'Test email from serverapp',
      text: 'This is a test email sent by automated test script. If you received this, SMTP works.'
    });

    console.log('SEND_OK');
  } catch (err) {
    console.error('ERROR:', err && err.message ? err.message : err);
    process.exitCode = 1;
  }
})();
