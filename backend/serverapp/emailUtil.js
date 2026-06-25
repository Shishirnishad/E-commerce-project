const nodemailer = require("nodemailer");

const emailUser = process.env.EMAIL || process.env.GMAIL_USER || process.env.GMAIL_EMAIL;
const emailPass = process.env.EMAIL_PASSWORD || process.env.GMAIL_APP_PASS || process.env.GMAIL_PASS;

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: { user: emailUser, pass: emailPass },
});

let emailServiceAvailable = true;
transporter.verify()
  .then(() => console.log("✅ Email transporter verified"))
  .catch((err) => {
    emailServiceAvailable = false;
    console.error("❌ Email transporter verification failed:", err && err.message ? err.message : err);
  });

function sendEmail(to, subject, text) {
  if (!emailServiceAvailable) {
    console.error("Email service not available, skipping email to", to);
    return;
  }
  transporter.sendMail({ from: emailUser, to, subject, text })
    .then(() => console.log("✅ Email sent to", to))
    .catch((e) => {
      console.error("❌ sendEmail error:", e && e.message ? e.message : e);
      if (e && (e.code === "EAUTH" || /auth/i.test(e.message || ""))) {
        emailServiceAvailable = false;
      }
    });
}

module.exports = { sendEmail, transporter, emailUser };
