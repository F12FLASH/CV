import { Router } from "express";
import { storage } from "../storage";
import { requireAuth } from "../middleware/auth";

const router = Router();

router.get("/", async (req, res) => {
  try {
    const settings = await storage.getAllSettings();
    const settingsObj: Record<string, any> = {};
    settings.forEach(s => { settingsObj[s.key] = s.value; });
    res.json(settingsObj);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

router.get("/:key", async (req, res) => {
  try {
    const setting = await storage.getSetting(req.params.key);
    if (!setting) {
      return res.status(404).json({ message: "Setting not found" });
    }
    res.json(setting.value);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

router.put("/:key", requireAuth, async (req, res) => {
  try {
    const setting = await storage.upsertSetting(req.params.key, req.body.value);
    res.json(setting);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

router.put("/", requireAuth, async (req, res) => {
  try {
    const updates = req.body;
    const results = [];
    for (const [key, value] of Object.entries(updates)) {
      const setting = await storage.upsertSetting(key, value);
      results.push(setting);
    }
    res.json(results);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

export default router;
