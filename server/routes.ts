import type { Express, Request, Response, NextFunction } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { rateLimitMiddleware } from "./middleware/security";
import { registerApiRoutes } from "./api";

async function checkIpBlocking(req: Request, res: Response, next: NextFunction) {
  const clientIp = req.ip || req.socket.remoteAddress || 'unknown';
  
  try {
    const ipRules = await storage.getAllIpRules();
    const blacklisted = ipRules.find(rule => rule.type === 'blacklist' && rule.ipAddress === clientIp);
    
    if (blacklisted) {
      await storage.createSecurityLog({
        action: `Blocked request from blacklisted IP`,
        userId: null,
        userName: 'System',
        ipAddress: clientIp,
        userAgent: req.get('User-Agent') || 'unknown',
        eventType: "ip_blocked",
        blocked: true
      });
      return res.status(403).json({ error: "Access denied" });
    }

    const whitelisted = ipRules.filter(rule => rule.type === 'whitelist');
    if (whitelisted.length > 0) {
      const isWhitelisted = whitelisted.some(rule => rule.ipAddress === clientIp);
      if (!isWhitelisted) {
        return res.status(403).json({ error: "Access denied - IP not whitelisted" });
      }
    }

    next();
  } catch (error) {
    next();
  }
}

async function seedInitialData() {
  try {
    const projectCategories = [
      { name: "Web Development", slug: "web-development", description: "Web application projects", type: "project" as const },
      { name: "Mobile Apps", slug: "mobile-apps", description: "Mobile application projects", type: "project" as const },
      { name: "UI/UX Design", slug: "ui-ux-design", description: "Design projects", type: "project" as const },
      { name: "E-commerce", slug: "e-commerce", description: "Online store projects", type: "project" as const },
    ];
    
    const postCategories = [
      { name: "Technology", slug: "technology", description: "Tech articles", type: "post" as const },
      { name: "Tutorial", slug: "tutorial", description: "How-to guides", type: "post" as const },
      { name: "News", slug: "news", description: "Industry news", type: "post" as const },
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

  app.use('/api/auth/login', checkIpBlocking);
  app.use('/admin/*', checkIpBlocking);

  app.use('/api/*', rateLimitMiddleware);

  registerApiRoutes(app);

  return httpServer;
}
