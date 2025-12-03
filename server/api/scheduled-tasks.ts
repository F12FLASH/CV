import { Router, Request, Response } from "express";
import { storage } from "../storage";
import { insertScheduledTaskSchema } from "@shared/schema";
import { z } from "zod";

const router = Router();

router.get("/", async (req: Request, res: Response) => {
  try {
    const tasks = await storage.getAllScheduledTasks();
    res.json(tasks);
  } catch (error) {
    console.error("Error fetching scheduled tasks:", error);
    res.status(500).json({ error: "Failed to fetch scheduled tasks" });
  }
});

router.get("/active", async (req: Request, res: Response) => {
  try {
    const tasks = await storage.getActiveScheduledTasks();
    res.json(tasks);
  } catch (error) {
    console.error("Error fetching active scheduled tasks:", error);
    res.status(500).json({ error: "Failed to fetch active scheduled tasks" });
  }
});

router.get("/:id", async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id);
    const task = await storage.getScheduledTask(id);
    if (!task) {
      return res.status(404).json({ error: "Scheduled task not found" });
    }
    res.json(task);
  } catch (error) {
    console.error("Error fetching scheduled task:", error);
    res.status(500).json({ error: "Failed to fetch scheduled task" });
  }
});

router.post("/", async (req: Request, res: Response) => {
  try {
    const data = insertScheduledTaskSchema.parse(req.body);
    const task = await storage.createScheduledTask(data);
    
    await storage.createActivityLog({
      action: `Created scheduled task: ${task.name}`,
      userId: (req as any).user?.id,
      userName: (req as any).user?.name || "System",
      type: "create"
    });
    
    res.status(201).json(task);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: "Validation error", details: error.errors });
    }
    console.error("Error creating scheduled task:", error);
    res.status(500).json({ error: "Failed to create scheduled task" });
  }
});

router.patch("/:id", async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id);
    const task = await storage.updateScheduledTask(id, req.body);
    if (!task) {
      return res.status(404).json({ error: "Scheduled task not found" });
    }
    
    await storage.createActivityLog({
      action: `Updated scheduled task: ${task.name}`,
      userId: (req as any).user?.id,
      userName: (req as any).user?.name || "System",
      type: "update"
    });
    
    res.json(task);
  } catch (error) {
    console.error("Error updating scheduled task:", error);
    res.status(500).json({ error: "Failed to update scheduled task" });
  }
});

router.post("/:id/run", async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id);
    const task = await storage.getScheduledTask(id);
    if (!task) {
      return res.status(404).json({ error: "Scheduled task not found" });
    }
    
    let result: 'success' | 'failed' = 'success';
    let error: string | undefined;
    
    try {
      switch (task.type) {
        case 'backup':
          break;
        case 'email':
          break;
        case 'maintenance':
          break;
        default:
          break;
      }
    } catch (e) {
      result = 'failed';
      error = e instanceof Error ? e.message : 'Unknown error';
    }
    
    const updatedTask = await storage.updateScheduledTaskRun(id, result, error);
    
    await storage.createActivityLog({
      action: `Ran scheduled task: ${task.name} - Result: ${result}`,
      userId: (req as any).user?.id,
      userName: (req as any).user?.name || "System",
      type: result === 'success' ? 'info' : 'error'
    });
    
    res.json({ task: updatedTask, result, error });
  } catch (error) {
    console.error("Error running scheduled task:", error);
    res.status(500).json({ error: "Failed to run scheduled task" });
  }
});

router.post("/:id/pause", async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id);
    const task = await storage.updateScheduledTask(id, { status: "paused" });
    if (!task) {
      return res.status(404).json({ error: "Scheduled task not found" });
    }
    
    await storage.createActivityLog({
      action: `Paused scheduled task: ${task.name}`,
      userId: (req as any).user?.id,
      userName: (req as any).user?.name || "System",
      type: "update"
    });
    
    res.json(task);
  } catch (error) {
    console.error("Error pausing scheduled task:", error);
    res.status(500).json({ error: "Failed to pause scheduled task" });
  }
});

router.post("/:id/resume", async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id);
    const task = await storage.updateScheduledTask(id, { status: "active" });
    if (!task) {
      return res.status(404).json({ error: "Scheduled task not found" });
    }
    
    await storage.createActivityLog({
      action: `Resumed scheduled task: ${task.name}`,
      userId: (req as any).user?.id,
      userName: (req as any).user?.name || "System",
      type: "update"
    });
    
    res.json(task);
  } catch (error) {
    console.error("Error resuming scheduled task:", error);
    res.status(500).json({ error: "Failed to resume scheduled task" });
  }
});

router.delete("/:id", async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id);
    const task = await storage.getScheduledTask(id);
    if (!task) {
      return res.status(404).json({ error: "Scheduled task not found" });
    }
    
    const deleted = await storage.deleteScheduledTask(id);
    
    await storage.createActivityLog({
      action: `Deleted scheduled task: ${task.name}`,
      userId: (req as any).user?.id,
      userName: (req as any).user?.name || "System",
      type: "delete"
    });
    
    res.json({ success: deleted });
  } catch (error) {
    console.error("Error deleting scheduled task:", error);
    res.status(500).json({ error: "Failed to delete scheduled task" });
  }
});

export default router;
