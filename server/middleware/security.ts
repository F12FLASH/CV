
import { Request, Response, NextFunction } from 'express';
import { storage } from '../storage';

// Rate limiting store
const rateLimitStore = new Map<string, { count: number; resetTime: number }>();
const loginAttemptStore = new Map<string, { attempts: number; lockoutUntil: number }>();

// IP whitelist/blacklist enforcement
export async function ipFilterMiddleware(req: Request, res: Response, next: NextFunction) {
  const clientIp = req.ip || req.socket.remoteAddress || 'unknown';
  
  const ipRules = await storage.getAllIpRules();
  const whitelist = ipRules.filter(r => r.type === 'whitelist');
  const blacklist = ipRules.filter(r => r.type === 'blacklist');
  
  // Check blacklist first
  const isBlacklisted = blacklist.some(rule => {
    if (rule.ipAddress.includes('/')) {
      // CIDR notation - simple check (should use ip-range-check library in production)
      return clientIp.startsWith(rule.ipAddress.split('/')[0].split('.').slice(0, 3).join('.'));
    }
    return rule.ipAddress === clientIp;
  });
  
  if (isBlacklisted) {
    await storage.createSecurityLog({
      action: 'Blocked by IP blacklist',
      ipAddress: clientIp,
      userAgent: req.get('User-Agent'),
      eventType: 'ip_blocked',
      blocked: true
    });
    return res.status(403).json({ message: 'Access denied' });
  }
  
  // If whitelist exists and IP not in whitelist, block
  if (whitelist.length > 0) {
    const isWhitelisted = whitelist.some(rule => {
      if (rule.ipAddress.includes('/')) {
        return clientIp.startsWith(rule.ipAddress.split('/')[0].split('.').slice(0, 3).join('.'));
      }
      return rule.ipAddress === clientIp;
    });
    
    if (!isWhitelisted) {
      await storage.createSecurityLog({
        action: 'Not in IP whitelist',
        ipAddress: clientIp,
        userAgent: req.get('User-Agent'),
        eventType: 'ip_not_whitelisted',
        blocked: true
      });
      return res.status(403).json({ message: 'Access denied' });
    }
  }
  
  next();
}

export async function rateLimitMiddleware(req: Request, res: Response, next: NextFunction) {
  const clientIp = req.ip || req.socket.remoteAddress || 'unknown';
  const now = Date.now();
  
  // Get rate limit settings
  const settings = await storage.getAllSecuritySettings();
  const apiRateLimit = settings.find(s => s.key === 'apiRateLimit')?.value || 1000;
  
  const key = `${clientIp}:${req.path}`;
  const record = rateLimitStore.get(key);
  
  if (record) {
    if (now < record.resetTime) {
      if (record.count >= Number(apiRateLimit)) {
        await storage.createSecurityLog({
          action: 'Rate limit exceeded',
          ipAddress: clientIp,
          userAgent: req.get('User-Agent'),
          eventType: 'rate_limit_exceeded',
          blocked: true,
          requestPath: req.path
        });
        return res.status(429).json({ message: 'Too many requests, please try again later' });
      }
      record.count++;
    } else {
      rateLimitStore.set(key, { count: 1, resetTime: now + 3600000 }); // 1 hour window
    }
  } else {
    rateLimitStore.set(key, { count: 1, resetTime: now + 3600000 });
  }
  
  next();
}

export async function loginRateLimitMiddleware(req: Request, res: Response, next: NextFunction) {
  const clientIp = req.ip || req.socket.remoteAddress || 'unknown';
  const now = Date.now();
  
  // Get login attempt settings
  const settings = await storage.getAllSecuritySettings();
  const maxAttempts = Number(settings.find(s => s.key === 'loginAttemptsLimit')?.value || 5);
  const lockoutDuration = Number(settings.find(s => s.key === 'lockoutDuration')?.value || 15) * 60000; // minutes to ms
  
  const record = loginAttemptStore.get(clientIp);
  
  if (record) {
    if (now < record.lockoutUntil) {
      await storage.createSecurityLog({
        action: 'Login attempt during lockout',
        ipAddress: clientIp,
        userAgent: req.get('User-Agent'),
        eventType: 'login_lockout',
        blocked: true
      });
      return res.status(429).json({ 
        message: `Too many login attempts. Please try again in ${Math.ceil((record.lockoutUntil - now) / 60000)} minutes` 
      });
    }
    
    if (record.attempts >= maxAttempts) {
      record.lockoutUntil = now + lockoutDuration;
      await storage.createSecurityLog({
        action: 'IP locked out due to failed login attempts',
        ipAddress: clientIp,
        userAgent: req.get('User-Agent'),
        eventType: 'login_lockout',
        blocked: true
      });
      return res.status(429).json({ 
        message: `Too many login attempts. Locked out for ${lockoutDuration / 60000} minutes` 
      });
    }
  }
  
  next();
}

export function recordFailedLogin(clientIp: string) {
  const record = loginAttemptStore.get(clientIp);
  if (record) {
    record.attempts++;
  } else {
    loginAttemptStore.set(clientIp, { attempts: 1, lockoutUntil: 0 });
  }
}

export function clearLoginAttempts(clientIp: string) {
  loginAttemptStore.delete(clientIp);
}

// Clean up expired entries periodically
setInterval(() => {
  const now = Date.now();
  for (const [key, record] of rateLimitStore.entries()) {
    if (now > record.resetTime) {
      rateLimitStore.delete(key);
    }
  }
  for (const [key, record] of loginAttemptStore.entries()) {
    if (now > record.lockoutUntil && record.lockoutUntil > 0) {
      loginAttemptStore.delete(key);
    }
  }
}, 300000); // Clean every 5 minutes
