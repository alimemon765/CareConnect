const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.GMAIL_USER,
    pass: process.env.GMAIL_APP_PASSWORD
  }
});

async function sendEmergencyEmail(to, patientName, driverName, vehicleNumber, patientLat, patientLng, timestamp) {
  const mapsLink = `https://www.google.com/maps?q=${patientLat},${patientLng}`;
  const timeStr = new Date(timestamp).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });

  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <div style="background: #DC2626; padding: 20px; border-radius: 8px 8px 0 0;">
        <h1 style="color: white; margin: 0; font-size: 22px;">🚨 Emergency Alert — CareConnect</h1>
      </div>
      <div style="background: #FEF2F2; padding: 24px; border-radius: 0 0 8px 8px; border: 1px solid #FECACA;">
        <p style="font-size: 16px; color: #1f2937;">Your emergency contact <strong>${patientName}</strong> has triggered an SOS alert at <strong>${timeStr}</strong>.</p>
        <div style="background: white; border-radius: 8px; padding: 16px; margin: 16px 0; border: 1px solid #e5e7eb;">
          <p style="margin: 0 0 8px 0;"><strong>🚑 Ambulance Dispatched</strong></p>
          <p style="margin: 0 0 4px 0; color: #6b7280;">Driver: ${driverName}</p>
          <p style="margin: 0 0 4px 0; color: #6b7280;">Vehicle: ${vehicleNumber}</p>
        </div>
        <a href="${mapsLink}" style="display: inline-block; background: #DC2626; color: white; padding: 12px 24px; border-radius: 6px; text-decoration: none; font-weight: bold; margin-top: 8px;">
          📍 View Patient Location on Map
        </a>
        <p style="margin-top: 20px; font-size: 13px; color: #9ca3af;">Please stay available — ${patientName} may need your help. This is an automated alert from CareConnect.</p>
      </div>
    </div>
  `;

  try {
    await transporter.sendMail({
      from: `"CareConnect Emergency" <${process.env.GMAIL_USER}>`,
      to,
      subject: `🚨 Emergency Alert — ${patientName} needs help`,
      html
    });
    console.log(`Emergency email sent to ${to}`);
  } catch (err) {
    console.error(`Email failed:`, err.message);
    // Never throw — email failure must never crash the SOS flow
  }
}

module.exports = sendEmergencyEmail;
