import { Router, Request, Response } from "express";
import { storage } from "../storage";
import { requireAdmin } from "../middleware/auth";

const router = Router();

router.get("/sections", async (req: Request, res: Response) => {
  try {
    const sections = await storage.getAllHomepageSections();
    res.json(sections);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

router.get("/sections/:name", async (req: Request, res: Response) => {
  try {
    const section = await storage.getHomepageSectionByName(req.params.name);
    if (!section) {
      return res.status(404).json({ message: "Section not found" });
    }
    res.json(section);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

router.put("/sections/:name", requireAdmin, async (req: Request, res: Response) => {
  try {
    const updated = await storage.upsertHomepageSection(req.params.name, req.body);
    res.json(updated);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

export default router;
