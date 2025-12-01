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
  Shield, Key, Lock, Smartphone, Globe, AlertTriangle, Trash2, Filter,
  ShieldAlert, RefreshCw, Eye, EyeOff, Clock, Users,
  Fingerprint, Monitor, LogOut, Ban, CheckCircle, XCircle,
  Server, AlertCircle, Plus, Loader2, FileText, Code, BarChart3, 
  Zap, Activity, Database, Link2, Layers
} from "lucide-react";

interface SecuritySettings {
  twoFactorEnabled?: boolean;
  biometricLogin?: boolean;
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
  deviceFingerprinting?: {
    enabled?: boolean;
    alertOnNewDevice?: boolean;
    blockSuspiciousDevices?: boolean;
  };
  compliance?: {
    gdprEnabled?: boolean;
    dataRetentionDays?: number;
    privacyPolicyUrl?: string;
    cookieConsentEnabled?: boolean;
  };
  apiSecurity?: {
    apiKeyRotationDays?: number;
    oauthEnabled?: boolean;
    webhooksEnabled?: boolean;
    rateLimitPerMin?: number;
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
  action: string;
  userId?: number;
  userName?: string;
  type: string;
  createdAt?: string;
}

export default function AdminSecurityEnhanced() {
  const { toast } = useToast();
  const [newWhitelistIp, setNewWhitelistIp] = useState("");
  const [newBlacklistIp, setNewBlacklistIp] = useState("");
  const [showGoogleSecret, setShowGoogleSecret] = useState(false);
  const [showCloudflareSecret, setShowCloudflareSecret] = useState(false);
  const [showLoginHistory, setShowLoginHistory] = useState(false);

  const { data: settings = {}, isLoading: settingsLoading, refetch: refetchSettings } = useQuery<SecuritySettings>({
    queryKey: ['/api/security/settings'],
  });

  const { data: devices = [], refetch: refetchDevices } = useQuery<TrustedDevice[]>({
    queryKey: ['/api/security/devices'],
  });

  const { data: sessions = [], refetch: refetchSessions } = useQuery<UserSession[]>({
    queryKey: ['/api/security/sessions'],
  });

  const { data: ipRules = [], refetch: refetchIpRules } = useQuery<IpRule[]>({
    queryKey: ['/api/security/ip-rules'],
  });

  const { data: stats } = useQuery<SecurityStats>({
    queryKey: ['/api/security/stats'],
  });

  const { data: loginHistory = [], refetch: refetchLoginHistory } = useQuery<SecurityLog[]>({
    queryKey: ['/api/security/logs'],
  });

  const [localSettings, setLocalSettings] = useState<SecuritySettings>({});

  useEffect(() => {
    if (settings && Object.keys(settings).length > 0) {
      setLocalSettings(settings);
    }
  }, [settings]);

  const updateSettingsMutation = useMutation({
    mutationFn: async (newSettings: SecuritySettings) => {
      return apiRequest('POST', '/api/security/settings/bulk', newSettings);
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
            <TabsTrigger value="api-security" data-testid="tab-api-security">API Security</TabsTrigger>
            <TabsTrigger value="csp" data-testid="tab-csp">CSP</TabsTrigger>
            <TabsTrigger value="scanner" data-testid="tab-scanner">Scanner</TabsTrigger>
            <TabsTrigger value="activity" data-testid="tab-activity">Activity</TabsTrigger>
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
                    checked={localSettings.twoFactorEnabled || false}
                    onCheckedChange={(v) => updateLocalSetting('twoFactorEnabled', v)}
                    data-testid="switch-2fa"
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Fingerprint className="w-5 h-5 text-muted-foreground" />
                    <div>
                      <div className="font-medium">Biometric Login</div>
                      <div className="text-sm text-muted-foreground">Touch ID / Face ID support</div>
                    </div>
                  </div>
                  <Switch 
                    checked={localSettings.biometricLogin || false}
                    onCheckedChange={(v) => updateLocalSetting('biometricLogin', v)}
                    data-testid="switch-biometric"
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
                <Button onClick={saveAllSettings} disabled={updateSettingsMutation.isPending} data-testid="button-save-auth">
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
                  Session
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button 
                  variant="outline" 
                  className="w-full"
                  onClick={() => logoutAllDevicesMutation.mutate()}
                  disabled={logoutAllDevicesMutation.isPending}
                  data-testid="button-logout-all-devices"
                >
                  {logoutAllDevicesMutation.isPending && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                  <LogOut className="w-4 h-4 mr-2" />
                  Logout All Devices
                </Button>
                <Button variant="outline" className="w-full" data-testid="button-view-login-history">
                  View Login History
                </Button>
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

                  <Button className="w-full" onClick={saveAllSettings} disabled={updateSettingsMutation.isPending} data-testid="button-save-captcha">
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
                    <Button className="w-full" onClick={saveAllSettings} disabled={updateSettingsMutation.isPending} data-testid="button-save-coverage">
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
                  <div className="flex gap-2">
                    <Input 
                      placeholder="Add IP address..." 
                      value={newWhitelistIp}
                      onChange={(e) => setNewWhitelistIp(e.target.value)}
                      data-testid="input-whitelist-ip"
                    />
                    <Button 
                      onClick={() => newWhitelistIp && addIpRuleMutation.mutate({ ipAddress: newWhitelistIp, type: 'whitelist' })}
                      disabled={!newWhitelistIp || addIpRuleMutation.isPending}
                      data-testid="button-add-whitelist"
                    >
                      <Plus className="w-4 h-4 mr-1" /> Add
                    </Button>
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
                  <div className="flex gap-2">
                    <Input 
                      placeholder="Add IP to block..." 
                      value={newBlacklistIp}
                      onChange={(e) => setNewBlacklistIp(e.target.value)}
                      data-testid="input-blacklist-ip"
                    />
                    <Button 
                      onClick={() => newBlacklistIp && addIpRuleMutation.mutate({ ipAddress: newBlacklistIp, type: 'blacklist' })}
                      disabled={!newBlacklistIp || addIpRuleMutation.isPending}
                      data-testid="button-add-blacklist"
                    >
                      <Ban className="w-4 h-4 mr-1" /> Block
                    </Button>
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
                <Button onClick={saveAllSettings} disabled={updateSettingsMutation.isPending} data-testid="button-save-rate-limiting">
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
                <Button onClick={saveAllSettings} disabled={updateSettingsMutation.isPending} className="w-full" data-testid="button-save-threat">
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

                <Button onClick={saveAllSettings} disabled={updateSettingsMutation.isPending} className="w-full" data-testid="button-save-session-policies">
                  {updateSettingsMutation.isPending && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                  Save Session Policies
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Fingerprint className="w-5 h-5" /> Device Fingerprinting
                </CardTitle>
                <CardDescription>Identify and track devices for security</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between p-3 border rounded-lg">
                  <div>
                    <p className="font-medium text-sm">Enable Device Fingerprinting</p>
                    <p className="text-xs text-muted-foreground">Track unique device signatures</p>
                  </div>
                  <Switch 
                    checked={localSettings.deviceFingerprinting?.enabled || false}
                    onCheckedChange={(v) => updateNestedSetting('deviceFingerprinting', 'enabled', v)}
                    data-testid="switch-device-fingerprinting"
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-sm">Alert on New Device</p>
                    <p className="text-xs text-muted-foreground">Notify when login from unrecognized device</p>
                  </div>
                  <Switch 
                    checked={localSettings.deviceFingerprinting?.alertOnNewDevice ?? true}
                    onCheckedChange={(v) => updateNestedSetting('deviceFingerprinting', 'alertOnNewDevice', v)}
                    data-testid="switch-alert-new-device"
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-sm">Block Suspicious Devices</p>
                    <p className="text-xs text-muted-foreground">Require verification for flagged devices</p>
                  </div>
                  <Switch 
                    checked={localSettings.deviceFingerprinting?.blockSuspiciousDevices || false}
                    onCheckedChange={(v) => updateNestedSetting('deviceFingerprinting', 'blockSuspiciousDevices', v)}
                    data-testid="switch-block-suspicious"
                  />
                </div>
                <Button onClick={saveAllSettings} disabled={updateSettingsMutation.isPending} className="w-full" data-testid="button-save-fingerprinting">
                  {updateSettingsMutation.isPending && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                  Save Device Settings
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
                <Button onClick={saveAllSettings} disabled={updateSettingsMutation.isPending} className="w-full" data-testid="button-save-compliance">
                  {updateSettingsMutation.isPending && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                  Save Compliance Settings
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          {/* API SECURITY TAB */}
          <TabsContent value="api-security" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Code className="w-5 h-5" /> API Protection
                </CardTitle>
                <CardDescription>Control API access and authentication</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="text-sm font-medium">API Key Rotation (days)</label>
                  <Input 
                    value={localSettings.apiSecurity?.apiKeyRotationDays ?? 90}
                    onChange={(e) => updateNestedSetting('apiSecurity', 'apiKeyRotationDays', parseInt(e.target.value) || 90)}
                    type="number" 
                    className="mt-1"
                    data-testid="input-api-rotation"
                  />
                  <p className="text-xs text-muted-foreground mt-1">Force API key rotation after this period</p>
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-sm">OAuth 2.0</p>
                    <p className="text-xs text-muted-foreground">Enable OAuth authentication</p>
                  </div>
                  <Switch 
                    checked={localSettings.apiSecurity?.oauthEnabled ?? false}
                    onCheckedChange={(v) => updateNestedSetting('apiSecurity', 'oauthEnabled', v)}
                    data-testid="switch-oauth"
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-sm">Webhooks</p>
                    <p className="text-xs text-muted-foreground">Allow outbound webhooks</p>
                  </div>
                  <Switch 
                    checked={localSettings.apiSecurity?.webhooksEnabled ?? true}
                    onCheckedChange={(v) => updateNestedSetting('apiSecurity', 'webhooksEnabled', v)}
                    data-testid="switch-webhooks"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Rate Limit (requests/min)</label>
                  <Input 
                    value={localSettings.apiSecurity?.rateLimitPerMin ?? 60}
                    onChange={(e) => updateNestedSetting('apiSecurity', 'rateLimitPerMin', parseInt(e.target.value) || 60)}
                    type="number" 
                    className="mt-1"
                    data-testid="input-api-rate-limit"
                  />
                </div>
                <Button onClick={saveAllSettings} disabled={updateSettingsMutation.isPending} className="w-full" data-testid="button-save-api-security">
                  {updateSettingsMutation.isPending && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                  Save API Security Settings
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
                <Button onClick={saveAllSettings} disabled={updateSettingsMutation.isPending} className="w-full" data-testid="button-save-csp">
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
                <Button onClick={saveAllSettings} disabled={updateSettingsMutation.isPending} className="w-full" data-testid="button-save-scanner">
                  {updateSettingsMutation.isPending && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                  Save Scanner Settings
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          {/* ACTIVITY TAB */}
          <TabsContent value="activity" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Activity className="w-5 h-5" /> Security Activity
                </CardTitle>
                <CardDescription>Monitor user actions and security events</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="p-3 border rounded-lg bg-blue-500/5">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium text-sm">Last Login Activity</p>
                        <p className="text-xs text-muted-foreground">Security events from last 24 hours</p>
                      </div>
                      <Badge variant="secondary">Active</Badge>
                    </div>
                  </div>
                  <div className="p-3 border rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <p className="text-sm font-medium">Login Attempts</p>
                      <span className="text-lg font-bold">{stats?.byEventType?.find(e => e.type === 'login')?.count || 0}</span>
                    </div>
                    <div className="h-2 bg-muted rounded-full overflow-hidden">
                      <div className="h-full bg-green-500 rounded-full" style={{ width: '60%' }} />
                    </div>
                  </div>
                  <div className="p-3 border rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <p className="text-sm font-medium">Failed Login Attempts</p>
                      <span className="text-lg font-bold">{stats?.byEventType?.find(e => e.type === 'failed_login')?.count || 0}</span>
                    </div>
                    <div className="h-2 bg-muted rounded-full overflow-hidden">
                      <div className="h-full bg-red-500 rounded-full" style={{ width: '15%' }} />
                    </div>
                  </div>
                  <div className="p-3 border rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <p className="text-sm font-medium">Settings Changes</p>
                      <span className="text-lg font-bold">{stats?.byEventType?.find(e => e.type === 'settings_change')?.count || 0}</span>
                    </div>
                    <div className="h-2 bg-muted rounded-full overflow-hidden">
                      <div className="h-full bg-blue-500 rounded-full" style={{ width: '40%' }} />
                    </div>
                  </div>
                </div>
                <Button 
                  onClick={() => setShowLoginHistory(!showLoginHistory)} 
                  className="w-full" 
                  data-testid="button-view-login-history"
                >
                  <FileText className="w-4 h-4 mr-2" /> {showLoginHistory ? 'Hide' : 'View'} Login History
                </Button>
                {showLoginHistory && (
                  <div className="mt-4 space-y-2 max-h-96 overflow-y-auto">
                    <p className="text-sm font-medium">Recent Login Activity</p>
                    {loginHistory.length === 0 ? (
                      <p className="text-xs text-muted-foreground">No login history found</p>
                    ) : (
                      loginHistory.map((log) => (
                        <div key={log.id} className="p-2 text-xs border rounded bg-muted/50">
                          <div className="flex items-center justify-between">
                            <span className="font-medium">{log.userName || 'Unknown User'}</span>
                            <span className="text-muted-foreground">{log.createdAt ? new Date(log.createdAt).toLocaleString() : 'N/A'}</span>
                          </div>
                          <p className="text-muted-foreground">{log.action}</p>
                        </div>
                      ))
                    )}
                  </div>
                )}
                <Button 
                  onClick={() => {
                    refetchLoginHistory();
                    refetchSessions();
                  }} 
                  disabled={false} 
                  className="w-full" 
                  data-testid="button-refresh-activity"
                >
                  <RefreshCw className="w-4 h-4 mr-2" /> Refresh Activity Log
                </Button>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </AdminLayout>
  );
}
