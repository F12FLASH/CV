import { Router, Request, Response } from "express";
import { storage } from "../storage";
import { requireAdmin } from "../middleware/auth";
import crypto from "crypto";

const router = Router();

interface SearchResult {
  type: 'post' | 'project' | 'page' | 'service';
  id: number;
  title: string;
  slug: string;
  excerpt?: string;
  thumbnail?: string;
  createdAt?: Date;
}

function getVisitorId(req: any): string {
  const ip = req.ip || req.socket.remoteAddress || 'unknown';
  const userAgent = req.get('User-Agent') || 'unknown';
  return crypto.createHash('md5').update(`${ip}-${userAgent}`).digest('hex').substring(0, 16);
}

router.get("/", async (req: Request, res: Response) => {
  try {
    const query = (req.query.q as string || "").toLowerCase().trim();
    const limit = parseInt(req.query.limit as string) || 10;
    
    if (!query || query.length < 2) {
      return res.json({ results: [], total: 0 });
    }

    const results: SearchResult[] = [];

    const posts = await storage.getAllPosts();
    const publishedPosts = posts.filter(p => p.status?.toLowerCase() === 'published');
    for (const post of publishedPosts) {
      if (
        post.title.toLowerCase().includes(query) ||
        (post.excerpt && post.excerpt.toLowerCase().includes(query)) ||
        (post.content && post.content.toLowerCase().includes(query))
      ) {
        results.push({
          type: 'post',
          id: post.id,
          title: post.title,
          slug: post.slug,
          excerpt: post.excerpt || undefined,
          thumbnail: post.featuredImage || undefined,
          createdAt: post.createdAt || undefined,
        });
      }
    }

    const projects = await storage.getAllProjects();
    for (const project of projects) {
      if (
        project.title.toLowerCase().includes(query) ||
        (project.description && project.description.toLowerCase().includes(query)) ||
        (project.tech && project.tech.some((t: string) => t.toLowerCase().includes(query)))
      ) {
        results.push({
          type: 'project',
          id: project.id,
          title: project.title,
          slug: project.title.toLowerCase().replace(/\s+/g, '-'),
          excerpt: project.description || undefined,
          thumbnail: project.image || undefined,
        });
      }
    }

    const pages = await storage.getAllPages();
    const publishedPages = pages.filter(p => p.status?.toLowerCase() === 'published');
    for (const page of publishedPages) {
      if (
        page.title.toLowerCase().includes(query) ||
        (page.content && page.content.toLowerCase().includes(query))
      ) {
        results.push({
          type: 'page',
          id: page.id,
          title: page.title,
          slug: page.slug,
          excerpt: page.metaDescription || undefined,
          thumbnail: page.featuredImage || undefined,
        });
      }
    }

    const services = await storage.getAllServices();
    for (const service of services) {
      if (
        service.title.toLowerCase().includes(query) ||
        (service.description && service.description.toLowerCase().includes(query))
      ) {
        results.push({
          type: 'service',
          id: service.id,
          title: service.title,
          slug: service.title.toLowerCase().replace(/\s+/g, '-'),
          excerpt: service.description || undefined,
          thumbnail: service.icon || undefined,
        });
      }
    }

    results.sort((a, b) => {
      const aTitle = a.title.toLowerCase().includes(query) ? 1 : 0;
      const bTitle = b.title.toLowerCase().includes(query) ? 1 : 0;
      return bTitle - aTitle;
    });

    const limitedResults = results.slice(0, limit);

    try {
      const visitorId = getVisitorId(req);
      await storage.createSearchHistory({
        query: req.query.q as string,
        resultsCount: results.length,
        visitorId,
        userId: (req.session as any)?.userId || null,
      });
    } catch (e) {
      console.error("Failed to log search history:", e);
    }

    res.json({
      results: limitedResults,
      total: results.length,
      query,
    });
  } catch (error: any) {
    console.error("Search error:", error);
    res.status(500).json({ message: error.message });
  }
});

router.get("/autocomplete", async (req: Request, res: Response) => {
  try {
    const query = (req.query.q as string || "").toLowerCase().trim();
    
    if (!query || query.length < 2) {
      return res.json({ suggestions: [] });
    }

    const suggestions: string[] = [];

    const posts = await storage.getAllPosts();
    const publishedPosts = posts.filter(p => p.status?.toLowerCase() === 'published');
    for (const post of publishedPosts) {
      if (post.title.toLowerCase().includes(query) && !suggestions.includes(post.title)) {
        suggestions.push(post.title);
      }
    }

    const projects = await storage.getAllProjects();
    for (const project of projects) {
      if (project.title.toLowerCase().includes(query) && !suggestions.includes(project.title)) {
        suggestions.push(project.title);
      }
      if (project.tech) {
        for (const tech of project.tech as string[]) {
          if (tech.toLowerCase().includes(query) && !suggestions.includes(tech)) {
            suggestions.push(tech);
          }
        }
      }
    }

    res.json({ suggestions: suggestions.slice(0, 10) });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

router.get("/popular", async (req: Request, res: Response) => {
  try {
    const popular = await storage.getPopularSearches(10);
    res.json(popular);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

router.get("/history", async (req: Request, res: Response) => {
  try {
    if (!(req.session as any)?.userId) {
      return res.json({ history: [] });
    }
    const history = await storage.getUserSearchHistory((req.session as any).userId, 10);
    res.json({ history });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

router.get("/admin/stats", requireAdmin, async (req: Request, res: Response) => {
  try {
    const popular = await storage.getPopularSearches(20);
    res.json({ popularSearches: popular });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

export default router;
