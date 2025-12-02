import { WebSocketServer, WebSocket } from "ws";
import type { Server } from "http";
import type { Message, Comment, Review } from "@shared/schema";

let wss: WebSocketServer | null = null;

export function setupWebSocket(server: Server) {
  // Use the same port as the HTTP server, no separate port needed
  wss = new WebSocketServer({ 
    server, 
    path: "/ws",
    perMessageDeflate: false,
    clientTracking: true
  });

  wss.on("connection", (ws: WebSocket) => {
    ws.on("close", (code: number, reason: Buffer) => {
      // Connection closed - clients will automatically reconnect
    });

    ws.on("error", (error: Error) => {
      // WebSocket error - connection will be terminated
      ws.terminate();
    });
  });

  return wss;
}

export function broadcastNewMessage(message: Message) {
  if (!wss) return;

  const payload = JSON.stringify({
    type: "NEW_MESSAGE",
    data: message,
  });

  wss.clients.forEach((client) => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(payload);
    }
  });
}

export function broadcastNotification(notification: { type: string; message: string; data?: any }) {
  if (!wss) return;

  const payload = JSON.stringify({
    type: "NOTIFICATION",
    data: notification,
  });

  wss.clients.forEach((client) => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(payload);
    }
  });
}

export function broadcastNewComment(comment: Comment) {
  if (!wss) return;

  const payload = JSON.stringify({
    type: "NEW_COMMENT",
    data: comment,
  });

  wss.clients.forEach((client) => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(payload);
    }
  });
}

export function broadcastNewReview(review: Review) {
  if (!wss) return;

  const payload = JSON.stringify({
    type: "NEW_REVIEW",
    data: review,
  });

  wss.clients.forEach((client) => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(payload);
    }
  });
}
