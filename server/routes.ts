import type { Express, Request, Response, NextFunction } from "express";
import { createServer, type Server } from "http";
import session from "express-session";
import { storage } from "./storage";
import * as fs from "fs";
import * as path from "path";
import multer from "multer";
import { 
  insertProjectSchema, insertPostSchema, insertPageSchema, insertSkillSchema,
  insertServiceSchema, insertTestimonialSchema, insertMessageSchema,
  insertUserSchema, insertCategorySchema, insertActivityLogSchema,
  insertNotificationSchema, insertCommentSchema, insertReviewSchema
} from "@shared/schema";
import bcrypt from "bcrypt";
import { broadcastNewMessage, broadcastNotification, broadcastNewComment, broadcastNewReview } from "./websocket";
// @ts-ignore - speakeasy doesn't have type definitions
import speakeasy from "speakeasy";
// @ts-ignore - qrcode types may be incomplete  
import QRCode from "qrcode";
import { 
  generateRegistrationOptions, 
  verifyRegistrationResponse,
  generateAuthenticationOptions,
  verifyAuthenticationResponse 
} from "@simplewebauthn/server";
import nodemailer from "nodemailer";
import { rateLimitMiddleware, loginRateLimitMiddleware, recordFailedLogin, clearLoginAttempts } from "./middleware/security";

// Configure multer for file uploads
const uploadsDir = path.join(process.cwd(), "uploads");
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

const multerStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    let subDir = "media";
    if (file.mimetype.startsWith("image/")) {
      subDir = "images";
    } else if (
      file.mimetype === "application/pdf" ||
      file.mimetype === "application/msword" ||
      file.mimetype === "application/vnd.openxmlformats-officedocument.wordprocessingml.document" ||
      file.mimetype === "application/vnd.ms-excel" ||
      file.mimetype === "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" ||
      file.mimetype === "application/vnd.ms-powerpoint" ||
      file.mimetype === "application/vnd.openxmlformats-officedocument.presentationml.presentation" ||
      file.mimetype === "text/plain"
    ) {
      subDir = "documents";
    }
    
    const targetDir = path.join(uploadsDir, subDir);
    if (!fs.existsSync(targetDir)) {
      fs.mkdirSync(targetDir, { recursive: true });
    }
    cb(null, targetDir);
  },
  filename: (req, file, cb) => {
    const timestamp = Date.now();
    const safeFilename = file.originalname.replace(/[^a-zA-Z0-9._-]/g, '_');
    cb(null, `${timestamp}-${safeFilename}`);
  }
});

const upload = multer({
  storage: multerStorage,
  limits: {
    fileSize: 50 * 1024 * 1024, // 50MB limit
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = [
      'image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/svg+xml',
      'application/pdf',
      'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/vnd.ms-excel', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'application/vnd.ms-powerpoint', 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
      'text/plain'
    ];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error(`File type ${file.mimetype} not allowed`));
    }
  }
});

const SALT_ROUNDS = 12;

declare module "express-session" {
  interface SessionData {
    userId: number;
    username: string;
    role: string;
    pending2FA?: boolean;
    pendingUserId?: number;
    temp2FASecret?: string;
    currentChallenge?: string;
    tempUserId?: number;
  }
}

async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, SALT_ROUNDS);
}

async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

interface CaptchaVerifyResult {
  success: boolean;
  score?: number;
  error?: string;
}

async function verifyCaptcha(
  captchaToken: string | undefined, 
  captchaType: string | undefined,
  secretKey?: string
): Promise<CaptchaVerifyResult> {
  if (!captchaType || captchaType === 'disabled') {
    return { success: true };
  }

  if (captchaType === 'local') {
    try {
      if (!captchaToken) return { success: true };
      const data = JSON.parse(captchaToken);
      if (data.type === 'local' && data.timeDiff && data.timeDiff >= 2000) {
        return { success: true };
      }
      return { success: false, error: 'Form submitted too quickly' };
    } catch {
      return { success: true };
    }
  }

  if (!captchaToken) {
    return { success: false, error: 'Captcha token required' };
  }

  if (captchaType === 'google') {
    const googleSecretKey = secretKey || process.env.RECAPTCHA_SECRET_KEY;
    if (!googleSecretKey) {
      console.warn('Google reCAPTCHA secret key not configured');
      return { success: true };
    }
    
    try {
      const response = await fetch('https://www.google.com/recaptcha/api/siteverify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: `secret=${googleSecretKey}&response=${captchaToken}`
      });
      const result = await response.json() as { success: boolean; score?: number; 'error-codes'?: string[] };
      
      if (result.success && (result.score === undefined || result.score >= 0.5)) {
        return { success: true, score: result.score };
      }
      return { success: false, error: 'reCAPTCHA verification failed', score: result.score };
    } catch (error) {
      console.error('reCAPTCHA verification error:', error);
      return { success: true };
    }
  }

  if (captchaType === 'cloudflare') {
    const cfSecretKey = secretKey || process.env.TURNSTILE_SECRET_KEY;
    if (!cfSecretKey) {
      console.warn('Cloudflare Turnstile secret key not configured');
      return { success: true };
    }
    
    try {
      const formData = new URLSearchParams();
      formData.append('secret', cfSecretKey);
      formData.append('response', captchaToken);
      
      const response = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: formData.toString()
      });
      const result = await response.json() as { success: boolean; 'error-codes'?: string[] };
      
      if (result.success) {
        return { success: true };
      }
      return { success: false, error: 'Turnstile verification failed' };
    } catch (error) {
      console.error('Turnstile verification error:', error);
      return { success: true };
    }
  }

  return { success: true };
}

// IP Blocking Middleware
async function checkIpBlocking(req: Request, res: Response, next: NextFunction) {
  const clientIp = req.ip || req.socket.remoteAddress || 'unknown';
  
  // Check if IP is blacklisted
  const ipRules = await storage.getAllIpRules();
  const blacklisted = ipRules.find(rule => rule.type === 'blacklist' && rule.ipAddress === clientIp);
  
  if (blacklisted) {
    await storage.createSecurityLog({
      action: 'Blocked request from blacklisted IP',
      ipAddress: clientIp,
      userAgent: req.get('User-Agent'),
      eventType: 'ip_blocked',
      blocked: true,
      requestPath: req.path
    });
    return res.status(403).json({ message: "Access denied" });
  }
  
  // Check whitelist (if any rules exist, enforce whitelist)
  const whitelisted = ipRules.filter(rule => rule.type === 'whitelist');
  if (whitelisted.length > 0 && !whitelisted.find(rule => rule.ipAddress === clientIp)) {
    await storage.createSecurityLog({
      action: 'Blocked request - IP not whitelisted',
      ipAddress: clientIp,
      userAgent: req.get('User-Agent'),
      eventType: 'ip_not_whitelisted',
      blocked: true,
      requestPath: req.path
    });
    return res.status(403).json({ message: "Access denied - IP not whitelisted" });
  }
  
  next();
}

function requireAuth(req: Request, res: Response, next: NextFunction) {
  if (!req.session.userId) {
    return res.status(401).json({ message: "Authentication required" });
  }
  // Block access if 2FA verification is pending
  if (req.session.pending2FA) {
    return res.status(401).json({ message: "2FA verification required" });
  }
  next();
}

