import { Router } from "express";
import { storage } from "../storage";
import { requireAdmin } from "../middleware/auth";
import { insertMessageSchema } from "@shared/schema";
import { broadcastNewMessage } from "../websocket";

const router = Router();

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

export default router;
