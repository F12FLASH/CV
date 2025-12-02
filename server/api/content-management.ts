import { Router } from "express";
import { storage } from "../storage";
import { requireAdmin, requireAuth } from "../middleware/auth";

const router = Router();

router.get("/drafts/:contentType", requireAuth, async (req, res) => {
  try {
    const { contentType } = req.params;
    const contentId = req.query.contentId ? parseInt(req.query.contentId as string) : undefined;
    
    const draft = await storage.getContentDraft(req.session.userId!, contentType, contentId);
    res.json(draft || null);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

router.post("/drafts", requireAuth, async (req, res) => {
  try {
    const { contentType, contentId, title, content, metadata } = req.body;
    
    if (!contentType) {
      return res.status(400).json({ message: "Content type is required" });
    }

    const draft = await storage.upsertContentDraft({
      contentType,
      contentId: contentId || null,
      title: title || null,
      content: content || null,
      metadata: metadata || null,
      userId: req.session.userId!,
    });

    res.json(draft);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

router.delete("/drafts/:id", requireAuth, async (req, res) => {
  try {
    const deleted = await storage.deleteContentDraft(parseInt(req.params.id));
    if (!deleted) {
      return res.status(404).json({ message: "Draft not found" });
    }
    res.json({ message: "Draft deleted successfully" });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

router.get("/versions/:contentType/:contentId", requireAdmin, async (req, res) => {
  try {
    const { contentType, contentId } = req.params;
    const versions = await storage.getContentVersions(contentType, parseInt(contentId));
    res.json(versions);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

router.post("/versions", requireAdmin, async (req, res) => {
  try {
    const { contentType, contentId, title, content, metadata } = req.body;
    
    if (!contentType || !contentId || !title) {
      return res.status(400).json({ message: "Content type, content ID, and title are required" });
    }

    const latestVersion = await storage.getLatestVersionNumber(contentType, contentId);

    const version = await storage.createContentVersion({
      contentType,
      contentId,
      version: latestVersion + 1,
      title,
      content: content || null,
      metadata: metadata || null,
      createdBy: req.session.userId,
    });

    res.status(201).json(version);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

router.get("/scheduled", requireAdmin, async (req, res) => {
  try {
    const scheduled = await storage.getAllScheduledContent();
    res.json(scheduled);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

router.post("/scheduled", requireAdmin, async (req, res) => {
  try {
    const { contentType, contentId, action, scheduledAt } = req.body;
    
    if (!contentType || !contentId || !action || !scheduledAt) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const scheduled = await storage.createScheduledContent({
      contentType,
      contentId,
      action,
      scheduledAt: new Date(scheduledAt),
      createdBy: req.session.userId,
    });

    await storage.createActivityLog({
      action: `Scheduled ${action} for ${contentType} #${contentId} at ${scheduledAt}`,
      userId: req.session.userId,
      userName: req.session.username,
      type: 'info'
    });

    res.status(201).json(scheduled);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

router.delete("/scheduled/:id", requireAdmin, async (req, res) => {
  try {
    const deleted = await storage.deleteScheduledContent(parseInt(req.params.id));
    if (!deleted) {
      return res.status(404).json({ message: "Scheduled content not found" });
    }
    res.json({ message: "Scheduled content cancelled successfully" });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

router.get("/templates", requireAdmin, async (req, res) => {
  try {
    const { type } = req.query;
    const templates = type 
      ? await storage.getContentTemplatesByType(type as string)
      : await storage.getAllContentTemplates();
    res.json(templates);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

router.get("/templates/:id", requireAdmin, async (req, res) => {
  try {
    const template = await storage.getContentTemplate(parseInt(req.params.id));
    if (!template) {
      return res.status(404).json({ message: "Template not found" });
    }
    res.json(template);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

router.post("/templates", requireAdmin, async (req, res) => {
  try {
    const { name, type, content, metadata, isDefault } = req.body;
    
    if (!name || !type) {
      return res.status(400).json({ message: "Name and type are required" });
    }

    const template = await storage.createContentTemplate({
      name,
      type,
      content: content || null,
      metadata: metadata || null,
      isDefault: isDefault || false,
    });

    res.status(201).json(template);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

router.put("/templates/:id", requireAdmin, async (req, res) => {
  try {
    const template = await storage.updateContentTemplate(parseInt(req.params.id), req.body);
    if (!template) {
      return res.status(404).json({ message: "Template not found" });
    }
    res.json(template);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

router.delete("/templates/:id", requireAdmin, async (req, res) => {
  try {
    const deleted = await storage.deleteContentTemplate(parseInt(req.params.id));
    if (!deleted) {
      return res.status(404).json({ message: "Template not found" });
    }
    res.json({ message: "Template deleted successfully" });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

router.post("/bulk-delete", requireAdmin, async (req, res) => {
  try {
    const { contentType, ids } = req.body;
    
    if (!contentType || !Array.isArray(ids) || ids.length === 0) {
      return res.status(400).json({ message: "Content type and IDs are required" });
    }

    let deleted = 0;
    for (const id of ids) {
      let result = false;
      switch (contentType) {
        case 'post':
          result = await storage.deletePost(id);
          break;
        case 'page':
          result = await storage.deletePage(id);
          break;
        case 'project':
          result = await storage.deleteProject(id);
          break;
      }
      if (result) deleted++;
    }

    await storage.createActivityLog({
      action: `Bulk deleted ${deleted} ${contentType}s`,
      userId: req.session.userId,
      userName: req.session.username,
      type: 'warning'
    });

    res.json({ message: `${deleted} items deleted successfully`, deleted });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

router.post("/bulk-publish", requireAdmin, async (req, res) => {
  try {
    const { contentType, ids } = req.body;
    
    if (!contentType || !Array.isArray(ids) || ids.length === 0) {
      return res.status(400).json({ message: "Content type and IDs are required" });
    }

    let updated = 0;
    for (const id of ids) {
      let result;
      switch (contentType) {
        case 'post':
          result = await storage.updatePost(id, { status: 'Published', publishedAt: new Date() });
          break;
        case 'page':
          result = await storage.updatePage(id, { status: 'Published', publishedAt: new Date() });
          break;
        case 'project':
          result = await storage.updateProject(id, { status: 'Published' });
          break;
      }
      if (result) updated++;
    }

    await storage.createActivityLog({
      action: `Bulk published ${updated} ${contentType}s`,
      userId: req.session.userId,
      userName: req.session.username,
      type: 'success'
    });

    res.json({ message: `${updated} items published successfully`, updated });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

export default router;
