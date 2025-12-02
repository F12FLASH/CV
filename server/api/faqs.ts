import { Router, Request, Response } from "express";
import { storage } from "../storage";
import { requireAuth } from "../middleware/auth";

const router = Router();

router.get("/", async (req: Request, res: Response) => {
  try {
    const faqs = req.query.visible === "true"
      ? await storage.getVisibleFAQs()
      : await storage.getAllFAQs();
    res.json(faqs);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

router.get("/:id", async (req: Request, res: Response) => {
  try {
    const faq = await storage.getFAQ(parseInt(req.params.id));
    if (!faq) {
      return res.status(404).json({ message: "FAQ not found" });
    }
    res.json(faq);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

router.post("/", requireAuth, async (req: Request, res: Response) => {
  try {
    const faq = await storage.createFAQ(req.body);
    res.status(201).json(faq);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

router.put("/:id", requireAuth, async (req: Request, res: Response) => {
  try {
    const faq = await storage.updateFAQ(parseInt(req.params.id), req.body);
    if (!faq) {
      return res.status(404).json({ message: "FAQ not found" });
    }
    res.json(faq);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

router.delete("/:id", requireAuth, async (req: Request, res: Response) => {
  try {
    const success = await storage.deleteFAQ(parseInt(req.params.id));
    if (!success) {
      return res.status(404).json({ message: "FAQ not found" });
    }
    res.json({ message: "FAQ deleted" });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

export default router;
