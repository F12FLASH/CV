import { Router } from "express";
import { storage } from "../storage";
import { requireAdmin } from "../middleware/auth";
import * as fs from "fs";
import * as path from "path";

const router = Router();

const logsDir = path.join(process.cwd(), "logs");
if (!fs.existsSync(logsDir)) {
  fs.mkdirSync(logsDir, { recursive: true });
}

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

router.get("/", requireAdmin, async (req, res) => {
  try {
    const { level, limit = 100, source = "all" } = req.query;
    const logs: any[] = [];

    if (source === "all" || source === "database") {
      const dbLogs = await storage.getAllActivityLogs(Number(limit));
      logs.push(...dbLogs.map(log => ({
        ...log,
        source: "database",
        timestamp: log.createdAt
      })));
    }

    if (source === "all" || source === "file") {
      const logFiles = fs.existsSync(logsDir) ? fs.readdirSync(logsDir).filter(f => f.endsWith('.log')) : [];

      for (const logFile of logFiles.slice(-7)) {
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
          }
        }
      }
    }

    let filteredLogs = logs;
    if (level && level !== 'all') {
      filteredLogs = logs.filter(log => log.type === level || log.level === level);
    }

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

router.get("/files", requireAdmin, async (req, res) => {
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

router.post("/", requireAdmin, async (req, res) => {
  try {
    const { level, message, details } = req.body;

    writeLogToFile(level || 'info', message, details);

    res.json({ success: true, message: "Log entry created" });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

router.delete("/files/:filename", requireAdmin, async (req, res) => {
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

export default router;
