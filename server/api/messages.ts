import { Router } from "express";
import { storage } from "../storage";
import { requireAdmin } from "../middleware/auth";
import { insertMessageSchema } from "@shared/schema";
import { broadcastNewMessage } from "../websocket";
import nodemailer from "nodemailer";

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

router.get("/", requireAdmin, async (req, res) => {
  try {
    const messages = req.query.unread === "true"
      ? await storage.getUnreadMessages()
      : await storage.getAllMessages();
    res.json(messages);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

router.get("/:id", requireAdmin, async (req, res) => {
  try {
    const message = await storage.getMessage(parseInt(req.params.id));
    if (!message) {
      return res.status(404).json({ message: "Message not found" });
    }
    res.json(message);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

router.post("/", async (req, res) => {
  try {
    const { captchaToken, captchaType, ...messageData } = req.body;

    const parsed = insertMessageSchema.safeParse(messageData);
    if (!parsed.success) {
      return res.status(400).json({ message: "Invalid data", errors: parsed.error.errors });
    }
    const message = await storage.createMessage(parsed.data);

    broadcastNewMessage(message);

    res.status(201).json(message);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

router.put("/:id/read", requireAdmin, async (req, res) => {
  try {
    const success = await storage.markMessageAsRead(parseInt(req.params.id));
    if (!success) {
      return res.status(404).json({ message: "Message not found" });
    }
    res.json({ message: "Message marked as read" });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

router.put("/:id/archive", requireAdmin, async (req, res) => {
  try {
    const success = await storage.archiveMessage(parseInt(req.params.id));
    if (!success) {
      return res.status(404).json({ message: "Message not found" });
    }
    res.json({ message: "Message archived" });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

router.delete("/:id", requireAdmin, async (req, res) => {
  try {
    const success = await storage.deleteMessage(parseInt(req.params.id));
    if (!success) {
      return res.status(404).json({ message: "Message not found" });
    }
    res.json({ message: "Message deleted" });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

router.get("/smtp/status", requireAdmin, async (req, res) => {
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

router.post("/:id/reply", requireAdmin, async (req, res) => {
  try {
    const messageId = parseInt(req.params.id);
    const { replyContent } = req.body;

    if (!replyContent || replyContent.trim() === '') {
      return res.status(400).json({ message: "Reply content is required" });
    }

    const message = await storage.getMessage(messageId);
    if (!message) {
      return res.status(404).json({ message: "Message not found" });
    }

    const transporter = await getSmtpTransporter();
    if (!transporter) {
      return res.status(400).json({ message: "SMTP is not configured. Please configure SMTP settings first." });
    }

    const emailFromName = await storage.getSetting("emailFromName");
    const emailFromAddress = await storage.getSetting("emailFromAddress");
    const smtpUser = await storage.getSetting("smtpUser");
    const siteTitle = await storage.getSetting("siteTitle");

    const fromName = emailFromName?.value || siteTitle?.value || 'Portfolio';
    const fromEmail = (emailFromAddress?.value || smtpUser?.value || '') as string;

    const originalSubject = message.subject || 'No Subject';
    const subject = originalSubject.startsWith('Re:') 
      ? originalSubject 
      : `Re: ${originalSubject}`;

    const htmlBody = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 20px; color: white; text-align: center;">
          <h2 style="margin: 0;">${fromName}</h2>
        </div>
        <div style="padding: 30px; background: #f9fafb;">
          <p style="color: #374151;">Hello ${message.sender},</p>
          <div style="margin: 20px 0; padding: 20px; background: white; border-radius: 8px; border-left: 4px solid #667eea;">
            ${replyContent.replace(/\n/g, '<br>')}
          </div>
          <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 30px 0;">
          <p style="color: #6b7280; font-size: 14px;">This is a reply to your message:</p>
          <div style="padding: 15px; background: #f3f4f6; border-radius: 8px; font-size: 14px; color: #6b7280;">
            <p style="margin: 0 0 10px 0;"><strong>Subject:</strong> ${message.subject}</p>
            <p style="margin: 0; white-space: pre-wrap;">${message.message}</p>
          </div>
        </div>
        <div style="padding: 20px; text-align: center; background: #374151; color: #9ca3af; font-size: 12px;">
          <p style="margin: 0;">Sent from ${fromName}</p>
        </div>
      </div>
    `;

    await transporter.sendMail({
      from: `"${fromName}" <${fromEmail}>`,
      to: message.email,
      subject: subject,
      html: htmlBody,
      replyTo: fromEmail,
    });

    await storage.createActivityLog({
      action: `Replied to message from ${message.sender} (${message.email})`,
      userId: req.session.userId!,
      userName: req.session.username || 'Admin',
      type: 'info'
    });

    res.json({ success: true, message: "Reply sent successfully" });
  } catch (error: any) {
    console.error('Error sending reply:', error);
    res.status(500).json({ message: `Failed to send reply: ${error.message}` });
  }
});

export default router;
