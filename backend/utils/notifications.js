// Simple notification stubs. Replace with SMS/email/push provider later
const sendNotification = async ({ to, subject, message }) => {
  // to: email or phone or user id
  console.log("NOTIFICATION ->", { to, subject, message });
  // integrate with SendGrid/Twilio/Firebase here later
};

module.exports = { sendNotification };
