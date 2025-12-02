import { Router } from "express";
import { storage } from "../storage";
import { requireAuth, requireAdmin } from "../middleware/auth";
import { insertCommentSchema } from "@shared/schema";
import { broadcastNotification } from "../websocket";

const router = Router();

router.get("/", async (req, res) => {
  try {
    const postId = req.query.postId ? parseInt(req.query.postId as string) : undefined;
    const projectId = req.query.projectId ? parseInt(req.query.projectId as string) : undefined;
    const pending = req.query.pending === "true";
    const approved = req.query.approved === "true";

    let comments;
    if (pending) {
      comments = await storage.getPendingComments();
    } else if (postId && approved) {
      comments = await storage.getApprovedCommentsByPost(postId);
    } else if (projectId && approved) {
      comments = await storage.getApprovedCommentsByProject(projectId);
    } else if (postId) {
      comments = await storage.getCommentsByPost(postId);
    } else if (projectId) {
      comments = await storage.getCommentsByProject(projectId);
    } else {
      comments = await storage.getAllComments();
    }
    res.json(comments);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

router.get("/unread", requireAdmin, async (req, res) => {
  try {
    const comments = await storage.getUnreadComments();
    res.json(comments);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

router.get("/:id", async (req, res) => {
  try {
    const comment = await storage.getComment(parseInt(req.params.id));
    if (!comment) {
      return res.status(404).json({ message: "Comment not found" });
    }
    res.json(comment);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

router.post("/", async (req, res) => {
  try {
    const parsed = insertCommentSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ message: "Invalid data", errors: parsed.error.errors });
    }
    const comment = await storage.createComment(parsed.data);

    const post = comment.postId ? await storage.getPost(comment.postId) : null;
    const project = comment.projectId ? await storage.getProject(comment.projectId) : null;
    const target = post?.title || project?.title || "Unknown";

    await storage.createNotification({
      message: `New comment from ${comment.authorName} on "${target}"`,
      type: "comment"
    });

    broadcastNotification({
      type: "NEW_COMMENT",
      message: `New comment from ${comment.authorName}`,
      data: comment
    });

    res.status(201).json(comment);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

router.put("/:id", requireAuth, async (req, res) => {
  try {
    const comment = await storage.updateComment(parseInt(req.params.id), req.body);
    if (!comment) {
      return res.status(404).json({ message: "Comment not found" });
    }
    res.json(comment);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

router.put("/:id/approve", requireAuth, async (req, res) => {
  try {
    const success = await storage.approveComment(parseInt(req.params.id));
    if (!success) {
      return res.status(404).json({ message: "Comment not found" });
    }
    res.json({ message: "Comment approved" });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

router.put("/:id/read", requireAuth, async (req, res) => {
  try {
    const success = await storage.markCommentAsRead(parseInt(req.params.id));
    if (!success) {
      return res.status(404).json({ message: "Comment not found" });
    }
    res.json({ message: "Comment marked as read" });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

router.put("/:id/archive", requireAuth, async (req, res) => {
  try {
    const success = await storage.archiveComment(parseInt(req.params.id));
    if (!success) {
      return res.status(404).json({ message: "Comment not found" });
    }
    res.json({ message: "Comment archived" });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

router.delete("/:id", requireAuth, async (req, res) => {
  try {
    const success = await storage.deleteComment(parseInt(req.params.id));
    if (!success) {
      return res.status(404).json({ message: "Comment not found" });
    }
    res.json({ message: "Comment deleted" });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

export default router;
