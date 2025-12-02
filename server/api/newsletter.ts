import { Router, Request, Response } from "express";
import { storage } from "../storage";
import { requireAdmin } from "../middleware/auth";

const router = Router();

router.get("/settings", async (req: Request, res: Response) => {
  try {
    const settings = await storage.getSetting("newsletter-settings");
    if (settings) {
      const value = typeof settings.value === 'string' ? JSON.parse(settings.value) : settings.value;
      res.json(value);
    } else {
      res.json({
        enabled: false,
        title: "Subscribe to Our Newsletter",
        subtitle: "Get the latest updates",
        description: "Stay informed with our weekly newsletter",
        placeholder: "Enter your email",
        buttonText: "Subscribe",
        successMessage: "Thanks for subscribing!",
      });
    }
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

router.post("/settings", requireAdmin, async (req: Request, res: Response) => {
  try {
    const settings = await storage.upsertSetting("newsletter-settings", req.body);
    const value = typeof settings.value === 'string' ? JSON.parse(settings.value) : settings.value;
    res.json(value);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

router.post("/subscribe", async (req: Request, res: Response) => {
  try {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({ message: "Email is required" });
    }

    await storage.createActivityLog({
      action: `User subscribed to newsletter: ${email}`,
      userId: req.session.userId,
      userName: req.session.username || "Guest",
      type: "info"
    });

    res.json({ message: "Successfully subscribed to newsletter" });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

export default router;
