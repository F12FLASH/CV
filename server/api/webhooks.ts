import { Router } from "express";

const router = Router();

// Webhooks API has been removed
export default router;

export async function triggerWebhooks(event: string, payload: any): Promise<void> {
  // Webhooks functionality has been removed
}