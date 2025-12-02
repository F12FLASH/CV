import { Router } from "express";
import { storage } from "../storage";
import { requireAuth } from "../middleware/auth";
import { insertServiceSchema } from "@shared/schema";

const router = Router();

router.get("/", async (req, res) => {
  try {
    const services = req.query.active === "true"
      ? await storage.getActiveServices()
      : await storage.getAllServices();
    res.json(services);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

router.get("/:id", async (req, res) => {
  try {
    const service = await storage.getService(parseInt(req.params.id));
    if (!service) {
      return res.status(404).json({ message: "Service not found" });
    }
    res.json(service);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

router.post("/", requireAuth, async (req, res) => {
  try {
    const parsed = insertServiceSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ message: "Invalid data", errors: parsed.error.errors });
    }
    const service = await storage.createService(parsed.data);
    res.status(201).json(service);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

router.put("/:id", requireAuth, async (req, res) => {
  try {
    const service = await storage.updateService(parseInt(req.params.id), req.body);
    if (!service) {
      return res.status(404).json({ message: "Service not found" });
    }
    res.json(service);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

router.delete("/:id", requireAuth, async (req, res) => {
  try {
    const success = await storage.deleteService(parseInt(req.params.id));
    if (!success) {
      return res.status(404).json({ message: "Service not found" });
    }
    res.json({ message: "Service deleted" });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

export default router;
