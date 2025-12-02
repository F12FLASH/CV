
import { storage } from "./storage";
import nodemailer from "nodemailer";

// Check for expiring passwords and send reminder emails
export async function checkPasswordExpiry() {
  try {
    const passwordExpirationSetting = await storage.getSecuritySetting('passwordExpiration');
    if (passwordExpirationSetting?.value !== 'true' && passwordExpirationSetting?.value !== true) {
      return; // Password expiration is disabled
    }

    const allUsers = await storage.getAllUsers();
    const now = Date.now();
    const reminderThreshold = 7 * 24 * 60 * 60 * 1000; // 7 days before expiry
    const maxAge = 90 * 24 * 60 * 60 * 1000; // 90 days

    for (const user of allUsers) {
      if (!user.passwordUpdatedAt) {
        // Set initial password update date if missing
        const expiresAt = new Date(now + maxAge);
        await storage.updateUser(user.id, {
          passwordUpdatedAt: new Date(),
          passwordExpiresAt: expiresAt
        });
        continue;
      }

      const passwordAge = now - new Date(user.passwordUpdatedAt).getTime();
      const timeUntilExpiry = maxAge - passwordAge;

      // Check if password will expire in the next 7 days
      if (timeUntilExpiry > 0 && timeUntilExpiry <= reminderThreshold) {
        const daysUntilExpiry = Math.ceil(timeUntilExpiry / (24 * 60 * 60 * 1000));
        await sendPasswordExpiryReminder(user, daysUntilExpiry);
        
        await storage.createActivityLog({
          action: `Password expiry reminder sent to ${user.username} (${daysUntilExpiry} days remaining)`,
          userId: user.id,
          userName: user.username,
          type: 'info'
        });
      }
    }
  } catch (error) {
    console.error('Error checking password expiry:', error);
  }
}

async function sendPasswordExpiryReminder(user: any, daysRemaining: number) {
  try {
    const smtpHost = await storage.getSetting("smtpHost");
    const smtpPort = await storage.getSetting("smtpPort");
    const smtpUser = await storage.getSetting("smtpUser");
    const smtpPassword = await storage.getSetting("smtpPassword");
    const smtpSecure = await storage.getSetting("smtpSecure");
    const emailFromName = await storage.getSetting("emailFromName");
    const emailFromAddress = await storage.getSetting("emailFromAddress");

    if (!smtpHost?.value || !smtpPort?.value || !smtpUser?.value || !smtpPassword?.value) {
      console.log('SMTP not configured, skipping email notification');
      return;
    }

    const port = typeof smtpPort.value === 'string' ? parseInt(smtpPort.value) : smtpPort.value;
    const secure = smtpSecure?.value === true || smtpSecure?.value === 'true';

    const transporter = nodemailer.createTransport({
      host: smtpHost.value as string,
      port: port as number,
      secure: secure,
      auth: {
        user: smtpUser.value as string,
        pass: smtpPassword.value as string,
      },
      requireTLS: !secure,
      connectionTimeout: 10000,
      greetingTimeout: 10000,
      socketTimeout: 10000,
    });

    const subject = `Password Expiry Reminder - ${daysRemaining} day${daysRemaining > 1 ? 's' : ''} remaining`;
    const body = `
      <h2>Password Expiry Reminder</h2>
      <p>Hello ${user.name},</p>
      <p>Your password will expire in <strong>${daysRemaining} day${daysRemaining > 1 ? 's' : ''}</strong>.</p>
      <p>Please change your password before it expires to maintain access to your account.</p>
      <p>You can change your password in your profile settings after logging in.</p>
      <br>
      <p>If you have any questions, please contact the administrator.</p>
      <p>Best regards,<br>System Administrator</p>
    `;

    await transporter.sendMail({
      from: `"${emailFromName?.value || 'Portfolio'}" <${emailFromAddress?.value || smtpUser.value}>`,
      to: user.email,
      subject,
      html: body,
    });

    console.log(`Password expiry reminder sent to ${user.email}`);
  } catch (error) {
    console.error(`Failed to send password expiry reminder to ${user.email}:`, error);
  }
}

// Run the check daily at midnight
export function startPasswordExpiryCron() {
  // Run immediately on startup
  checkPasswordExpiry();

  // Then run every 24 hours
  setInterval(() => {
    checkPasswordExpiry();
  }, 24 * 60 * 60 * 1000);

  console.log('Password expiry cron job started');
}
