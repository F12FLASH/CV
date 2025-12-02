import { Router } from "express";
import { storage } from "../storage";
import { requireAuth } from "../middleware/auth";

const router = Router();

router.get("/stats", requireAuth, async (req, res) => {
  try {
    const [projects, posts, messages, users, comments, reviews] = await Promise.all([
      storage.getAllProjects(),
      storage.getAllPosts(),
      storage.getAllMessages(),
      storage.getAllUsers(),
      storage.getAllComments(),
      storage.getAllReviews()
    ]);

    const totalViews = projects.reduce((sum, p) => sum + (p.views || 0), 0) +
                      posts.reduce((sum, p) => sum + (p.views || 0), 0);

    res.json({
      totalProjects: projects.length,
      publishedProjects: projects.filter(p => p.status === "Published").length,
      totalPosts: posts.length,
      publishedPosts: posts.filter(p => p.status === "Published").length,
      totalMessages: messages.length,
      unreadMessages: messages.filter(m => !m.read).length,
      totalUsers: users.length,
      activeUsers: users.filter(u => u.status === "Active").length,
      totalViews,
      totalComments: comments.length,
      pendingComments: comments.filter(c => c.status === "Pending").length,
      totalReviews: reviews.length,
      pendingReviews: reviews.filter(r => r.status === "Pending").length
    });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

export default router;