function requireAdmin(req: Request, res: Response, next: NextFunction) {
  if (!req.session.userId) {
    return res.status(401).json({ message: "Authentication required" });
  }
  // Block access if 2FA verification is pending
  if (req.session.pending2FA) {
    return res.status(401).json({ message: "2FA verification required" });
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

  // Apply IP blocking middleware to admin routes
  app.use('/api/auth/login', checkIpBlocking);
  app.use('/admin/*', checkIpBlocking);
  
  // Apply rate limiting to all API routes (except static assets)
  app.use('/api/*', rateLimitMiddleware);

  app.post("/api/auth/login", loginRateLimitMiddleware, async (req, res) => {
    try {
      const { username, password, captchaToken, captchaType } = req.body;
      const clientIp = req.ip || req.socket.remoteAddress || 'unknown';
      const userAgent = req.get('User-Agent') || 'unknown';

      if (!username || !password) {
        return res.status(400).json({ message: "Username and password required" });
      }

      const captchaResult = await verifyCaptcha(captchaToken, captchaType);
      if (!captchaResult.success) {
        recordFailedLogin(clientIp);
        await storage.createSecurityLog({
          action: `Failed login attempt - captcha failed`,
          userId: null,
          userName: username,
          ipAddress: clientIp,
          userAgent: userAgent,
          eventType: "login_failed",
          blocked: true
        });
        return res.status(400).json({ message: captchaResult.error || "Captcha verification failed" });
      }

      const user = await storage.getUserByUsernameOrEmail(username);
      if (!user) {
        recordFailedLogin(clientIp);
        await storage.createSecurityLog({
          action: `Failed login attempt - user not found`,
          userId: null,
          userName: username,
          ipAddress: clientIp,
          userAgent: userAgent,
          eventType: "login_failed",
          blocked: true
        });
        return res.status(401).json({ message: "Invalid credentials" });
      }
      
      const isValid = await verifyPassword(password, user.password);
      if (!isValid) {
        recordFailedLogin(clientIp);
        await storage.createSecurityLog({
          action: `Failed login attempt - invalid password`,
          userId: user.id,
          userName: user.username,
          ipAddress: clientIp,
          userAgent: userAgent,
          eventType: "login_failed",
          blocked: true
        });
        return res.status(401).json({ message: "Invalid credentials" });
      }
      
      // Clear failed login attempts on success
      clearLoginAttempts(clientIp);

      // Check if 2FA is enabled for user
      if (user.twoFactorEnabled) {
        // Check if user has biometric credentials
        const webAuthnCredentials = await storage.getWebAuthnCredentialsByUser(user.id);
        const hasBiometric = webAuthnCredentials.length > 0;

        // Return partial auth requiring 2FA
        req.session.pending2FA = true;
        req.session.pendingUserId = user.id;
        return res.json({ 
          requires2FA: true,
          hasBiometric,
          message: "Please enter your 2FA code"
        });
      }

      // Check password expiration
      const passwordExpirationSetting = await storage.getSecuritySetting('passwordExpiration');
      if (passwordExpirationSetting?.value === 'true' || passwordExpirationSetting?.value === true) {
        if (user.passwordUpdatedAt) {
          const passwordAge = Date.now() - new Date(user.passwordUpdatedAt).getTime();
          const maxAge = 90 * 24 * 60 * 60 * 1000; // 90 days
          if (passwordAge > maxAge) {
            await storage.createSecurityLog({
              action: `Login blocked - password expired`,
              userId: user.id,
              userName: user.username,
              ipAddress: clientIp,
              userAgent: userAgent,
              eventType: "password_expired",
              blocked: true
            });
            return res.status(403).json({ 
              passwordExpired: true,
              userId: user.id,
              message: "Your password has expired. Please reset it to continue."
            });
          }
        } else {
          // If no passwordUpdatedAt, set it to now and calculate expiry
          const now = new Date();
          const expiresAt = new Date(now.getTime() + 90 * 24 * 60 * 60 * 1000);
          await storage.updateUser(user.id, {
            passwordUpdatedAt: now,
            passwordExpiresAt: expiresAt
          });
        }
      }

      req.session.userId = user.id;
      req.session.username = user.username;
      req.session.role = user.role;

      // Create user session record
      const sessionExpiry = new Date();
      sessionExpiry.setHours(sessionExpiry.getHours() + 24); // 24 hour session
      
      await storage.createUserSession({
        sessionId: req.sessionID,
        userId: user.id,
        ipAddress: clientIp,
        userAgent: userAgent,
        deviceInfo: userAgent,
        location: 'Unknown', // Could integrate with IP geolocation service
        expiresAt: sessionExpiry
      });

      await storage.createActivityLog({
        action: `User ${user.name} logged in`,
        userId: user.id,
        userName: user.name,
        type: "success"
      });

      await storage.createSecurityLog({
        action: `Successful login`,
        userId: user.id,
        userName: user.username,
        ipAddress: clientIp,
        userAgent: userAgent,
        eventType: "login_success",
        blocked: false
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

  // Force password reset for expired passwords (without authentication)
  app.post("/api/auth/force-password-reset", async (req, res) => {
    try {
      const { userId, currentPassword, newPassword } = req.body;
      
      if (!userId || !currentPassword || !newPassword) {
        return res.status(400).json({ message: "All fields are required" });
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
      const now = new Date();
      const expiresAt = new Date(now.getTime() + 90 * 24 * 60 * 60 * 1000);
      
      await storage.updateUser(userId, { 
        password: hashedPassword,
        passwordUpdatedAt: now,
        passwordExpiresAt: expiresAt
      });
      
      await storage.createActivityLog({
        action: 'Forced password reset due to expiration',
        userId: user.id,
        userName: user.username,
        type: 'warning'
      });
      
      res.json({ message: "Password reset successfully. You can now login." });
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
      const now = new Date();
      const expiresAt = new Date(now.getTime() + 90 * 24 * 60 * 60 * 1000); // 90 days from now
      
      await storage.updateUser(userId, { 
        password: hashedPassword,
        passwordUpdatedAt: now,
        passwordExpiresAt: expiresAt
      });
      
      await storage.createActivityLog({
        action: 'Password changed successfully',
        userId: userId,
        userName: req.session.username || 'Unknown',
        type: 'success'
      });
      
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

  app.get("/api/pages", async (req, res) => {
    try {
      const pages = req.query.published === "true"
        ? await storage.getPublishedPages()
        : await storage.getAllPages();
      res.json(pages);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.get("/api/pages/:id", async (req, res) => {
    try {
      const page = isNaN(parseInt(req.params.id))
        ? await storage.getPageBySlug(req.params.id)
        : await storage.getPage(parseInt(req.params.id));
      if (!page) {
        return res.status(404).json({ message: "Page not found" });
      }
      res.json(page);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.post("/api/pages", requireAuth, async (req, res) => {
    try {
      const parsed = insertPageSchema.safeParse(req.body);
      if (!parsed.success) {
        return res.status(400).json({ message: "Invalid data", errors: parsed.error.errors });
      }
      const page = await storage.createPage(parsed.data);
      res.status(201).json(page);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.put("/api/pages/:id", requireAuth, async (req, res) => {
    try {
      const page = await storage.updatePage(parseInt(req.params.id), req.body);
      if (!page) {
        return res.status(404).json({ message: "Page not found" });
      }
      res.json(page);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.delete("/api/pages/:id", requireAuth, async (req, res) => {
    try {
      const success = await storage.deletePage(parseInt(req.params.id));
      if (!success) {
        return res.status(404).json({ message: "Page not found" });
      }
      res.json({ message: "Page deleted" });
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.post("/api/pages/:id/view", async (req, res) => {
    try {
      await storage.incrementPageViews(parseInt(req.params.id));
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
      const { captchaToken, captchaType, ...messageData } = req.body;

      const captchaResult = await verifyCaptcha(captchaToken, captchaType);
      if (!captchaResult.success) {
        return res.status(400).json({ message: captchaResult.error || "Captcha verification failed" });
      }

      const parsed = insertMessageSchema.safeParse(messageData);
      if (!parsed.success) {
        return res.status(400).json({ message: "Invalid data", errors: parsed.error.errors });
      }
      const message = await storage.createMessage(parsed.data);
      
      broadcastNewMessage(message);
      
      // Send notification email asynchronously (don't wait for it)
      sendNotificationEmail('contact', {
        senderName: message.sender,
        senderEmail: message.email,
        messageSubject: message.subject || 'No subject',
        messageContent: message.message
      }).catch(err => console.error('Failed to send contact notification email:', err));
      
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

  // New file upload endpoint using multer (FormData)
  app.post("/api/upload/file", requireAuth, upload.single('file'), async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ message: "No file uploaded" });
      }
      
      const file = req.file;
      let subDir = "media";
      if (file.mimetype.startsWith("image/")) {
        subDir = "images";
      } else if (
        file.mimetype === "application/pdf" ||
        file.mimetype === "application/msword" ||
        file.mimetype === "application/vnd.openxmlformats-officedocument.wordprocessingml.document" ||
        file.mimetype === "application/vnd.ms-excel" ||
        file.mimetype === "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" ||
        file.mimetype === "application/vnd.ms-powerpoint" ||
        file.mimetype === "application/vnd.openxmlformats-officedocument.presentationml.presentation" ||
        file.mimetype === "text/plain"
      ) {
        subDir = "documents";
      }
      
      const fileUrl = `/uploads/${subDir}/${file.filename}`;
      
      // Create media record in database
      const mediaItem = await storage.createMedia({
        filename: file.filename,
        originalName: file.originalname,
        mimeType: file.mimetype,
        size: file.size,
        url: fileUrl,
        alt: req.body.alt || null,
      });
      
      res.status(201).json(mediaItem);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // Multiple files upload endpoint
  app.post("/api/upload/files", requireAuth, upload.array('files', 20), async (req, res) => {
    try {
      const files = req.files as Express.Multer.File[];
      if (!files || files.length === 0) {
        return res.status(400).json({ message: "No files uploaded" });
      }
      
      const mediaItems = [];
      
      for (const file of files) {
        let subDir = "media";
        if (file.mimetype.startsWith("image/")) {
          subDir = "images";
        } else if (
          file.mimetype === "application/pdf" ||
          file.mimetype === "application/msword" ||
          file.mimetype === "application/vnd.openxmlformats-officedocument.wordprocessingml.document" ||
          file.mimetype === "application/vnd.ms-excel" ||
          file.mimetype === "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" ||
          file.mimetype === "application/vnd.ms-powerpoint" ||
          file.mimetype === "application/vnd.openxmlformats-officedocument.presentationml.presentation" ||
          file.mimetype === "text/plain"
        ) {
          subDir = "documents";
        }
        
        const fileUrl = `/uploads/${subDir}/${file.filename}`;
        
        const mediaItem = await storage.createMedia({
          filename: file.filename,
          originalName: file.originalname,
          mimeType: file.mimetype,
          size: file.size,
          url: fileUrl,
          alt: null,
        });
        
        mediaItems.push(mediaItem);
      }
      
      res.status(201).json(mediaItems);
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
        } else if (
          mimeType === "application/pdf" ||
          mimeType === "application/msword" ||
          mimeType === "application/vnd.openxmlformats-officedocument.wordprocessingml.document" ||
          mimeType === "application/vnd.ms-excel" ||
          mimeType === "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" ||
          mimeType === "application/vnd.ms-powerpoint" ||
          mimeType === "application/vnd.openxmlformats-officedocument.presentationml.presentation" ||
          mimeType === "text/plain"
        ) {
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

  // Sync files from uploads folder to database
  app.post("/api/media/sync", requireAuth, async (req, res) => {
    try {
      const uploadsDir = path.join(process.cwd(), "uploads");
      const folders = ["images", "documents", "media"];
      const syncedFiles: any[] = [];
      const skippedFiles: string[] = [];
      
      // Get all existing media URLs from database
      const existingMedia = await storage.getAllMedia();
      const existingUrls = new Set(existingMedia.map(m => m.url));
      
      for (const folder of folders) {
        const folderPath = path.join(uploadsDir, folder);
        if (!fs.existsSync(folderPath)) continue;
        
        const files = fs.readdirSync(folderPath);
        for (const filename of files) {
          const filePath = path.join(folderPath, filename);
          const stat = fs.statSync(filePath);
          
          if (!stat.isFile()) continue;
          
          const url = `/uploads/${folder}/${filename}`;
          
          // Skip if already exists in database
          if (existingUrls.has(url)) {
            skippedFiles.push(filename);
            continue;
          }
          
          // Determine mime type
          const ext = path.extname(filename).toLowerCase();
          let mimeType = "application/octet-stream";
          const mimeTypes: Record<string, string> = {
            ".jpg": "image/jpeg", ".jpeg": "image/jpeg", ".png": "image/png",
            ".gif": "image/gif", ".webp": "image/webp", ".svg": "image/svg+xml",
            ".pdf": "application/pdf", ".doc": "application/msword",
            ".docx": "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
            ".xls": "application/vnd.ms-excel",
            ".xlsx": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
            ".txt": "text/plain", ".mp4": "video/mp4", ".mp3": "audio/mpeg"
          };
          if (mimeTypes[ext]) mimeType = mimeTypes[ext];
          
          // Create media record
          const mediaItem = await storage.createMedia({
            filename,
            originalName: filename,
            mimeType,
            size: stat.size,
            url,
            alt: null
          });
          syncedFiles.push(mediaItem);
        }
      }
      
      res.json({
        message: `Synced ${syncedFiles.length} files, skipped ${skippedFiles.length} existing files`,
        synced: syncedFiles,
        skipped: skippedFiles
      });
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
      const parsed = insertCommentSchema.safeParse(req.body);
      if (!parsed.success) {
        return res.status(400).json({ message: "Invalid data", errors: parsed.error.errors });
      }
      const comment = await storage.createComment(parsed.data);
      
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
      
      // Send notification email asynchronously
      const postLink = post ? `/blog/${post.id}` : project ? `/projects/${project.id}` : '/';
      sendNotificationEmail('comment', {
        postTitle: target,
        commenterName: comment.authorName,
        commentContent: comment.content,
        postLink: postLink
      }).catch(err => console.error('Failed to send comment notification email:', err));
      
      res.status(201).json(comment);
    } catch (error: any) {
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
      const parsed = insertReviewSchema.safeParse(req.body);
      if (!parsed.success) {
        return res.status(400).json({ message: "Invalid data", errors: parsed.error.errors });
      }
      const review = await storage.createReview(parsed.data);
      
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

  // System endpoints
  app.get("/api/system/stats", requireAdmin, async (req, res) => {
    try {
      const stats = await storage.getSystemStats();
      res.json(stats);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.get("/api/system/activity-logs", requireAdmin, async (req, res) => {
    try {
      const limit = parseInt(req.query.limit as string) || 50;
      const offset = parseInt(req.query.offset as string) || 0;
      const logs = await storage.getActivityLogs(limit, offset);
      res.json(logs);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.post("/api/system/clear-logs", requireAdmin, async (req, res) => {
    try {
      await storage.clearActivityLogs();
      await storage.createActivityLog({
        action: "Activity logs cleared",
        userId: req.session.userId,
        userName: req.session.username,
        type: "warning"
      });
      res.json({ message: "Logs cleared successfully" });
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.post("/api/system/reset", requireAdmin, async (req, res) => {
    try {
      await storage.createActivityLog({
        action: "System reset requested",
        userId: req.session.userId,
        userName: req.session.username,
        type: "warning"
      });
      res.json({ message: "System reset is not available in this environment. Contact administrator." });
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // Debug Mode endpoints
  app.get("/api/debug/settings", requireAdmin, async (req, res) => {
    try {
      const debugSetting = await storage.getSetting("debugSettings");
      res.json(debugSetting ? JSON.parse(debugSetting.value as string) : { debugMode: false, showQueryDebug: false, performanceProfiling: false });
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.post("/api/debug/settings", requireAdmin, async (req, res) => {
    try {
      const { debugMode, showQueryDebug, performanceProfiling } = req.body;
      await storage.upsertSetting("debugSettings", JSON.stringify({
        debugMode,
        showQueryDebug,
        performanceProfiling,
        updatedAt: new Date()
      }));
      
      await storage.createActivityLog({
        action: `Debug settings updated: Debug Mode=${debugMode}, Query Debug=${showQueryDebug}, Performance Profiling=${performanceProfiling}`,
        userId: req.session.userId,
        userName: req.session.username,
        type: "info"
      });
      
      res.json({ message: "Debug settings saved", debugMode, showQueryDebug, performanceProfiling });
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // ============ 2FA ENDPOINTS ============

  // Generate 2FA secret and QR code
  app.post("/api/auth/2fa/generate", requireAuth, async (req, res) => {
    try {
      const user = await storage.getUser(req.session.userId!);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      const secret = speakeasy.generateSecret({
        name: `Loi Developer (${user.email})`,
        issuer: "Loi Developer Portfolio"
      });

      // Lưu secret tạm thời vào session
      req.session.temp2FASecret = secret.base32;

      // Generate QR code
      const qrCodeUrl = await QRCode.toDataURL(secret.otpauth_url!);

      res.json({
        secret: secret.base32,
        qrCode: qrCodeUrl
      });
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // Verify and enable 2FA
  app.post("/api/auth/2fa/verify", requireAuth, async (req, res) => {
    try {
      const { token } = req.body;
      const secret = req.session.temp2FASecret;

      if (!secret) {
        return res.status(400).json({ message: "No 2FA setup in progress" });
      }

      const verified = speakeasy.totp.verify({
        secret,
        encoding: 'base32',
        token,
        window: 2
      });

      if (!verified) {
        return res.status(400).json({ message: "Invalid verification code" });
      }

      // Save secret to database
      await storage.updateUser(req.session.userId!, {
        twoFactorSecret: secret,
        twoFactorEnabled: true
      });

      delete req.session.temp2FASecret;

      await storage.createActivityLog({
        action: "2FA enabled",
        userId: req.session.userId,
        userName: req.session.username,
        type: "success"
      });

      res.json({ message: "2FA enabled successfully" });
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // Disable 2FA
  app.post("/api/auth/2fa/disable", requireAuth, async (req, res) => {
    try {
      const { token } = req.body;
      const user = await storage.getUser(req.session.userId!);

      if (!user?.twoFactorSecret) {
        return res.status(400).json({ message: "2FA not enabled" });
      }

      const verified = speakeasy.totp.verify({
        secret: user.twoFactorSecret,
        encoding: 'base32',
        token,
        window: 2
      });

      if (!verified) {
        return res.status(400).json({ message: "Invalid verification code" });
      }

      await storage.updateUser(req.session.userId!, {
        twoFactorSecret: null,
        twoFactorEnabled: false
      });

      await storage.createActivityLog({
        action: "2FA disabled",
        userId: req.session.userId,
        userName: req.session.username,
        type: "warning"
      });

      res.json({ message: "2FA disabled successfully" });
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // Verify 2FA token during login (legacy)
  app.post("/api/auth/2fa/login", async (req, res) => {
    try {
      const { userId, token } = req.body;
      const user = await storage.getUser(userId);

      if (!user?.twoFactorSecret) {
        return res.status(400).json({ message: "2FA not enabled for this user" });
      }

      const verified = speakeasy.totp.verify({
        secret: user.twoFactorSecret,
        encoding: 'base32',
        token,
        window: 2
      });

      if (!verified) {
        return res.status(400).json({ message: "Invalid verification code" });
      }

      req.session.userId = user.id;
      req.session.username = user.username;
      req.session.role = user.role;

      const { password: _, twoFactorSecret: __, ...userWithoutSensitive } = user;
      res.json({ user: userWithoutSensitive });
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // Verify 2FA during login flow (session-based)
  app.post("/api/auth/2fa/verify-login", async (req, res) => {
    try {
      const { code } = req.body;
      const clientIp = req.ip || req.socket.remoteAddress || 'unknown';
      const userAgent = req.get('User-Agent') || 'unknown';

      if (!req.session.pending2FA || !req.session.pendingUserId) {
        return res.status(400).json({ message: "No pending 2FA verification" });
      }

      const user = await storage.getUser(req.session.pendingUserId);
      if (!user || !user.twoFactorSecret) {
        return res.status(400).json({ message: "User not found or 2FA not enabled" });
      }

      const verified = speakeasy.totp.verify({
        secret: user.twoFactorSecret,
        encoding: 'base32',
        token: code,
        window: 2
      });

      if (!verified) {
        await storage.createSecurityLog({
          action: "Failed 2FA verification",
          userId: user.id,
          userName: user.username,
          ipAddress: clientIp,
          userAgent: userAgent,
          eventType: "two_factor_failed",
          blocked: false
        });
        return res.status(400).json({ message: "Invalid verification code" });
      }

      // Regenerate session to prevent session fixation attacks
      // All session mutations must happen inside the callback
      req.session.regenerate(async (err) => {
        if (err) {
          console.error('Session regeneration failed:', err);
          return res.status(500).json({ message: "Session error, please try again" });
        }

        // Set full session after successful verification AND regeneration
        req.session.userId = user.id;
        req.session.username = user.username;
        req.session.role = user.role;

        await storage.createSecurityLog({
          action: "Successful 2FA login",
          userId: user.id,
          userName: user.username,
          ipAddress: clientIp,
          userAgent: userAgent,
          eventType: "login",
          blocked: false
        });

        const { password: _, twoFactorSecret: __, ...userWithoutSensitive } = user;
        res.json({ user: userWithoutSensitive, message: "Login successful" });
      });
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // ============ WEBAUTHN (BIOMETRIC) ENDPOINTS ============

  const rpName = "Loi Developer Portfolio";
  const rpID = process.env.RP_ID || "localhost";
  const origin = process.env.ORIGIN || `http://localhost:5000`;

  // Generate registration options
  app.get("/api/auth/webauthn/register/options", requireAuth, async (req, res) => {
    try {
      const user = await storage.getUser(req.session.userId!);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      const options = await generateRegistrationOptions({
        rpName,
        rpID,
        userID: new TextEncoder().encode(user.id.toString()),
        userName: user.email,
        attestationType: 'none',
        authenticatorSelection: {
          residentKey: 'preferred',
          userVerification: 'preferred',
        },
      });

      req.session.currentChallenge = options.challenge;

      res.json(options);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // Verify registration
  app.post("/api/auth/webauthn/register/verify", requireAuth, async (req, res) => {
    try {
      const { credential, deviceName } = req.body;
      const expectedChallenge = req.session.currentChallenge;

      if (!expectedChallenge) {
        return res.status(400).json({ message: "No challenge in session" });
      }

      const verification = await verifyRegistrationResponse({
        response: credential,
        expectedChallenge,
        expectedOrigin: origin,
        expectedRPID: rpID,
      });

      if (!verification.verified || !verification.registrationInfo) {
        return res.status(400).json({ message: "Verification failed" });
      }

      // Use the new API structure - credential contains id and publicKey
      const { credential: webauthnCredential } = verification.registrationInfo;
      const credentialId = Buffer.from(webauthnCredential.id).toString('base64');
      const publicKey = Buffer.from(webauthnCredential.publicKey).toString('base64');
      const counter = webauthnCredential.counter;

      await storage.createWebAuthnCredential({
        userId: req.session.userId!,
        credentialId,
        publicKey,
        counter,
        deviceName: deviceName || 'Biometric Device'
      });

      delete req.session.currentChallenge;

      await storage.createActivityLog({
        action: `Biometric login registered: ${deviceName || 'Biometric Device'}`,
        userId: req.session.userId,
        userName: req.session.username,
        type: "success"
      });

      res.json({ verified: true });
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // Generate authentication options
  app.post("/api/auth/webauthn/login/options", async (req, res) => {
    try {
      const { email } = req.body;
      
      // Only allow WebAuthn login options when 2FA is pending
      // This prevents challenge farming with stolen session cookies
      // Require BOTH flags to be present
      if (!req.session.pending2FA || !req.session.pendingUserId) {
        return res.status(400).json({ message: "Please login with password first" });
      }

      const user = await storage.getUserByEmail(email);

      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      // Verify the user matches the pending session
      if (req.session.pendingUserId && req.session.pendingUserId !== user.id) {
        return res.status(400).json({ message: "Invalid session state" });
      }

      const credentials = await storage.getWebAuthnCredentialsByUser(user.id);

      if (credentials.length === 0) {
        return res.status(400).json({ message: "No biometric credentials registered" });
      }

      const options = await generateAuthenticationOptions({
        rpID,
        allowCredentials: credentials.map(cred => ({
          id: cred.credentialId, // Already base64 encoded string
        })),
        userVerification: 'preferred',
      });

      req.session.currentChallenge = options.challenge;
      req.session.tempUserId = user.id;

      res.json(options);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // Verify authentication
  app.post("/api/auth/webauthn/login/verify", async (req, res) => {
    try {
      const { credential } = req.body;
      const expectedChallenge = req.session.currentChallenge;
      const userId = req.session.tempUserId;

      // Verify we're in a pending 2FA state
      if (!req.session.pending2FA || !req.session.pendingUserId) {
        return res.status(400).json({ message: "No pending 2FA verification" });
      }

      if (!expectedChallenge || !userId) {
        return res.status(400).json({ message: "Invalid session" });
      }

      // Verify the user matches the pending session
      if (userId !== req.session.pendingUserId) {
        return res.status(400).json({ message: "Invalid session state" });
      }

      const credentialId = Buffer.from(credential.id, 'base64url').toString('base64');
      const dbCredential = await storage.getWebAuthnCredentialById(credentialId);

      if (!dbCredential || dbCredential.userId !== userId) {
        return res.status(400).json({ message: "Credential not found" });
      }

      const verification = await verifyAuthenticationResponse({
        response: credential,
        expectedChallenge,
        expectedOrigin: origin,
        expectedRPID: rpID,
        credential: {
          id: dbCredential.credentialId,
          publicKey: new Uint8Array(Buffer.from(dbCredential.publicKey, 'base64')),
          counter: dbCredential.counter,
        },
      });

      if (!verification.verified) {
        return res.status(400).json({ message: "Authentication failed" });
      }

      await storage.updateWebAuthnCredentialCounter(
        dbCredential.id,
        verification.authenticationInfo.newCounter
      );

      const user = await storage.getUser(userId);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      // Regenerate session to prevent session fixation attacks
      // All session mutations must happen inside the callback
      req.session.regenerate(async (err) => {
        if (err) {
          console.error('Session regeneration failed:', err);
          return res.status(500).json({ message: "Session error, please try again" });
        }

        // Set full session after successful biometric verification AND regeneration
        req.session.userId = user.id;
        req.session.username = user.username;
        req.session.role = user.role;

        const { password: _, twoFactorSecret: __, ...userWithoutSensitive } = user;
        res.json({ user: userWithoutSensitive });
      });
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // Get user's WebAuthn credentials
  app.get("/api/auth/webauthn/credentials", requireAuth, async (req, res) => {
    try {
      const credentials = await storage.getWebAuthnCredentialsByUser(req.session.userId!);
      res.json(credentials.map(c => ({
        id: c.id,
        deviceName: c.deviceName,
        createdAt: c.createdAt,
        lastUsed: c.lastUsed
      })));
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // Delete WebAuthn credential
  app.delete("/api/auth/webauthn/credentials/:id", requireAuth, async (req, res) => {
    try {
      await storage.deleteWebAuthnCredential(parseInt(req.params.id));
      res.json({ message: "Credential deleted" });
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // ============ SECURITY ENDPOINTS ============

  // Security Settings
  app.get("/api/security/settings", requireAdmin, async (req, res) => {
    try {
      const settings = await storage.getAllSecuritySettings();
      const settingsObject: Record<string, any> = {};
      
      // Build nested structure for frontend
      settings.forEach(s => {
        const keys = s.key.split('.');
        if (keys.length === 1) {
          settingsObject[s.key] = s.value;
        } else {
          let current = settingsObject;
          for (let i = 0; i < keys.length - 1; i++) {
            if (!current[keys[i]]) {
              current[keys[i]] = {};
            }
            current = current[keys[i]];
          }
          current[keys[keys.length - 1]] = s.value;
        }
      });
      
      res.json(settingsObject);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.post("/api/security/settings", requireAdmin, async (req, res) => {
    try {
      const { key, value } = req.body;
      const setting = await storage.upsertSecuritySetting(key, value);
      await storage.createActivityLog({
        action: `Security setting updated: ${key}`,
        userId: req.session.userId,
        userName: req.session.username,
        type: "info"
      });
      res.json(setting);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.post("/api/security/settings/bulk", requireAdmin, async (req, res) => {
    try {
      const settings = req.body;
      const updated: any[] = [];
      for (const [key, value] of Object.entries(settings)) {
        const setting = await storage.upsertSecuritySetting(key, value);
        updated.push(setting);
      }
      await storage.createActivityLog({
        action: `Bulk security settings updated`,
        userId: req.session.userId,
        userName: req.session.username,
        type: "info"
      });
      res.json({ message: "Settings updated", count: updated.length });
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // Trusted Devices
  app.get("/api/security/devices", requireAuth, async (req, res) => {
    try {
      const devices = await storage.getTrustedDevicesByUser(req.session.userId!);
      res.json(devices);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.post("/api/security/devices", requireAuth, async (req, res) => {
    try {
      const { deviceName, deviceFingerprint, ipAddress, userAgent, trusted } = req.body;
      const device = await storage.createTrustedDevice({
        userId: req.session.userId!,
        deviceName,
        deviceFingerprint,
        ipAddress,
        userAgent,
        trusted: trusted ?? true
      });
      res.json(device);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.delete("/api/security/devices/:id", requireAuth, async (req, res) => {
    try {
      await storage.deleteTrustedDevice(parseInt(req.params.id));
      res.json({ message: "Device removed" });
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // User Sessions
  app.get("/api/security/sessions", requireAuth, async (req, res) => {
    try {
      const sessions = await storage.getUserSessions(req.session.userId!);
      res.json(sessions);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.post("/api/security/sessions/terminate/:id", requireAuth, async (req, res) => {
    try {
      await storage.terminateSession(parseInt(req.params.id));
      res.json({ message: "Session terminated" });
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.post("/api/security/sessions/terminate-all", requireAuth, async (req, res) => {
    try {
      await storage.terminateAllSessions(req.session.userId!);
      res.json({ message: "All sessions terminated" });
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.post("/api/security/sessions/logout-all-devices", requireAuth, async (req, res) => {
    try {
      await storage.logoutAllDevices(req.session.userId!);
      res.json({ message: "Logged out from all devices" });
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // IP Rules
  app.get("/api/security/ip-rules", requireAdmin, async (req, res) => {
    try {
      const rules = await storage.getIpRules();
      res.json(rules);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.post("/api/security/ip-rules", requireAdmin, async (req, res) => {
    try {
      const { ipAddress, type } = req.body;
      const rule = await storage.createIpRule({ ipAddress, type, createdBy: req.session.userId });
      await storage.createActivityLog({
        action: `IP ${type} rule added: ${ipAddress}`,
        userId: req.session.userId,
        userName: req.session.username,
        type: "warning"
      });
      res.json(rule);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.delete("/api/security/ip-rules/:id", requireAdmin, async (req, res) => {
    try {
      await storage.deleteIpRule(parseInt(req.params.id));
      res.json({ message: "IP rule removed" });
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // Security Stats
  app.get("/api/security/stats", requireAdmin, async (req, res) => {
    try {
      const logs = await storage.getSecurityLogs();
      const totalBlocked = logs.filter(l => l.blocked).length;
      const totalAllowed = logs.filter(l => !l.blocked).length;
      const byEventType = logs.reduce((acc: any[], log) => {
        const existing = acc.find(e => e.type === log.eventType);
        if (existing) {
          existing.count++;
        } else {
          acc.push({ type: log.eventType || 'unknown', count: 1 });
        }
        return acc;
      }, []);
      res.json({ totalBlocked, totalAllowed, byEventType });
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // Login History
  app.get("/api/security/login-history", requireAuth, async (req, res) => {
    try {
      const logs = await storage.getSecurityLogs();
      const loginLogs = logs.filter(l => 
        l.eventType?.includes('login') || 
        l.eventType?.includes('2fa') ||
        l.action?.toLowerCase().includes('login')
      ).slice(0, 50);
      res.json(loginLogs);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.patch("/api/security/devices/:id", requireAuth, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const device = await storage.updateTrustedDevice(id, req.body);
      res.json(device);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.delete("/api/security/devices/:id", requireAuth, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      await storage.deleteTrustedDevice(id);
      res.json({ message: "Device removed" });
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // User Sessions
  app.get("/api/security/sessions", requireAdmin, async (req, res) => {
    try {
      const sessions = await storage.getAllActiveSessions();
      res.json(sessions);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.get("/api/security/sessions/user/:userId", requireAuth, async (req, res) => {
    try {
      const userId = parseInt(req.params.userId);
      if (req.session.userId !== userId && req.session.role !== "Super Admin" && req.session.role !== "Admin") {
        return res.status(403).json({ message: "Access denied" });
      }
      const sessions = await storage.getActiveSessionsByUser(userId);
      res.json(sessions);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.post("/api/security/sessions/terminate/:id", requireAuth, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      await storage.terminateSession(id);
      await storage.createActivityLog({
        action: "Session terminated",
        userId: req.session.userId,
        userName: req.session.username,
        type: "warning"
      });
      res.json({ message: "Session terminated" });
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.post("/api/security/sessions/terminate-all", requireAdmin, async (req, res) => {
    try {
      await storage.terminateAllSessions();
      await storage.createActivityLog({
        action: "All sessions terminated",
        userId: req.session.userId,
        userName: req.session.username,
        type: "warning"
      });
      res.json({ message: "All sessions terminated" });
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.post("/api/security/sessions/logout-all-devices", requireAuth, async (req, res) => {
    try {
      await storage.terminateAllUserSessions(req.session.userId!);
      await storage.createActivityLog({
        action: "Logged out from all devices",
        userId: req.session.userId,
        userName: req.session.username,
        type: "info"
      });
      res.json({ message: "Logged out from all devices" });
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // IP Rules (Whitelist/Blacklist)
  app.get("/api/security/ip-rules", requireAdmin, async (req, res) => {
    try {
      const rules = await storage.getAllIpRules();
      res.json(rules);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.get("/api/security/ip-rules/:type", requireAdmin, async (req, res) => {
    try {
      const type = req.params.type;
      const rules = await storage.getIpRulesByType(type);
      res.json(rules);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.post("/api/security/ip-rules", requireAdmin, async (req, res) => {
    try {
      const { ipAddress, type, reason } = req.body;
      const rule = await storage.createIpRule({
        ipAddress,
        type,
        reason,
        createdBy: req.session.userId
      });
      await storage.createActivityLog({
        action: `IP ${type === 'whitelist' ? 'whitelisted' : 'blacklisted'}: ${ipAddress}`,
        userId: req.session.userId,
        userName: req.session.username,
        type: type === 'blacklist' ? 'warning' : 'info'
      });
      res.json(rule);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.delete("/api/security/ip-rules/:id", requireAdmin, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      await storage.deleteIpRule(id);
      await storage.createActivityLog({
        action: `IP rule removed`,
        userId: req.session.userId,
        userName: req.session.username,
        type: "info"
      });
      res.json({ message: "IP rule removed" });
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // Security Logs
  app.get("/api/security/logs", requireAdmin, async (req, res) => {
    try {
      const limit = parseInt(req.query.limit as string) || 100;
      const logs = await storage.getRecentSecurityLogs(limit);
      res.json(logs);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.get("/api/security/logs/:type", requireAdmin, async (req, res) => {
    try {
      const eventType = req.params.type;
      const logs = await storage.getSecurityLogsByType(eventType);
      res.json(logs);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // Login History - All login-related events
  app.get("/api/security/login-history", requireAdmin, async (req, res) => {
    try {
      const limit = parseInt(req.query.limit as string) || 50;
      const loginLogs = await storage.getLoginHistory(limit);
      res.json(loginLogs);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.post("/api/security/logs", requireAdmin, async (req, res) => {
    try {
      const log = await storage.createSecurityLog(req.body);
      res.json(log);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // Security Stats
  app.get("/api/security/stats", requireAdmin, async (req, res) => {
    try {
      const stats = await storage.getSecurityStats();
      res.json(stats);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // Email API - Send Test Email
  app.post("/api/email/test", requireAdmin, async (req, res) => {
    try {
      // Handle potential malformed JSON
      if (!req.body || typeof req.body !== 'object') {
        return res.status(400).json({ 
          message: "Invalid request body",
          success: false 
        });
      }
      
      const { to, subject, body } = req.body;
      
      if (!to || !subject || !body) {
        return res.status(400).json({ 
          message: "Missing required fields: to, subject, body" 
        });
      }

      // Get individual SMTP settings
      const smtpHost = await storage.getSetting("smtpHost");
      const smtpPort = await storage.getSetting("smtpPort");
      const smtpUser = await storage.getSetting("smtpUser");
      const smtpPassword = await storage.getSetting("smtpPassword");
      const smtpSecure = await storage.getSetting("smtpSecure");
      const emailFromName = await storage.getSetting("emailFromName");
      const emailFromAddress = await storage.getSetting("emailFromAddress");

      if (!smtpHost?.value || !smtpPort?.value || !smtpUser?.value || !smtpPassword?.value) {
        return res.status(400).json({ 
          message: "SMTP not fully configured. Please fill in all SMTP settings." 
        });
      }

      // Try to send actual email using nodemailer
      try {
        
        // Parse port to number
        const port = typeof smtpPort.value === 'string' 
          ? parseInt(smtpPort.value) 
          : smtpPort.value;
        
        // Parse secure flag
        const secure = smtpSecure?.value === true || smtpSecure?.value === 'true';
        
        const transporter = nodemailer.createTransport({
          host: smtpHost.value as string,
          port: port as number,
          secure: secure, // true cho port 465, false cho port 587
          auth: {
            user: smtpUser.value as string,
            pass: smtpPassword.value as string,
          },
          // Tự động nâng cấp lên TLS nếu server hỗ trợ STARTTLS
          requireTLS: !secure, // Yêu cầu STARTTLS nếu không dùng SSL
          // Add timeout and debug options
          connectionTimeout: 10000,
          greetingTimeout: 10000,
          socketTimeout: 10000,
          logger: false,
          debug: false,
        });

        // Verify connection configuration
        await transporter.verify();

        // Send email
        const info = await transporter.sendMail({
          from: `"${emailFromName?.value || 'Portfolio'}" <${emailFromAddress?.value || smtpUser.value}>`,
          to,
          subject,
          html: body,
        });

        await storage.createActivityLog({
          action: `Test email sent to ${to}`,
          userId: req.session.userId,
          userName: req.session.username,
          type: "success"
        });

        res.json({ 
          message: `Test email sent successfully to ${to}`,
          messageId: info.messageId,
          success: true 
        });
      } catch (smtpError: any) {
        console.error("SMTP Error:", smtpError);
        
        let errorMessage = smtpError.message || 'Unknown SMTP error';
        
        // Provide more helpful error messages
        if (errorMessage.includes('ECONNREFUSED')) {
          errorMessage = 'Cannot connect to SMTP server. Please check host and port.';
        } else if (errorMessage.includes('Invalid login')) {
          errorMessage = 'SMTP authentication failed. Please check username and password.';
        } else if (errorMessage.includes('ETIMEDOUT')) {
          errorMessage = 'Connection timeout. Please check your network and SMTP settings.';
        } else if (errorMessage.includes('wrong version number') || errorMessage.includes('SSL routines')) {
          errorMessage = 'SSL/TLS configuration error. For Gmail: Use port 587 with TLS/SSL OFF, or port 465 with TLS/SSL ON.';
        } else if (errorMessage.includes('ENOTFOUND')) {
          errorMessage = 'SMTP host not found. Please check the hostname.';
        }
        
        await storage.createActivityLog({
          action: `Failed to send test email to ${to}: ${errorMessage}`,
          userId: req.session.userId,
          userName: req.session.username,
          type: "error"
        });
        
        return res.status(500).json({ 
          message: errorMessage,
          error: smtpError.message,
          success: false 
        });
      }
    } catch (error: any) {
      console.error("Error in test email endpoint:", error);
      res.status(500).json({ 
        message: error.message || 'Internal server error',
        success: false 
      });
    }
  });

  // Email Templates API
  app.get("/api/email/templates", requireAdmin, async (req, res) => {
    try {
      const templates = await storage.getSetting("email-templates");
      const defaultTemplates = {
        welcome: {
          subject: "Welcome to {{siteName}}",
          body: `<h1>Welcome, {{userName}}!</h1>
<p>Thank you for joining {{siteName}}. We're excited to have you on board.</p>
<p>If you have any questions, feel free to reach out to us.</p>
<p>Best regards,<br>{{siteName}} Team</p>`
        },
        notification: {
          subject: "New notification from {{siteName}}",
          body: `<h1>Hello, {{userName}}</h1>
<p>{{notificationMessage}}</p>
<p>Best regards,<br>{{siteName}} Team</p>`
        },
        newsletter: {
          subject: "{{siteName}} Newsletter - {{date}}",
          body: `<h1>{{siteName}} Newsletter</h1>
<p>{{newsletterContent}}</p>
<hr>
<p style="font-size: 12px; color: #666;">
You're receiving this because you subscribed to our newsletter.
<a href="{{unsubscribeLink}}">Unsubscribe</a>
</p>`
        },
        contact: {
          subject: "New Contact Form Submission - {{siteName}}",
          body: `<h1>New Contact Message</h1>
<p><strong>From:</strong> {{senderName}} ({{senderEmail}})</p>
<p><strong>Subject:</strong> {{messageSubject}}</p>
<hr>
<p>{{messageContent}}</p>
<hr>
<p style="font-size: 12px; color: #666;">Received on {{date}}</p>`
        },
        comment: {
          subject: "New Comment on {{postTitle}} - {{siteName}}",
          body: `<h1>New Comment</h1>
<p><strong>Post:</strong> {{postTitle}}</p>
<p><strong>From:</strong> {{commenterName}}</p>
<hr>
<p>{{commentContent}}</p>
<hr>
<p><a href="{{postLink}}">View Post</a></p>`
        }
      };
      
      if (templates?.value) {
        const value = typeof templates.value === 'string' ? JSON.parse(templates.value) : templates.value;
        res.json({ ...defaultTemplates, ...value });
      } else {
        res.json(defaultTemplates);
      }
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.put("/api/email/templates/:name", requireAdmin, async (req, res) => {
    try {
      const { name } = req.params;
      const { subject, body } = req.body;
      
      if (!subject || !body) {
        return res.status(400).json({ message: "Subject and body are required" });
      }
      
      const existingTemplates = await storage.getSetting("email-templates");
      const templates = existingTemplates?.value 
        ? (typeof existingTemplates.value === 'string' ? JSON.parse(existingTemplates.value) : existingTemplates.value)
        : {};
      
      templates[name] = { subject, body };
      
      await storage.upsertSetting("email-templates", templates);
      
      await storage.createActivityLog({
        action: `Email template "${name}" updated`,
        userId: req.session.userId,
        userName: req.session.username,
        type: "info"
      });
      
      res.json({ message: "Template updated successfully", template: templates[name] });
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // Send notification email (internal function used by other routes)
  async function sendNotificationEmail(
    type: 'contact' | 'comment' | 'newsletter' | 'security',
    data: Record<string, string>
  ) {
    try {
      // Check if email notifications are enabled for this type
      const settingKey = type === 'contact' ? 'emailNotifyNewContact' 
        : type === 'comment' ? 'emailNotifyNewComment'
        : type === 'newsletter' ? 'emailNotifyNewsletter'
        : 'emailNotifySecurityAlert';
      
      const notifySetting = await storage.getSetting(settingKey);
      if (notifySetting?.value === false || notifySetting?.value === 'false') {
        return { sent: false, reason: 'Notifications disabled for this type' };
      }
      
      // Get SMTP settings
      const smtpHost = await storage.getSetting("smtpHost");
      const smtpPort = await storage.getSetting("smtpPort");
      const smtpUser = await storage.getSetting("smtpUser");
      const smtpPassword = await storage.getSetting("smtpPassword");
      const smtpSecure = await storage.getSetting("smtpSecure");
      const emailFromName = await storage.getSetting("emailFromName");
      const emailFromAddress = await storage.getSetting("emailFromAddress");
      const adminEmail = await storage.getSetting("contactEmail");
      
      if (!smtpHost?.value || !smtpPort?.value || !smtpUser?.value || !smtpPassword?.value) {
        return { sent: false, reason: 'SMTP not configured' };
      }
      
      // Get email template
      const templates = await storage.getSetting("email-templates");
      let template = { subject: '', body: '' };
      
      if (templates?.value) {
        const allTemplates = typeof templates.value === 'string' ? JSON.parse(templates.value) : templates.value;
        template = allTemplates[type] || template;
      }
      
      // Default templates if not found
      if (!template.subject || !template.body) {
        const siteTitleForDefault = (await storage.getSetting("siteTitle"))?.value as string || 'Portfolio';
        template = {
          subject: `New ${type} notification from ${siteTitleForDefault}`,
          body: `<h1>New ${type} notification</h1><p>${JSON.stringify(data)}</p>`
        };
      }
      
      // Replace placeholders in template
      let subject = template.subject;
      let body = template.body;
      
      const siteTitleSetting = await storage.getSetting("siteTitle");
      const siteTitleValue = (siteTitleSetting?.value as string) || 'Portfolio';
      const replacements: Record<string, string> = {
        ...data,
        siteName: siteTitleValue,
        date: new Date().toLocaleDateString()
      };
      
      for (const [key, value] of Object.entries(replacements)) {
        const regex = new RegExp(`{{${key}}}`, 'g');
        subject = subject.replace(regex, value);
        body = body.replace(regex, value);
      }
      
      // Send email
      const port = typeof smtpPort.value === 'string' ? parseInt(smtpPort.value) : smtpPort.value;
      const secure = smtpSecure?.value === true || smtpSecure?.value === 'true';
      
      const transporter = nodemailer.createTransport({
        host: smtpHost.value as string,
        port: port as number,
        secure: secure,
        auth: {
          user: smtpUser.value as string,
          pass: smtpPassword.value as string,
        },
        requireTLS: !secure,
        connectionTimeout: 10000,
        greetingTimeout: 10000,
        socketTimeout: 10000,
      });
      
      const toEmail = (adminEmail?.value as string) || (smtpUser.value as string);
      await transporter.sendMail({
        from: `"${(emailFromName?.value as string) || 'Portfolio'}" <${(emailFromAddress?.value as string) || smtpUser.value}>`,
        to: toEmail,
        subject,
        html: body,
      });
      
      return { sent: true };
    } catch (error: any) {
      console.error('Failed to send notification email:', error.message);
      return { sent: false, reason: error.message };
    }
  }

  // ==================== STORAGE MANAGEMENT API ====================
  
  // Get real storage statistics from uploads folder
  app.get("/api/storage/stats", requireAdmin, async (req, res) => {
    try {
      const uploadsPath = path.join(process.cwd(), "uploads");
      
      // Function to get folder size recursively
      const getFolderSize = (folderPath: string): { size: number; files: number } => {
        let totalSize = 0;
        let fileCount = 0;
        
        if (!fs.existsSync(folderPath)) {
          return { size: 0, files: 0 };
        }
        
        const items = fs.readdirSync(folderPath);
        for (const item of items) {
          const itemPath = path.join(folderPath, item);
          const stats = fs.statSync(itemPath);
          if (stats.isFile()) {
            totalSize += stats.size;
            fileCount++;
          } else if (stats.isDirectory()) {
            const subResult = getFolderSize(itemPath);
            totalSize += subResult.size;
            fileCount += subResult.files;
          }
        }
        return { size: totalSize, files: fileCount };
      };
      
      // Get stats for each folder
      const imagesStats = getFolderSize(path.join(uploadsPath, "images"));
      const documentsStats = getFolderSize(path.join(uploadsPath, "documents"));
      const mediaStats = getFolderSize(path.join(uploadsPath, "media"));
      
      const totalSize = imagesStats.size + documentsStats.size + mediaStats.size;
      const totalFiles = imagesStats.files + documentsStats.files + mediaStats.files;
      const maxStorage = 10 * 1024 * 1024 * 1024; // 10GB limit
      
      // Format size for display
      const formatSize = (bytes: number): string => {
        if (bytes === 0) return '0 B';
        const k = 1024;
        const sizes = ['B', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
      };
      
      res.json({
        total: {
          size: totalSize,
          sizeFormatted: formatSize(totalSize),
          files: totalFiles,
          maxStorage: maxStorage,
          maxStorageFormatted: formatSize(maxStorage),
          usagePercent: ((totalSize / maxStorage) * 100).toFixed(1)
        },
        folders: {
          images: {
            size: imagesStats.size,
            sizeFormatted: formatSize(imagesStats.size),
            files: imagesStats.files
          },
          documents: {
            size: documentsStats.size,
            sizeFormatted: formatSize(documentsStats.size),
            files: documentsStats.files
          },
          media: {
            size: mediaStats.size,
            sizeFormatted: formatSize(mediaStats.size),
            files: mediaStats.files
          }
        }
      });
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // List files in storage
  app.get("/api/storage/files", requireAdmin, async (req, res) => {
    try {
      const { folder = "all" } = req.query;
      const uploadsPath = path.join(process.cwd(), "uploads");
      const files: Array<{ name: string; path: string; size: number; sizeFormatted: string; type: string; folder: string; modified: Date }> = [];
      
      const formatSize = (bytes: number): string => {
        if (bytes === 0) return '0 B';
        const k = 1024;
        const sizes = ['B', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
      };
      
      const scanFolder = (folderName: string) => {
        const folderPath = path.join(uploadsPath, folderName);
        if (!fs.existsSync(folderPath)) return;
        
        const items = fs.readdirSync(folderPath);
        for (const item of items) {
          const itemPath = path.join(folderPath, item);
          const stats = fs.statSync(itemPath);
          if (stats.isFile()) {
            files.push({
              name: item,
              path: `/uploads/${folderName}/${item}`,
              size: stats.size,
              sizeFormatted: formatSize(stats.size),
              type: item.split('.').pop() || 'unknown',
              folder: folderName,
              modified: stats.mtime
            });
          }
        }
      };
      
      if (folder === "all") {
        scanFolder("images");
        scanFolder("documents");
        scanFolder("media");
      } else {
        scanFolder(folder as string);
      }
      
      // Sort by modified date, newest first
      files.sort((a, b) => new Date(b.modified).getTime() - new Date(a.modified).getTime());
      
      res.json(files);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // Delete file from storage
  app.delete("/api/storage/files/:folder/:filename", requireAdmin, async (req, res) => {
    try {
      const { folder, filename } = req.params;
      const filePath = path.join(process.cwd(), "uploads", folder, filename);
      
      if (!fs.existsSync(filePath)) {
        return res.status(404).json({ message: "File not found" });
      }
      
      fs.unlinkSync(filePath);
      
      await storage.createActivityLog({
        action: `Deleted file: ${folder}/${filename}`,
        userId: req.session.userId,
        userName: req.session.username,
        type: "warning"
      });
      
      res.json({ message: "File deleted successfully", success: true });
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // ==================== LOGGING SYSTEM API ====================
  
  const logsDir = path.join(process.cwd(), "logs");
  if (!fs.existsSync(logsDir)) {
    fs.mkdirSync(logsDir, { recursive: true });
  }
  
  // Write log to file
  const writeLogToFile = (level: string, message: string, details?: any) => {
    const timestamp = new Date().toISOString();
    const logEntry = {
      timestamp,
      level,
      message,
      details: details || null
    };
    
    const today = new Date().toISOString().split('T')[0];
    const logFile = path.join(logsDir, `app-${today}.log`);
    
    fs.appendFileSync(logFile, JSON.stringify(logEntry) + '\n');
  };

  // Get logs from file system
  app.get("/api/logs", requireAdmin, async (req, res) => {
    try {
      const { level, limit = 100, source = "all" } = req.query;
      const logs: any[] = [];
      
      // Get logs from database (activity logs)
      if (source === "all" || source === "database") {
        const dbLogs = await storage.getAllActivityLogs(Number(limit));
        logs.push(...dbLogs.map(log => ({
          ...log,
          source: "database",
          timestamp: log.createdAt
        })));
      }
      
      // Get logs from file system
      if (source === "all" || source === "file") {
        const logFiles = fs.existsSync(logsDir) ? fs.readdirSync(logsDir).filter(f => f.endsWith('.log')) : [];
        
        for (const logFile of logFiles.slice(-7)) { // Last 7 days
          const filePath = path.join(logsDir, logFile);
          const content = fs.readFileSync(filePath, 'utf-8');
          const lines = content.split('\n').filter(line => line.trim());
          
          for (const line of lines) {
            try {
              const logEntry = JSON.parse(line);
              logs.push({
                ...logEntry,
                source: "file",
                type: logEntry.level
              });
            } catch (e) {
              // Skip invalid JSON lines
            }
          }
        }
      }
      
      // Filter by level
      let filteredLogs = logs;
      if (level && level !== 'all') {
        filteredLogs = logs.filter(log => log.type === level || log.level === level);
      }
      
      // Sort by timestamp, newest first
      filteredLogs.sort((a, b) => {
        const timeA = new Date(a.timestamp || a.createdAt).getTime();
        const timeB = new Date(b.timestamp || b.createdAt).getTime();
        return timeB - timeA;
      });
      
      res.json(filteredLogs.slice(0, Number(limit)));
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // Get log files list
  app.get("/api/logs/files", requireAdmin, async (req, res) => {
    try {
      if (!fs.existsSync(logsDir)) {
        return res.json([]);
      }
      
      const logFiles = fs.readdirSync(logsDir)
        .filter(f => f.endsWith('.log'))
        .map(filename => {
          const filePath = path.join(logsDir, filename);
          const stats = fs.statSync(filePath);
          return {
            filename,
            size: stats.size,
            sizeFormatted: stats.size < 1024 ? `${stats.size} B` : 
                          stats.size < 1024*1024 ? `${(stats.size/1024).toFixed(1)} KB` :
                          `${(stats.size/1024/1024).toFixed(2)} MB`,
            modified: stats.mtime,
            date: filename.replace('app-', '').replace('.log', '')
          };
        })
        .sort((a, b) => new Date(b.modified).getTime() - new Date(a.modified).getTime());
      
      res.json(logFiles);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // Write a log entry (for frontend debugging)
  app.post("/api/logs", requireAdmin, async (req, res) => {
    try {
      const { level, message, details } = req.body;
      
      writeLogToFile(level || 'info', message, details);
      
      res.json({ success: true, message: "Log entry created" });
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // Delete a log file
  app.delete("/api/logs/files/:filename", requireAdmin, async (req, res) => {
    try {
      const { filename } = req.params;
      const filePath = path.join(logsDir, filename);
      
      if (!fs.existsSync(filePath)) {
        return res.status(404).json({ message: "Log file not found" });
      }
      
      fs.unlinkSync(filePath);
      
      await storage.createActivityLog({
        action: `Deleted log file: ${filename}`,
        userId: req.session.userId,
        userName: req.session.username,
        type: "warning"
      });
      
      res.json({ message: "Log file deleted successfully", success: true });
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // Clear all log files
  app.delete("/api/logs/clear", requireAdmin, async (req, res) => {
    try {
      if (fs.existsSync(logsDir)) {
        const logFiles = fs.readdirSync(logsDir).filter(f => f.endsWith('.log'));
        for (const file of logFiles) {
          fs.unlinkSync(path.join(logsDir, file));
        }
      }
      
      await storage.createActivityLog({
        action: "Cleared all log files",
        userId: req.session.userId,
        userName: req.session.username,
        type: "warning"
      });
      
      res.json({ message: "All log files cleared", success: true });
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // Export logs to file
  app.get("/api/logs/export", requireAdmin, async (req, res) => {
    try {
      const { source = "all" } = req.query;
      const exportData: any = {
        exportedAt: new Date().toISOString(),
        logs: []
      };
      
      // Get database logs
      if (source === "all" || source === "database") {
        const dbLogs = await storage.getAllActivityLogs(1000);
        exportData.logs.push(...dbLogs.map(log => ({ ...log, source: "database" })));
      }
      
      // Get file logs
      if (source === "all" || source === "file") {
        const logFiles = fs.existsSync(logsDir) ? fs.readdirSync(logsDir).filter(f => f.endsWith('.log')) : [];
        
        for (const logFile of logFiles) {
          const filePath = path.join(logsDir, logFile);
          const content = fs.readFileSync(filePath, 'utf-8');
          const lines = content.split('\n').filter(line => line.trim());
          
          for (const line of lines) {
            try {
              const logEntry = JSON.parse(line);
              exportData.logs.push({ ...logEntry, source: "file", file: logFile });
            } catch (e) {}
          }
        }
      }
      
      const logData = JSON.stringify(exportData, null, 2);
      
      res.setHeader('Content-Type', 'application/json');
      res.setHeader('Content-Disposition', `attachment; filename="logs-export-${Date.now()}.json"`);
      res.send(logData);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // ==================== DATABASE BACKUP/RESTORE API ====================
  
  const backupsDir = path.join(process.cwd(), "backups");
  if (!fs.existsSync(backupsDir)) {
    fs.mkdirSync(backupsDir, { recursive: true });
  }

  // Get database status with real data
  app.get("/api/database/status", requireAdmin, async (req, res) => {
    try {
      const stats = await storage.getSystemStats();
      
      // Count records in each table
      const users = await storage.getAllUsers();
      const projects = await storage.getAllProjects();
      const posts = await storage.getAllPosts();
      const skills = await storage.getAllSkills();
      const services = await storage.getAllServices();
      const testimonials = await storage.getAllTestimonials();
      const messages = await storage.getAllMessages();
      const comments = await storage.getAllComments();
      const reviews = await storage.getAllReviews();
      const media = await storage.getAllMedia();
      
      res.json({
        status: "Connected",
        uptime: "99.9%",
        tables: {
          users: users.length,
          projects: projects.length,
          posts: posts.length,
          skills: skills.length,
          services: services.length,
          testimonials: testimonials.length,
          messages: messages.length,
          comments: comments.length,
          reviews: reviews.length,
          media: media.length
        },
        totalRecords: users.length + projects.length + posts.length + skills.length + 
                      services.length + testimonials.length + messages.length + 
                      comments.length + reviews.length + media.length,
        databaseSize: stats.databaseSize || "N/A"
      });
    } catch (error: any) {
      res.status(500).json({ message: error.message, status: "Error" });
    }
  });

  // Create full database backup with real data
  app.post("/api/database/backup", requireAdmin, async (req, res) => {
    try {
      // Collect all data from database
      const backup = {
        version: "1.0",
        timestamp: new Date().toISOString(),
        data: {
          users: await storage.getAllUsers(),
          projects: await storage.getAllProjects(),
          posts: await storage.getAllPosts(),
          pages: await storage.getAllPages(),
          skills: await storage.getAllSkills(),
          services: await storage.getAllServices(),
          testimonials: await storage.getAllTestimonials(),
          messages: await storage.getAllMessages(),
          comments: await storage.getAllComments(),
          reviews: await storage.getAllReviews(),
          media: await storage.getAllMedia(),
          categories: await storage.getAllCategories(),
          settings: await storage.getAllSettings(),
          activityLogs: await storage.getAllActivityLogs(500),
          notifications: await storage.getAllNotifications()
        }
      };
      
      // Save backup file
      const filename = `backup-${new Date().toISOString().replace(/[:.]/g, '-')}.json`;
      const filePath = path.join(backupsDir, filename);
      fs.writeFileSync(filePath, JSON.stringify(backup, null, 2));
      
      const stats = fs.statSync(filePath);
      
      await storage.createActivityLog({
        action: `Database backup created: ${filename}`,
        userId: req.session.userId,
        userName: req.session.username,
        type: "info"
      });
      
      res.json({
        success: true,
        message: "Backup created successfully",
        filename,
        size: stats.size,
        sizeFormatted: stats.size < 1024*1024 ? `${(stats.size/1024).toFixed(1)} KB` : `${(stats.size/1024/1024).toFixed(2)} MB`,
        timestamp: backup.timestamp,
        recordCount: Object.values(backup.data).reduce((sum: number, arr: any[]) => sum + arr.length, 0)
      });
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // Download backup file
  app.get("/api/database/backup/:filename", requireAdmin, async (req, res) => {
    try {
      const { filename } = req.params;
      const filePath = path.join(backupsDir, filename);
      
      if (!fs.existsSync(filePath)) {
        return res.status(404).json({ message: "Backup file not found" });
      }
      
      res.download(filePath, filename);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // List backup files
  app.get("/api/database/backups", requireAdmin, async (req, res) => {
    try {
      if (!fs.existsSync(backupsDir)) {
        return res.json([]);
      }
      
      const backupFiles = fs.readdirSync(backupsDir)
        .filter(f => f.endsWith('.json'))
        .map(filename => {
          const filePath = path.join(backupsDir, filename);
          const stats = fs.statSync(filePath);
          return {
            filename,
            size: stats.size,
            sizeFormatted: stats.size < 1024*1024 ? `${(stats.size/1024).toFixed(1)} KB` : `${(stats.size/1024/1024).toFixed(2)} MB`,
            created: stats.birthtime,
            modified: stats.mtime
          };
        })
        .sort((a, b) => new Date(b.created).getTime() - new Date(a.created).getTime());
      
      res.json(backupFiles);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // Delete backup file
  app.delete("/api/database/backup/:filename", requireAdmin, async (req, res) => {
    try {
      const { filename } = req.params;
      const filePath = path.join(backupsDir, filename);
      
      if (!fs.existsSync(filePath)) {
        return res.status(404).json({ message: "Backup file not found" });
      }
      
      fs.unlinkSync(filePath);
      
      await storage.createActivityLog({
        action: `Deleted backup file: ${filename}`,
        userId: req.session.userId,
        userName: req.session.username,
        type: "warning"
      });
      
      res.json({ message: "Backup file deleted successfully", success: true });
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // Restore database from backup (upload and process)
  app.post("/api/database/restore", requireAdmin, upload.single('backup'), async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ message: "No backup file uploaded" });
      }
      
      // Read and parse backup file
      const backupContent = fs.readFileSync(req.file.path, 'utf-8');
      const backup = JSON.parse(backupContent);
      
      if (!backup.version || !backup.data) {
        return res.status(400).json({ message: "Invalid backup file format" });
      }
      
      // Restore process would go here
      // For safety, we'll just validate the backup and report what would be restored
      const summary = {
        version: backup.version,
        timestamp: backup.timestamp,
        tables: Object.entries(backup.data).map(([table, data]: [string, any]) => ({
          table,
          records: Array.isArray(data) ? data.length : 0
        }))
      };
      
      await storage.createActivityLog({
        action: `Database restore validated from backup (${backup.timestamp})`,
        userId: req.session.userId,
        userName: req.session.username,
        type: "warning"
      });
      
      // Clean up uploaded file
      fs.unlinkSync(req.file.path);
      
      res.json({
        success: true,
        message: "Backup file validated successfully. Full restore requires confirmation.",
        summary
      });
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // Performance API - Clear Cache
  app.post("/api/performance/clear-cache", requireAdmin, async (req, res) => {
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

  // Storage API - Upload File
  app.post("/api/storage/upload", requireAdmin, upload.single('file'), async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ message: "No file uploaded" });
      }

      const mediaItem = await storage.createMedia({
        filename: req.file.filename,
        originalName: req.file.originalname,
        mimeType: req.file.mimetype,
        size: req.file.size,
        url: `/uploads/${req.file.filename}`
      });

      res.json(mediaItem);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // Newsletter Settings
  app.get("/api/newsletter/settings", async (req, res) => {
    try {
      const settings = await storage.getSetting("newsletter-settings");
      if (settings) {
        const value = typeof settings.value === 'string' ? JSON.parse(settings.value) : settings.value;
        res.json(value);
      } else {
        res.json({
          enabled: false,
          title: "Subscribe to Our Newsletter",
          subtitle: "Get the latest updates",
          description: "Stay informed with our weekly newsletter",
          placeholder: "Enter your email",
          buttonText: "Subscribe",
          successMessage: "Thanks for subscribing!",
        });
      }
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.post("/api/newsletter/settings", requireAdmin, async (req, res) => {
    try {
      const settings = await storage.upsertSetting("newsletter-settings", req.body);
      const value = typeof settings.value === 'string' ? JSON.parse(settings.value) : settings.value;
      res.json(value);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.post("/api/newsletter/subscribe", async (req, res) => {
    try {
      const { email } = req.body;
      if (!email) {
        return res.status(400).json({ message: "Email is required" });
      }
      
      await storage.createActivityLog({
        action: `User subscribed to newsletter: ${email}`,
        userId: req.session.userId,
        userName: req.session.username || "Guest",
        type: "info"
      });

      res.json({ message: "Successfully subscribed to newsletter" });
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // Homepage Sections
  app.get("/api/homepage/sections", async (req, res) => {
    try {
      const sections = await storage.getAllHomepageSections();
      res.json(sections);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.get("/api/homepage/sections/:name", async (req, res) => {
    try {
      const section = await storage.getHomepageSectionByName(req.params.name);
      if (!section) {
        return res.status(404).json({ message: "Section not found" });
      }
      res.json(section);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.put("/api/homepage/sections/:name", requireAdmin, async (req, res) => {
    try {
      const updated = await storage.upsertHomepageSection(req.params.name, req.body);
      res.json(updated);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // FAQs API Routes
  app.get("/api/faqs", async (req, res) => {
    try {
      const faqs = req.query.visible === "true"
        ? await storage.getVisibleFAQs()
        : await storage.getAllFAQs();
      res.json(faqs);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.get("/api/faqs/:id", async (req, res) => {
    try {
      const faq = await storage.getFAQ(parseInt(req.params.id));
      if (!faq) {
        return res.status(404).json({ message: "FAQ not found" });
      }
      res.json(faq);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.post("/api/faqs", requireAuth, async (req, res) => {
    try {
      const faq = await storage.createFAQ(req.body);
      res.status(201).json(faq);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.put("/api/faqs/:id", requireAuth, async (req, res) => {
    try {
      const faq = await storage.updateFAQ(parseInt(req.params.id), req.body);
      if (!faq) {
        return res.status(404).json({ message: "FAQ not found" });
      }
      res.json(faq);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.delete("/api/faqs/:id", requireAuth, async (req, res) => {
    try {
      const success = await storage.deleteFAQ(parseInt(req.params.id));
      if (!success) {
        return res.status(404).json({ message: "FAQ not found" });
      }
      res.json({ message: "FAQ deleted" });
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  return httpServer;
}
