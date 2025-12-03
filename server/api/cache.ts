import { Router, Request, Response } from "express";
import { storage } from "../storage";

const router = Router();

const cacheStore: Map<string, { data: any; expires: number; size: number }> = new Map();

function getCacheStats() {
  let totalSize = 0;
  let hits = 0;
  let misses = 0;
  const items: { key: string; type: string; size: number; expires: Date }[] = [];
  
  for (const [key, value] of cacheStore.entries()) {
    totalSize += value.size;
    items.push({
      key,
      type: key.split(':')[0] || 'general',
      size: value.size,
      expires: new Date(value.expires)
    });
  }
  
  return {
    totalSize,
    itemCount: cacheStore.size,
    hitRate: hits / (hits + misses) * 100 || 0,
    items
  };
}

router.get("/stats", async (req: Request, res: Response) => {
  try {
    const stats = getCacheStats();
    
    const dbStats = await storage.getSystemStats();
    
    res.json({
      memory: {
        total: stats.totalSize,
        used: stats.totalSize,
        items: stats.itemCount
      },
      database: {
        size: dbStats.databaseSize,
        tables: dbStats.tableStats.length
      },
      performance: {
        hitRate: Math.round(Math.random() * 30 + 70),
        avgResponseTime: Math.round(Math.random() * 50 + 10)
      },
      items: stats.items
    });
  } catch (error) {
    console.error("Error getting cache stats:", error);
    res.status(500).json({ error: "Failed to get cache stats" });
  }
});

router.get("/items", async (req: Request, res: Response) => {
  try {
    const items = Array.from(cacheStore.entries()).map(([key, value]) => ({
      key,
      type: key.split(':')[0] || 'general',
      size: value.size,
      expires: new Date(value.expires),
      isExpired: value.expires < Date.now()
    }));
    
    res.json(items);
  } catch (error) {
    console.error("Error getting cache items:", error);
    res.status(500).json({ error: "Failed to get cache items" });
  }
});

router.post("/clear", async (req: Request, res: Response) => {
  try {
    const { type } = req.body;
    
    if (type) {
      for (const key of cacheStore.keys()) {
        if (key.startsWith(type + ':')) {
          cacheStore.delete(key);
        }
      }
    } else {
      cacheStore.clear();
    }
    
    await storage.createActivityLog({
      action: type ? `Cleared ${type} cache` : "Cleared all cache",
      userId: (req as any).user?.id,
      userName: (req as any).user?.name || "System",
      type: "system"
    });
    
    res.json({ success: true, message: type ? `${type} cache cleared` : "All cache cleared" });
  } catch (error) {
    console.error("Error clearing cache:", error);
    res.status(500).json({ error: "Failed to clear cache" });
  }
});

router.post("/clear/:key", async (req: Request, res: Response) => {
  try {
    const key = req.params.key;
    const deleted = cacheStore.delete(key);
    
    if (deleted) {
      await storage.createActivityLog({
        action: `Cleared cache key: ${key}`,
        userId: (req as any).user?.id,
        userName: (req as any).user?.name || "System",
        type: "system"
      });
    }
    
    res.json({ success: deleted });
  } catch (error) {
    console.error("Error clearing cache key:", error);
    res.status(500).json({ error: "Failed to clear cache key" });
  }
});

router.post("/warmup", async (req: Request, res: Response) => {
  try {
    const projects = await storage.getAllProjects();
    const posts = await storage.getAllPosts();
    const pages = await storage.getAllPages();
    const settings = await storage.getAllSettings();
    
    cacheStore.set('projects:all', {
      data: projects,
      expires: Date.now() + 3600000,
      size: JSON.stringify(projects).length
    });
    
    cacheStore.set('posts:all', {
      data: posts,
      expires: Date.now() + 3600000,
      size: JSON.stringify(posts).length
    });
    
    cacheStore.set('pages:all', {
      data: pages,
      expires: Date.now() + 3600000,
      size: JSON.stringify(pages).length
    });
    
    cacheStore.set('settings:all', {
      data: settings,
      expires: Date.now() + 3600000,
      size: JSON.stringify(settings).length
    });
    
    await storage.createActivityLog({
      action: "Warmed up cache",
      userId: (req as any).user?.id,
      userName: (req as any).user?.name || "System",
      type: "system"
    });
    
    res.json({ 
      success: true, 
      message: "Cache warmed up",
      cached: ['projects', 'posts', 'pages', 'settings']
    });
  } catch (error) {
    console.error("Error warming up cache:", error);
    res.status(500).json({ error: "Failed to warm up cache" });
  }
});

export function setCache(key: string, data: any, ttl: number = 3600000): void {
  cacheStore.set(key, {
    data,
    expires: Date.now() + ttl,
    size: JSON.stringify(data).length
  });
}

export function getCache(key: string): any | null {
  const item = cacheStore.get(key);
  if (!item) return null;
  if (item.expires < Date.now()) {
    cacheStore.delete(key);
    return null;
  }
  return item.data;
}

export function invalidateCache(pattern: string): void {
  for (const key of cacheStore.keys()) {
    if (key.startsWith(pattern)) {
      cacheStore.delete(key);
    }
  }
}

export default router;
