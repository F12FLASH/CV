import type { Express, Request, Response, NextFunction } from "express";
import { createServer, type Server } from "http";
import session from "express-session";
import { storage } from "./storage";
import * as fs from "fs";
import * as path from "path";
import { 
  insertProjectSchema, insertPostSchema, insertSkillSchema,
  insertServiceSchema, insertTestimonialSchema, insertMessageSchema,
  insertUserSchema, insertCategorySchema, insertActivityLogSchema,
  insertNotificationSchema, insertCommentSchema, insertReviewSchema
} from "@shared/schema";
import bcrypt from "bcrypt";
import { broadcastNewMessage, broadcastNotification, broadcastNewComment, broadcastNewReview } from "./websocket";

const SALT_ROUNDS = 12;

declare module "express-session" {
  interface SessionData {
    userId: number;
    username: string;
    role: string;
  }
}

async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, SALT_ROUNDS);
}

async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

function requireAuth(req: Request, res: Response, next: NextFunction) {
  if (!req.session.userId) {
    return res.status(401).json({ message: "Authentication required" });
  }
  next();
}

function requireAdmin(req: Request, res: Response, next: NextFunction) {
  if (!req.session.userId) {
    return res.status(401).json({ message: "Authentication required" });
  }
  if (req.session.role !== "Super Admin" && req.session.role !== "Admin") {
    return res.status(403).json({ message: "Admin access required" });
  }
  next();
}

