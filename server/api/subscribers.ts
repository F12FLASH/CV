import { Router } from "express";
import { storage } from "../storage";
import { requireAdmin } from "../middleware/auth";
import { insertSubscriberSchema } from "@shared/schema";
import crypto from "crypto";

const router = Router();

router.get("/", requireAdmin, async (req, res) => {
  try {
    const subscribers = await storage.getAllSubscribers();
    res.json(subscribers);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

router.get("/stats", requireAdmin, async (req, res) => {
  try {
    const all = await storage.getAllSubscribers();
    const active = all.filter(s => s.status === 'active');
    const unsubscribed = all.filter(s => s.status === 'unsubscribed');
    
    res.json({
      total: all.length,
      active: active.length,
      unsubscribed: unsubscribed.length,
    });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

router.post("/subscribe", async (req, res) => {
  try {
    const { email, name, source } = req.body;

    if (!email) {
      return res.status(400).json({ message: "Email is required" });
    }

    const existing = await storage.getSubscriberByEmail(email);
    if (existing) {
      if (existing.status === 'unsubscribed') {
        await storage.updateSubscriber(existing.id, {
          status: 'active',
          unsubscribedAt: null,
          confirmedAt: new Date(),
        });
        return res.json({ message: "Welcome back! You have been resubscribed." });
      }
      return res.json({ message: "You are already subscribed." });
    }

    const unsubscribeToken = crypto.randomBytes(32).toString('hex');

    await storage.createSubscriber({
      email,
      name: name || null,
      status: 'active',
      source: source || 'website',
      unsubscribeToken,
      confirmedAt: new Date(),
    });

    await storage.createActivityLog({
      action: `New subscriber: ${email}`,
      type: 'info'
    });

    res.json({ message: "Successfully subscribed to newsletter" });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

router.get("/unsubscribe/:token", async (req, res) => {
  try {
    const { token } = req.params;

    const subscribers = await storage.getAllSubscribers();
    const subscriber = subscribers.find(s => s.unsubscribeToken === token);

    if (!subscriber) {
      return res.status(400).json({ message: "Invalid unsubscribe link" });
    }

    await storage.updateSubscriber(subscriber.id, {
      status: 'unsubscribed',
      unsubscribedAt: new Date(),
    });

    await storage.createActivityLog({
      action: `Subscriber unsubscribed: ${subscriber.email}`,
      type: 'info'
    });

    res.json({ message: "You have been successfully unsubscribed." });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

router.delete("/:id", requireAdmin, async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const deleted = await storage.deleteSubscriber(id);
    
    if (!deleted) {
      return res.status(404).json({ message: "Subscriber not found" });
    }

    res.json({ message: "Subscriber deleted successfully" });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

router.post("/bulk-delete", requireAdmin, async (req, res) => {
  try {
    const { ids } = req.body;
    
    if (!Array.isArray(ids) || ids.length === 0) {
      return res.status(400).json({ message: "No subscribers selected" });
    }

    let deleted = 0;
    for (const id of ids) {
      const result = await storage.deleteSubscriber(id);
      if (result) deleted++;
    }

    res.json({ message: `${deleted} subscribers deleted successfully` });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

router.post("/import", requireAdmin, async (req, res) => {
  try {
    const { emails, source } = req.body;
    
    if (!Array.isArray(emails) || emails.length === 0) {
      return res.status(400).json({ message: "No emails provided" });
    }

    let imported = 0;
    let skipped = 0;

    for (const email of emails) {
      const trimmedEmail = email.trim().toLowerCase();
      if (!trimmedEmail || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmedEmail)) {
        skipped++;
        continue;
      }

      const existing = await storage.getSubscriberByEmail(trimmedEmail);
      if (existing) {
        skipped++;
        continue;
      }

      const unsubscribeToken = crypto.randomBytes(32).toString('hex');
      await storage.createSubscriber({
        email: trimmedEmail,
        status: 'active',
        source: source || 'import',
        unsubscribeToken,
        confirmedAt: new Date(),
      });
      imported++;
    }

    res.json({ 
      message: `Imported ${imported} subscribers, skipped ${skipped} (invalid or existing)`,
      imported,
      skipped,
    });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

router.get("/export", requireAdmin, async (req, res) => {
  try {
    const subscribers = await storage.getActiveSubscribers();
    const csv = ['email,name,status,source,subscribed_at'];
    
    for (const sub of subscribers) {
      csv.push(`${sub.email},"${sub.name || ''}",${sub.status},${sub.source || ''},${sub.createdAt?.toISOString() || ''}`);
    }

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename=subscribers.csv');
    res.send(csv.join('\n'));
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

export default router;
