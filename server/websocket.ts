import { WebSocketServer, WebSocket } from "ws";
import type { Server } from "http";
import type { Message } from "@shared/schema";

let wss: WebSocketServer | null = null;

export function setupWebSocket(server: Server) {
  wss = new WebSocketServer({ server, path: "/ws" });

  wss.on("connection", (ws: WebSocket) => {
    ws.on("close", () => {
    });

    ws.on("error", () => {
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
