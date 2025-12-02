import { Router, Request, Response } from "express";
import { storage } from "../storage";

const router = Router();

router.get("/sitemap.xml", async (req: Request, res: Response) => {
  try {
    const baseUrl = process.env.REPLIT_DEV_DOMAIN 
      ? `https://${process.env.REPLIT_DEV_DOMAIN}` 
      : 'http://localhost:5000';

    const posts = await storage.getPublishedPosts();
    const projects = await storage.getPublishedProjects();
    const pages = await storage.getPublishedPages();
    
    let sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>${baseUrl}/</loc>
    <changefreq>daily</changefreq>
    <priority>1.0</priority>
  </url>
  <url>
    <loc>${baseUrl}/blog</loc>
    <changefreq>daily</changefreq>
    <priority>0.9</priority>
  </url>
  <url>
    <loc>${baseUrl}/projects</loc>
    <changefreq>weekly</changefreq>
    <priority>0.9</priority>
  </url>
  <url>
    <loc>${baseUrl}/contact</loc>
    <changefreq>monthly</changefreq>
    <priority>0.7</priority>
  </url>`;

    for (const post of posts) {
      const lastmod = post.updatedAt || post.publishedAt || post.createdAt;
      sitemap += `
  <url>
    <loc>${baseUrl}/blog/${post.slug}</loc>
    <lastmod>${lastmod ? new Date(lastmod).toISOString().split('T')[0] : new Date().toISOString().split('T')[0]}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>`;
    }

    for (const project of projects) {
      const lastmod = project.updatedAt || project.createdAt;
      sitemap += `
  <url>
    <loc>${baseUrl}/projects/${project.id}</loc>
    <lastmod>${lastmod ? new Date(lastmod).toISOString().split('T')[0] : new Date().toISOString().split('T')[0]}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.8</priority>
  </url>`;
    }

    for (const page of pages) {
      if (page.slug !== 'home') {
        const lastmod = page.updatedAt || page.publishedAt || page.createdAt;
        sitemap += `
  <url>
    <loc>${baseUrl}/pages/${page.slug}</loc>
    <lastmod>${lastmod ? new Date(lastmod).toISOString().split('T')[0] : new Date().toISOString().split('T')[0]}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.6</priority>
  </url>`;
      }
    }

    sitemap += `
</urlset>`;

    res.set('Content-Type', 'application/xml');
    res.send(sitemap);
  } catch (error: any) {
    console.error("Sitemap error:", error);
    res.status(500).send('Error generating sitemap');
  }
});

router.get("/rss.xml", async (req: Request, res: Response) => {
  try {
    const baseUrl = process.env.REPLIT_DEV_DOMAIN 
      ? `https://${process.env.REPLIT_DEV_DOMAIN}` 
      : 'http://localhost:5000';

    const siteTitle = await storage.getSetting("siteTitle");
    const siteDescription = await storage.getSetting("siteDescription");
    const posts = await storage.getPublishedPosts();

    let rss = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom" xmlns:content="http://purl.org/rss/1.0/modules/content/">
  <channel>
    <title>${siteTitle?.value || 'Portfolio'}</title>
    <link>${baseUrl}</link>
    <description>${siteDescription?.value || 'Blog and Portfolio'}</description>
    <language>en-us</language>
    <lastBuildDate>${new Date().toUTCString()}</lastBuildDate>
    <atom:link href="${baseUrl}/rss.xml" rel="self" type="application/rss+xml"/>`;

    for (const post of posts.slice(0, 20)) {
      const pubDate = post.publishedAt || post.createdAt;
      const excerpt = post.excerpt || (post.content ? post.content.substring(0, 200) + '...' : '');
      
      rss += `
    <item>
      <title><![CDATA[${post.title}]]></title>
      <link>${baseUrl}/blog/${post.slug}</link>
      <guid isPermaLink="true">${baseUrl}/blog/${post.slug}</guid>
      <pubDate>${pubDate ? new Date(pubDate).toUTCString() : new Date().toUTCString()}</pubDate>
      <description><![CDATA[${excerpt}]]></description>
      <content:encoded><![CDATA[${post.content || ''}]]></content:encoded>
    </item>`;
    }

    rss += `
  </channel>
</rss>`;

    res.set('Content-Type', 'application/rss+xml');
    res.send(rss);
  } catch (error: any) {
    console.error("RSS error:", error);
    res.status(500).send('Error generating RSS feed');
  }
});

router.get("/robots.txt", async (req: Request, res: Response) => {
  try {
    const baseUrl = process.env.REPLIT_DEV_DOMAIN 
      ? `https://${process.env.REPLIT_DEV_DOMAIN}` 
      : 'http://localhost:5000';

    const robots = `User-agent: *
Allow: /
Disallow: /admin
Disallow: /api

Sitemap: ${baseUrl}/sitemap.xml
`;

    res.set('Content-Type', 'text/plain');
    res.send(robots);
  } catch (error: any) {
    res.status(500).send('Error generating robots.txt');
  }
});

export default router;
