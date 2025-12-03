import { Router, Request, Response } from "express";
import { storage } from "../storage";
import { insertWebhookSchema } from "@shared/schema";
import { z } from "zod";
import crypto from "crypto";

const router = Router();

function generateSecret(): string {
  return crypto.randomBytes(32).toString('hex');
}

async function triggerWebhook(webhook: any, event: string, payload: any): Promise<{ success: boolean; status?: number; body?: string; duration: number }> {
  const startTime = Date.now();
  
  try {
    const signature = crypto
      .createHmac('sha256', webhook.secret || '')
      .update(JSON.stringify(payload))
      .digest('hex');
    
    const response = await fetch(webhook.url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Webhook-Event': event,
        'X-Webhook-Signature': `sha256=${signature}`,
        'X-Webhook-Timestamp': new Date().toISOString()
      },
      body: JSON.stringify(payload)
    });
    
    const body = await response.text();
    const duration = Date.now() - startTime;
    
    return {
      success: response.ok,
      status: response.status,
      body: body.substring(0, 1000),
      duration
    };
  } catch (error) {
    const duration = Date.now() - startTime;
    return {
      success: false,
      body: error instanceof Error ? error.message : 'Unknown error',
      duration
    };
  }
}

router.get("/", async (req: Request, res: Response) => {
  try {
    const webhooks = await storage.getAllWebhooks();
    res.json(webhooks);
  } catch (error) {
    console.error("Error fetching webhooks:", error);
    res.status(500).json({ error: "Failed to fetch webhooks" });
  }
});

router.get("/events", async (req: Request, res: Response) => {
  const events = [
    { id: "post.created", name: "Post Created", description: "When a new post is published" },
    { id: "post.updated", name: "Post Updated", description: "When a post is updated" },
    { id: "post.deleted", name: "Post Deleted", description: "When a post is deleted" },
    { id: "project.created", name: "Project Created", description: "When a new project is added" },
    { id: "project.updated", name: "Project Updated", description: "When a project is updated" },
    { id: "project.deleted", name: "Project Deleted", description: "When a project is deleted" },
    { id: "message.received", name: "Message Received", description: "When a contact form is submitted" },
    { id: "comment.created", name: "Comment Created", description: "When a new comment is posted" },
    { id: "user.login", name: "User Login", description: "When a user logs in" },
    { id: "user.registered", name: "User Registered", description: "When a new user registers" },
    { id: "subscriber.added", name: "Subscriber Added", description: "When someone subscribes to newsletter" },
  ];
  res.json(events);
});

router.get("/:id", async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id);
    const webhook = await storage.getWebhook(id);
    if (!webhook) {
      return res.status(404).json({ error: "Webhook not found" });
    }
    res.json(webhook);
  } catch (error) {
    console.error("Error fetching webhook:", error);
    res.status(500).json({ error: "Failed to fetch webhook" });
  }
});

router.get("/:id/logs", async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id);
    const limit = parseInt(req.query.limit as string) || 50;
    const logs = await storage.getWebhookLogs(id, limit);
    res.json(logs);
  } catch (error) {
    console.error("Error fetching webhook logs:", error);
    res.status(500).json({ error: "Failed to fetch webhook logs" });
  }
});

router.post("/", async (req: Request, res: Response) => {
  try {
    const data = insertWebhookSchema.parse({
      ...req.body,
      secret: req.body.secret || generateSecret()
    });
    const webhook = await storage.createWebhook(data);
    
    await storage.createActivityLog({
      action: `Created webhook: ${webhook.name}`,
      userId: (req as any).user?.id,
      userName: (req as any).user?.name || "System",
      type: "create"
    });
    
    res.status(201).json(webhook);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: "Validation error", details: error.errors });
    }
    console.error("Error creating webhook:", error);
    res.status(500).json({ error: "Failed to create webhook" });
  }
});

router.patch("/:id", async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id);
    const webhook = await storage.updateWebhook(id, req.body);
    if (!webhook) {
      return res.status(404).json({ error: "Webhook not found" });
    }
    
    await storage.createActivityLog({
      action: `Updated webhook: ${webhook.name}`,
      userId: (req as any).user?.id,
      userName: (req as any).user?.name || "System",
      type: "update"
    });
    
    res.json(webhook);
  } catch (error) {
    console.error("Error updating webhook:", error);
    res.status(500).json({ error: "Failed to update webhook" });
  }
});

