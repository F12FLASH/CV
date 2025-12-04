import { Router, Request } from "express";
import { storage } from "../storage";
import { requireAdmin } from "../middleware/auth";
import { insertEmailCampaignSchema, insertEmailTemplateSchema } from "@shared/schema";
import nodemailer from "nodemailer";

const router = Router();

function getBaseUrl(req: Request): string {
  if (process.env.SITE_URL) return process.env.SITE_URL;
  const protocol = req.headers['x-forwarded-proto'] || req.protocol || 'https';
  const host = req.headers['x-forwarded-host'] || req.headers.host || 'localhost:5000';
  return `${protocol}://${host}`;
}

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
  });
}

router.get("/templates", requireAdmin, async (req, res) => {
  try {
    const templates = await storage.getAllEmailTemplates();
    res.json(templates);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

router.get("/templates/:id", requireAdmin, async (req, res) => {
  try {
    const template = await storage.getEmailTemplate(parseInt(req.params.id));
    if (!template) {
      return res.status(404).json({ message: "Template not found" });
    }
    res.json(template);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

router.post("/templates", requireAdmin, async (req, res) => {
  try {
    const parsed = insertEmailTemplateSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ message: "Invalid data", errors: parsed.error.errors });
    }
    const template = await storage.createEmailTemplate(parsed.data);
    res.status(201).json(template);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

router.put("/templates/:id", requireAdmin, async (req, res) => {
  try {
    const template = await storage.updateEmailTemplate(parseInt(req.params.id), req.body);
    if (!template) {
      return res.status(404).json({ message: "Template not found" });
    }
    res.json(template);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

router.delete("/templates/:id", requireAdmin, async (req, res) => {
  try {
    const deleted = await storage.deleteEmailTemplate(parseInt(req.params.id));
    if (!deleted) {
      return res.status(404).json({ message: "Template not found" });
    }
    res.json({ message: "Template deleted successfully" });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

router.get("/campaigns", requireAdmin, async (req, res) => {
  try {
    const campaigns = await storage.getAllEmailCampaigns();
    res.json(campaigns);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

router.get("/campaigns/:id", requireAdmin, async (req, res) => {
  try {
    const campaign = await storage.getEmailCampaign(parseInt(req.params.id));
    if (!campaign) {
      return res.status(404).json({ message: "Campaign not found" });
    }
    res.json(campaign);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

router.post("/campaigns", requireAdmin, async (req, res) => {
  try {
    const parsed = insertEmailCampaignSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ message: "Invalid data", errors: parsed.error.errors });
    }
    const campaign = await storage.createEmailCampaign(parsed.data);
    res.status(201).json(campaign);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

router.put("/campaigns/:id", requireAdmin, async (req, res) => {
  try {
    const campaign = await storage.updateEmailCampaign(parseInt(req.params.id), req.body);
    if (!campaign) {
      return res.status(404).json({ message: "Campaign not found" });
    }
    res.json(campaign);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

router.delete("/campaigns/:id", requireAdmin, async (req, res) => {
  try {
    const deleted = await storage.deleteEmailCampaign(parseInt(req.params.id));
    if (!deleted) {
      return res.status(404).json({ message: "Campaign not found" });
    }
    res.json({ message: "Campaign deleted successfully" });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

router.post("/campaigns/:id/send", requireAdmin, async (req, res) => {
  try {
    const campaignId = parseInt(req.params.id);
    const campaign = await storage.getEmailCampaign(campaignId);
    
    if (!campaign) {
      return res.status(404).json({ message: "Campaign not found" });
    }

    if (campaign.status === 'sent') {
      return res.status(400).json({ message: "Campaign has already been sent" });
    }

    const transporter = await getSmtpTransporter();
    if (!transporter) {
      return res.status(400).json({ message: "SMTP is not configured" });
    }

    const subscribers = await storage.getActiveSubscribers();
    if (subscribers.length === 0) {
      return res.status(400).json({ message: "No active subscribers found" });
    }

    const siteTitle = await storage.getSetting("siteTitle");
    const emailFromName = await storage.getSetting("emailFromName");
    const emailFromAddress = await storage.getSetting("emailFromAddress");
    const smtpUser = await storage.getSetting("smtpUser");

    await storage.updateEmailCampaign(campaignId, {
      status: 'sending',
    });

    let sent = 0;
    for (const subscriber of subscribers) {
      try {
        const baseUrl = getBaseUrl(req);
        const unsubscribeUrl = `${baseUrl}/api/subscribers/unsubscribe/${subscriber.unsubscribeToken}`;

        let htmlContent = campaign.content;
        htmlContent = htmlContent.replace(/\{\{name\}\}/g, subscriber.name || 'Subscriber');
        htmlContent = htmlContent.replace(/\{\{email\}\}/g, subscriber.email);
        htmlContent = htmlContent.replace(/\{\{unsubscribe_url\}\}/g, unsubscribeUrl);

        const fullHtml = `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            ${htmlContent}
            <div style="padding: 20px; text-align: center; background: #f3f4f6; color: #6b7280; font-size: 12px; margin-top: 30px;">
              <p style="margin: 0 0 10px 0;">You received this email because you subscribed to our newsletter.</p>
              <a href="${unsubscribeUrl}" style="color: #6b7280;">Unsubscribe</a>
            </div>
          </div>
        `;

        await transporter.sendMail({
          from: `"${emailFromName?.value || siteTitle?.value || 'Newsletter'}" <${emailFromAddress?.value || smtpUser?.value}>`,
          to: subscriber.email,
          subject: campaign.subject,
          html: fullHtml,
        });
        sent++;
      } catch (emailError) {
        console.error(`Failed to send email to ${subscriber.email}:`, emailError);
      }
    }

    await storage.updateEmailCampaign(campaignId, {
      status: 'sent',
      sentAt: new Date(),
      recipientCount: sent,
    });

    await storage.createActivityLog({
      action: `Email campaign "${campaign.name}" sent to ${sent} subscribers`,
      userId: req.session.userId,
      userName: req.session.username,
      type: 'success'
    });

    res.json({ message: `Campaign sent to ${sent} subscribers`, sent });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

router.post("/campaigns/:id/test", requireAdmin, async (req, res) => {
  try {
    const { testEmail } = req.body;
    const campaignId = parseInt(req.params.id);
    
    if (!testEmail) {
      return res.status(400).json({ message: "Test email is required" });
    }

    const campaign = await storage.getEmailCampaign(campaignId);
    if (!campaign) {
      return res.status(404).json({ message: "Campaign not found" });
    }

    const transporter = await getSmtpTransporter();
    if (!transporter) {
      return res.status(400).json({ message: "SMTP is not configured" });
    }

    const siteTitle = await storage.getSetting("siteTitle");
    const emailFromName = await storage.getSetting("emailFromName");
    const emailFromAddress = await storage.getSetting("emailFromAddress");
    const smtpUser = await storage.getSetting("smtpUser");

    let htmlContent = campaign.content;
    htmlContent = htmlContent.replace(/\{\{name\}\}/g, 'Test User');
    htmlContent = htmlContent.replace(/\{\{email\}\}/g, testEmail);
    htmlContent = htmlContent.replace(/\{\{unsubscribe_url\}\}/g, '#');

    const fullHtml = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: #fef3c7; color: #92400e; padding: 10px; text-align: center; font-size: 12px;">
          This is a test email
        </div>
        ${htmlContent}
      </div>
    `;

    await transporter.sendMail({
      from: `"${emailFromName?.value || siteTitle?.value || 'Newsletter'}" <${emailFromAddress?.value || smtpUser?.value}>`,
      to: testEmail,
      subject: `[TEST] ${campaign.subject}`,
      html: fullHtml,
    });

    res.json({ message: `Test email sent to ${testEmail}` });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

export default router;
