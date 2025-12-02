import { Router } from "express";
import { storage } from "../storage";
import { requireAuth } from "../middleware/auth";
import { insertTestimonialSchema } from "@shared/schema";

const router = Router();

router.get("/", async (req, res) => {
  try {
    const testimonials = req.query.active === "true"
      ? await storage.getActiveTestimonials()
      : await storage.getAllTestimonials();
    res.json(testimonials);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

router.get("/:id", async (req, res) => {
  try {
    const testimonial = await storage.getTestimonial(parseInt(req.params.id));
    if (!testimonial) {
      return res.status(404).json({ message: "Testimonial not found" });
    }
    res.json(testimonial);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

router.post("/", requireAuth, async (req, res) => {
  try {
    const parsed = insertTestimonialSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ message: "Invalid data", errors: parsed.error.errors });
    }
    const testimonial = await storage.createTestimonial(parsed.data);
    res.status(201).json(testimonial);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

router.put("/:id", requireAuth, async (req, res) => {
  try {
    const testimonial = await storage.updateTestimonial(parseInt(req.params.id), req.body);
    if (!testimonial) {
      return res.status(404).json({ message: "Testimonial not found" });
    }
    res.json(testimonial);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

router.delete("/:id", requireAuth, async (req, res) => {
  try {
    const success = await storage.deleteTestimonial(parseInt(req.params.id));
    if (!success) {
      return res.status(404).json({ message: "Testimonial not found" });
    }
    res.json({ message: "Testimonial deleted" });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

export default router;