async function seedInitialData() {
  try {
    // Create default project categories
    const projectCategories = [
      { name: "Full-stack", slug: "full-stack", type: "project", description: "Full-stack applications" },
      { name: "Front-end", slug: "frontend", type: "project", description: "Frontend projects" },
      { name: "Back-end", slug: "backend", type: "project", description: "Backend projects" },
      { name: "Mobile", slug: "mobile", type: "project", description: "Mobile applications" },
      { name: "Design", slug: "design", type: "project", description: "Design projects" },
    ];

    // Create default post categories
    const postCategories = [
      { name: "Web Development", slug: "web-development", type: "post", description: "Web development tips and tricks" },
      { name: "Backend", slug: "backend-post", type: "post", description: "Backend development articles" },
      { name: "Frontend", slug: "frontend-post", type: "post", description: "Frontend development tips" },
      { name: "Tutorial", slug: "tutorial", type: "post", description: "Step-by-step tutorials" },
    ];

    for (const cat of projectCategories) {
      const existing = await storage.getCategoriesByType("project");
      if (!existing.find(c => c.slug === cat.slug)) {
        await storage.createCategory(cat);
      }
    }

    for (const cat of postCategories) {
      const existing = await storage.getCategoriesByType("post");
      if (!existing.find(c => c.slug === cat.slug)) {
        await storage.createCategory(cat);
      }
    }
  } catch (error) {
    console.log("Seed data already exists or error:", error);
  }
}

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  await seedInitialData();

  app.post("/api/auth/login", async (req, res) => {
    try {
      const { username, password } = req.body;
      if (!username || !password) {
        return res.status(400).json({ message: "Username and password required" });
      }
      const user = await storage.getUserByUsernameOrEmail(username);
      if (!user) {
        return res.status(401).json({ message: "Invalid credentials" });
      }
      
      const isValid = await verifyPassword(password, user.password);
      if (!isValid) {
        return res.status(401).json({ message: "Invalid credentials" });
      }

      req.session.userId = user.id;
      req.session.username = user.username;
      req.session.role = user.role;

      await storage.createActivityLog({
        action: `User ${user.name} logged in`,
        userId: user.id,
        userName: user.name,
        type: "success"
      });

      const { password: _, ...userWithoutPassword } = user;
      res.json({ user: userWithoutPassword });
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.post("/api/auth/logout", (req, res) => {
    req.session.destroy((err) => {
      if (err) {
        return res.status(500).json({ message: "Could not log out" });
      }
      res.json({ message: "Logged out successfully" });
    });
  });

  app.get("/api/auth/me", requireAuth, async (req, res) => {
    try {
      const user = await storage.getUser(req.session.userId!);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      const { password, ...userWithoutPassword } = user;
      res.json(userWithoutPassword);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // Profile update endpoint - allows users to update their own profile
  app.put("/api/auth/profile", requireAuth, async (req, res) => {
    try {
      const userId = req.session.userId!;
      const { name, email, username, avatar } = req.body;
      
      // Only allow updating specific fields
      const updateData: any = {};
      if (name !== undefined) updateData.name = name;
      if (email !== undefined) updateData.email = email;
      if (username !== undefined) updateData.username = username;
      if (avatar !== undefined) updateData.avatar = avatar;
      
      // Check if username is taken by another user
      if (username) {
        const existingUser = await storage.getUserByUsername(username);
        if (existingUser && existingUser.id !== userId) {
          return res.status(400).json({ message: "Username already taken" });
        }
      }
      
      // Check if email is taken by another user
      if (email) {
        const existingEmail = await storage.getUserByEmail(email);
        if (existingEmail && existingEmail.id !== userId) {
          return res.status(400).json({ message: "Email already taken" });
        }
      }
      
      const user = await storage.updateUser(userId, updateData);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      
      // Update session with new username if changed
      if (username) {
        req.session.username = username;
      }
      
      const { password, ...userWithoutPassword } = user;
      res.json(userWithoutPassword);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // Password change endpoint
  app.put("/api/auth/password", requireAuth, async (req, res) => {
    try {
      const userId = req.session.userId!;
      const { currentPassword, newPassword } = req.body;
      
      if (!currentPassword || !newPassword) {
        return res.status(400).json({ message: "Current password and new password are required" });
      }
      
      const user = await storage.getUser(userId);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      
      const isValid = await verifyPassword(currentPassword, user.password);
      if (!isValid) {
        return res.status(401).json({ message: "Current password is incorrect" });
      }
      
      const hashedPassword = await hashPassword(newPassword);
      await storage.updateUser(userId, { password: hashedPassword });
      
      res.json({ message: "Password updated successfully" });
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.post("/api/auth/register", requireAdmin, async (req, res) => {
    try {
      const parsed = insertUserSchema.safeParse(req.body);
      if (!parsed.success) {
        return res.status(400).json({ message: "Invalid data", errors: parsed.error.errors });
      }
      const existing = await storage.getUserByUsername(parsed.data.username);
      if (existing) {
        return res.status(400).json({ message: "Username already exists" });
      }
      const hashedPassword = await hashPassword(parsed.data.password);
      const user = await storage.createUser({
        ...parsed.data,
        password: hashedPassword
      });
      const { password: _, ...userWithoutPassword } = user;
      res.status(201).json({ user: userWithoutPassword });
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.get("/api/users", requireAdmin, async (req, res) => {
    try {
      const users = await storage.getAllUsers();
      const usersWithoutPasswords = users.map(({ password, ...user }) => user);
      res.json(usersWithoutPasswords);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.get("/api/users/:id", requireAdmin, async (req, res) => {
    try {
      const user = await storage.getUser(parseInt(req.params.id));
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      const { password, ...userWithoutPassword } = user;
      res.json(userWithoutPassword);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.put("/api/users/:id", requireAdmin, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const updateData = { ...req.body };
      if (updateData.password) {
        updateData.password = await hashPassword(updateData.password);
      }
      const user = await storage.updateUser(id, updateData);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      const { password, ...userWithoutPassword } = user;
      res.json(userWithoutPassword);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.delete("/api/users/:id", requireAdmin, async (req, res) => {
    try {
      const success = await storage.deleteUser(parseInt(req.params.id));
      if (!success) {
        return res.status(404).json({ message: "User not found" });
      }
      res.json({ message: "User deleted" });
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.get("/api/projects", async (req, res) => {
    try {
      const projects = req.query.published === "true" 
        ? await storage.getPublishedProjects()
        : await storage.getAllProjects();
      res.json(projects);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.get("/api/projects/:id", async (req, res) => {
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

  app.post("/api/projects", requireAuth, async (req, res) => {
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

  app.put("/api/projects/:id", requireAuth, async (req, res) => {
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

  app.delete("/api/projects/:id", requireAuth, async (req, res) => {
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

  app.post("/api/projects/:id/view", async (req, res) => {
    try {
      await storage.incrementProjectViews(parseInt(req.params.id));
      res.json({ message: "View counted" });
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.get("/api/posts", async (req, res) => {
    try {
      const posts = req.query.published === "true"
        ? await storage.getPublishedPosts()
        : await storage.getAllPosts();
      res.json(posts);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.get("/api/posts/:id", async (req, res) => {
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

  app.post("/api/posts", requireAuth, async (req, res) => {
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

  app.put("/api/posts/:id", requireAuth, async (req, res) => {
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

  app.delete("/api/posts/:id", requireAuth, async (req, res) => {
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

  app.post("/api/posts/:id/view", async (req, res) => {
    try {
      await storage.incrementPostViews(parseInt(req.params.id));
      res.json({ message: "View counted" });
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.get("/api/skills", async (req, res) => {
    try {
      const skills = await storage.getAllSkills();
      res.json(skills);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.get("/api/skills/:id", async (req, res) => {
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

  app.post("/api/skills", requireAuth, async (req, res) => {
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

  app.put("/api/skills/:id", requireAuth, async (req, res) => {
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

  app.delete("/api/skills/:id", requireAuth, async (req, res) => {
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

  app.get("/api/services", async (req, res) => {
    try {
      const services = req.query.active === "true"
        ? await storage.getActiveServices()
        : await storage.getAllServices();
      res.json(services);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.get("/api/services/:id", async (req, res) => {
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

  app.post("/api/services", requireAuth, async (req, res) => {
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

  app.put("/api/services/:id", requireAuth, async (req, res) => {
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

  app.delete("/api/services/:id", requireAuth, async (req, res) => {
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

  app.get("/api/testimonials", async (req, res) => {
    try {
      const testimonials = req.query.active === "true"
        ? await storage.getActiveTestimonials()
        : await storage.getAllTestimonials();
      res.json(testimonials);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.get("/api/testimonials/:id", async (req, res) => {
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

  app.post("/api/testimonials", requireAuth, async (req, res) => {
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

  app.put("/api/testimonials/:id", requireAuth, async (req, res) => {
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

  app.delete("/api/testimonials/:id", requireAuth, async (req, res) => {
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

  app.get("/api/messages", requireAdmin, async (req, res) => {
    try {
      const messages = req.query.unread === "true"
        ? await storage.getUnreadMessages()
        : await storage.getAllMessages();
      res.json(messages);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.get("/api/messages/:id", requireAdmin, async (req, res) => {
    try {
      const message = await storage.getMessage(parseInt(req.params.id));
      if (!message) {
        return res.status(404).json({ message: "Message not found" });
      }
      res.json(message);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.post("/api/messages", async (req, res) => {
    try {
      const parsed = insertMessageSchema.safeParse(req.body);
      if (!parsed.success) {
        return res.status(400).json({ message: "Invalid data", errors: parsed.error.errors });
      }
      const message = await storage.createMessage(parsed.data);
      
      broadcastNewMessage(message);
      
      res.status(201).json(message);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.put("/api/messages/:id/read", requireAdmin, async (req, res) => {
    try {
      const success = await storage.markMessageAsRead(parseInt(req.params.id));
      if (!success) {
        return res.status(404).json({ message: "Message not found" });
      }
      res.json({ message: "Message marked as read" });
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.put("/api/messages/:id/archive", requireAdmin, async (req, res) => {
    try {
      const success = await storage.archiveMessage(parseInt(req.params.id));
      if (!success) {
        return res.status(404).json({ message: "Message not found" });
      }
      res.json({ message: "Message archived" });
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.delete("/api/messages/:id", requireAdmin, async (req, res) => {
    try {
      const success = await storage.deleteMessage(parseInt(req.params.id));
      if (!success) {
        return res.status(404).json({ message: "Message not found" });
      }
      res.json({ message: "Message deleted" });
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.get("/api/activity-logs", requireAdmin, async (req, res) => {
    try {
      const limit = req.query.limit ? parseInt(req.query.limit as string) : 50;
      const logs = await storage.getAllActivityLogs(limit);
      res.json(logs);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.post("/api/activity-logs", requireAdmin, async (req, res) => {
    try {
      const parsed = insertActivityLogSchema.safeParse(req.body);
      if (!parsed.success) {
        return res.status(400).json({ message: "Invalid data", errors: parsed.error.errors });
      }
      const log = await storage.createActivityLog(parsed.data);
      res.status(201).json(log);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.get("/api/notifications", requireAdmin, async (req, res) => {
    try {
      const userId = req.query.userId ? parseInt(req.query.userId as string) : undefined;
      const notifications = await storage.getAllNotifications(userId);
      res.json(notifications);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.post("/api/notifications", requireAdmin, async (req, res) => {
    try {
      const parsed = insertNotificationSchema.safeParse(req.body);
      if (!parsed.success) {
        return res.status(400).json({ message: "Invalid data", errors: parsed.error.errors });
      }
      const notification = await storage.createNotification(parsed.data);
      res.status(201).json(notification);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.put("/api/notifications/:id/read", requireAdmin, async (req, res) => {
    try {
      const success = await storage.markNotificationAsRead(parseInt(req.params.id));
      if (!success) {
        return res.status(404).json({ message: "Notification not found" });
      }
      res.json({ message: "Notification marked as read" });
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.get("/api/settings", async (req, res) => {
    try {
      const settings = await storage.getAllSettings();
      const settingsObj: Record<string, any> = {};
      settings.forEach(s => { settingsObj[s.key] = s.value; });
      res.json(settingsObj);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.get("/api/settings/:key", async (req, res) => {
    try {
      const setting = await storage.getSetting(req.params.key);
      if (!setting) {
        return res.status(404).json({ message: "Setting not found" });
      }
      res.json(setting.value);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.put("/api/settings/:key", requireAuth, async (req, res) => {
    try {
      const setting = await storage.upsertSetting(req.params.key, req.body.value);
      res.json(setting);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.put("/api/settings", requireAuth, async (req, res) => {
    try {
      const updates = req.body;
      const results = [];
      for (const [key, value] of Object.entries(updates)) {
        const setting = await storage.upsertSetting(key, value);
        results.push(setting);
      }
      res.json(results);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.get("/api/categories", async (req, res) => {
    try {
      const type = req.query.type as string;
      const categories = type 
        ? await storage.getCategoriesByType(type)
        : await storage.getCategoriesByType("all");
      res.json(categories);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.get("/api/categories/:id", async (req, res) => {
    try {
      const category = await storage.getCategory(parseInt(req.params.id));
      if (!category) {
        return res.status(404).json({ message: "Category not found" });
      }
      res.json(category);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.post("/api/categories", requireAuth, async (req, res) => {
    try {
      const parsed = insertCategorySchema.safeParse(req.body);
      if (!parsed.success) {
        return res.status(400).json({ message: "Invalid data", errors: parsed.error.errors });
      }
      const category = await storage.createCategory(parsed.data);
      res.status(201).json(category);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.put("/api/categories/:id", requireAuth, async (req, res) => {
    try {
      const category = await storage.updateCategory(parseInt(req.params.id), req.body);
      if (!category) {
        return res.status(404).json({ message: "Category not found" });
      }
      res.json(category);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.delete("/api/categories/:id", requireAuth, async (req, res) => {
    try {
      const success = await storage.deleteCategory(parseInt(req.params.id));
      if (!success) {
        return res.status(404).json({ message: "Category not found" });
      }
      res.json({ message: "Category deleted" });
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.post("/api/upload/image", requireAuth, async (req, res) => {
    try {
      const { image, filename } = req.body;
      if (!image) {
        return res.status(400).json({ message: "No image data provided" });
      }
      
      // Generate unique filename
      const timestamp = Date.now();
      const name = filename || `upload-${timestamp}`;
      const imagePath = `/uploads/${name}`;
      
      // In production, you would save to cloud storage
      // For now, we'll return the data URL directly
      res.json({ url: image, path: imagePath });
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.get("/api/media", requireAuth, async (req, res) => {
    try {
      const media = await storage.getAllMedia();
      res.json(media);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.post("/api/media", requireAuth, async (req, res) => {
    try {
      const { filename, originalName, mimeType, size, url, alt } = req.body;
      if (!filename || !originalName || !mimeType || !url) {
        return res.status(400).json({ message: "Missing required fields" });
      }
      
      const safeFilename = path.basename(filename).replace(/[^a-zA-Z0-9._-]/g, '_');
      if (!safeFilename || safeFilename.startsWith('.')) {
        return res.status(400).json({ message: "Invalid filename" });
      }
      
      let savedUrl = url;
      
      if (url.startsWith("data:")) {
        const uploadsDir = path.join(process.cwd(), "uploads");
        if (!fs.existsSync(uploadsDir)) {
          fs.mkdirSync(uploadsDir, { recursive: true });
        }
        
        let subDir = "media";
        if (mimeType.startsWith("image/")) {
          subDir = "images";
        } else if (mimeType === "application/pdf" || mimeType.startsWith("application/")) {
          subDir = "documents";
        }
        
        const targetDir = path.join(uploadsDir, subDir);
        if (!fs.existsSync(targetDir)) {
          fs.mkdirSync(targetDir, { recursive: true });
        }
        
        const base64Data = url.split(",")[1];
        if (!base64Data) {
          return res.status(400).json({ message: "Invalid base64 data" });
        }
        
        const buffer = Buffer.from(base64Data, "base64");
        const filePath = path.join(targetDir, safeFilename);
        
        const resolvedPath = path.resolve(filePath);
        const resolvedTargetDir = path.resolve(targetDir);
        if (!resolvedPath.startsWith(resolvedTargetDir)) {
          return res.status(400).json({ message: "Invalid file path" });
        }
        
        fs.writeFileSync(filePath, buffer);
        savedUrl = `/uploads/${subDir}/${safeFilename}`;
      }
      
      const mediaItem = await storage.createMedia({
        filename: safeFilename,
        originalName,
        mimeType,
        size: size || 0,
        url: savedUrl,
        alt: alt || null,
      });
      res.status(201).json(mediaItem);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.get("/api/media/:id", requireAuth, async (req, res) => {
    try {
      const mediaItem = await storage.getMedia(parseInt(req.params.id));
      if (!mediaItem) {
        return res.status(404).json({ message: "Media not found" });
      }
      res.json(mediaItem);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.delete("/api/media/:id", requireAuth, async (req, res) => {
    try {
      const mediaItem = await storage.getMedia(parseInt(req.params.id));
      if (!mediaItem) {
        return res.status(404).json({ message: "Media not found" });
      }
      
      if (mediaItem.url.startsWith("/uploads/")) {
        const relativePath = mediaItem.url.replace(/^\//, "");
        const filePath = path.join(process.cwd(), relativePath);
        if (fs.existsSync(filePath)) {
          fs.unlinkSync(filePath);
        }
      }
      
      const success = await storage.deleteMedia(parseInt(req.params.id));
      if (!success) {
        return res.status(404).json({ message: "Failed to delete media record" });
      }
      res.json({ message: "Media deleted" });
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.get("/api/dashboard/stats", requireAuth, async (req, res) => {
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

  // Comments API
  app.get("/api/comments", async (req, res) => {
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

  app.get("/api/comments/unread", requireAdmin, async (req, res) => {
    try {
      const comments = await storage.getUnreadComments();
      res.json(comments);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.get("/api/comments/:id", async (req, res) => {
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

  app.post("/api/comments", async (req, res) => {
    try {
      console.log('[POST /api/comments] Body:', req.body);
      const parsed = insertCommentSchema.safeParse(req.body);
      if (!parsed.success) {
        console.error('[POST /api/comments] Validation errors:', parsed.error.errors);
        return res.status(400).json({ message: "Invalid data", errors: parsed.error.errors });
      }
      const comment = await storage.createComment(parsed.data);
      console.log('[POST /api/comments] Created comment:', comment);
      
      // Create notification and broadcast
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
      console.error('[POST /api/comments] Error:', error);
      res.status(500).json({ message: error.message });
    }
  });

  app.put("/api/comments/:id", requireAuth, async (req, res) => {
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

  app.put("/api/comments/:id/approve", requireAuth, async (req, res) => {
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

  app.put("/api/comments/:id/read", requireAuth, async (req, res) => {
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

  app.put("/api/comments/:id/archive", requireAuth, async (req, res) => {
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

  app.delete("/api/comments/:id", requireAuth, async (req, res) => {
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

  // Reviews API
  app.get("/api/reviews", async (req, res) => {
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

  app.get("/api/reviews/unread", requireAdmin, async (req, res) => {
    try {
      const reviews = await storage.getUnreadReviews();
      res.json(reviews);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.get("/api/reviews/:id", async (req, res) => {
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

  app.post("/api/reviews", async (req, res) => {
    try {
      console.log('[POST /api/reviews] Body:', req.body);
      const parsed = insertReviewSchema.safeParse(req.body);
      if (!parsed.success) {
        console.error('[POST /api/reviews] Validation errors:', parsed.error.errors);
        return res.status(400).json({ message: "Invalid data", errors: parsed.error.errors });
      }
      const review = await storage.createReview(parsed.data);
      console.log('[POST /api/reviews] Created review:', review);
      
      // Create notification and broadcast
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

  app.put("/api/reviews/:id", requireAuth, async (req, res) => {
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

  app.put("/api/reviews/:id/approve", requireAuth, async (req, res) => {
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

  app.put("/api/reviews/:id/read", requireAuth, async (req, res) => {
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

  app.put("/api/reviews/:id/archive", requireAuth, async (req, res) => {
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

  app.delete("/api/reviews/:id", requireAuth, async (req, res) => {
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

  return httpServer;
}
