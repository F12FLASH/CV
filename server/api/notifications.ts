import { Router } from "express";
import { storage } from "../storage";
import { requireAdmin } from "../middleware/auth";
import { insertNotificationSchema } from "@shared/schema";

const router = Router();

router.get("/", requireAdmin, async (req, res) => {
  try {
    const userId = req.query.userId ? parseInt(req.query.userId as string) : undefined;
    const notifications = await storage.getAllNotifications(userId);
    res.json(notifications);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

router.post("/", requireAdmin, async (req, res) => {
  try {
    const parsed = insertNotificationSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ message: "Invalid data", errors: parsed.error.errors });
    }
    const notification = await storage.createNotification(parsed.data);
    res.status(201).json(notification);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

router.put("/:id/read", requireAdmin, async (req, res) => {
  try {
    const success = await storage.markNotificationAsRead(parseInt(req.params.id));
    if (!success) {
      return res.status(404).json({ message: "Notification not found" });
    }
    res.json({ message: "Notification marked as read" });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

export default router;
