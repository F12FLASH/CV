import { AdminLayout } from "@/layouts/AdminLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/hooks/use-toast";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useState, useEffect } from "react";
import {
  Shield, Key, Lock, Smartphone, Globe, AlertTriangle, Trash2,
  ShieldAlert, RefreshCw, Eye, EyeOff, Clock, Users,
  Monitor, LogOut, Ban, CheckCircle, XCircle,
  Server, AlertCircle, Plus, Loader2, FileText, BarChart3,
  Zap, Activity, Layers, QrCode, Copy, Check, ShieldCheck,
  Fingerprint, Settings2, Radio, TrendingUp, Lock as LockIcon
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp";
import { EnhancedFirewall } from "@/components/admin/EnhancedFirewall";
import { ScrollArea } from "@/components/ui/scroll-area";

interface SecuritySettings {
  twoFactorEnabled?: boolean;
  passwordExpiration?: boolean;
  captchaType?: 'disabled' | 'local' | 'google' | 'cloudflare';
  captchaSettings?: {
    honeypotEnabled?: boolean;
    timeValidation?: boolean;
    ipRateLimit?: boolean;
    googleSiteKey?: string;
    googleSecretKey?: string;
    googleMinScore?: number;
    cloudflareSiteKey?: string;
    cloudflareSecretKey?: string;
    cloudflareManagedMode?: boolean;
  };
  protectionCoverage?: {
    loginForm?: boolean;
    contactForm?: boolean;
    newsletterForm?: boolean;
    commentForms?: boolean;
    registrationForm?: boolean;
  };
  rateLimiting?: {
    loginAttemptsLimit?: number;
    apiRateLimit?: number;
    lockoutDuration?: number;
  };
  ddosProtection?: {
    enabled?: boolean;
    threshold?: number;
    blockDuration?: number;
  };
  sqlInjectionProtection?: {
    enabled?: boolean;
    logAttempts?: boolean;
    blockRequests?: boolean;
  };
  xssProtection?: {
    enabled?: boolean;
    sanitizeInput?: boolean;
    blockRequests?: boolean;
  };
  sessionSettings?: {
    idleTimeout?: string;
    maxDuration?: string;
    forceLogoutInactive?: boolean;
    concurrentSessionLimit?: string;
  };
  compliance?: {
    gdprEnabled?: boolean;
    dataRetentionDays?: number;
    privacyPolicyUrl?: string;
    cookieConsentEnabled?: boolean;
  };
  cspSettings?: {
    enabled?: boolean;
    strictMode?: boolean;
    reportUri?: string;
  };
  scannerSettings?: {
    vulnerabilityScanEnabled?: boolean;
    sslScanEnabled?: boolean;
    malwareScanEnabled?: boolean;
    scanFrequency?: string;
  };
}

interface TrustedDevice {
  id: number;
  userId: number;
  deviceName: string;
  deviceFingerprint?: string;
  ipAddress?: string;
  userAgent?: string;
  trusted: boolean;
  lastUsed?: string;
  createdAt?: string;
}

interface UserSession {
  id: number;
  sessionId: string;
  userId: number;
  ipAddress?: string;
  userAgent?: string;
  deviceInfo?: string;
  location?: string;
  active: boolean;
  createdAt?: string;
  expiresAt?: string;
  lastActivity?: string;
}

interface IpRule {
  id: number;
  ipAddress: string;
  type: 'whitelist' | 'blacklist';
  reason?: string;
  createdBy?: number;
  createdAt?: string;
}

interface SecurityStats {
  totalBlocked: number;
  totalAllowed: number;
  byEventType: { type: string; count: number }[];
}

interface SecurityLog {
  id: number;
  eventType?: string;
  action: string;
  userId?: number;
  userName?: string;
  ipAddress?: string;
  userAgent?: string;
  type: string;
  blocked?: boolean;
  createdAt?: string;
}

const flattenSettings = (obj: Record<string, any>, prefix = ''): Record<string, any> => {
  const result: Record<string, any> = {};
  for (const [key, value] of Object.entries(obj)) {
    const newKey = prefix ? `${prefix}.${key}` : key;
    if (value && typeof value === 'object' && !Array.isArray(value)) {
      Object.assign(result, flattenSettings(value, newKey));
    } else {
      result[newKey] = value;
    }
  }
  return result;
};

export default function AdminSecurityEnhanced() {
  const { toast } = useToast();
  const [newWhitelistIp, setNewWhitelistIp] = useState("");
  const [newBlacklistIp, setNewBlacklistIp] = useState("");
  const [showGoogleSecret, setShowGoogleSecret] = useState(false);
  const [showCloudflareSecret, setShowCloudflareSecret] = useState(false);
  const [showLoginHistory, setShowLoginHistory] = useState(false);

  const [show2FASetup, setShow2FASetup] = useState(false);
  const [show2FAVerify, setShow2FAVerify] = useState(false);
  const [show2FADisable, setShow2FADisable] = useState(false);
  const [qrCode, setQrCode] = useState("");
  const [secret, setSecret] = useState("");
  const [verifyCode, setVerifyCode] = useState("");
  const [disableCode, setDisableCode] = useState("");
  const [secretCopied, setSecretCopied] = useState(false);

  const { data: settings = {}, isLoading: settingsLoading, refetch: refetchSettings } = useQuery<SecuritySettings>({
    queryKey: ['/api/security/settings'],
  });

  const { data: devices = [], refetch: refetchDevices } = useQuery<TrustedDevice[]>({
    queryKey: ['/api/security/devices'],
  });

  const { data: sessions = [], refetch: refetchSessions } = useQuery<UserSession[]>({
    queryKey: ['/api/security/sessions'],
    refetchInterval: 30000,
  });

  const { data: ipRules = [], refetch: refetchIpRules } = useQuery<IpRule[]>({
    queryKey: ['/api/security/ip-rules'],
  });

  const { data: stats } = useQuery<SecurityStats>({
    queryKey: ['/api/security/stats'],
  });

  const { data: loginHistory = [], refetch: refetchLoginHistory, isRefetching: isRefetchingLoginHistory } = useQuery<SecurityLog[]>({
    queryKey: ['/api/security/login-history'],
    refetchInterval: showLoginHistory ? 30000 : false,
  });

  const { data: user = null, refetch: refetchUser } = useQuery<any>({
    queryKey: ['/api/auth/me'],
  });

  const [localSettings, setLocalSettings] = useState<SecuritySettings>({});

  useEffect(() => {
    if (settings && Object.keys(settings).length > 0) {
      setLocalSettings(settings);
    }
  }, [settings]);

  const updateSettingsMutation = useMutation({
    mutationFn: async (newSettings: SecuritySettings) => {
      const flatSettings = flattenSettings(newSettings);
      return apiRequest('POST', '/api/security/settings/bulk', flatSettings);
    },
    onSuccess: () => {
      toast({ title: "Settings saved successfully" });
      refetchSettings();
    },
    onError: () => {
      toast({ title: "Failed to save settings", variant: "destructive" });
    }
  });

  const deleteDeviceMutation = useMutation({
    mutationFn: async (id: number) => {
      return apiRequest('DELETE', `/api/security/devices/${id}`);
    },
    onSuccess: () => {
      toast({ title: "Device removed" });
      refetchDevices();
    }
  });

  const terminateSessionMutation = useMutation({
    mutationFn: async (id: number) => {
      return apiRequest('POST', `/api/security/sessions/terminate/${id}`);
    },
    onSuccess: () => {
      toast({ title: "Session terminated" });
      refetchSessions();
    }
  });

  const terminateAllSessionsMutation = useMutation({
    mutationFn: async () => {
      return apiRequest('POST', '/api/security/sessions/terminate-all');
    },
    onSuccess: () => {
      toast({ title: "All sessions terminated" });
      refetchSessions();
    }
  });

  const logoutAllDevicesMutation = useMutation({
    mutationFn: async () => {
      return apiRequest('POST', '/api/security/sessions/logout-all-devices');
    },
    onSuccess: () => {
      toast({ title: "Logged out from all devices" });
      refetchSessions();
    }
  });

  const addIpRuleMutation = useMutation({
    mutationFn: async ({ ipAddress, type }: { ipAddress: string; type: 'whitelist' | 'blacklist' }) => {
      return apiRequest('POST', '/api/security/ip-rules', { ipAddress, type });
    },
    onSuccess: () => {
      toast({ title: "IP rule added" });
      setNewWhitelistIp("");
      setNewBlacklistIp("");
      refetchIpRules();
    }
  });

  const deleteIpRuleMutation = useMutation({
    mutationFn: async (id: number) => {
      return apiRequest('DELETE', `/api/security/ip-rules/${id}`);
    },
    onSuccess: () => {
      toast({ title: "IP rule removed" });
      refetchIpRules();
    }
  });

  const generate2FAMutation = useMutation({
    mutationFn: async () => {
      const res = await apiRequest('POST', '/api/auth/2fa/generate');
      return await res.json();
    },
    onSuccess: (data: any) => {
      if (data?.secret && data?.qrCode) {
        setSecret(data.secret);
        setQrCode(data.qrCode);
        setShow2FASetup(true);
      } else {
        toast({ title: "Failed to generate 2FA setup", description: "Missing secret or QR code", variant: "destructive" });
      }
    },
    onError: (error: any) => {
      toast({ title: "Failed to generate 2FA setup", description: error.message || "Unknown error", variant: "destructive" });
    }
  });

  const verify2FAMutation = useMutation({
    mutationFn: async (token: string) => {
      const res = await apiRequest('POST', '/api/auth/2fa/verify', { token });
      return await res.json();
    },
    onSuccess: () => {
      toast({ title: "2FA enabled successfully" });
      setShow2FASetup(false);
      setShow2FAVerify(false);
      setVerifyCode("");
      refetchUser();
      refetchSettings();
    },
    onError: () => {
      toast({ title: "Invalid verification code", variant: "destructive" });
    }
  });

  const disable2FAMutation = useMutation({
    mutationFn: async (token: string) => {
      const res = await apiRequest('POST', '/api/auth/2fa/disable', { token });
      return await res.json();
    },
    onSuccess: () => {
      toast({ title: "2FA disabled successfully" });
      setShow2FADisable(false);
      setDisableCode("");
      refetchUser();
      refetchSettings();
    },
    onError: () => {
      toast({ title: "Invalid verification code", variant: "destructive" });
    }
  });

  const updateLocalSetting = (key: string, value: any) => {
    setLocalSettings(prev => ({ ...prev, [key]: value }));
  };

  const updateNestedSetting = (parentKey: string, childKey: string, value: any) => {
    setLocalSettings(prev => ({
      ...prev,
      [parentKey]: {
        ...(prev[parentKey as keyof SecuritySettings] as Record<string, any> || {}),
        [childKey]: value
      }
    }));
  };

  const saveAuthSettings = () => {
    const authSettings = {
      passwordExpiration: localSettings.passwordExpiration
    };
    updateSettingsMutation.mutate(authSettings);
  };

  const saveCaptchaSettings = () => {
    const captchaSettings = {
      captchaType: localSettings.captchaType,
      captchaSettings: localSettings.captchaSettings,
      protectionCoverage: localSettings.protectionCoverage
    };
    updateSettingsMutation.mutate(captchaSettings);
  };

  const saveThreatSettings = () => {
    const threatSettings = {
      ddosProtection: localSettings.ddosProtection,
      sqlInjectionProtection: localSettings.sqlInjectionProtection,
      xssProtection: localSettings.xssProtection
    };
    updateSettingsMutation.mutate(threatSettings);
  };

  const saveSessionSettings = () => {
    const sessionSettings = {
      sessionSettings: localSettings.sessionSettings
    };
    updateSettingsMutation.mutate(sessionSettings);
  };

  const saveComplianceSettings = () => {
    const complianceSettings = {
      compliance: localSettings.compliance
    };
    updateSettingsMutation.mutate(complianceSettings);
  };

  const saveCSPSettings = () => {
    const cspSettings = {
      cspSettings: localSettings.cspSettings
    };
    updateSettingsMutation.mutate(cspSettings);
  };

  const saveScannerSettings = () => {
    const scannerSettings = {
      scannerSettings: localSettings.scannerSettings
    };
    updateSettingsMutation.mutate(scannerSettings);
  };

  const handle2FAToggle = (enabled: boolean) => {
    if (enabled) {
      if (user?.twoFactorEnabled) {
        toast({ title: "2FA is already enabled", variant: "default" });
        return;
      }
      generate2FAMutation.mutate(undefined);
    } else {
      if (!user?.twoFactorEnabled) {
        toast({ title: "2FA is not enabled", variant: "default" });
        return;
      }
      setShow2FADisable(true);
    }
  };

  const copySecret = async () => {
    try {
      await navigator.clipboard.writeText(secret);
      setSecretCopied(true);
      setTimeout(() => setSecretCopied(false), 2000);
      toast({ title: "Secret copied to clipboard" });
    } catch (err) {
      const textArea = document.createElement("textarea");
      textArea.value = secret;
      document.body.appendChild(textArea);
      textArea.select();
      try {
        document.execCommand('copy');
        setSecretCopied(true);
        setTimeout(() => setSecretCopied(false), 2000);
        toast({ title: "Secret copied to clipboard" });
      } catch (e) {
        toast({ title: "Failed to copy secret", variant: "destructive" });
      }
      document.body.removeChild(textArea);
    }
  };

  const whitelistIps = ipRules.filter(r => r.type === 'whitelist');
  const blacklistIps = ipRules.filter(r => r.type === 'blacklist');

  const securityScore = (() => {
    let score = 60;
    if (user?.twoFactorEnabled) score += 15;
    if (localSettings.ddosProtection?.enabled) score += 5;
    if (localSettings.sqlInjectionProtection?.enabled) score += 5;
    if (localSettings.xssProtection?.enabled) score += 5;
    if (localSettings.captchaType && localSettings.captchaType !== 'disabled') score += 5;
    if (localSettings.compliance?.gdprEnabled) score += 5;
    return Math.min(score, 100);
  })();

  const getScoreColor = (score: number) => {
    if (score >= 80) return "text-green-500";
    if (score >= 60) return "text-yellow-500";
    return "text-red-500";
  };

  const getScoreBg = (score: number) => {
    if (score >= 80) return "bg-green-500";
    if (score >= 60) return "bg-yellow-500";
    return "bg-red-500";
  };

  if (settingsLoading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <Loader2 className="w-10 h-10 animate-spin text-primary mx-auto mb-4" />
            <p className="text-muted-foreground">Loading security settings...</p>
          </div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-heading font-bold flex items-center gap-3" data-testid="text-security-title">
              <Shield className="w-8 h-8 text-primary" />
              Security Center
            </h1>
            <p className="text-muted-foreground mt-1">Monitor threats, manage access, and configure security policies</p>
          </div>
          <div className="flex items-center gap-3">
            <Button variant="outline" onClick={() => refetchSettings()} data-testid="button-refresh-security">
              <RefreshCw className="w-4 h-4 mr-2" />
              Refresh
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
          <Card className="lg:col-span-1 bg-gradient-to-br from-primary/10 via-primary/5 to-transparent border-primary/20">
            <CardContent className="p-6">
              <div className="flex flex-col items-center text-center">
                <div className="relative mb-4">
                  <svg className="w-24 h-24 transform -rotate-90">
                    <circle cx="48" cy="48" r="40" stroke="currentColor" strokeWidth="8" fill="none" className="text-muted/20" />
                    <circle cx="48" cy="48" r="40" stroke="currentColor" strokeWidth="8" fill="none" 
                      className={getScoreBg(securityScore)}
                      strokeDasharray={`${(securityScore / 100) * 251.2} 251.2`}
                      strokeLinecap="round"
                    />
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className={`text-2xl font-bold ${getScoreColor(securityScore)}`}>{securityScore}</span>
                  </div>
                </div>
                <h3 className="font-semibold text-lg">Security Score</h3>
                <p className="text-sm text-muted-foreground mt-1">
                  {securityScore >= 80 ? "Excellent protection" : securityScore >= 60 ? "Good, can improve" : "Needs attention"}
                </p>
              </div>
            </CardContent>
          </Card>

          <div className="lg:col-span-3 grid grid-cols-2 md:grid-cols-4 gap-4">
            <Card className="border-green-500/30 bg-green-500/5">
              <CardContent className="p-4">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">System Status</p>
                    <p className="text-xl font-bold text-green-500">Secure</p>
                  </div>
                  <div className="p-2 rounded-lg bg-green-500/10">
                    <ShieldCheck className="w-5 h-5 text-green-500" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">SSL Certificate</p>
                    <p className="text-xl font-bold">Valid</p>
                    <p className="text-xs text-muted-foreground">Dec 2025</p>
                  </div>
                  <div className="p-2 rounded-lg bg-primary/10">
                    <LockIcon className="w-5 h-5 text-primary" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-yellow-500/30 bg-yellow-500/5">
              <CardContent className="p-4">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">Blocked (24h)</p>
                    <p className="text-xl font-bold text-yellow-600">{stats?.totalBlocked || 0}</p>
                    <p className="text-xs text-muted-foreground">attempts</p>
                  </div>
                  <div className="p-2 rounded-lg bg-yellow-500/10">
                    <AlertTriangle className="w-5 h-5 text-yellow-500" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">Active Sessions</p>
                    <p className="text-xl font-bold">{sessions.length}</p>
                    <p className="text-xs text-muted-foreground">devices</p>
                  </div>
                  <div className="p-2 rounded-lg bg-blue-500/10">
                    <Smartphone className="w-5 h-5 text-blue-500" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        <Tabs defaultValue="authentication" className="space-y-6">
          <div className="bg-card border rounded-lg p-1.5">
            <TabsList className="flex flex-wrap gap-1 bg-transparent h-auto p-0">
              <TabsTrigger value="authentication" className="gap-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground" data-testid="tab-authentication">
                <Key className="w-4 h-4" /> Authentication
              </TabsTrigger>
              <TabsTrigger value="recaptcha" className="gap-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground" data-testid="tab-recaptcha">
                <Radio className="w-4 h-4" /> Bot Protection
              </TabsTrigger>
              <TabsTrigger value="firewall" className="gap-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground" data-testid="tab-firewall">
                <Shield className="w-4 h-4" /> Firewall
              </TabsTrigger>
              <TabsTrigger value="threat" className="gap-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground" data-testid="tab-threat">
                <ShieldAlert className="w-4 h-4" /> Threats
              </TabsTrigger>
              <TabsTrigger value="sessions" className="gap-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground" data-testid="tab-sessions">
                <Users className="w-4 h-4" /> Sessions
              </TabsTrigger>
              <TabsTrigger value="compliance" className="gap-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground" data-testid="tab-compliance">
                <FileText className="w-4 h-4" /> Compliance
              </TabsTrigger>
              <TabsTrigger value="advanced" className="gap-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground" data-testid="tab-advanced">
                <Settings2 className="w-4 h-4" /> Advanced
              </TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="authentication" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <Fingerprint className="w-5 h-5 text-primary" />
                    Authentication Methods
                  </CardTitle>
                  <CardDescription>Configure how users authenticate</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className={`flex items-center justify-between p-4 rounded-xl border transition-all ${user?.twoFactorEnabled ? 'bg-green-500/5 border-green-500/30' : 'bg-muted/30'}`}>
                    <div className="flex items-center gap-3">
                      <div className={`p-2 rounded-lg ${user?.twoFactorEnabled ? 'bg-green-500/10' : 'bg-muted'}`}>
                        <Smartphone className={`w-5 h-5 ${user?.twoFactorEnabled ? 'text-green-500' : 'text-muted-foreground'}`} />
                      </div>
                      <div>
                        <div className="font-medium flex items-center gap-2">
                          Two-Factor Authentication
                          {user?.twoFactorEnabled && <Badge variant="outline" className="bg-green-500/10 text-green-600 border-green-500/30 text-xs">Active</Badge>}
                        </div>
                        <div className="text-sm text-muted-foreground">Secure with authenticator app</div>
                      </div>
                    </div>
                    <Switch
                      checked={user?.twoFactorEnabled || settings.twoFactorEnabled || false}
                      onCheckedChange={handle2FAToggle}
                      disabled={generate2FAMutation.isPending}
                      data-testid="switch-2fa"
                    />
                  </div>

                  <div className={`flex items-center justify-between p-4 rounded-xl border transition-all ${localSettings.passwordExpiration ? 'bg-blue-500/5 border-blue-500/30' : 'bg-muted/30'}`}>
                    <div className="flex items-center gap-3">
                      <div className={`p-2 rounded-lg ${localSettings.passwordExpiration ? 'bg-blue-500/10' : 'bg-muted'}`}>
                        <Clock className={`w-5 h-5 ${localSettings.passwordExpiration ? 'text-blue-500' : 'text-muted-foreground'}`} />
                      </div>
                      <div>
                        <div className="font-medium">Password Expiration</div>
                        <div className="text-sm text-muted-foreground">Force reset every 90 days</div>
                      </div>
                    </div>
                    <Switch
                      checked={localSettings.passwordExpiration ?? false}
                      onCheckedChange={(v) => updateLocalSetting('passwordExpiration', v)}
                      data-testid="switch-password-expiration"
                    />
                  </div>

                  <Button onClick={saveAuthSettings} disabled={updateSettingsMutation.isPending} className="w-full" data-testid="button-save-auth">
                    {updateSettingsMutation.isPending && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                    Save Authentication Settings
                  </Button>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <Monitor className="w-5 h-5 text-primary" />
                    Trusted Devices
                  </CardTitle>
                  <CardDescription>Devices that can skip 2FA verification</CardDescription>
                </CardHeader>
                <CardContent>
                  <ScrollArea className="h-[200px]">
                    {devices.length === 0 ? (
                      <div className="flex flex-col items-center justify-center h-full text-center py-8">
                        <Monitor className="w-10 h-10 text-muted-foreground/30 mb-3" />
                        <p className="text-sm text-muted-foreground">No trusted devices registered</p>
                      </div>
                    ) : (
                      <div className="space-y-2">
                        {devices.map((device) => (
                          <div key={device.id} className="flex items-center justify-between p-3 rounded-lg border hover:bg-muted/50 transition-colors">
                            <div className="flex items-center gap-3">
                              <div className="p-2 rounded-lg bg-muted">
                                <Monitor className="w-4 h-4" />
                              </div>
                              <div>
                                <p className="font-medium text-sm">{device.deviceName}</p>
                                <p className="text-xs text-muted-foreground">{device.ipAddress} • {device.lastUsed ? new Date(device.lastUsed).toLocaleDateString() : 'Never'}</p>
                              </div>
                            </div>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="text-destructive"
                              onClick={() => deleteDeviceMutation.mutate(device.id)}
                              data-testid={`button-remove-device-${device.id}`}
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        ))}
                      </div>
                    )}
                  </ScrollArea>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="flex items-center gap-2 text-lg">
                      <Clock className="w-5 h-5 text-primary" />
                      Login History
                    </CardTitle>
                    <CardDescription>Recent authentication attempts</CardDescription>
                  </div>
                  <Button variant="outline" size="sm" onClick={() => { setShowLoginHistory(!showLoginHistory); refetchLoginHistory(); }} data-testid="button-toggle-login-history">
                    {isRefetchingLoginHistory ? <Loader2 className="w-4 h-4 animate-spin" /> : <Eye className="w-4 h-4" />}
                    <span className="ml-2">{showLoginHistory ? 'Hide' : 'Show'}</span>
                  </Button>
                </div>
              </CardHeader>
              {showLoginHistory && (
                <CardContent>
                  <ScrollArea className="h-[300px]">
                    {loginHistory.length === 0 ? (
                      <div className="text-center py-8 text-muted-foreground">
                        <Clock className="w-10 h-10 mx-auto mb-3 opacity-30" />
                        <p>No login history available</p>
                      </div>
                    ) : (
                      <div className="space-y-2">
                        {loginHistory.slice(0, 20).map((log) => (
                          <div key={log.id} className={`flex items-center justify-between p-3 rounded-lg border ${log.blocked ? 'border-red-500/30 bg-red-500/5' : 'border-green-500/30 bg-green-500/5'}`}>
                            <div className="flex items-center gap-3">
                              {log.blocked ? (
                                <XCircle className="w-5 h-5 text-red-500" />
                              ) : (
                                <CheckCircle className="w-5 h-5 text-green-500" />
                              )}
                              <div>
                                <p className="font-medium text-sm">{log.userName || 'Unknown'}</p>
                                <p className="text-xs text-muted-foreground">{log.ipAddress} • {log.eventType}</p>
                              </div>
                            </div>
                            <span className="text-xs text-muted-foreground">
                              {log.createdAt ? new Date(log.createdAt).toLocaleString() : ''}
                            </span>
                          </div>
                        ))}
                      </div>
                    )}
                  </ScrollArea>
                </CardContent>
              )}
            </Card>
          </TabsContent>

          <TabsContent value="recaptcha" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-lg">
                      <Radio className="w-5 h-5 text-primary" />
                      Bot Protection Method
                    </CardTitle>
                    <CardDescription>Choose how to protect forms from automated submissions</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {[
                        { value: 'disabled', label: 'Disabled', desc: 'No bot protection', icon: XCircle, color: 'text-red-500' },
                        { value: 'local', label: 'Local Protection', desc: 'Honeypot + rate limiting', icon: Shield, color: 'text-blue-500' },
                        { value: 'google', label: 'Google reCAPTCHA', desc: 'Invisible v3 protection', icon: Globe, color: 'text-green-500' },
                        { value: 'cloudflare', label: 'Cloudflare Turnstile', desc: 'Privacy-focused CAPTCHA', icon: Zap, color: 'text-orange-500' },
                      ].map((option) => (
                        <label
                          key={option.value}
                          data-testid={`radio-captcha-${option.value}`}
                          className={`flex items-start gap-3 p-4 rounded-xl border cursor-pointer transition-all ${
                            localSettings.captchaType === option.value 
                              ? 'border-primary bg-primary/5 ring-2 ring-primary/20' 
                              : 'hover:bg-muted/50'
                          }`}
                        >
                          <input
                            type="radio"
                            name="captchaType"
                            value={option.value}
                            checked={localSettings.captchaType === option.value}
                            onChange={(e) => updateLocalSetting('captchaType', e.target.value)}
                            className="sr-only"
                          />
                          <div className={`p-2 rounded-lg bg-muted`}>
                            <option.icon className={`w-5 h-5 ${option.color}`} />
                          </div>
                          <div>
                            <div className="font-medium">{option.label}</div>
                            <div className="text-xs text-muted-foreground">{option.desc}</div>
                          </div>
                        </label>
                      ))}
                    </div>

                    {localSettings.captchaType === 'google' && (
                      <div className="space-y-3 p-4 rounded-lg bg-muted/50 mt-4">
                        <div>
                          <Label>Google Site Key</Label>
                          <Input
                            value={localSettings.captchaSettings?.googleSiteKey || ''}
                            onChange={(e) => updateNestedSetting('captchaSettings', 'googleSiteKey', e.target.value)}
                            placeholder="6L..."
                            className="mt-1"
                            data-testid="input-google-site-key"
                          />
                        </div>
                        <div>
                          <Label>Google Secret Key</Label>
                          <div className="relative mt-1">
                            <Input
                              type={showGoogleSecret ? 'text' : 'password'}
                              value={localSettings.captchaSettings?.googleSecretKey || ''}
                              onChange={(e) => updateNestedSetting('captchaSettings', 'googleSecretKey', e.target.value)}
                              placeholder="6L..."
                              data-testid="input-google-secret-key"
                            />
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon"
                              className="absolute right-0 top-0"
                              onClick={() => setShowGoogleSecret(!showGoogleSecret)}
                              data-testid="button-toggle-google-secret"
                            >
                              {showGoogleSecret ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                            </Button>
                          </div>
                        </div>
                      </div>
                    )}

                    {localSettings.captchaType === 'cloudflare' && (
                      <div className="space-y-3 p-4 rounded-lg bg-muted/50 mt-4">
                        <div>
                          <Label>Cloudflare Site Key</Label>
                          <Input
                            value={localSettings.captchaSettings?.cloudflareSiteKey || ''}
                            onChange={(e) => updateNestedSetting('captchaSettings', 'cloudflareSiteKey', e.target.value)}
                            placeholder="0x..."
                            className="mt-1"
                            data-testid="input-cloudflare-site-key"
                          />
                        </div>
                        <div>
                          <Label>Cloudflare Secret Key</Label>
                          <div className="relative mt-1">
                            <Input
                              type={showCloudflareSecret ? 'text' : 'password'}
                              value={localSettings.captchaSettings?.cloudflareSecretKey || ''}
                              onChange={(e) => updateNestedSetting('captchaSettings', 'cloudflareSecretKey', e.target.value)}
                              placeholder="0x..."
                              data-testid="input-cloudflare-secret-key"
                            />
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon"
                              className="absolute right-0 top-0"
                              onClick={() => setShowCloudflareSecret(!showCloudflareSecret)}
                              data-testid="button-toggle-cloudflare-secret"
                            >
                              {showCloudflareSecret ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                            </Button>
                          </div>
                        </div>
                      </div>
                    )}

                    <Button onClick={saveCaptchaSettings} disabled={updateSettingsMutation.isPending} className="w-full mt-4" data-testid="button-save-captcha">
                      {updateSettingsMutation.isPending && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                      Save Bot Protection Settings
                    </Button>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-lg">
                      <Layers className="w-5 h-5 text-primary" />
                      Protection Coverage
                    </CardTitle>
                    <CardDescription>Choose which forms to protect</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {[
                        { key: 'loginForm', label: 'Login Form', desc: 'Admin login page' },
                        { key: 'contactForm', label: 'Contact Form', desc: 'Public contact form' },
                        { key: 'newsletterForm', label: 'Newsletter', desc: 'Email subscription' },
                        { key: 'commentForms', label: 'Comments', desc: 'Blog comments' },
                        { key: 'registrationForm', label: 'Registration', desc: 'User signup' },
                      ].map((form) => (
                        <div key={form.key} className="flex items-center justify-between p-3 rounded-lg border">
                          <div>
                            <p className="font-medium text-sm">{form.label}</p>
                            <p className="text-xs text-muted-foreground">{form.desc}</p>
                          </div>
                          <Switch
                            checked={(localSettings.protectionCoverage as any)?.[form.key] ?? true}
                            onCheckedChange={(v) => updateNestedSetting('protectionCoverage', form.key, v)}
                            data-testid={`switch-protect-${form.key}`}
                          />
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>

              <div className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-lg">
                      <BarChart3 className="w-5 h-5 text-primary" />
                      Bot Detection Stats
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-3">
                      <div className="p-4 rounded-xl bg-green-500/10 border border-green-500/20 text-center">
                        <p className="text-3xl font-bold text-green-500">{stats?.totalAllowed || 0}</p>
                        <p className="text-xs text-muted-foreground mt-1">Legitimate</p>
                      </div>
                      <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-center">
                        <p className="text-3xl font-bold text-red-500">{stats?.totalBlocked || 0}</p>
                        <p className="text-xs text-muted-foreground mt-1">Blocked Bots</p>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Protection Rate</span>
                        <span className="font-medium">
                          {stats && stats.totalBlocked + stats.totalAllowed > 0
                            ? ((stats.totalAllowed / (stats.totalBlocked + stats.totalAllowed)) * 100).toFixed(1)
                            : 100}%
                        </span>
                      </div>
                      <Progress 
                        value={stats && stats.totalBlocked + stats.totalAllowed > 0 
                          ? (stats.totalAllowed / (stats.totalBlocked + stats.totalAllowed)) * 100 
                          : 100} 
                        className="h-2"
                      />
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="firewall" className="space-y-4">
            <EnhancedFirewall />
          </TabsContent>

          <TabsContent value="threat" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <Zap className="w-5 h-5 text-yellow-500" />
                    DDoS Protection
                  </CardTitle>
                  <CardDescription>Mitigate denial-of-service attacks</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className={`flex items-center justify-between p-3 rounded-lg border ${localSettings.ddosProtection?.enabled ? 'bg-green-500/5 border-green-500/30' : ''}`}>
                    <span className="font-medium text-sm">Enable Protection</span>
                    <Switch
                      checked={localSettings.ddosProtection?.enabled ?? true}
                      onCheckedChange={(v) => updateNestedSetting('ddosProtection', 'enabled', v)}
                      data-testid="switch-ddos-protection"
                    />
                  </div>
                  {localSettings.ddosProtection?.enabled !== false && (
                    <>
                      <div>
                        <Label className="text-xs">Request Threshold (per min)</Label>
                        <Input
                          value={localSettings.ddosProtection?.threshold ?? 100}
                          onChange={(e) => updateNestedSetting('ddosProtection', 'threshold', parseInt(e.target.value) || 100)}
                          type="number"
                          className="mt-1"
                        />
                      </div>
                      <div>
                        <Label className="text-xs">Block Duration (min)</Label>
                        <Input
                          value={localSettings.ddosProtection?.blockDuration ?? 30}
                          onChange={(e) => updateNestedSetting('ddosProtection', 'blockDuration', parseInt(e.target.value) || 30)}
                          type="number"
                          className="mt-1"
                        />
                      </div>
                    </>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <AlertTriangle className="w-5 h-5 text-orange-500" />
                    SQL Injection
                  </CardTitle>
                  <CardDescription>Block malicious SQL queries</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className={`flex items-center justify-between p-3 rounded-lg border ${localSettings.sqlInjectionProtection?.enabled ? 'bg-green-500/5 border-green-500/30' : ''}`}>
                    <span className="font-medium text-sm">Enable Detection</span>
                    <Switch
                      checked={localSettings.sqlInjectionProtection?.enabled ?? true}
                      onCheckedChange={(v) => updateNestedSetting('sqlInjectionProtection', 'enabled', v)}
                      data-testid="switch-sql-injection"
                    />
                  </div>
                  {localSettings.sqlInjectionProtection?.enabled !== false && (
                    <>
                      <div className="flex items-center justify-between">
                        <span className="text-sm">Log Attempts</span>
                        <Switch
                          checked={localSettings.sqlInjectionProtection?.logAttempts ?? true}
                          onCheckedChange={(v) => updateNestedSetting('sqlInjectionProtection', 'logAttempts', v)}
                        />
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm">Block Requests</span>
                        <Switch
                          checked={localSettings.sqlInjectionProtection?.blockRequests ?? true}
                          onCheckedChange={(v) => updateNestedSetting('sqlInjectionProtection', 'blockRequests', v)}
                        />
                      </div>
                    </>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <Shield className="w-5 h-5 text-red-500" />
                    XSS Protection
                  </CardTitle>
                  <CardDescription>Prevent cross-site scripting</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className={`flex items-center justify-between p-3 rounded-lg border ${localSettings.xssProtection?.enabled ? 'bg-green-500/5 border-green-500/30' : ''}`}>
                    <span className="font-medium text-sm">Enable Protection</span>
                    <Switch
                      checked={localSettings.xssProtection?.enabled ?? true}
                      onCheckedChange={(v) => updateNestedSetting('xssProtection', 'enabled', v)}
                      data-testid="switch-xss-protection"
                    />
                  </div>
                  {localSettings.xssProtection?.enabled !== false && (
                    <>
                      <div className="flex items-center justify-between">
                        <span className="text-sm">Sanitize Input</span>
                        <Switch
                          checked={localSettings.xssProtection?.sanitizeInput ?? true}
                          onCheckedChange={(v) => updateNestedSetting('xssProtection', 'sanitizeInput', v)}
                        />
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm">Block Requests</span>
                        <Switch
                          checked={localSettings.xssProtection?.blockRequests ?? true}
                          onCheckedChange={(v) => updateNestedSetting('xssProtection', 'blockRequests', v)}
                        />
                      </div>
                    </>
                  )}
                </CardContent>
              </Card>
            </div>
            <Button onClick={saveThreatSettings} disabled={updateSettingsMutation.isPending} data-testid="button-save-threat">
              {updateSettingsMutation.isPending && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              Save Threat Protection Settings
            </Button>
          </TabsContent>

          <TabsContent value="sessions" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="flex items-center gap-2 text-lg">
                        <Users className="w-5 h-5 text-primary" />
                        Active Sessions
                      </CardTitle>
                      <CardDescription>{sessions.length} active session(s)</CardDescription>
                    </div>
                    <Badge variant="outline" className="bg-green-500/10 text-green-600 border-green-500/30">
                      <div className="w-2 h-2 rounded-full bg-green-500 mr-2 animate-pulse" />
                      Live
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <ScrollArea className="h-[300px]">
                    {sessions.length === 0 ? (
                      <div className="flex flex-col items-center justify-center h-full py-8">
                        <Users className="w-10 h-10 text-muted-foreground/30 mb-3" />
                        <p className="text-sm text-muted-foreground">No active sessions</p>
                      </div>
                    ) : (
                      <div className="space-y-2">
                        {sessions.map((session) => (
                          <div key={session.id} className="flex items-center justify-between p-3 rounded-lg border hover:bg-muted/50 transition-colors">
                            <div className="flex items-center gap-3">
                              <div className="relative">
                                <div className="p-2 rounded-lg bg-muted">
                                  <Monitor className="w-4 h-4" />
                                </div>
                                <div className="absolute -top-1 -right-1 w-3 h-3 rounded-full bg-green-500 border-2 border-background" />
                              </div>
                              <div>
                                <p className="font-medium text-sm">{session.deviceInfo || 'Unknown Device'}</p>
                                <p className="text-xs text-muted-foreground">
                                  {session.ipAddress || 'Unknown IP'} • {session.location || 'Unknown'}
                                </p>
                              </div>
                            </div>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => terminateSessionMutation.mutate(session.id)}
                              disabled={terminateSessionMutation.isPending}
                              data-testid={`button-terminate-session-${session.id}`}
                            >
                              <LogOut className="w-4 h-4" />
                            </Button>
                          </div>
                        ))}
                      </div>
                    )}
                  </ScrollArea>

                  <div className="flex gap-2 mt-4 pt-4 border-t">
                    <Button
                      variant="outline"
                      className="flex-1"
                      onClick={() => logoutAllDevicesMutation.mutate()}
                      disabled={logoutAllDevicesMutation.isPending}
                      data-testid="button-logout-all-devices"
                    >
                      {logoutAllDevicesMutation.isPending && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                      Logout All
                    </Button>
                    <Button
                      variant="destructive"
                      className="flex-1"
                      onClick={() => terminateAllSessionsMutation.mutate()}
                      disabled={terminateAllSessionsMutation.isPending}
                      data-testid="button-force-logout-all"
                    >
                      {terminateAllSessionsMutation.isPending && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                      Force Terminate
                    </Button>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <Clock className="w-5 h-5 text-primary" />
                    Session Policies
                  </CardTitle>
                  <CardDescription>Configure session timeouts and limits</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label className="text-xs">Idle Timeout</Label>
                      <select
                        className="w-full p-2 rounded-md border border-input bg-background text-sm"
                        value={localSettings.sessionSettings?.idleTimeout || '30 minutes'}
                        onChange={(e) => updateNestedSetting('sessionSettings', 'idleTimeout', e.target.value)}
                        data-testid="select-idle-timeout"
                      >
                        <option value="15 minutes">15 minutes</option>
                        <option value="30 minutes">30 minutes</option>
                        <option value="1 hour">1 hour</option>
                        <option value="4 hours">4 hours</option>
                        <option value="Never">Never</option>
                      </select>
                    </div>
                    <div className="space-y-2">
                      <Label className="text-xs">Max Duration</Label>
                      <select
                        className="w-full p-2 rounded-md border border-input bg-background text-sm"
                        value={localSettings.sessionSettings?.maxDuration || '24 hours'}
                        onChange={(e) => updateNestedSetting('sessionSettings', 'maxDuration', e.target.value)}
                        data-testid="select-max-duration"
                      >
                        <option value="8 hours">8 hours</option>
                        <option value="24 hours">24 hours</option>
                        <option value="7 days">7 days</option>
                        <option value="30 days">30 days</option>
                      </select>
                    </div>
                  </div>

                  <div className="flex items-center justify-between p-3 rounded-lg border">
                    <div>
                      <p className="font-medium text-sm">Force Logout Inactive</p>
                      <p className="text-xs text-muted-foreground">Auto-logout after idle timeout</p>
                    </div>
                    <Switch
                      checked={localSettings.sessionSettings?.forceLogoutInactive ?? true}
                      onCheckedChange={(v) => updateNestedSetting('sessionSettings', 'forceLogoutInactive', v)}
                      data-testid="switch-force-logout-inactive"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label className="text-xs">Concurrent Sessions</Label>
                    <select
                      className="w-full p-2 rounded-md border border-input bg-background text-sm"
                      value={localSettings.sessionSettings?.concurrentSessionLimit || 'Unlimited'}
                      onChange={(e) => updateNestedSetting('sessionSettings', 'concurrentSessionLimit', e.target.value)}
                      data-testid="select-concurrent-sessions"
                    >
                      <option value="Unlimited">Unlimited</option>
                      <option value="1 session per user">1 session</option>
                      <option value="3 sessions per user">3 sessions</option>
                      <option value="5 sessions per user">5 sessions</option>
                    </select>
                  </div>

                  <Button onClick={saveSessionSettings} disabled={updateSettingsMutation.isPending} className="w-full" data-testid="button-save-session-policies">
                    {updateSettingsMutation.isPending && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                    Save Session Policies
                  </Button>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="compliance" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <FileText className="w-5 h-5 text-primary" />
                    GDPR Compliance
                  </CardTitle>
                  <CardDescription>Data protection and privacy regulations</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className={`flex items-center justify-between p-3 rounded-lg border ${localSettings.compliance?.gdprEnabled ? 'bg-green-500/5 border-green-500/30' : ''}`}>
                    <div>
                      <p className="font-medium text-sm">GDPR Mode</p>
                      <p className="text-xs text-muted-foreground">Enable compliance features</p>
                    </div>
                    <Switch
                      checked={localSettings.compliance?.gdprEnabled ?? true}
                      onCheckedChange={(v) => updateNestedSetting('compliance', 'gdprEnabled', v)}
                      data-testid="switch-gdpr"
                    />
                  </div>

                  <div>
                    <Label className="text-xs">Data Retention (days)</Label>
                    <Input
                      value={localSettings.compliance?.dataRetentionDays ?? 365}
                      onChange={(e) => updateNestedSetting('compliance', 'dataRetentionDays', parseInt(e.target.value) || 365)}
                      type="number"
                      className="mt-1"
                      data-testid="input-retention-days"
                    />
                    <p className="text-xs text-muted-foreground mt-1">Auto-delete data after this period</p>
                  </div>

                  <div>
                    <Label className="text-xs">Privacy Policy URL</Label>
                    <Input
                      value={localSettings.compliance?.privacyPolicyUrl || ''}
                      onChange={(e) => updateNestedSetting('compliance', 'privacyPolicyUrl', e.target.value)}
                      placeholder="https://example.com/privacy"
                      className="mt-1"
                      data-testid="input-privacy-url"
                    />
                  </div>

                  <div className="flex items-center justify-between p-3 rounded-lg border">
                    <div>
                      <p className="font-medium text-sm">Cookie Consent</p>
                      <p className="text-xs text-muted-foreground">Require explicit consent</p>
                    </div>
                    <Switch
                      checked={localSettings.compliance?.cookieConsentEnabled ?? true}
                      onCheckedChange={(v) => updateNestedSetting('compliance', 'cookieConsentEnabled', v)}
                      data-testid="switch-cookie-consent"
                    />
                  </div>

                  <Button onClick={saveComplianceSettings} disabled={updateSettingsMutation.isPending} className="w-full" data-testid="button-save-compliance">
                    {updateSettingsMutation.isPending && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                    Save Compliance Settings
                  </Button>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <Layers className="w-5 h-5 text-primary" />
                    Content Security Policy
                  </CardTitle>
                  <CardDescription>Control allowed content sources</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className={`flex items-center justify-between p-3 rounded-lg border ${localSettings.cspSettings?.enabled ? 'bg-green-500/5 border-green-500/30' : ''}`}>
                    <div>
                      <p className="font-medium text-sm">Enable CSP</p>
                      <p className="text-xs text-muted-foreground">Add security headers</p>
                    </div>
                    <Switch
                      checked={localSettings.cspSettings?.enabled ?? false}
                      onCheckedChange={(v) => updateNestedSetting('cspSettings', 'enabled', v)}
                      data-testid="switch-csp"
                    />
                  </div>

                  {localSettings.cspSettings?.enabled && (
                    <>
                      <div className="flex items-center justify-between p-3 rounded-lg border">
                        <div>
                          <p className="font-medium text-sm">Strict Mode</p>
                          <p className="text-xs text-muted-foreground">Maximum security restrictions</p>
                        </div>
                        <Switch
                          checked={localSettings.cspSettings?.strictMode ?? false}
                          onCheckedChange={(v) => updateNestedSetting('cspSettings', 'strictMode', v)}
                        />
                      </div>

                      <div>
                        <Label className="text-xs">Report URI</Label>
                        <Input
                          value={localSettings.cspSettings?.reportUri || ''}
                          onChange={(e) => updateNestedSetting('cspSettings', 'reportUri', e.target.value)}
                          placeholder="https://example.com/csp-report"
                          className="mt-1"
                        />
                      </div>
                    </>
                  )}

                  <Button onClick={saveCSPSettings} disabled={updateSettingsMutation.isPending} className="w-full">
                    {updateSettingsMutation.isPending && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                    Save CSP Settings
                  </Button>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="advanced" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Activity className="w-5 h-5 text-primary" />
                  Security Scanner
                </CardTitle>
                <CardDescription>Automated vulnerability scanning</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className={`flex items-center justify-between p-4 rounded-xl border ${localSettings.scannerSettings?.vulnerabilityScanEnabled ? 'bg-green-500/5 border-green-500/30' : ''}`}>
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-lg bg-muted">
                        <Shield className="w-5 h-5 text-blue-500" />
                      </div>
                      <div>
                        <p className="font-medium text-sm">Vulnerability Scan</p>
                        <p className="text-xs text-muted-foreground">Check for weaknesses</p>
                      </div>
                    </div>
                    <Switch
                      checked={localSettings.scannerSettings?.vulnerabilityScanEnabled ?? false}
                      onCheckedChange={(v) => updateNestedSetting('scannerSettings', 'vulnerabilityScanEnabled', v)}
                    />
                  </div>

                  <div className={`flex items-center justify-between p-4 rounded-xl border ${localSettings.scannerSettings?.sslScanEnabled ? 'bg-green-500/5 border-green-500/30' : ''}`}>
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-lg bg-muted">
                        <Lock className="w-5 h-5 text-green-500" />
                      </div>
                      <div>
                        <p className="font-medium text-sm">SSL Scan</p>
                        <p className="text-xs text-muted-foreground">Certificate health</p>
                      </div>
                    </div>
                    <Switch
                      checked={localSettings.scannerSettings?.sslScanEnabled ?? false}
                      onCheckedChange={(v) => updateNestedSetting('scannerSettings', 'sslScanEnabled', v)}
                    />
                  </div>

                  <div className={`flex items-center justify-between p-4 rounded-xl border ${localSettings.scannerSettings?.malwareScanEnabled ? 'bg-green-500/5 border-green-500/30' : ''}`}>
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-lg bg-muted">
                        <AlertCircle className="w-5 h-5 text-red-500" />
                      </div>
                      <div>
                        <p className="font-medium text-sm">Malware Scan</p>
                        <p className="text-xs text-muted-foreground">Detect malicious code</p>
                      </div>
                    </div>
                    <Switch
                      checked={localSettings.scannerSettings?.malwareScanEnabled ?? false}
                      onCheckedChange={(v) => updateNestedSetting('scannerSettings', 'malwareScanEnabled', v)}
                    />
                  </div>
                </div>

                <div className="mt-4 space-y-2">
                  <Label className="text-xs">Scan Frequency</Label>
                  <select
                    className="w-full p-2 rounded-md border border-input bg-background text-sm"
                    value={localSettings.scannerSettings?.scanFrequency || 'weekly'}
                    onChange={(e) => updateNestedSetting('scannerSettings', 'scanFrequency', e.target.value)}
                  >
                    <option value="daily">Daily</option>
                    <option value="weekly">Weekly</option>
                    <option value="monthly">Monthly</option>
                  </select>
                </div>

                <Button onClick={saveScannerSettings} disabled={updateSettingsMutation.isPending} className="w-full mt-4">
                  {updateSettingsMutation.isPending && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                  Save Scanner Settings
                </Button>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        <Dialog open={show2FASetup} onOpenChange={setShow2FASetup}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <QrCode className="w-5 h-5" />
                Set Up Two-Factor Authentication
              </DialogTitle>
              <DialogDescription>
                Scan this QR code with your authenticator app
              </DialogDescription>
            </DialogHeader>
            <div className="flex flex-col items-center space-y-4 py-4">
              {qrCode && (
                <div className="p-4 bg-white rounded-xl">
                  <img src={qrCode} alt="2FA QR Code" className="w-48 h-48" />
                </div>
              )}
              <div className="w-full space-y-2">
                <Label className="text-xs text-muted-foreground">Or enter this code manually:</Label>
                <div className="flex items-center gap-2">
                  <code className="flex-1 p-2 bg-muted rounded text-xs font-mono break-all">{secret}</code>
                  <Button variant="outline" size="icon" onClick={copySecret}>
                    {secretCopied ? <Check className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
                  </Button>
                </div>
              </div>
            </div>
            <DialogFooter className="flex-col sm:flex-row gap-2">
              <Button variant="outline" onClick={() => setShow2FASetup(false)} className="w-full sm:w-auto">
                Cancel
              </Button>
              <Button onClick={() => { setShow2FASetup(false); setShow2FAVerify(true); }} className="w-full sm:w-auto">
                Continue to Verify
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        <Dialog open={show2FAVerify} onOpenChange={setShow2FAVerify}>
          <DialogContent className="max-w-sm">
            <DialogHeader>
              <DialogTitle>Verify 2FA Setup</DialogTitle>
              <DialogDescription>
                Enter the 6-digit code from your authenticator app
              </DialogDescription>
            </DialogHeader>
            <div className="flex justify-center py-6">
              <InputOTP maxLength={6} value={verifyCode} onChange={setVerifyCode}>
                <InputOTPGroup>
                  <InputOTPSlot index={0} />
                  <InputOTPSlot index={1} />
                  <InputOTPSlot index={2} />
                  <InputOTPSlot index={3} />
                  <InputOTPSlot index={4} />
                  <InputOTPSlot index={5} />
                </InputOTPGroup>
              </InputOTP>
            </div>
            <DialogFooter>
              <Button
                onClick={() => verify2FAMutation.mutate(verifyCode)}
                disabled={verifyCode.length !== 6 || verify2FAMutation.isPending}
                className="w-full"
              >
                {verify2FAMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                Verify and Enable
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        <Dialog open={show2FADisable} onOpenChange={setShow2FADisable}>
          <DialogContent className="max-w-sm">
            <DialogHeader>
              <DialogTitle className="text-destructive">Disable 2FA</DialogTitle>
              <DialogDescription>
                Enter your current 2FA code to disable two-factor authentication
              </DialogDescription>
            </DialogHeader>
            <div className="flex justify-center py-6">
              <InputOTP maxLength={6} value={disableCode} onChange={setDisableCode}>
                <InputOTPGroup>
                  <InputOTPSlot index={0} />
                  <InputOTPSlot index={1} />
                  <InputOTPSlot index={2} />
                  <InputOTPSlot index={3} />
                  <InputOTPSlot index={4} />
                  <InputOTPSlot index={5} />
                </InputOTPGroup>
              </InputOTP>
            </div>
            <DialogFooter>
              <Button
                variant="destructive"
                onClick={() => disable2FAMutation.mutate(disableCode)}
                disabled={disableCode.length !== 6 || disable2FAMutation.isPending}
                className="w-full"
              >
                {disable2FAMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                Disable 2FA
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </AdminLayout>
  );
}
