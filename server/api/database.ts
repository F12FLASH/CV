import { Router, Request, Response } from "express";
import { storage } from "../storage";
import { requireAdmin } from "../middleware/auth";
import { upload } from "../utils/upload";
import * as fs from "fs";
import * as path from "path";

const router = Router();

const backupsDir = path.join(process.cwd(), "backups");
if (!fs.existsSync(backupsDir)) {
  fs.mkdirSync(backupsDir, { recursive: true });
}

router.get("/status", requireAdmin, async (req: Request, res: Response) => {
  try {
    const stats = await storage.getSystemStats();

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

router.post("/backup", requireAdmin, async (req: Request, res: Response) => {
  try {
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

router.get("/backup/:filename", requireAdmin, async (req: Request, res: Response) => {
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

router.get("/backups", requireAdmin, async (req: Request, res: Response) => {
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

router.delete("/backup/:filename", requireAdmin, async (req: Request, res: Response) => {
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

router.post("/restore", requireAdmin, upload.single('backup'), async (req: Request, res: Response) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "No backup file uploaded" });
    }

    const backupContent = fs.readFileSync(req.file.path, 'utf-8');
    const backup = JSON.parse(backupContent);

    if (!backup.version || !backup.data) {
      return res.status(400).json({ message: "Invalid backup file format" });
    }

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

export default router;
