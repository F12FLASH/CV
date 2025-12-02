import { Router } from "express";
import { storage } from "../storage";
import { requireAuth } from "../middleware/auth";
import { insertSkillSchema } from "@shared/schema";

const router = Router();

router.get("/", async (req, res) => {
  try {
    const skills = await storage.getAllSkills();
    res.json(skills);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

router.get("/:id", async (req, res) => {
  try {
    const skill = await storage.getSkill(parseInt(req.params.id));
    if (!skill) {
      return res.status(404).json({ message: "Skill not found" });
    }
    res.json(skill);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

router.post("/", requireAuth, async (req, res) => {
  try {
    const parsed = insertSkillSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ message: "Invalid data", errors: parsed.error.errors });
    }
    const skill = await storage.createSkill(parsed.data);
    res.status(201).json(skill);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

router.put("/:id", requireAuth, async (req, res) => {
  try {
    const skill = await storage.updateSkill(parseInt(req.params.id), req.body);
    if (!skill) {
      return res.status(404).json({ message: "Skill not found" });
    }
    res.json(skill);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

router.delete("/:id", requireAuth, async (req, res) => {
  try {
    const success = await storage.deleteSkill(parseInt(req.params.id));
    if (!success) {
      return res.status(404).json({ message: "Skill not found" });
    }
    res.json({ message: "Skill deleted" });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

export default router;
