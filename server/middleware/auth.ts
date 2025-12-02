import { Request, Response, NextFunction } from "express";

declare module "express-session" {
  interface SessionData {
    userId: number;
    username: string;
    role: string;
    pending2FA?: boolean;
    pendingUserId?: number;
    temp2FASecret?: string;
    currentChallenge?: string;
    tempUserId?: number;
  }
}

export function requireAuth(req: Request, res: Response, next: NextFunction) {
  if (!req.session.userId) {
    return res.status(401).json({ error: "Authentication required" });
  }
  next();
}

export function requireAdmin(req: Request, res: Response, next: NextFunction) {
  if (!req.session.userId) {
    return res.status(401).json({ error: "Authentication required" });
  }
  const adminRoles = ['Super Admin', 'Admin', 'Editor', 'Moderator'];
  if (!adminRoles.includes(req.session.role || '')) {
    return res.status(403).json({ error: "Admin access required" });
  }
  next();
}
