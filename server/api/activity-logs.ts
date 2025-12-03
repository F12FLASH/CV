import { Router } from "express";
import { storage } from "../storage";
import { requireAdmin } from "../middleware/auth";
import { insertActivityLogSchema } from "@shared/schema";

const router = Router();

router.get("/", requireAdmin, async (req, res) => {
  try {
    const limit = req.query.limit ? parseInt(req.query.limit as string) : 50;
    const offset = req.query.offset ? parseInt(req.query.offset as string) : 0;
    const logs = await storage.getAllActivityLogs(limit, offset);
    res.json(logs);
  } catch (error: any) {
    console.error('Error fetching activity logs:', error);
    res.status(500).json({ message: error.message });
  }
});

router.post("/", requireAdmin, async (req, res) => {
  try {
    const parsed = insertActivityLogSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ message: "Invalid data", errors: parsed.error.errors });
    }
    const log = await storage.createActivityLog(parsed.data);
    res.status(201).json(log);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

export default router;
