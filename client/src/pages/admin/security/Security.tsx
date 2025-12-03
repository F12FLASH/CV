import { AdminLayout } from "@/layouts/AdminLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useState, useEffect } from "react";
import { 
  Shield, Key, Lock, Smartphone, Globe, AlertTriangle, Trash2,
  ShieldAlert, RefreshCw, Eye, EyeOff, Clock, Users,
  Monitor, LogOut, Ban, CheckCircle, XCircle,
  Server, AlertCircle, Plus, Loader2, FileText, BarChart3, 
  Zap, Activity, Layers, QrCode, Copy, Check
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
  
  // 2FA Modal
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
    refetchInterval: 30000, // Auto refresh every 30 seconds
  });

  const { data: ipRules = [], refetch: refetchIpRules } = useQuery<IpRule[]>({
    queryKey: ['/api/security/ip-rules'],
  });

  const { data: stats } = useQuery<SecurityStats>({
    queryKey: ['/api/security/stats'],
  });

  const { data: loginHistory = [], refetch: refetchLoginHistory, isRefetching: isRefetchingLoginHistory } = useQuery<SecurityLog[]>({
    queryKey: ['/api/security/login-history'],
    refetchInterval: showLoginHistory ? 30000 : false, // Auto refresh every 30s when viewing
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

  // 2FA Mutations
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

  const saveAllSettings = () => {
    updateSettingsMutation.mutate(localSettings);
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

  const saveFirewallSettings = () => {
    const firewallSettings = {
      rateLimiting: localSettings.rateLimiting
    };
    updateSettingsMutation.mutate(firewallSettings);
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
      generate2FAMutation.mutate(undefined, {
        onSuccess: () => {
          // Modal sẽ tự động hiện
        },
        onError: () => {
          toast({ title: "Failed to generate 2FA setup", variant: "destructive" });
        }
      });
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
      // Fallback cho trình duyệt cũ
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

  if (settingsLoading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center h-64">
          <Loader2 className="w-8 h-8 animate-spin" />
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-heading font-bold" data-testid="text-security-title">Security Center</h1>
          <p className="text-muted-foreground">Monitor and configure security settings</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          <Card className="border-green-500/50 bg-green-500/5">
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <Shield className="w-6 h-6 text-green-500" />
                <div>
                  <p className="text-xs text-muted-foreground">System Status</p>
                  <p className="font-bold">Secure</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <Lock className="w-6 h-6 text-primary" />
                <div>
                  <p className="text-xs text-muted-foreground">SSL Certificate</p>
                  <p className="font-bold text-sm">Valid (Dec 2025)</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <AlertTriangle className="w-6 h-6 text-yellow-500" />
                <div>
                  <p className="text-xs text-muted-foreground">Blocked (24h)</p>
                  <p className="font-bold">{stats?.totalBlocked || 0} attempts</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <Smartphone className="w-6 h-6 text-primary" />
                <div>
                  <p className="text-xs text-muted-foreground">Active Sessions</p>
                  <p className="font-bold">{sessions.length} devices</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="border-blue-500/50 bg-blue-500/5">
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <Shield className="w-6 h-6 text-blue-500" />
                <div>
                  <p className="text-xs text-muted-foreground">IP Rules</p>
                  <p className="font-bold text-sm">{ipRules.length} active</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="authentication" className="space-y-6">
          <TabsList className="flex flex-wrap gap-1 h-auto p-1">
            <TabsTrigger value="authentication" data-testid="tab-authentication">Authentication</TabsTrigger>
            <TabsTrigger value="recaptcha" data-testid="tab-recaptcha">Recaptcha</TabsTrigger>
            <TabsTrigger value="firewall" data-testid="tab-firewall">Firewall</TabsTrigger>
            <TabsTrigger value="threat" data-testid="tab-threat">Threat Protection</TabsTrigger>
            <TabsTrigger value="sessions" data-testid="tab-sessions">Sessions</TabsTrigger>
            <TabsTrigger value="compliance" data-testid="tab-compliance">Compliance</TabsTrigger>
            <TabsTrigger value="csp" data-testid="tab-csp">CSP</TabsTrigger>
            <TabsTrigger value="scanner" data-testid="tab-scanner">Scanner</TabsTrigger>
          </TabsList>

          {/* AUTHENTICATION TAB */}
          <TabsContent value="authentication" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Key className="w-5 h-5" />
                  Authentication Methods
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Smartphone className="w-5 h-5 text-muted-foreground" />
                    <div>
                      <div className="font-medium">Two-Factor Authentication (2FA)</div>
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
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Lock className="w-5 h-5 text-muted-foreground" />
                    <div>
                      <div className="font-medium">Password Expiration</div>
                      <div className="text-sm text-muted-foreground">Force reset every 90 days</div>
                    </div>
                  </div>
                  <Switch 
                    checked={localSettings.passwordExpiration ?? true}
                    onCheckedChange={(v) => updateLocalSetting('passwordExpiration', v)}
                    data-testid="switch-password-expiration"
                  />
                </div>
                <Button onClick={saveAuthSettings} disabled={updateSettingsMutation.isPending} data-testid="button-save-auth">
                  {updateSettingsMutation.isPending && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                  Save Authentication Settings
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Monitor className="w-5 h-5" />
                  Trusted Devices
                </CardTitle>
                <CardDescription>Manage devices that can skip 2FA</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {devices.length === 0 ? (
                  <p className="text-sm text-muted-foreground">No trusted devices registered</p>
                ) : (
                  devices.map((device) => (
                    <div key={device.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div>
                        <p className="font-medium text-sm">{device.deviceName}</p>
                        <p className="text-xs text-muted-foreground">{device.ipAddress} • {device.lastUsed ? new Date(device.lastUsed).toLocaleDateString() : 'Never'}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        {device.trusted && <Badge variant="secondary">Trusted</Badge>}
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className="text-destructive"
                          onClick={() => deleteDeviceMutation.mutate(device.id)}
                          data-testid={`button-remove-device-${device.id}`}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  ))
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="w-5 h-5" />
                  Login History
                </CardTitle>
                <CardDescription>View recent login activity and security events</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button 
                  variant="outline" 
                  className="w-full" 
                  onClick={() => setShowLoginHistory(!showLoginHistory)}
                  data-testid="button-view-login-history"
                >
                  <Eye className="w-4 h-4 mr-2" />
                  {showLoginHistory ? 'Hide' : 'View'} Login History
                </Button>
                
                {showLoginHistory && (
                  <div className="mt-4 space-y-2 max-h-96 overflow-y-auto border rounded-lg p-3">
                    <div className="flex items-center justify-between mb-3">
                      <p className="text-sm font-medium">Recent Login Activity</p>
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={() => refetchLoginHistory()}
                        disabled={isRefetchingLoginHistory}
                      >
                        <RefreshCw className={`w-3 h-3 ${isRefetchingLoginHistory ? 'animate-spin' : ''}`} />
                      </Button>
                    </div>
                    {loginHistory.length === 0 ? (
                      <p className="text-xs text-muted-foreground text-center py-4">No login history found</p>
                    ) : (
                      loginHistory.map((log) => (
                        <div key={log.id} className="p-2 text-xs border rounded bg-muted/50">
                          <div className="flex items-center justify-between mb-1">
                            <span className="font-medium flex items-center gap-1">
                              {log.type === 'success' ? (
                                <CheckCircle className="w-3 h-3 text-green-500" />
                              ) : log.type === 'error' ? (
                                <XCircle className="w-3 h-3 text-red-500" />
                              ) : (
                                <AlertCircle className="w-3 h-3 text-yellow-500" />
                              )}
                              {log.userName || 'Unknown User'}
                            </span>
                            <Badge variant={log.type === 'success' ? 'default' : 'destructive'} className="text-[10px]">
                              {log.type}
                            </Badge>
                          </div>
                          <p className="text-muted-foreground mb-1">{log.action}</p>
                          <p className="text-muted-foreground/70">
                            {log.createdAt ? new Date(log.createdAt).toLocaleString() : 'N/A'}
                          </p>
                        </div>
                      ))
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* RECAPTCHA TAB */}
          <TabsContent value="recaptcha" className="space-y-4">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <ShieldAlert className="w-5 h-5" />
                    Bot Protection Settings
                  </CardTitle>
                  <CardDescription>Configure CAPTCHA protection for forms and login</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-4">
                    <div className={`p-4 border rounded-lg space-y-3 ${localSettings.captchaType === 'disabled' ? 'border-primary/50 bg-primary/5' : ''}`}>
                      <label className="flex items-center gap-3 cursor-pointer">
                        <input 
                          type="radio" 
                          name="captcha" 
                          value="disabled"
                          checked={localSettings.captchaType === 'disabled'}
                          onChange={() => updateLocalSetting('captchaType', 'disabled')}
                          className="w-4 h-4 text-primary"
                          data-testid="radio-captcha-disabled"
                        />
                        <div className="flex-1">
                          <div className="font-medium text-sm flex items-center gap-2">
                            <XCircle className="w-4 h-4 text-muted-foreground" />
                            Disabled
                          </div>
                          <div className="text-xs text-muted-foreground">No bot protection (not recommended)</div>
                        </div>
                      </label>
                    </div>

                    <div className={`p-4 border rounded-lg space-y-3 ${localSettings.captchaType === 'local' ? 'border-primary/50 bg-primary/5' : ''}`}>
                      <label className="flex items-center gap-3 cursor-pointer">
                        <input 
                          type="radio" 
                          name="captcha" 
                          value="local"
                          checked={localSettings.captchaType === 'local' || !localSettings.captchaType}
                          onChange={() => updateLocalSetting('captchaType', 'local')}
                          className="w-4 h-4 text-primary"
                          data-testid="radio-captcha-local"
                        />
                        <div className="flex-1">
                          <div className="font-medium text-sm flex items-center gap-2">
                            <Server className="w-4 h-4 text-muted-foreground" />
                            Local Verification
                            {(localSettings.captchaType === 'local' || !localSettings.captchaType) && <Badge variant="secondary" className="text-[10px]">Active</Badge>}
                          </div>
                          <div className="text-xs text-muted-foreground">Server-side honeypot + rate limiting</div>
                        </div>
                      </label>
                      {(localSettings.captchaType === 'local' || !localSettings.captchaType) && (
                        <div className="ml-7 space-y-2">
                          <div className="flex items-center justify-between">
                            <span className="text-xs">Honeypot Fields</span>
                            <Switch 
                              checked={localSettings.captchaSettings?.honeypotEnabled ?? true}
                              onCheckedChange={(v) => updateNestedSetting('captchaSettings', 'honeypotEnabled', v)}
                              data-testid="switch-honeypot"
                            />
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-xs">Time-based Validation</span>
                            <Switch 
                              checked={localSettings.captchaSettings?.timeValidation ?? true}
                              onCheckedChange={(v) => updateNestedSetting('captchaSettings', 'timeValidation', v)}
                              data-testid="switch-time-validation"
                            />
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-xs">IP Rate Limiting</span>
                            <Switch 
                              checked={localSettings.captchaSettings?.ipRateLimit ?? true}
                              onCheckedChange={(v) => updateNestedSetting('captchaSettings', 'ipRateLimit', v)}
                              data-testid="switch-ip-rate-limit"
                            />
                          </div>
                        </div>
                      )}
                    </div>

                    <div className={`p-4 border rounded-lg space-y-3 ${localSettings.captchaType === 'google' ? 'border-primary/50 bg-primary/5' : ''}`}>
                      <label className="flex items-center gap-3 cursor-pointer">
                        <input 
                          type="radio" 
                          name="captcha" 
                          value="google"
                          checked={localSettings.captchaType === 'google'}
                          onChange={() => updateLocalSetting('captchaType', 'google')}
                          className="w-4 h-4 text-primary"
                          data-testid="radio-captcha-google"
                        />
                        <div className="flex-1">
                          <div className="font-medium text-sm flex items-center gap-2">
                            <Globe className="w-4 h-4 text-muted-foreground" />
                            Google reCAPTCHA v3
                          </div>
                          <div className="text-xs text-muted-foreground">Invisible, score-based protection</div>
                        </div>
                      </label>
                      {localSettings.captchaType === 'google' && (
                        <div className="ml-7 space-y-3 pt-2">
                          <div className="space-y-1">
                            <Label className="text-xs">Site Key</Label>
                            <Input 
                              placeholder="Enter Google reCAPTCHA site key" 
                              className="text-sm"
                              value={localSettings.captchaSettings?.googleSiteKey || ''}
                              onChange={(e) => updateNestedSetting('captchaSettings', 'googleSiteKey', e.target.value)}
                              data-testid="input-google-site-key"
                            />
                            {localSettings.captchaType === 'google' && !localSettings.captchaSettings?.googleSiteKey && (
                              <p className="text-xs text-yellow-600 dark:text-yellow-500 flex items-center gap-1">
                                <AlertTriangle className="w-3 h-3" />
                                Site key is required for Google reCAPTCHA to work
                              </p>
                            )}
                          </div>
                          <div className="space-y-1">
                            <Label className="text-xs">Secret Key</Label>
                            <div className="relative">
                              <Input 
                                type={showGoogleSecret ? "text" : "password"} 
                                placeholder="Enter secret key" 
                                className="text-sm pr-10"
                                value={localSettings.captchaSettings?.googleSecretKey || ''}
                                onChange={(e) => updateNestedSetting('captchaSettings', 'googleSecretKey', e.target.value)}
                                data-testid="input-google-secret-key"
                              />
                              <Button 
                                variant="ghost" 
                                size="icon" 
                                className="absolute right-0 top-0 h-full"
                                onClick={() => setShowGoogleSecret(!showGoogleSecret)}
                              >
                                {showGoogleSecret ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                              </Button>
                            </div>
                          </div>
                          <div className="space-y-1">
                            <Label className="text-xs">Minimum Score (0.0 - 1.0)</Label>
                            <Input 
                              type="number" 
                              value={localSettings.captchaSettings?.googleMinScore ?? 0.5}
                              onChange={(e) => updateNestedSetting('captchaSettings', 'googleMinScore', parseFloat(e.target.value))}
                              step="0.1" 
                              min="0" 
                              max="1" 
                              className="text-sm"
                              data-testid="input-google-min-score"
                            />
                          </div>
                        </div>
                      )}
                    </div>

                    <div className={`p-4 border rounded-lg space-y-3 ${localSettings.captchaType === 'cloudflare' ? 'border-primary/50 bg-primary/5' : ''}`}>
                      <label className="flex items-center gap-3 cursor-pointer">
                        <input 
                          type="radio" 
                          name="captcha" 
                          value="cloudflare"
                          checked={localSettings.captchaType === 'cloudflare'}
                          onChange={() => updateLocalSetting('captchaType', 'cloudflare')}
                          className="w-4 h-4 text-primary"
                          data-testid="radio-captcha-cloudflare"
                        />
                        <div className="flex-1">
                          <div className="font-medium text-sm flex items-center gap-2">
                            <Shield className="w-4 h-4 text-muted-foreground" />
                            Cloudflare Turnstile
                          </div>
                          <div className="text-xs text-muted-foreground">Privacy-friendly, works with adblockers</div>
                        </div>
                      </label>
                      {localSettings.captchaType === 'cloudflare' && (
                        <div className="ml-7 space-y-3 pt-2">
                          <div className="space-y-1">
                            <Label className="text-xs">Site Key</Label>
                            <Input 
                              placeholder="Enter Cloudflare site key" 
                              className="text-sm"
                              value={localSettings.captchaSettings?.cloudflareSiteKey || ''}
                              onChange={(e) => updateNestedSetting('captchaSettings', 'cloudflareSiteKey', e.target.value)}
                              data-testid="input-cloudflare-site-key"
                            />
                            {localSettings.captchaType === 'cloudflare' && !localSettings.captchaSettings?.cloudflareSiteKey && (
                              <p className="text-xs text-yellow-600 dark:text-yellow-500 flex items-center gap-1">
                                <AlertTriangle className="w-3 h-3" />
                                Site key is required for Cloudflare Turnstile to work
                              </p>
                            )}
                          </div>
                          <div className="space-y-1">
                            <Label className="text-xs">Secret Key</Label>
                            <div className="relative">
                              <Input 
                                type={showCloudflareSecret ? "text" : "password"} 
                                placeholder="Enter secret key" 
                                className="text-sm pr-10"
                                value={localSettings.captchaSettings?.cloudflareSecretKey || ''}
                                onChange={(e) => updateNestedSetting('captchaSettings', 'cloudflareSecretKey', e.target.value)}
                                data-testid="input-cloudflare-secret-key"
                              />
                              <Button 
                                variant="ghost" 
                                size="icon" 
                                className="absolute right-0 top-0 h-full"
                                onClick={() => setShowCloudflareSecret(!showCloudflareSecret)}
                              >
                                {showCloudflareSecret ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                              </Button>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <Switch 
                              checked={localSettings.captchaSettings?.cloudflareManagedMode || false}
                              onCheckedChange={(v) => updateNestedSetting('captchaSettings', 'cloudflareManagedMode', v)}
                              data-testid="switch-cloudflare-managed"
                            />
                            <Label className="text-xs">Managed Challenge Mode</Label>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  <Button className="w-full" onClick={saveCaptchaSettings} disabled={updateSettingsMutation.isPending} data-testid="button-save-captcha">
                    {updateSettingsMutation.isPending && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                    Save Captcha Settings
                  </Button>
                </CardContent>
              </Card>

              <div className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <CheckCircle className="w-5 h-5" />
                      Protection Coverage
                    </CardTitle>
                    <CardDescription>Choose which forms to protect</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex items-center justify-between p-3 border rounded-lg">
                      <div>
                        <p className="font-medium text-sm">Login Form</p>
                        <p className="text-xs text-muted-foreground">Admin login page</p>
                      </div>
                      <Switch 
                        checked={localSettings.protectionCoverage?.loginForm ?? true}
                        onCheckedChange={(v) => updateNestedSetting('protectionCoverage', 'loginForm', v)}
                        data-testid="switch-protect-login"
                      />
                    </div>
                    <div className="flex items-center justify-between p-3 border rounded-lg">
                      <div>
                        <p className="font-medium text-sm">Contact Form</p>
                        <p className="text-xs text-muted-foreground">Public contact form</p>
                      </div>
                      <Switch 
                        checked={localSettings.protectionCoverage?.contactForm ?? true}
                        onCheckedChange={(v) => updateNestedSetting('protectionCoverage', 'contactForm', v)}
                        data-testid="switch-protect-contact"
                      />
                    </div>
                    <div className="flex items-center justify-between p-3 border rounded-lg">
                      <div>
                        <p className="font-medium text-sm">Newsletter Signup</p>
                        <p className="text-xs text-muted-foreground">Email subscription form</p>
                      </div>
                      <Switch 
                        checked={localSettings.protectionCoverage?.newsletterForm ?? true}
                        onCheckedChange={(v) => updateNestedSetting('protectionCoverage', 'newsletterForm', v)}
                        data-testid="switch-protect-newsletter"
                      />
                    </div>
                    <div className="flex items-center justify-between p-3 border rounded-lg">
                      <div>
                        <p className="font-medium text-sm">Comment Forms</p>
                        <p className="text-xs text-muted-foreground">Blog post comments</p>
                      </div>
                      <Switch 
                        checked={localSettings.protectionCoverage?.commentForms ?? true}
                        onCheckedChange={(v) => updateNestedSetting('protectionCoverage', 'commentForms', v)}
                        data-testid="switch-protect-comments"
                      />
                    </div>
                    <div className="flex items-center justify-between p-3 border rounded-lg">
                      <div>
                        <p className="font-medium text-sm">Registration Form</p>
                        <p className="text-xs text-muted-foreground">User registration (if enabled)</p>
                      </div>
                      <Switch 
                        checked={localSettings.protectionCoverage?.registrationForm || false}
                        onCheckedChange={(v) => updateNestedSetting('protectionCoverage', 'registrationForm', v)}
                        data-testid="switch-protect-registration"
                      />
                    </div>
                    <Button className="w-full" onClick={saveCaptchaSettings} disabled={updateSettingsMutation.isPending} data-testid="button-save-coverage">
                      Save Coverage Settings
                    </Button>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <AlertCircle className="w-5 h-5" />
                      Bot Detection Stats
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="p-3 bg-green-500/10 border border-green-500/20 rounded-lg">
                        <p className="text-2xl font-bold text-green-500" data-testid="text-allowed-count">{stats?.totalAllowed || 0}</p>
                        <p className="text-xs text-muted-foreground">Legitimate Submissions</p>
                      </div>
                      <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg">
                        <p className="text-2xl font-bold text-red-500" data-testid="text-blocked-count">{stats?.totalBlocked || 0}</p>
                        <p className="text-xs text-muted-foreground">Blocked Bots</p>
                      </div>
                    </div>
                    <div className="p-3 bg-muted/50 rounded-lg">
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-xs text-muted-foreground">Protection Rate</span>
                        <span className="text-sm font-medium">
                          {stats && stats.totalBlocked + stats.totalAllowed > 0 
                            ? ((stats.totalAllowed / (stats.totalBlocked + stats.totalAllowed)) * 100).toFixed(1) 
                            : 100}%
                        </span>
                      </div>
                      <div className="h-2 bg-muted rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-green-500 rounded-full" 
                          style={{ width: `${stats && stats.totalBlocked + stats.totalAllowed > 0 ? (stats.totalAllowed / (stats.totalBlocked + stats.totalAllowed)) * 100 : 100}%` }} 
                        />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>

          {/* FIREWALL TAB */}
          <TabsContent value="firewall" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Globe className="w-5 h-5" /> IP Whitelist / Blacklist
                </CardTitle>
                <CardDescription>Control which IP addresses can access admin panel</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h4 className="font-medium mb-2">IP Whitelist (Allow only these IPs)</h4>
                  <div className="space-y-2 mb-3">
                    {whitelistIps.length === 0 ? (
                      <p className="text-sm text-muted-foreground">No whitelisted IPs</p>
                    ) : (
                      whitelistIps.map((rule) => (
                        <div key={rule.id} className="flex items-center justify-between p-2 border rounded bg-green-500/5 border-green-500/20">
                          <span className="text-sm">{rule.ipAddress}</span>
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            className="text-destructive"
                            onClick={() => deleteIpRuleMutation.mutate(rule.id)}
                            data-testid={`button-remove-whitelist-${rule.id}`}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      ))
                    )}
                  </div>
                  <div className="space-y-2">
                    <div className="flex gap-2">
                      <Input 
                        placeholder="Add IP address (e.g., 192.168.1.1)" 
                        value={newWhitelistIp}
                        onChange={(e) => setNewWhitelistIp(e.target.value)}
                        data-testid="input-whitelist-ip"
                        className={newWhitelistIp && !/^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/.test(newWhitelistIp) ? 'border-red-500' : ''}
                      />
                      <Button 
                        onClick={() => {
                          // More comprehensive IP validation
                          const validateIP = (ip: string) => {
                            // IPv4 with optional CIDR
                            const ipv4Regex = /^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)(?:\/(?:3[0-2]|[12]?[0-9]))?$/;
                            // IPv6 with optional CIDR
                            const ipv6Regex = /^(?:(?:[0-9a-fA-F]{1,4}:){7}[0-9a-fA-F]{1,4}|::(?:[0-9a-fA-F]{1,4}:){0,6}[0-9a-fA-F]{1,4})(?:\/(?:12[0-8]|1[01][0-9]|[1-9]?[0-9]))?$/;
                            
                            if (ipv4Regex.test(ip)) {
                              // Validate CIDR range if present
                              const parts = ip.split('/');
                              if (parts.length === 2) {
                                const cidr = parseInt(parts[1]);
                                return cidr >= 0 && cidr <= 32;
                              }
                              return true;
                            }
                            
                            if (ipv6Regex.test(ip)) {
                              const parts = ip.split('/');
                              if (parts.length === 2) {
                                const cidr = parseInt(parts[1]);
                                return cidr >= 0 && cidr <= 128;
                              }
                              return true;
                            }
                            
                            return false;
                          };
                          
                          if (newWhitelistIp && validateIP(newWhitelistIp)) {
                            addIpRuleMutation.mutate({ ipAddress: newWhitelistIp, type: 'whitelist' });
                          } else {
                            toast({ title: "Invalid IP address format. Use IPv4/IPv6 with optional CIDR notation", variant: "destructive" });
                          }
                        }}
                        disabled={!newWhitelistIp || addIpRuleMutation.isPending}
                        data-testid="button-add-whitelist"
                      >
                        <Plus className="w-4 h-4 mr-1" /> Add
                      </Button>
                    </div>
                    {newWhitelistIp && !/^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)(?:\/(?:3[0-2]|[12]?[0-9]))?$/.test(newWhitelistIp) && 
                     !/^(?:[0-9a-fA-F]{1,4}:){7}[0-9a-fA-F]{1,4}(?:\/(?:12[0-8]|1[01][0-9]|[1-9]?[0-9]))?$|^::(?:[0-9a-fA-F]{1,4}:){0,6}[0-9a-fA-F]{1,4}(?:\/(?:12[0-8]|1[01][0-9]|[1-9]?[0-9]))?$/.test(newWhitelistIp) && (
                      <p className="text-xs text-red-500">Please enter a valid IPv4/IPv6 address (CIDR notation supported)</p>
                    )}
                  </div>
                </div>

                <Separator />

                <div>
                  <h4 className="font-medium mb-2">IP Blacklist (Block these IPs)</h4>
                  <div className="space-y-2 mb-3">
                    {blacklistIps.length === 0 ? (
                      <p className="text-sm text-muted-foreground">No blacklisted IPs</p>
                    ) : (
                      blacklistIps.map((rule) => (
                        <div key={rule.id} className="flex items-center justify-between p-2 border rounded bg-red-500/5 border-red-500/20">
                          <span className="text-sm">{rule.ipAddress}</span>
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            className="text-destructive"
                            onClick={() => deleteIpRuleMutation.mutate(rule.id)}
                            data-testid={`button-remove-blacklist-${rule.id}`}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      ))
                    )}
                  </div>
                  <div className="space-y-2">
                    <div className="flex gap-2">
                      <Input 
                        placeholder="Add IP to block..." 
                        value={newBlacklistIp}
                        onChange={(e) => setNewBlacklistIp(e.target.value)}
                        data-testid="input-blacklist-ip"
                        className={newBlacklistIp && !/^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/.test(newBlacklistIp) ? 'border-red-500' : ''}
                      />
                      <Button 
                        onClick={() => {
                          const validateIP = (ip: string) => {
                            const ipv4Regex = /^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)(?:\/(?:3[0-2]|[12]?[0-9]))?$/;
                            const ipv6Regex = /^(?:(?:[0-9a-fA-F]{1,4}:){7}[0-9a-fA-F]{1,4}|::(?:[0-9a-fA-F]{1,4}:){0,6}[0-9a-fA-F]{1,4})(?:\/(?:12[0-8]|1[01][0-9]|[1-9]?[0-9]))?$/;
                            
                            if (ipv4Regex.test(ip)) {
                              const parts = ip.split('/');
                              if (parts.length === 2) {
                                const cidr = parseInt(parts[1]);
                                return cidr >= 0 && cidr <= 32;
                              }
                              return true;
                            }
                            
                            if (ipv6Regex.test(ip)) {
                              const parts = ip.split('/');
                              if (parts.length === 2) {
                                const cidr = parseInt(parts[1]);
                                return cidr >= 0 && cidr <= 128;
                              }
                              return true;
                            }
                            
                            return false;
                          };
                          
                          if (newBlacklistIp && validateIP(newBlacklistIp)) {
                            addIpRuleMutation.mutate({ ipAddress: newBlacklistIp, type: 'blacklist' });
                          } else {
                            toast({ title: "Invalid IP address format. Use IPv4/IPv6 with optional CIDR notation", variant: "destructive" });
                          }
                        }}
                        disabled={!newBlacklistIp || addIpRuleMutation.isPending}
                        data-testid="button-add-blacklist"
                      >
                        <Ban className="w-4 h-4 mr-1" /> Block
                      </Button>
                    </div>
                    {newBlacklistIp && !/^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)(?:\/(?:3[0-2]|[12]?[0-9]))?$/.test(newBlacklistIp) && 
                     !/^(?:[0-9a-fA-F]{1,4}:){7}[0-9a-fA-F]{1,4}(?:\/(?:12[0-8]|1[01][0-9]|[1-9]?[0-9]))?$|^::(?:[0-9a-fA-F]{1,4}:){0,6}[0-9a-fA-F]{1,4}(?:\/(?:12[0-8]|1[01][0-9]|[1-9]?[0-9]))?$/.test(newBlacklistIp) && (
                      <p className="text-xs text-red-500">Please enter a valid IPv4/IPv6 address (CIDR notation supported)</p>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Rate Limiting</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="text-sm font-medium">Login Attempts Limit</label>
                  <Input 
                    value={localSettings.rateLimiting?.loginAttemptsLimit ?? 5}
                    onChange={(e) => updateNestedSetting('rateLimiting', 'loginAttemptsLimit', parseInt(e.target.value) || 5)}
                    type="number" 
                    className="mt-1"
                    data-testid="input-login-attempts-limit"
                  />
                  <p className="text-xs text-muted-foreground mt-1">Max attempts before lockout</p>
                </div>
                <div>
                  <label className="text-sm font-medium">API Rate Limit</label>
                  <Input 
                    value={localSettings.rateLimiting?.apiRateLimit ?? 1000}
                    onChange={(e) => updateNestedSetting('rateLimiting', 'apiRateLimit', parseInt(e.target.value) || 1000)}
                    type="number" 
                    className="mt-1"
                    data-testid="input-api-rate-limit"
                  />
                  <p className="text-xs text-muted-foreground mt-1">Requests per hour per IP</p>
                </div>
                <div>
                  <label className="text-sm font-medium">Lockout Duration (minutes)</label>
                  <Input 
                    value={localSettings.rateLimiting?.lockoutDuration ?? 15}
                    onChange={(e) => updateNestedSetting('rateLimiting', 'lockoutDuration', parseInt(e.target.value) || 15)}
                    type="number" 
                    className="mt-1"
                    data-testid="input-lockout-duration"
                  />
                  <p className="text-xs text-muted-foreground mt-1">Time before locked out user can try again</p>
                </div>
                <Button onClick={saveFirewallSettings} disabled={updateSettingsMutation.isPending} data-testid="button-save-rate-limiting">
                  {updateSettingsMutation.isPending && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                  Save Rate Limiting Settings
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          {/* THREAT PROTECTION TAB */}
          <TabsContent value="threat" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <ShieldAlert className="w-5 h-5" /> DDoS Protection
                </CardTitle>
                <CardDescription>Protect against distributed denial-of-service attacks</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className={`flex items-center justify-between p-3 border rounded-lg ${localSettings.ddosProtection?.enabled ? 'bg-green-500/5 border-green-500/20' : ''}`}>
                  <div>
                    <p className="font-medium text-sm">DDoS Protection</p>
                    <p className="text-xs text-muted-foreground">Automatically detect and mitigate attacks</p>
                  </div>
                  <Switch 
                    checked={localSettings.ddosProtection?.enabled ?? true}
                    onCheckedChange={(v) => updateNestedSetting('ddosProtection', 'enabled', v)}
                    data-testid="switch-ddos-protection"
                  />
                </div>
                {localSettings.ddosProtection?.enabled !== false && (
                  <>
                    <div>
                      <label className="text-sm font-medium">Request Threshold (per minute)</label>
                      <Input 
                        value={localSettings.ddosProtection?.threshold ?? 100}
                        onChange={(e) => updateNestedSetting('ddosProtection', 'threshold', parseInt(e.target.value) || 100)}
                        type="number" 
                        className="mt-1"
                        data-testid="input-ddos-threshold"
                      />
                      <p className="text-xs text-muted-foreground mt-1">Trigger protection when requests exceed this limit</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium">Block Duration (minutes)</label>
                      <Input 
                        value={localSettings.ddosProtection?.blockDuration ?? 30}
                        onChange={(e) => updateNestedSetting('ddosProtection', 'blockDuration', parseInt(e.target.value) || 30)}
                        type="number" 
                        className="mt-1"
                        data-testid="input-ddos-block-duration"
                      />
                      <p className="text-xs text-muted-foreground mt-1">How long to block suspicious IPs</p>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <AlertTriangle className="w-5 h-5" /> SQL Injection Detection
                </CardTitle>
                <CardDescription>Detect and block SQL injection attempts</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className={`flex items-center justify-between p-3 border rounded-lg ${localSettings.sqlInjectionProtection?.enabled ? 'bg-green-500/5 border-green-500/20' : ''}`}>
                  <div>
                    <p className="font-medium text-sm">SQL Injection Protection</p>
                    <p className="text-xs text-muted-foreground">Scan requests for malicious SQL patterns</p>
                  </div>
                  <Switch 
                    checked={localSettings.sqlInjectionProtection?.enabled ?? true}
                    onCheckedChange={(v) => updateNestedSetting('sqlInjectionProtection', 'enabled', v)}
                    data-testid="switch-sql-injection"
                  />
                </div>
                {localSettings.sqlInjectionProtection?.enabled !== false && (
                  <>
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium text-sm">Log Attempts</p>
                        <p className="text-xs text-muted-foreground">Record all detected injection attempts</p>
                      </div>
                      <Switch 
                        checked={localSettings.sqlInjectionProtection?.logAttempts ?? true}
                        onCheckedChange={(v) => updateNestedSetting('sqlInjectionProtection', 'logAttempts', v)}
                        data-testid="switch-sql-log"
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium text-sm">Block Requests</p>
                        <p className="text-xs text-muted-foreground">Automatically block suspicious requests</p>
                      </div>
                      <Switch 
                        checked={localSettings.sqlInjectionProtection?.blockRequests ?? true}
                        onCheckedChange={(v) => updateNestedSetting('sqlInjectionProtection', 'blockRequests', v)}
                        data-testid="switch-sql-block"
                      />
                    </div>
                  </>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="w-5 h-5" /> XSS Protection
                </CardTitle>
                <CardDescription>Protect against cross-site scripting attacks</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className={`flex items-center justify-between p-3 border rounded-lg ${localSettings.xssProtection?.enabled ? 'bg-green-500/5 border-green-500/20' : ''}`}>
                  <div>
                    <p className="font-medium text-sm">XSS Protection</p>
                    <p className="text-xs text-muted-foreground">Detect and sanitize malicious scripts</p>
                  </div>
                  <Switch 
                    checked={localSettings.xssProtection?.enabled ?? true}
                    onCheckedChange={(v) => updateNestedSetting('xssProtection', 'enabled', v)}
                    data-testid="switch-xss-protection"
                  />
                </div>
                {localSettings.xssProtection?.enabled !== false && (
                  <>
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium text-sm">Sanitize Input</p>
                        <p className="text-xs text-muted-foreground">Automatically clean user input</p>
                      </div>
                      <Switch 
                        checked={localSettings.xssProtection?.sanitizeInput ?? true}
                        onCheckedChange={(v) => updateNestedSetting('xssProtection', 'sanitizeInput', v)}
                        data-testid="switch-xss-sanitize"
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium text-sm">Block Requests</p>
                        <p className="text-xs text-muted-foreground">Block requests with malicious content</p>
                      </div>
                      <Switch 
                        checked={localSettings.xssProtection?.blockRequests ?? true}
                        onCheckedChange={(v) => updateNestedSetting('xssProtection', 'blockRequests', v)}
                        data-testid="switch-xss-block"
                      />
                    </div>
                  </>
                )}
                <Button onClick={saveThreatSettings} disabled={updateSettingsMutation.isPending} className="w-full" data-testid="button-save-threat">
                  {updateSettingsMutation.isPending && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                  Save Threat Protection Settings
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          {/* SESSIONS TAB */}
          <TabsContent value="sessions" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="w-5 h-5" /> Active Sessions
                </CardTitle>
                <CardDescription>Manage active user sessions</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {sessions.length === 0 ? (
                  <p className="text-sm text-muted-foreground">No active sessions</p>
                ) : (
                  <div className="space-y-2">
                    {sessions.map((session) => (
                      <div key={session.id} className="flex items-center justify-between p-3 border rounded-lg">
                        <div className="flex items-center gap-3">
                          <div className="w-2 h-2 rounded-full bg-green-500" />
                          <div>
                            <p className="font-medium text-sm">{session.deviceInfo || 'Unknown Device'}</p>
                            <p className="text-xs text-muted-foreground">
                              {session.ipAddress || 'Unknown IP'} • {session.location || 'Unknown Location'}
                              {session.lastActivity && ` • ${new Date(session.lastActivity).toLocaleString()}`}
                            </p>
                          </div>
                        </div>
                        <Button 
                          variant="ghost" 
                          size="sm"
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

                <div className="flex gap-2">
                  <Button 
                    variant="outline" 
                    className="flex-1"
                    onClick={(e) => {
                      e.preventDefault();
                      logoutAllDevicesMutation.mutate();
                    }}
                    disabled={logoutAllDevicesMutation.isPending}
                    data-testid="button-logout-all-devices"
                  >
                    {logoutAllDevicesMutation.isPending && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                    <LogOut className="w-4 h-4 mr-2" /> Logout All Devices
                  </Button>
                  <Button 
                    variant="destructive" 
                    className="flex-1"
                    onClick={(e) => {
                      e.preventDefault();
                      terminateAllSessionsMutation.mutate();
                    }}
                    disabled={terminateAllSessionsMutation.isPending}
                    data-testid="button-force-logout-all"
                  >
                    {terminateAllSessionsMutation.isPending && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                    <LogOut className="w-4 h-4 mr-2" /> Force Logout All Users
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="w-5 h-5" /> Session Policies
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Session Timeout (Idle)</Label>
                    <select 
                      className="w-full p-2 rounded-md border border-input bg-background"
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
                    <Label>Max Session Duration</Label>
                    <select 
                      className="w-full p-2 rounded-md border border-input bg-background"
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

                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-sm">Force Logout Inactive Users</p>
                    <p className="text-xs text-muted-foreground">Auto-logout users after idle timeout</p>
                  </div>
                  <Switch 
                    checked={localSettings.sessionSettings?.forceLogoutInactive ?? true}
                    onCheckedChange={(v) => updateNestedSetting('sessionSettings', 'forceLogoutInactive', v)}
                    data-testid="switch-force-logout-inactive"
                  />
                </div>

                <div className="space-y-2">
                  <Label>Concurrent Session Limit</Label>
                  <select 
                    className="w-full p-2 rounded-md border border-input bg-background"
                    value={localSettings.sessionSettings?.concurrentSessionLimit || 'Unlimited'}
                    onChange={(e) => updateNestedSetting('sessionSettings', 'concurrentSessionLimit', e.target.value)}
                    data-testid="select-concurrent-sessions"
                  >
                    <option value="Unlimited">Unlimited</option>
                    <option value="1 session per user">1 session per user</option>
                    <option value="3 sessions per user">3 sessions per user</option>
                    <option value="5 sessions per user">5 sessions per user</option>
                  </select>
                </div>

                <Button onClick={saveSessionSettings} disabled={updateSettingsMutation.isPending} className="w-full" data-testid="button-save-session-policies">
                  {updateSettingsMutation.isPending && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                  Save Session Policies
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          {/* COMPLIANCE TAB */}
          <TabsContent value="compliance" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="w-5 h-5" /> GDPR Compliance
                </CardTitle>
                <CardDescription>Manage data protection and privacy regulations</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-sm">GDPR Enabled</p>
                    <p className="text-xs text-muted-foreground">Enable GDPR compliance features</p>
                  </div>
                  <Switch 
                    checked={localSettings.compliance?.gdprEnabled ?? true}
                    onCheckedChange={(v) => updateNestedSetting('compliance', 'gdprEnabled', v)}
                    data-testid="switch-gdpr"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Data Retention Period (days)</label>
                  <Input 
                    value={localSettings.compliance?.dataRetentionDays ?? 365}
                    onChange={(e) => updateNestedSetting('compliance', 'dataRetentionDays', parseInt(e.target.value) || 365)}
                    type="number" 
                    className="mt-1"
                    data-testid="input-retention-days"
                  />
                  <p className="text-xs text-muted-foreground mt-1">Automatically delete user data after this period</p>
                </div>
                <div>
                  <label className="text-sm font-medium">Privacy Policy URL</label>
                  <Input 
                    value={localSettings.compliance?.privacyPolicyUrl || ''}
                    onChange={(e) => updateNestedSetting('compliance', 'privacyPolicyUrl', e.target.value)}
                    placeholder="https://example.com/privacy"
                    className="mt-1"
                    data-testid="input-privacy-url"
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-sm">Cookie Consent</p>
                    <p className="text-xs text-muted-foreground">Require explicit cookie consent from users</p>
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
          </TabsContent>

          {/* CSP TAB */}
          <TabsContent value="csp" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Layers className="w-5 h-5" /> Content Security Policy
                </CardTitle>
                <CardDescription>Control resource loading and execution</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-sm">CSP Enabled</p>
                    <p className="text-xs text-muted-foreground">Apply content security policy headers</p>
                  </div>
                  <Switch 
                    checked={localSettings.cspSettings?.enabled ?? true}
                    onCheckedChange={(v) => updateNestedSetting('cspSettings', 'enabled', v)}
                    data-testid="switch-csp-enabled"
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-sm">Strict Mode</p>
                    <p className="text-xs text-muted-foreground">Enforce strict CSP violations</p>
                  </div>
                  <Switch 
                    checked={localSettings.cspSettings?.strictMode ?? false}
                    onCheckedChange={(v) => updateNestedSetting('cspSettings', 'strictMode', v)}
                    data-testid="switch-csp-strict"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Report URI</label>
                  <Input 
                    value={localSettings.cspSettings?.reportUri || ''}
                    onChange={(e) => updateNestedSetting('cspSettings', 'reportUri', e.target.value)}
                    placeholder="https://example.com/csp-report"
                    className="mt-1"
                    data-testid="input-csp-report-uri"
                  />
                  <p className="text-xs text-muted-foreground mt-1">Endpoint to receive CSP violation reports</p>
                </div>
                <Button onClick={saveCSPSettings} disabled={updateSettingsMutation.isPending} className="w-full" data-testid="button-save-csp">
                  {updateSettingsMutation.isPending && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                  Save CSP Settings
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          {/* SCANNER TAB */}
          <TabsContent value="scanner" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Zap className="w-5 h-5" /> Security Scanning
                </CardTitle>
                <CardDescription>Automated security vulnerability scanning</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-sm">Vulnerability Scanning</p>
                    <p className="text-xs text-muted-foreground">Scan for known vulnerabilities</p>
                  </div>
                  <Switch 
                    checked={localSettings.scannerSettings?.vulnerabilityScanEnabled ?? true}
                    onCheckedChange={(v) => updateNestedSetting('scannerSettings', 'vulnerabilityScanEnabled', v)}
                    data-testid="switch-vuln-scan"
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-sm">SSL Certificate Scanning</p>
                    <p className="text-xs text-muted-foreground">Monitor SSL certificate validity</p>
                  </div>
                  <Switch 
                    checked={localSettings.scannerSettings?.sslScanEnabled ?? true}
                    onCheckedChange={(v) => updateNestedSetting('scannerSettings', 'sslScanEnabled', v)}
                    data-testid="switch-ssl-scan"
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-sm">Malware Scanning</p>
                    <p className="text-xs text-muted-foreground">Scan uploaded files for malware</p>
                  </div>
                  <Switch 
                    checked={localSettings.scannerSettings?.malwareScanEnabled ?? true}
                    onCheckedChange={(v) => updateNestedSetting('scannerSettings', 'malwareScanEnabled', v)}
                    data-testid="switch-malware-scan"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Scan Frequency</label>
                  <select 
                    className="w-full p-2 rounded-md border border-input bg-background mt-1"
                    value={localSettings.scannerSettings?.scanFrequency || 'weekly'}
                    onChange={(e) => updateNestedSetting('scannerSettings', 'scanFrequency', e.target.value)}
                    data-testid="select-scan-frequency"
                  >
                    <option value="daily">Daily</option>
                    <option value="weekly">Weekly</option>
                    <option value="monthly">Monthly</option>
                  </select>
                </div>
                <Button onClick={saveScannerSettings} disabled={updateSettingsMutation.isPending} className="w-full" data-testid="button-save-scanner">
                  {updateSettingsMutation.isPending && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                  Save Scanner Settings
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

        </Tabs>
      </div>

      {/* 2FA Setup Modal */}
      <Dialog open={show2FASetup} onOpenChange={setShow2FASetup}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Set up Two-Factor Authentication</DialogTitle>
            <DialogDescription>
              Scan this QR code with your authenticator app (Google Authenticator, Authy, etc.)
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            {qrCode && (
              <div className="flex justify-center p-4 bg-white rounded-lg">
                <img src={qrCode} alt="2FA QR Code" className="w-48 h-48" />
              </div>
            )}
            <div className="space-y-2">
              <Label className="text-sm font-medium">Or enter this code manually:</Label>
              <div className="flex gap-2">
                <Input value={secret} readOnly className="font-mono text-sm" />
                <Button 
                  variant="outline" 
                  size="icon"
                  onClick={copySecret}
                >
                  {secretCopied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                </Button>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button 
              onClick={() => {
                setShow2FASetup(false);
                setShow2FAVerify(true);
              }}
            >
              Continue to Verification
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* 2FA Verify Modal */}
      <Dialog open={show2FAVerify} onOpenChange={setShow2FAVerify}>
        <DialogContent className="sm:max-w-md">
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
          <DialogFooter className="gap-2">
            <Button 
              variant="outline" 
              onClick={() => {
                setShow2FAVerify(false);
                setVerifyCode("");
              }}
            >
              Cancel
            </Button>
            <Button 
              onClick={() => verify2FAMutation.mutate(verifyCode)}
              disabled={verifyCode.length !== 6 || verify2FAMutation.isPending}
            >
              {verify2FAMutation.isPending && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              Verify & Enable
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* 2FA Disable Modal */}
      <Dialog open={show2FADisable} onOpenChange={setShow2FADisable}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Disable Two-Factor Authentication</DialogTitle>
            <DialogDescription>
              Enter your 6-digit code to confirm disabling 2FA
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
          <DialogFooter className="gap-2">
            <Button 
              variant="outline" 
              onClick={() => {
                setShow2FADisable(false);
                setDisableCode("");
              }}
            >
              Cancel
            </Button>
            <Button 
              variant="destructive"
              onClick={() => disable2FAMutation.mutate(disableCode)}
              disabled={disableCode.length !== 6 || disable2FAMutation.isPending}
            >
              {disable2FAMutation.isPending && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              Disable 2FA
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AdminLayout>
  );
}
