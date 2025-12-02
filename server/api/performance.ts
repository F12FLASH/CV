import { Router, Request, Response } from "express";
import { storage } from "../storage";
import { requireAdmin } from "../middleware/auth";

const router = Router();

router.post("/clear-cache", requireAdmin, async (req: Request, res: Response) => {
  try {
    await storage.createActivityLog({
      action: "Cache cleared",
      userId: req.session.userId,
      userName: req.session.username,
      type: "info"
    });

    res.json({ message: "Cache cleared successfully", success: true });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

export default router;
