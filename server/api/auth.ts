import { Router, Request, Response } from "express";
import { storage } from "../storage";
import { requireAuth, requireAdmin } from "../middleware/auth";
import { hashPassword, verifyPassword } from "../utils/password";
import { verifyCaptcha } from "../utils/captcha";
import { insertUserSchema } from "@shared/schema";
import { loginRateLimitMiddleware, recordFailedLogin, clearLoginAttempts } from "../middleware/security";
// @ts-ignore - speakeasy doesn't have type definitions
import speakeasy from "speakeasy";
// @ts-ignore - qrcode types may be incomplete  
import QRCode from "qrcode";
import { 
  generateRegistrationOptions, 
  verifyRegistrationResponse,
  generateAuthenticationOptions,
  verifyAuthenticationResponse 
} from "@simplewebauthn/server";

const router = Router();

// WebAuthn configuration
const rpName = "Loi Developer Portfolio";
const rpID = process.env.RP_ID || "localhost";
const origin = process.env.ORIGIN || `http://localhost:5000`;

// 2FA: Generate secret and QR code
router.post('/2fa/generate', requireAuth, async (req, res) => {
  try {
    const user = await storage.getUser(req.session.userId!);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const secret = speakeasy.generateSecret({
      name: `Loi Developer (${user.email})`,
      issuer: "Loi Developer Portfolio"
    });

    req.session.temp2FASecret = secret.base32;

    const qrCodeUrl = await QRCode.toDataURL(secret.otpauth_url!);

    res.json({
      secret: secret.base32,
      qrCode: qrCodeUrl
    });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

// 2FA: Verify and enable
router.post('/2fa/verify', requireAuth, async (req, res) => {
  try {
    const { token } = req.body;
    const secret = req.session.temp2FASecret;

    if (!secret) {
      return res.status(400).json({ message: "No 2FA setup in progress" });
    }

    const verified = speakeasy.totp.verify({
      secret,
      encoding: 'base32',
      token,
      window: 2
    });

    if (!verified) {
      return res.status(400).json({ message: "Invalid verification code" });
    }

    await storage.updateUser(req.session.userId!, {
      twoFactorSecret: secret,
      twoFactorEnabled: true
    });

    delete req.session.temp2FASecret;

    await storage.createActivityLog({
      action: "2FA enabled",
      userId: req.session.userId,
      userName: req.session.username,
      type: "success"
    });

    res.json({ message: "2FA enabled successfully" });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

// 2FA: Disable
router.post('/2fa/disable', requireAuth, async (req, res) => {
  try {
    const { token } = req.body;
    const user = await storage.getUser(req.session.userId!);

    if (!user?.twoFactorSecret) {
      return res.status(400).json({ message: "2FA not enabled" });
    }

    const verified = speakeasy.totp.verify({
      secret: user.twoFactorSecret,
      encoding: 'base32',
      token,
      window: 2
    });

    if (!verified) {
      return res.status(400).json({ message: "Invalid verification code" });
    }

    await storage.updateUser(req.session.userId!, {
      twoFactorSecret: null,
      twoFactorEnabled: false
    });

    await storage.createActivityLog({
      action: "2FA disabled",
      userId: req.session.userId,
      userName: req.session.username,
      type: "warning"
    });

    res.json({ message: "2FA disabled successfully" });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

// 2FA: Verify token during login (legacy)
router.post("/2fa/login", async (req, res) => {
  try {
    const { userId, token } = req.body;
    const user = await storage.getUser(userId);

    if (!user?.twoFactorSecret) {
      return res.status(400).json({ message: "2FA not enabled for this user" });
    }

    const verified = speakeasy.totp.verify({
      secret: user.twoFactorSecret,
      encoding: 'base32',
      token,
      window: 2
    });

    if (!verified) {
      return res.status(400).json({ message: "Invalid verification code" });
    }

    req.session.userId = user.id;
    req.session.username = user.username;
    req.session.role = user.role;

    const { password: _, twoFactorSecret: __, ...userWithoutSensitive } = user;
    res.json({ user: userWithoutSensitive });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

// 2FA: Verify during login flow (session-based)
router.post("/2fa/verify-login", async (req, res) => {
  try {
    const { code } = req.body;
    const clientIp = req.ip || req.socket.remoteAddress || 'unknown';
    const userAgent = req.get('User-Agent') || 'unknown';

    if (!req.session.pending2FA || !req.session.pendingUserId) {
      return res.status(400).json({ message: "No pending 2FA verification" });
    }

    const user = await storage.getUser(req.session.pendingUserId);
    if (!user || !user.twoFactorSecret) {
      return res.status(400).json({ message: "User not found or 2FA not enabled" });
    }

    const verified = speakeasy.totp.verify({
      secret: user.twoFactorSecret,
      encoding: 'base32',
      token: code,
      window: 2
    });

    if (!verified) {
      await storage.createSecurityLog({
        action: "Failed 2FA verification",
        userId: user.id,
        userName: user.username,
        ipAddress: clientIp,
        userAgent: userAgent,
        eventType: "two_factor_failed",
        blocked: false
      });
      return res.status(400).json({ message: "Invalid verification code" });
    }

    req.session.regenerate(async (err) => {
      if (err) {
        console.error('Session regeneration failed:', err);
        return res.status(500).json({ message: "Session error, please try again" });
      }

      req.session.userId = user.id;
      req.session.username = user.username;
      req.session.role = user.role;

      await storage.createSecurityLog({
        action: "Successful 2FA login",
        userId: user.id,
        userName: user.username,
        ipAddress: clientIp,
        userAgent: userAgent,
        eventType: "login",
        blocked: false
      });

      const { password: _, twoFactorSecret: __, ...userWithoutSensitive } = user;
      res.json({ user: userWithoutSensitive, message: "Login successful" });
    });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

// Login
router.post("/login", loginRateLimitMiddleware, async (req, res) => {
  try {
    const { username, password, captchaToken, captchaType } = req.body;
    const clientIp = req.ip || req.socket.remoteAddress || 'unknown';
    const userAgent = req.get('User-Agent') || 'unknown';

    if (!username || !password) {
      return res.status(400).json({ message: "Username and password required" });
    }

    const captchaResult = await verifyCaptcha(captchaToken, captchaType);
    if (!captchaResult.success) {
      recordFailedLogin(clientIp);
      await storage.createSecurityLog({
        action: `Failed login attempt - captcha failed`,
        userId: null,
        userName: username,
        ipAddress: clientIp,
        userAgent: userAgent,
        eventType: "login_failed",
        blocked: true
      });
      return res.status(400).json({ message: captchaResult.error || "Captcha verification failed" });
    }

    const user = await storage.getUserByUsernameOrEmail(username);
    if (!user) {
      recordFailedLogin(clientIp);
      await storage.createSecurityLog({
        action: `Failed login attempt - user not found`,
        userId: null,
        userName: username,
        ipAddress: clientIp,
        userAgent: userAgent,
        eventType: "login_failed",
        blocked: true
      });
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const isValid = await verifyPassword(password, user.password);
    if (!isValid) {
      recordFailedLogin(clientIp);
      await storage.createSecurityLog({
        action: `Failed login attempt - invalid password`,
        userId: user.id,
        userName: user.username,
        ipAddress: clientIp,
        userAgent: userAgent,
        eventType: "login_failed",
        blocked: true
      });
      return res.status(401).json({ message: "Invalid credentials" });
    }

    clearLoginAttempts(clientIp);

    if (user.twoFactorEnabled) {
      const webAuthnCredentials = await storage.getWebAuthnCredentialsByUser(user.id);
      const hasBiometric = webAuthnCredentials.length > 0;

      req.session.pending2FA = true;
      req.session.pendingUserId = user.id;
      return res.json({ 
        requires2FA: true,
        hasBiometric,
        message: "Please enter your 2FA code"
      });
    }

    const passwordExpirationSetting = await storage.getSecuritySetting('passwordExpiration');
    if (passwordExpirationSetting?.value === 'true' || passwordExpirationSetting?.value === true) {
      if (user.passwordUpdatedAt) {
        const passwordAge = Date.now() - new Date(user.passwordUpdatedAt).getTime();
        const maxAge = 90 * 24 * 60 * 60 * 1000;
        if (passwordAge > maxAge) {
          await storage.createSecurityLog({
            action: `Login blocked - password expired`,
            userId: user.id,
            userName: user.username,
            ipAddress: clientIp,
            userAgent: userAgent,
            eventType: "password_expired",
            blocked: true
          });
          return res.status(403).json({ 
            passwordExpired: true,
            userId: user.id,
            message: "Your password has expired. Please reset it to continue."
          });
        }
      } else {
        const now = new Date();
        const expiresAt = new Date(now.getTime() + 90 * 24 * 60 * 60 * 1000);
        await storage.updateUser(user.id, {
          passwordUpdatedAt: now,
          passwordExpiresAt: expiresAt
        });
      }
    }

    req.session.userId = user.id;
    req.session.username = user.username;
    req.session.role = user.role;

    const sessionExpiry = new Date();
    sessionExpiry.setHours(sessionExpiry.getHours() + 24);

    try {
      await storage.terminateSessionBySessionId(req.sessionID);
    } catch (e) {
    }

    await storage.createUserSession({
      sessionId: req.sessionID,
      userId: user.id,
      ipAddress: clientIp,
      userAgent: userAgent,
      deviceInfo: userAgent,
      location: 'Unknown',
      expiresAt: sessionExpiry
    });

    await storage.createActivityLog({
      action: `User ${user.name} logged in`,
      userId: user.id,
      userName: user.name,
      type: "success"
    });

    await storage.createSecurityLog({
      action: `Successful login`,
      userId: user.id,
      userName: user.username,
      ipAddress: clientIp,
      userAgent: userAgent,
      eventType: "login_success",
      blocked: false
    });

    const { password: _, ...userWithoutPassword } = user;
    res.json({ user: userWithoutPassword });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

// Logout
router.post("/logout", (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      return res.status(500).json({ message: "Could not log out" });
    }
    res.json({ message: "Logged out successfully" });
  });
});

// Get current user
router.get("/me", requireAuth, async (req, res) => {
  try {
    const user = await storage.getUser(req.session.userId!);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    const { password, ...userWithoutPassword } = user;
    res.json(userWithoutPassword);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

// Profile update
router.put("/profile", requireAuth, async (req, res) => {
  try {
    const userId = req.session.userId!;
    const { name, email, username, avatar } = req.body;

    const updateData: any = {};
    if (name !== undefined) updateData.name = name;
    if (email !== undefined) updateData.email = email;
    if (username !== undefined) updateData.username = username;
    if (avatar !== undefined) updateData.avatar = avatar;

    if (username) {
      const existingUser = await storage.getUserByUsername(username);
      if (existingUser && existingUser.id !== userId) {
        return res.status(400).json({ message: "Username already taken" });
      }
    }

    if (email) {
      const existingEmail = await storage.getUserByEmail(email);
      if (existingEmail && existingEmail.id !== userId) {
        return res.status(400).json({ message: "Email already taken" });
      }
    }

    const user = await storage.updateUser(userId, updateData);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    if (username) {
      req.session.username = username;
    }

    const { password, ...userWithoutPassword } = user;
    res.json(userWithoutPassword);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

// Force password reset for expired passwords
router.post("/force-password-reset", async (req, res) => {
  try {
    const { userId, currentPassword, newPassword } = req.body;

    if (!userId || !currentPassword || !newPassword) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const user = await storage.getUser(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const isValid = await verifyPassword(currentPassword, user.password);
    if (!isValid) {
      return res.status(401).json({ message: "Current password is incorrect" });
    }

    const hashedPassword = await hashPassword(newPassword);
    const now = new Date();
    const expiresAt = new Date(now.getTime() + 90 * 24 * 60 * 60 * 1000);

    await storage.updateUser(userId, { 
      password: hashedPassword,
      passwordUpdatedAt: now,
      passwordExpiresAt: expiresAt
    });

    await storage.createActivityLog({
      action: 'Forced password reset due to expiration',
      userId: user.id,
      userName: user.username,
      type: 'warning'
    });

    res.json({ message: "Password reset successfully. You can now login." });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

// Password change
router.put("/password", requireAuth, async (req, res) => {
  try {
    const userId = req.session.userId!;
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({ message: "Current password and new password are required" });
    }

    const user = await storage.getUser(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const isValid = await verifyPassword(currentPassword, user.password);
    if (!isValid) {
      return res.status(401).json({ message: "Current password is incorrect" });
    }

    const hashedPassword = await hashPassword(newPassword);
    const now = new Date();
    const expiresAt = new Date(now.getTime() + 90 * 24 * 60 * 60 * 1000);

    await storage.updateUser(userId, { 
      password: hashedPassword,
      passwordUpdatedAt: now,
      passwordExpiresAt: expiresAt
    });

    await storage.createActivityLog({
      action: 'Password changed successfully',
      userId: userId,
      userName: req.session.username || 'Unknown',
      type: 'success'
    });

    res.json({ message: "Password updated successfully" });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

// Register new user (admin only)
router.post("/register", requireAdmin, async (req, res) => {
  try {
    const parsed = insertUserSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ message: "Invalid data", errors: parsed.error.errors });
    }
    const existing = await storage.getUserByUsername(parsed.data.username);
    if (existing) {
      return res.status(400).json({ message: "Username already exists" });
    }
    const hashedPassword = await hashPassword(parsed.data.password);
    const user = await storage.createUser({
      ...parsed.data,
      password: hashedPassword
    });
    const { password: _, ...userWithoutPassword } = user;
    res.status(201).json({ user: userWithoutPassword });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

// WebAuthn: Generate registration options
router.get("/webauthn/register/options", requireAuth, async (req, res) => {
  try {
    const user = await storage.getUser(req.session.userId!);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const options = await generateRegistrationOptions({
      rpName,
      rpID,
      userID: new TextEncoder().encode(user.id.toString()),
      userName: user.email,
      attestationType: 'none',
      authenticatorSelection: {
        residentKey: 'preferred',
        userVerification: 'preferred',
      },
    });

    req.session.currentChallenge = options.challenge;

    res.json(options);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

// WebAuthn: Verify registration
router.post("/webauthn/register/verify", requireAuth, async (req, res) => {
  try {
    const { credential, deviceName } = req.body;
    const expectedChallenge = req.session.currentChallenge;

    if (!expectedChallenge) {
      return res.status(400).json({ message: "No challenge in session" });
    }

    const verification = await verifyRegistrationResponse({
      response: credential,
      expectedChallenge,
      expectedOrigin: origin,
      expectedRPID: rpID,
    });

    if (!verification.verified || !verification.registrationInfo) {
      return res.status(400).json({ message: "Verification failed" });
    }

    const { credential: webauthnCredential } = verification.registrationInfo;
    const credentialId = Buffer.from(webauthnCredential.id).toString('base64');
    const publicKey = Buffer.from(webauthnCredential.publicKey).toString('base64');
    const counter = webauthnCredential.counter;

    await storage.createWebAuthnCredential({
      userId: req.session.userId!,
      credentialId,
      publicKey,
      counter,
      deviceName: deviceName || 'Biometric Device'
    });

    delete req.session.currentChallenge;

    await storage.createActivityLog({
      action: `Biometric login registered: ${deviceName || 'Biometric Device'}`,
      userId: req.session.userId,
      userName: req.session.username,
      type: "success"
    });

    res.json({ verified: true });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

// WebAuthn: Generate authentication options
router.post("/webauthn/login/options", async (req, res) => {
  try {
    const { email } = req.body;

    if (!req.session.pending2FA || !req.session.pendingUserId) {
      return res.status(400).json({ message: "Please login with password first" });
    }

    const user = await storage.getUserByEmail(email);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    if (req.session.pendingUserId && req.session.pendingUserId !== user.id) {
      return res.status(400).json({ message: "Invalid session state" });
    }

    const credentials = await storage.getWebAuthnCredentialsByUser(user.id);

    if (credentials.length === 0) {
      return res.status(400).json({ message: "No biometric credentials registered" });
    }

    const options = await generateAuthenticationOptions({
      rpID,
      allowCredentials: credentials.map(cred => ({
        id: cred.credentialId,
      })),
      userVerification: 'preferred',
    });

    req.session.currentChallenge = options.challenge;
    req.session.tempUserId = user.id;

    res.json(options);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

// WebAuthn: Verify authentication
router.post("/webauthn/login/verify", async (req, res) => {
  try {
    const { credential } = req.body;
    const expectedChallenge = req.session.currentChallenge;
    const userId = req.session.tempUserId;

    if (!req.session.pending2FA || !req.session.pendingUserId) {
      return res.status(400).json({ message: "No pending 2FA verification" });
    }

    if (!expectedChallenge || !userId) {
      return res.status(400).json({ message: "Invalid session" });
    }

    if (userId !== req.session.pendingUserId) {
      return res.status(400).json({ message: "Invalid session state" });
    }

    const credentialId = Buffer.from(credential.id, 'base64url').toString('base64');
    const dbCredential = await storage.getWebAuthnCredentialById(credentialId);

    if (!dbCredential || dbCredential.userId !== userId) {
      return res.status(400).json({ message: "Credential not found" });
    }

    const verification = await verifyAuthenticationResponse({
      response: credential,
      expectedChallenge,
      expectedOrigin: origin,
      expectedRPID: rpID,
      credential: {
        id: dbCredential.credentialId,
        publicKey: new Uint8Array(Buffer.from(dbCredential.publicKey, 'base64')),
        counter: dbCredential.counter,
      },
    });

    if (!verification.verified) {
      return res.status(400).json({ message: "Authentication failed" });
    }

    await storage.updateWebAuthnCredentialCounter(
      dbCredential.id,
      verification.authenticationInfo.newCounter
    );

    const user = await storage.getUser(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    req.session.regenerate(async (err) => {
      if (err) {
        console.error('Session regeneration failed:', err);
        return res.status(500).json({ message: "Session error, please try again" });
      }

      req.session.userId = user.id;
      req.session.username = user.username;
      req.session.role = user.role;

      const { password: _, twoFactorSecret: __, ...userWithoutSensitive } = user;
      res.json({ user: userWithoutSensitive });
    });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

export default router;
