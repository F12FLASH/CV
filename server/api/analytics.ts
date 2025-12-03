import { Router } from "express";
import { storage } from "../storage";
import { requireAdmin } from "../middleware/auth";
import crypto from "crypto";

const router = Router();

function getVisitorId(req: any): string {
  const ip = req.ip || req.socket.remoteAddress || 'unknown';
  const userAgent = req.get('User-Agent') || 'unknown';
  return crypto.createHash('md5').update(`${ip}-${userAgent}`).digest('hex').substring(0, 16);
}

function parseUserAgent(ua: string): { device: string; browser: string; os: string } {
  let device = 'desktop';
  let browser = 'unknown';
  let os = 'unknown';

  if (/mobile/i.test(ua)) device = 'mobile';
  else if (/tablet|ipad/i.test(ua)) device = 'tablet';

  if (/chrome/i.test(ua) && !/edge/i.test(ua)) browser = 'Chrome';
  else if (/firefox/i.test(ua)) browser = 'Firefox';
  else if (/safari/i.test(ua) && !/chrome/i.test(ua)) browser = 'Safari';
  else if (/edge/i.test(ua)) browser = 'Edge';
  else if (/msie|trident/i.test(ua)) browser = 'IE';

  if (/windows/i.test(ua)) os = 'Windows';
  else if (/mac/i.test(ua)) os = 'macOS';
  else if (/linux/i.test(ua)) os = 'Linux';
  else if (/android/i.test(ua)) os = 'Android';
  else if (/iphone|ipad/i.test(ua)) os = 'iOS';

  return { device, browser, os };
}

router.post("/track", async (req, res) => {
  try {
    const { path, contentType, contentId, referrer, sessionDuration } = req.body;
    
    if (!path) {
      return res.status(400).json({ message: "Path is required" });
    }

    const visitorId = getVisitorId(req);
    const userAgent = req.get('User-Agent') || 'unknown';
    const ipAddress = req.ip || req.socket.remoteAddress || 'unknown';
    const { device, browser, os } = parseUserAgent(userAgent);

    await storage.createPageView({
      path,
      contentType: contentType || null,
      contentId: contentId || null,
      visitorId,
      referrer: referrer || req.get('Referer') || null,
      userAgent,
      ipAddress,
      device,
      browser,
      os,
      sessionDuration: sessionDuration || null,
    });

    if (contentType && contentId) {
      switch (contentType) {
        case 'post':
          await storage.incrementPostViews(contentId);
          break;
        case 'page':
          await storage.incrementPageViews(contentId);
          break;
        case 'project':
          await storage.incrementProjectViews(contentId);
          break;
      }
    }

    res.json({ success: true });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

router.get("/overview", requireAdmin, async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    
    const start = startDate ? new Date(startDate as string) : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const end = endDate ? new Date(endDate as string) : new Date();

    const pageViewStats = await storage.getPageViewStats(start, end);
    const popularContent = await storage.getPopularContent(undefined, 10);
    const referrerStats = await storage.getReferrerStats(10);
    const deviceStats = await storage.getDeviceStats();
    const browserStats = await storage.getBrowserStats();
    const countryStats = await storage.getCountryStats();

    const totalViews = pageViewStats.reduce((acc, pv) => acc + pv.views, 0);

    res.json({
      totalViews,
      pageViewStats: pageViewStats.slice(0, 20),
      popularContent,
      referrerStats,
      deviceStats,
      browserStats,
      countryStats,
      dateRange: { start, end },
    });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

router.get("/popular-content", requireAdmin, async (req, res) => {
  try {
    const { contentType, limit } = req.query;
    const popular = await storage.getPopularContent(
      contentType as string | undefined, 
      parseInt(limit as string) || 10
    );
    res.json(popular);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

router.get("/referrers", requireAdmin, async (req, res) => {
  try {
    const { limit } = req.query;
    const referrers = await storage.getReferrerStats(parseInt(limit as string) || 10);
    res.json(referrers);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

router.get("/devices", requireAdmin, async (req, res) => {
  try {
    const devices = await storage.getDeviceStats();
    res.json(devices);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

router.get("/browsers", requireAdmin, async (req, res) => {
  try {
    const browsers = await storage.getBrowserStats();
    res.json(browsers);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

router.get("/countries", requireAdmin, async (req, res) => {
  try {
    const countries = await storage.getCountryStats();
    res.json(countries);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

router.get("/daily", requireAdmin, async (req, res) => {
  try {
    const { days } = req.query;
    const numDays = parseInt(days as string) || 30;
    const dailyViews = await storage.getDailyPageViews(numDays);
    res.json(dailyViews);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

router.get("/export", requireAdmin, async (req, res) => {
  try {
    const { startDate, endDate, format } = req.query;
    
    const start = startDate ? new Date(startDate as string) : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const end = endDate ? new Date(endDate as string) : new Date();

    const pageViewStats = await storage.getPageViewStats(start, end);
    const popularContent = await storage.getPopularContent(undefined, 50);
    const referrerStats = await storage.getReferrerStats(50);

    if (format === 'csv') {
      const csv = ['Page,Views'];
      for (const pv of pageViewStats) {
        csv.push(`"${pv.path}",${pv.views}`);
      }
      
      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', 'attachment; filename=analytics.csv');
      res.send(csv.join('\n'));
    } else {
      res.json({
        pageViewStats,
        popularContent,
        referrerStats,
        dateRange: { start, end },
      });
    }
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

export default router;
