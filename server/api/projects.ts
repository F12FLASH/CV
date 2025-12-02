import { Router } from "express";
import { storage } from "../storage";
import { requireAuth } from "../middleware/auth";
import { insertProjectSchema } from "@shared/schema";

const router = Router();

// Get all projects
router.get("/", async (req, res) => {
  try {
    const projects = req.query.published === "true" 
      ? await storage.getPublishedProjects()
      : await storage.getAllProjects();
    res.json(projects);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

// Get project by ID
router.get("/:id", async (req, res) => {
  try {
    const project = await storage.getProject(parseInt(req.params.id));
    if (!project) {
      return res.status(404).json({ message: "Project not found" });
    }
    res.json(project);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

// Create project
router.post("/", requireAuth, async (req, res) => {
  try {
    const parsed = insertProjectSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ message: "Invalid data", errors: parsed.error.errors });
    }
    const project = await storage.createProject(parsed.data);
    res.status(201).json(project);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

// Update project
router.put("/:id", requireAuth, async (req, res) => {
  try {
    const project = await storage.updateProject(parseInt(req.params.id), req.body);
    if (!project) {
      return res.status(404).json({ message: "Project not found" });
    }
    res.json(project);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

// Delete project
router.delete("/:id", requireAuth, async (req, res) => {
  try {
    const success = await storage.deleteProject(parseInt(req.params.id));
    if (!success) {
      return res.status(404).json({ message: "Project not found" });
    }
    res.json({ message: "Project deleted" });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

// Increment project views
router.post("/:id/view", async (req, res) => {
  try {
    await storage.incrementProjectViews(parseInt(req.params.id));
    res.json({ message: "View counted" });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

export default router;
