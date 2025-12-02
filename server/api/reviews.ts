import { Router } from "express";
import { storage } from "../storage";
import { requireAuth, requireAdmin } from "../middleware/auth";
import { insertReviewSchema } from "@shared/schema";
import { broadcastNotification } from "../websocket";

const router = Router();

router.get("/", async (req, res) => {
  try {
    const projectId = req.query.projectId ? parseInt(req.query.projectId as string) : undefined;
    const pending = req.query.pending === "true";
    const approved = req.query.approved === "true";

    let reviews;
    if (pending) {
      reviews = await storage.getPendingReviews();
    } else if (projectId && approved) {
      reviews = await storage.getApprovedReviewsByProject(projectId);
    } else if (projectId) {
      reviews = await storage.getReviewsByProject(projectId);
    } else {
      reviews = await storage.getAllReviews();
    }
    res.json(reviews);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

router.get("/unread", requireAdmin, async (req, res) => {
  try {
    const reviews = await storage.getUnreadReviews();
    res.json(reviews);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

router.get("/:id", async (req, res) => {
  try {
    const review = await storage.getReview(parseInt(req.params.id));
    if (!review) {
      return res.status(404).json({ message: "Review not found" });
    }
    res.json(review);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

router.post("/", async (req, res) => {
  try {
    const parsed = insertReviewSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ message: "Invalid data", errors: parsed.error.errors });
    }
    const review = await storage.createReview(parsed.data);

    const project = await storage.getProject(review.projectId);

    await storage.createNotification({
      message: `New ${review.rating}-star review from ${review.authorName} on "${project?.title || "Unknown"}"`,
      type: "review"
    });

    broadcastNotification({
      type: "NEW_REVIEW",
      message: `New ${review.rating}-star review from ${review.authorName}`,
      data: review
    });

    res.status(201).json(review);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

router.put("/:id", requireAuth, async (req, res) => {
  try {
    const review = await storage.updateReview(parseInt(req.params.id), req.body);
    if (!review) {
      return res.status(404).json({ message: "Review not found" });
    }
    res.json(review);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

router.put("/:id/approve", requireAuth, async (req, res) => {
  try {
    const success = await storage.approveReview(parseInt(req.params.id));
    if (!success) {
      return res.status(404).json({ message: "Review not found" });
    }
    res.json({ message: "Review approved" });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

router.put("/:id/read", requireAuth, async (req, res) => {
  try {
    const success = await storage.markReviewAsRead(parseInt(req.params.id));
    if (!success) {
      return res.status(404).json({ message: "Review not found" });
    }
    res.json({ message: "Review marked as read" });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

router.put("/:id/archive", requireAuth, async (req, res) => {
  try {
    const success = await storage.archiveReview(parseInt(req.params.id));
    if (!success) {
      return res.status(404).json({ message: "Review not found" });
    }
    res.json({ message: "Review archived" });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

router.delete("/:id", requireAuth, async (req, res) => {
  try {
    const success = await storage.deleteReview(parseInt(req.params.id));
    if (!success) {
      return res.status(404).json({ message: "Review not found" });
    }
    res.json({ message: "Review deleted" });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

export default router;
