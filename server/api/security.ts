import { Router } from "express";
import { storage } from "../storage";
import { requireAuth, requireAdmin } from "../middleware/auth";

const router = Router();

router.get("/settings", requireAdmin, async (req, res) => {
  try {
    const settings = await storage.getAllSecuritySettings();
    const settingsObject: Record<string, any> = {};

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

router.post("/settings", requireAdmin, async (req, res) => {
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

router.post("/settings/bulk", requireAdmin, async (req, res) => {
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

router.get("/devices", requireAuth, async (req, res) => {
  try {
    const devices = await storage.getTrustedDevicesByUser(req.session.userId!);
    res.json(devices);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

router.post("/devices", requireAuth, async (req, res) => {
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

router.patch("/devices/:id", requireAuth, async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const device = await storage.updateTrustedDevice(id, req.body);
    res.json(device);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

router.delete("/devices/:id", requireAuth, async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    await storage.deleteTrustedDevice(id);
    res.json({ message: "Device removed" });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

router.get("/sessions", requireAuth, async (req, res) => {
  try {
    if (req.session.role === "Super Admin" || req.session.role === "Admin") {
      const sessions = await storage.getAllActiveSessions();
      res.json(sessions);
    } else {
      const sessions = await storage.getActiveSessionsByUser(req.session.userId!);
      res.json(sessions);
    }
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

router.get("/sessions/user/:userId", requireAuth, async (req, res) => {
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

router.post("/sessions/terminate/:id", requireAuth, async (req, res) => {
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

router.post("/sessions/terminate-all", requireAdmin, async (req, res) => {
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

router.post("/sessions/logout-all-devices", requireAuth, async (req, res) => {
  try {
    await storage.terminateAllUserSessions(req.session.userId!);
    const devices = await storage.getTrustedDevicesByUser(req.session.userId!);
    for (const device of devices) {
      await storage.deleteTrustedDevice(device.id);
    }
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

router.get("/ip-rules", requireAdmin, async (req, res) => {
  try {
    const rules = await storage.getAllIpRules();
    res.json(rules);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

router.get("/ip-rules/:type", requireAdmin, async (req, res) => {
  try {
    const type = req.params.type;
    const rules = await storage.getIpRulesByType(type);
    res.json(rules);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

router.post("/ip-rules", requireAdmin, async (req, res) => {
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

router.delete("/ip-rules/:id", requireAdmin, async (req, res) => {
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

router.get("/logs", requireAdmin, async (req, res) => {
  try {
    const limit = parseInt(req.query.limit as string) || 100;
    const logs = await storage.getRecentSecurityLogs(limit);
    res.json(logs);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

router.get("/logs/:type", requireAdmin, async (req, res) => {
  try {
    const eventType = req.params.type;
    const logs = await storage.getSecurityLogsByType(eventType);
    res.json(logs);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

router.post("/logs", requireAdmin, async (req, res) => {
  try {
    const log = await storage.createSecurityLog(req.body);
    res.json(log);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

router.get("/login-history", requireAuth, async (req, res) => {
  try {
    const limit = parseInt(req.query.limit as string) || 50;
    const loginLogs = await storage.getLoginHistory(limit);
    res.json(loginLogs);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

router.get("/stats", requireAdmin, async (req, res) => {
  try {
    const stats = await storage.getSecurityStats();
    res.json(stats);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

export default router;