router.post("/:id/test", async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id);
    const webhook = await storage.getWebhook(id);
    if (!webhook) {
      return res.status(404).json({ error: "Webhook not found" });
    }
    
    const testPayload = {
      event: "test",
      timestamp: new Date().toISOString(),
      data: {
        message: "This is a test webhook delivery"
      }
    };
    
    const result = await triggerWebhook(webhook, "test", testPayload);
    
    await storage.createWebhookLog({
      webhookId: id,
      event: "test",
      payload: testPayload,
      responseStatus: result.status,
      responseBody: result.body,
      success: result.success,
      duration: result.duration
    });
    
    if (result.success) {
      await storage.incrementWebhookSuccess(id);
    } else {
      await storage.incrementWebhookFailure(id);
    }
    
    await storage.createActivityLog({
      action: `Tested webhook: ${webhook.name} - ${result.success ? 'Success' : 'Failed'}`,
      userId: (req as any).user?.id,
      userName: (req as any).user?.name || "System",
      type: result.success ? 'info' : 'error'
    });
    
    res.json(result);
  } catch (error) {
    console.error("Error testing webhook:", error);
    res.status(500).json({ error: "Failed to test webhook" });
  }
});

router.post("/:id/toggle", async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id);
    const webhook = await storage.getWebhook(id);
    if (!webhook) {
      return res.status(404).json({ error: "Webhook not found" });
    }
    
    const newStatus = webhook.status === 'active' ? 'inactive' : 'active';
    const updated = await storage.updateWebhook(id, { status: newStatus });
    
    await storage.createActivityLog({
      action: `${newStatus === 'active' ? 'Activated' : 'Deactivated'} webhook: ${webhook.name}`,
      userId: (req as any).user?.id,
      userName: (req as any).user?.name || "System",
      type: "update"
    });
    
    res.json(updated);
  } catch (error) {
    console.error("Error toggling webhook:", error);
    res.status(500).json({ error: "Failed to toggle webhook" });
  }
});

router.post("/:id/regenerate-secret", async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id);
    const newSecret = generateSecret();
    const webhook = await storage.updateWebhook(id, { secret: newSecret });
    if (!webhook) {
      return res.status(404).json({ error: "Webhook not found" });
    }
    
    await storage.createActivityLog({
      action: `Regenerated secret for webhook: ${webhook.name}`,
      userId: (req as any).user?.id,
      userName: (req as any).user?.name || "System",
      type: "update"
    });
    
    res.json(webhook);
  } catch (error) {
    console.error("Error regenerating webhook secret:", error);
    res.status(500).json({ error: "Failed to regenerate webhook secret" });
  }
});

router.delete("/:id", async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id);
    const webhook = await storage.getWebhook(id);
    if (!webhook) {
      return res.status(404).json({ error: "Webhook not found" });
    }
    
    const deleted = await storage.deleteWebhook(id);
    
    await storage.createActivityLog({
      action: `Deleted webhook: ${webhook.name}`,
      userId: (req as any).user?.id,
      userName: (req as any).user?.name || "System",
      type: "delete"
    });
    
    res.json({ success: deleted });
  } catch (error) {
    console.error("Error deleting webhook:", error);
    res.status(500).json({ error: "Failed to delete webhook" });
  }
});

export default router;

export async function triggerWebhooks(event: string, payload: any): Promise<void> {
  try {
    const webhooks = await storage.getWebhooksByEvent(event);
    
    for (const webhook of webhooks) {
      const result = await triggerWebhook(webhook, event, payload);
      
      await storage.createWebhookLog({
        webhookId: webhook.id,
        event,
        payload,
        responseStatus: result.status,
        responseBody: result.body,
        success: result.success,
        duration: result.duration
      });
      
      if (result.success) {
        await storage.incrementWebhookSuccess(webhook.id);
      } else {
        await storage.incrementWebhookFailure(webhook.id);
      }
    }
  } catch (error) {
    console.error("Error triggering webhooks:", error);
  }
}
