import { Router } from "express";
import nodemailer from "nodemailer";
import { storage } from "../storage";
import { requireAdmin } from "../middleware/auth";

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

router.post("/test", requireAdmin, async (req, res) => {
  try {
    const { to, subject, body } = req.body;

    if (!to) {
      return res.status(400).json({ message: "Email address is required" });
    }

    const transporter = await getSmtpTransporter();
    if (!transporter) {
      return res.status(400).json({ message: "SMTP is not configured. Please configure SMTP settings first." });
    }

    const siteTitle = await storage.getSetting("siteTitle");
    const emailFromName = await storage.getSetting("emailFromName");
    const emailFromAddress = await storage.getSetting("emailFromAddress");
    const smtpUser = await storage.getSetting("smtpUser");

    const fromName = emailFromName?.value || siteTitle?.value || 'Portfolio';
    const fromEmail = emailFromAddress?.value || smtpUser?.value || '';

    await transporter.sendMail({
      from: `"${fromName}" <${fromEmail}>`,
      to: to,
      subject: subject || "Test Email from Portfolio",
      html: body || "<h1>Test Email</h1><p>This is a test email from your portfolio admin panel.</p>",
    });

    await storage.createActivityLog({
      action: `Test email sent to ${to}`,
      userId: req.session.userId,
      userName: req.session.username,
      type: 'success'
    });

    res.json({ message: `Test email sent successfully to ${to}` });
  } catch (error: any) {
    console.error("Test email error:", error);
    res.status(500).json({ message: error.message || "Failed to send test email" });
  }
});

router.get("/status", requireAdmin, async (req, res) => {
  try {
    const transporter = await getSmtpTransporter();
    if (!transporter) {
      return res.json({ configured: false, message: "SMTP is not configured" });
    }
    
    try {
      await transporter.verify();
      res.json({ configured: true, active: true, message: "SMTP is configured and active" });
    } catch (verifyError: any) {
      res.json({ configured: true, active: false, message: `SMTP configured but not active: ${verifyError.message}` });
    }
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

router.get("/templates", requireAdmin, async (req, res) => {
  try {
    const templates = await storage.getAllEmailTemplates();
    const result: Record<string, { subject: string; body: string }> = {};
    templates.forEach(t => {
      result[t.name] = { subject: t.subject, body: t.htmlContent };
    });
    res.json(result);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

router.put("/templates/:name", requireAdmin, async (req, res) => {
  try {
    const { name } = req.params;
    const { subject, body } = req.body;
    
    const templates = await storage.getAllEmailTemplates();
    const existing = templates.find(t => t.name === name);
    
    if (existing) {
      await storage.updateEmailTemplate(existing.id, { subject, htmlContent: body });
    } else {
      await storage.createEmailTemplate({ name, subject, htmlContent: body });
    }
    
    res.json({ 
      message: "Template saved successfully",
      template: { subject, body }
    });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

export default router;
