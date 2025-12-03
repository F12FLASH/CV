
import { Router, Request, Response } from "express";
import { storage } from "../storage";

const router = Router();

interface CacheItem {
  data: any;
  expires: number;
  size: number;
  createdAt: number;
}

const cacheStore: Map<string, CacheItem> = new Map();

function getCacheStats() {
  let totalSize = 0;
  let expiredCount = 0;
  const now = Date.now();
  const items: { key: string; type: string; size: number; expires: Date; isExpired: boolean }[] = [];
  
  for (const [key, value] of cacheStore.entries()) {
    totalSize += value.size;
    const isExpired = value.expires < now;
    if (isExpired) expiredCount++;
    
    items.push({
      key,
      type: key.split(':')[0] || 'general',
      size: value.size,
      expires: new Date(value.expires),
      isExpired
    });
  }
  
  const typeStats: Record<string, { count: number; size: number }> = {};
  for (const item of items) {
    if (!typeStats[item.type]) {
      typeStats[item.type] = { count: 0, size: 0 };
    }
    typeStats[item.type].count++;
    typeStats[item.type].size += item.size;
  }
  
  return {
    totalSize,
    itemCount: cacheStore.size,
    expiredCount,
    items,
    typeStats
  };
}

router.get("/stats", async (req: Request, res: Response) => {
  try {
    const stats = getCacheStats();
    
    const cacheTypes = [
      { name: "Application Cache", type: "app", size: 0, items: 0 },
      { name: "Database Queries", type: "db", size: 0, items: 0 },
      { name: "Image Cache", type: "image", size: 0, items: 0 },
      { name: "Page Cache", type: "page", size: 0, items: 0 },
    ];

    for (const cacheType of cacheTypes) {
      const typeStat = stats.typeStats[cacheType.type];
      if (typeStat) {
        cacheType.size = typeStat.size;
        cacheType.items = typeStat.count;
      }
    }

    res.json({
      totalSize: stats.totalSize,
      itemCount: stats.itemCount,
      expiredCount: stats.expiredCount,
      cacheTypes,
      lastCleared: null
    });
  } catch (error) {
    console.error("Error getting cache stats:", error);
    res.status(500).json({ error: "Failed to get cache stats" });
  }
});

router.get("/items", async (req: Request, res: Response) => {
  try {
    const stats = getCacheStats();
    res.json(stats.items);
  } catch (error) {
    console.error("Error getting cache items:", error);
    res.status(500).json({ error: "Failed to get cache items" });
  }
});

router.post("/clear", async (req: Request, res: Response) => {
  try {
    const { type } = req.body;
    
    if (type) {
      let cleared = 0;
      for (const key of Array.from(cacheStore.keys())) {
        if (key.startsWith(type + ':')) {
          cacheStore.delete(key);
          cleared++;
        }
      }
      
      await storage.createActivityLog({
        action: `Cleared ${cleared} items from ${type} cache`,
        userId: (req as any).user?.id,
        userName: (req as any).user?.name || "System",
        type: "system"
      });
      
      res.json({ success: true, message: `Cleared ${cleared} items from ${type} cache` });
    } else {
      const count = cacheStore.size;
      cacheStore.clear();
      
      await storage.createActivityLog({
        action: `Cleared all cache (${count} items)`,
        userId: (req as any).user?.id,
        userName: (req as any).user?.name || "System",
        type: "system"
      });
      
      res.json({ success: true, message: `All cache cleared (${count} items)` });
    }
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
    
    setCache('app:projects:all', projects, 3600000);
    setCache('app:posts:all', posts, 3600000);
    setCache('page:all', pages, 3600000);
    setCache('app:settings:all', settings, 3600000);
    
    await storage.createActivityLog({
      action: "Cache warmed up with projects, posts, pages, and settings",
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
    size: JSON.stringify(data).length,
    createdAt: Date.now()
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
