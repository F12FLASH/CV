import { Router } from "express";
import { storage } from "../storage";
import { requireAuth } from "../middleware/auth";
import { insertPostSchema } from "@shared/schema";

const router = Router();

// Get all posts
router.get("/", async (req, res) => {
  try {
    const posts = req.query.published === "true"
      ? await storage.getPublishedPosts()
      : await storage.getAllPosts();
    res.json(posts);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

// Get post by ID or slug
router.get("/:id", async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const post = isNaN(id) 
      ? await storage.getPostBySlug(req.params.id)
      : await storage.getPost(id);
    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }
    res.json(post);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

// Create post
router.post("/", requireAuth, async (req, res) => {
  try {
    const parsed = insertPostSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ message: "Invalid data", errors: parsed.error.errors });
    }
    const post = await storage.createPost(parsed.data);
    res.status(201).json(post);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

// Update post
router.put("/:id", requireAuth, async (req, res) => {
  try {
    const post = await storage.updatePost(parseInt(req.params.id), req.body);
    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }
    res.json(post);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

// Delete post
router.delete("/:id", requireAuth, async (req, res) => {
  try {
    const success = await storage.deletePost(parseInt(req.params.id));
    if (!success) {
      return res.status(404).json({ message: "Post not found" });
    }
    res.json({ message: "Post deleted" });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

// Increment post views
router.post("/:id/view", async (req, res) => {
  try {
    await storage.incrementPostViews(parseInt(req.params.id));
    res.json({ message: "View counted" });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

export default router;
