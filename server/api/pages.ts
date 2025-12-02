import { Router } from "express";
import { storage } from "../storage";
import { requireAuth } from "../middleware/auth";
import { insertPageSchema } from "@shared/schema";

const router = Router();

// Get all pages
router.get("/", async (req, res) => {
  try {
    const pages = req.query.published === "true"
      ? await storage.getPublishedPages()
      : await storage.getAllPages();
    res.json(pages);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

// Get page by ID or slug
router.get("/:id", async (req, res) => {
  try {
    const page = isNaN(parseInt(req.params.id))
      ? await storage.getPageBySlug(req.params.id)
      : await storage.getPage(parseInt(req.params.id));
    if (!page) {
      return res.status(404).json({ message: "Page not found" });
    }
    res.json(page);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

// Create page
router.post("/", requireAuth, async (req, res) => {
  try {
    const parsed = insertPageSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ message: "Invalid data", errors: parsed.error.errors });
    }
    const page = await storage.createPage(parsed.data);
    res.status(201).json(page);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

// Update page
router.put("/:id", requireAuth, async (req, res) => {
  try {
    const page = await storage.updatePage(parseInt(req.params.id), req.body);
    if (!page) {
      return res.status(404).json({ message: "Page not found" });
    }
    res.json(page);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

// Delete page
router.delete("/:id", requireAuth, async (req, res) => {
  try {
    const success = await storage.deletePage(parseInt(req.params.id));
    if (!success) {
      return res.status(404).json({ message: "Page not found" });
    }
    res.json({ message: "Page deleted" });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

// Increment page views
router.post("/:id/view", async (req, res) => {
  try {
    await storage.incrementPageViews(parseInt(req.params.id));
    res.json({ message: "View counted" });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

export default router;
