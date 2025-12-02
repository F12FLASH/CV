import { Router } from "express";
import { storage } from "../storage";
import { hashPassword } from "../utils/password";
import nodemailer from "nodemailer";
import crypto from "crypto";

const router = Router();

async function getSmtpTransporter() {
  const smtpHost = await storage.getSetting("smtpHost");
  const smtpPort = await storage.getSetting("smtpPort");
  const smtpUser = await storage.getSetting("smtpUser");
  const smtpPassword = await storage.getSetting("smtpPassword");
  const smtpSecure = await storage.getSetting("smtpSecure");

  if (!smtpHost?.value || !smtpPort?.value || !smtpUser?.value || !smtpPassword?.value) {
    return null;
  }

  const port = typeof smtpPort.value === 'string' ? parseInt(smtpPort.value) : smtpPort.value;
  const secure = smtpSecure?.value === true || smtpSecure?.value === 'true';

  return nodemailer.createTransport({
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
}

router.post("/forgot-password", async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ message: "Email is required" });
    }

    const user = await storage.getUserByEmail(email);
    if (!user) {
      return res.json({ message: "If an account exists with this email, a password reset link has been sent." });
    }

    const token = crypto.randomBytes(32).toString('hex');
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000);

    await storage.createPasswordResetToken({
      userId: user.id,
      token,
      expiresAt,
    });

    const transporter = await getSmtpTransporter();
    if (!transporter) {
      console.log('SMTP not configured, skipping password reset email');
      return res.json({ message: "If an account exists with this email, a password reset link has been sent." });
    }

    const siteTitle = await storage.getSetting("siteTitle");
    const emailFromName = await storage.getSetting("emailFromName");
    const emailFromAddress = await storage.getSetting("emailFromAddress");
    const smtpUser = await storage.getSetting("smtpUser");

    const baseUrl = process.env.REPLIT_DEV_DOMAIN 
      ? `https://${process.env.REPLIT_DEV_DOMAIN}` 
      : 'http://localhost:5000';
    const resetUrl = `${baseUrl}/reset-password?token=${token}`;

    const htmlBody = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 20px; color: white; text-align: center;">
          <h2 style="margin: 0;">${siteTitle?.value || 'Portfolio'}</h2>
        </div>
        <div style="padding: 30px; background: #f9fafb;">
          <p style="color: #374151;">Hello ${user.name},</p>
          <p style="color: #374151;">You have requested to reset your password. Click the button below to set a new password:</p>
          <div style="text-align: center; margin: 30px 0;">
            <a href="${resetUrl}" style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; display: inline-block;">Reset Password</a>
          </div>
          <p style="color: #6b7280; font-size: 14px;">This link will expire in 1 hour.</p>
          <p style="color: #6b7280; font-size: 14px;">If you didn't request a password reset, please ignore this email.</p>
        </div>
        <div style="padding: 20px; text-align: center; background: #374151; color: #9ca3af; font-size: 12px;">
          <p style="margin: 0;">Sent from ${siteTitle?.value || 'Portfolio'}</p>
        </div>
      </div>
    `;

    await transporter.sendMail({
      from: `"${emailFromName?.value || siteTitle?.value || 'Portfolio'}" <${emailFromAddress?.value || smtpUser?.value}>`,
      to: user.email,
      subject: "Password Reset Request",
      html: htmlBody,
    });

    await storage.createActivityLog({
      action: `Password reset requested for ${user.email}`,
      userId: user.id,
      userName: user.username,
      type: 'info'
    });

    res.json({ message: "If an account exists with this email, a password reset link has been sent." });
  } catch (error: any) {
    console.error('Forgot password error:', error);
    res.status(500).json({ message: error.message });
  }
});

router.post("/reset-password", async (req, res) => {
  try {
    const { token, newPassword } = req.body;

    if (!token || !newPassword) {
      return res.status(400).json({ message: "Token and new password are required" });
    }

    if (newPassword.length < 8) {
      return res.status(400).json({ message: "Password must be at least 8 characters long" });
    }

    const resetToken = await storage.getPasswordResetToken(token);
    if (!resetToken) {
      return res.status(400).json({ message: "Invalid or expired reset token" });
    }

    if (resetToken.used) {
      return res.status(400).json({ message: "This reset token has already been used" });
    }

    if (new Date() > resetToken.expiresAt) {
      return res.status(400).json({ message: "Reset token has expired" });
    }

    const hashedPassword = await hashPassword(newPassword);
    const now = new Date();
    const expiresAt = new Date(now.getTime() + 90 * 24 * 60 * 60 * 1000);

    await storage.updateUser(resetToken.userId, {
      password: hashedPassword,
      passwordUpdatedAt: now,
      passwordExpiresAt: expiresAt,
    });

    await storage.markPasswordResetTokenUsed(resetToken.id);

    const user = await storage.getUser(resetToken.userId);

    await storage.createActivityLog({
      action: `Password reset completed for ${user?.username || 'unknown'}`,
      userId: resetToken.userId,
      userName: user?.username || 'unknown',
      type: 'success'
    });

    await storage.createSecurityLog({
      eventType: 'password_reset',
      action: 'Password reset via email link',
      userId: resetToken.userId,
      userName: user?.username || 'unknown',
      ipAddress: req.ip || 'unknown',
      userAgent: req.get('User-Agent') || 'unknown',
      blocked: false,
    });

    res.json({ message: "Password has been reset successfully. You can now log in with your new password." });
  } catch (error: any) {
    console.error('Reset password error:', error);
    res.status(500).json({ message: error.message });
  }
});

router.get("/verify-token/:token", async (req, res) => {
  try {
    const { token } = req.params;

    const resetToken = await storage.getPasswordResetToken(token);
    if (!resetToken) {
      return res.status(400).json({ valid: false, message: "Invalid reset token" });
    }

    if (resetToken.used) {
      return res.status(400).json({ valid: false, message: "This reset token has already been used" });
    }

    if (new Date() > resetToken.expiresAt) {
      return res.status(400).json({ valid: false, message: "Reset token has expired" });
    }

    res.json({ valid: true });
  } catch (error: any) {
    res.status(500).json({ valid: false, message: error.message });
  }
});

export default router;
