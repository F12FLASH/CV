import { AdminLayout } from "@/layouts/AdminLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { 
  Shield, Key, Lock, Smartphone, Globe, AlertTriangle, Download, Trash2, Filter,
  ShieldAlert, FileCheck, FileWarning, RefreshCw, Eye, EyeOff, Clock, Users,
  Fingerprint, Monitor, LogOut, Ban, CheckCircle, XCircle, FileText, Scale,
  Database, Timer, Zap, Code, Server, AlertCircle
} from "lucide-react";

export default function AdminSecurityEnhanced() {
  return (
    <AdminLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-heading font-bold">Security Center</h1>
          <p className="text-muted-foreground">Monitor and configure security settings</p>
        </div>

        {/* Status Cards */}
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
                  <p className="text-xs text-muted-foreground">Failed Logins (24h)</p>
                  <p className="font-bold">3 attempts</p>
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
                  <p className="font-bold">2 devices</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="border-blue-500/50 bg-blue-500/5">
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <Shield className="w-6 h-6 text-blue-500" />
                <div>
                  <p className="text-xs text-muted-foreground">Last Scan</p>
                  <p className="font-bold text-sm">2 days ago</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="authentication" className="space-y-6">
          <TabsList className="flex flex-wrap gap-1 h-auto p-1">
            <TabsTrigger value="authentication">Authentication</TabsTrigger>
            <TabsTrigger value="recaptcha">Recaptcha</TabsTrigger>
            <TabsTrigger value="firewall">Firewall</TabsTrigger>
            <TabsTrigger value="threat">Threat Protection</TabsTrigger>
            <TabsTrigger value="compliance">Compliance</TabsTrigger>
            <TabsTrigger value="api-security">API Security</TabsTrigger>
            <TabsTrigger value="csp">CSP</TabsTrigger>
            <TabsTrigger value="sessions">Sessions</TabsTrigger>
            <TabsTrigger value="scanner">Scanner</TabsTrigger>
            <TabsTrigger value="activity">Activity</TabsTrigger>
          </TabsList>

          {/* AUTHENTICATION */}
          <TabsContent value="authentication" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Authentication Methods</CardTitle>
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
                  <Switch />
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Key className="w-5 h-5 text-muted-foreground" />
                    <div>
                      <div className="font-medium">Biometric Login</div>
                      <div className="text-sm text-muted-foreground">Touch ID / Face ID support</div>
                    </div>
                  </div>
                  <Switch />
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Lock className="w-5 h-5 text-muted-foreground" />
                    <div>
                      <div className="font-medium">Password Expiration</div>
                      <div className="text-sm text-muted-foreground">Force reset every 90 days</div>
                    </div>
                  </div>
                  <Switch defaultChecked />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Trusted Devices</CardTitle>
                <CardDescription>Manage devices that can skip 2FA</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {[
                  { name: "MacBook Pro (Home)", ip: "192.168.1.1", date: "2 weeks ago", trusted: true },
                  { name: "iPhone 14", ip: "203.0.113.45", date: "3 days ago", trusted: true },
                  { name: "Dell Laptop (Office)", ip: "10.0.0.50", date: "Yesterday", trusted: false },
                ].map((device, i) => (
                  <div key={i} className="flex items-center justify-between p-3 border rounded-lg">
                    <div>
                      <p className="font-medium text-sm">{device.name}</p>
                      <p className="text-xs text-muted-foreground">{device.ip} • {device.date}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      {device.trusted && <Badge variant="secondary">Trusted</Badge>}
                      <Button variant="ghost" size="sm" className="text-destructive">
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Password & Session</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button variant="outline" className="w-full">Change Master Password</Button>
                <Button variant="outline" className="w-full">Logout All Devices</Button>
                <Button variant="outline" className="w-full">View Login History</Button>
              </CardContent>
            </Card>
          </TabsContent>

          {/* RECAPTCHA */}
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
                    <div className="p-4 border rounded-lg space-y-3">
                      <label className="flex items-center gap-3 cursor-pointer">
                        <input 
                          type="radio" 
                          name="captcha" 
                          value="disabled"
                          className="w-4 h-4 text-primary"
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

                    <div className="p-4 border rounded-lg space-y-3 border-primary/50 bg-primary/5">
                      <label className="flex items-center gap-3 cursor-pointer">
                        <input 
                          type="radio" 
                          name="captcha" 
                          value="local"
                          defaultChecked
                          className="w-4 h-4 text-primary"
                        />
                        <div className="flex-1">
                          <div className="font-medium text-sm flex items-center gap-2">
                            <Server className="w-4 h-4 text-muted-foreground" />
                            Local Verification
                            <Badge variant="secondary" className="text-[10px]">Active</Badge>
                          </div>
                          <div className="text-xs text-muted-foreground">Server-side honeypot + rate limiting</div>
                        </div>
                      </label>
                      <div className="ml-7 space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-xs">Honeypot Fields</span>
                          <Switch defaultChecked />
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-xs">Time-based Validation</span>
                          <Switch defaultChecked />
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-xs">IP Rate Limiting</span>
                          <Switch defaultChecked />
                        </div>
                      </div>
                    </div>

                    <div className="p-4 border rounded-lg space-y-3">
                      <label className="flex items-center gap-3 cursor-pointer">
                        <input 
                          type="radio" 
                          name="captcha" 
                          value="google"
                          className="w-4 h-4 text-primary"
                        />
                        <div className="flex-1">
                          <div className="font-medium text-sm flex items-center gap-2">
                            <Globe className="w-4 h-4 text-muted-foreground" />
                            Google reCAPTCHA v3
                          </div>
                          <div className="text-xs text-muted-foreground">Invisible, score-based protection</div>
                        </div>
                      </label>
                      <div className="ml-7 space-y-3 pt-2">
                        <div className="space-y-1">
                          <Label className="text-xs">Site Key</Label>
                          <Input placeholder="Enter Google reCAPTCHA site key" className="text-sm" />
                        </div>
                        <div className="space-y-1">
                          <Label className="text-xs">Secret Key</Label>
                          <div className="relative">
                            <Input type="password" placeholder="Enter secret key" className="text-sm pr-10" />
                            <Button variant="ghost" size="icon" className="absolute right-0 top-0 h-full">
                              <Eye className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                        <div className="space-y-1">
                          <Label className="text-xs">Minimum Score (0.0 - 1.0)</Label>
                          <Input type="number" defaultValue="0.5" step="0.1" min="0" max="1" className="text-sm" />
                        </div>
                      </div>
                    </div>

                    <div className="p-4 border rounded-lg space-y-3">
                      <label className="flex items-center gap-3 cursor-pointer">
                        <input 
                          type="radio" 
                          name="captcha" 
                          value="cloudflare"
                          className="w-4 h-4 text-primary"
                        />
                        <div className="flex-1">
                          <div className="font-medium text-sm flex items-center gap-2">
                            <Shield className="w-4 h-4 text-muted-foreground" />
                            Cloudflare Turnstile
                          </div>
                          <div className="text-xs text-muted-foreground">Privacy-friendly, works with adblockers</div>
                        </div>
                      </label>
                      <div className="ml-7 space-y-3 pt-2">
                        <div className="space-y-1">
                          <Label className="text-xs">Site Key</Label>
                          <Input placeholder="Enter Cloudflare site key" className="text-sm" />
                        </div>
                        <div className="space-y-1">
                          <Label className="text-xs">Secret Key</Label>
                          <div className="relative">
                            <Input type="password" placeholder="Enter secret key" className="text-sm pr-10" />
                            <Button variant="ghost" size="icon" className="absolute right-0 top-0 h-full">
                              <Eye className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Switch id="turnstile-managed" />
                          <Label htmlFor="turnstile-managed" className="text-xs">Managed Challenge Mode</Label>
                        </div>
                      </div>
                    </div>
                  </div>

                  <Button className="w-full">Save Captcha Settings</Button>
                </CardContent>
              </Card>

              <div className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Zap className="w-5 h-5" />
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
                      <Switch defaultChecked />
                    </div>
                    <div className="flex items-center justify-between p-3 border rounded-lg">
                      <div>
                        <p className="font-medium text-sm">Contact Form</p>
                        <p className="text-xs text-muted-foreground">Public contact form</p>
                      </div>
                      <Switch defaultChecked />
                    </div>
                    <div className="flex items-center justify-between p-3 border rounded-lg">
                      <div>
                        <p className="font-medium text-sm">Newsletter Signup</p>
                        <p className="text-xs text-muted-foreground">Email subscription form</p>
                      </div>
                      <Switch defaultChecked />
                    </div>
                    <div className="flex items-center justify-between p-3 border rounded-lg">
                      <div>
                        <p className="font-medium text-sm">Comment Forms</p>
                        <p className="text-xs text-muted-foreground">Blog post comments</p>
                      </div>
                      <Switch defaultChecked />
                    </div>
                    <div className="flex items-center justify-between p-3 border rounded-lg">
                      <div>
                        <p className="font-medium text-sm">Registration Form</p>
                        <p className="text-xs text-muted-foreground">User registration (if enabled)</p>
                      </div>
                      <Switch />
                    </div>
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
                        <p className="text-2xl font-bold text-green-500">1,247</p>
                        <p className="text-xs text-muted-foreground">Legitimate Submissions</p>
                      </div>
                      <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg">
                        <p className="text-2xl font-bold text-red-500">89</p>
                        <p className="text-xs text-muted-foreground">Blocked Bots</p>
                      </div>
                    </div>
                    <div className="p-3 bg-muted/50 rounded-lg">
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-xs text-muted-foreground">Protection Rate</span>
                        <span className="text-sm font-medium">93.3%</span>
                      </div>
                      <div className="h-2 bg-muted rounded-full overflow-hidden">
                        <div className="h-full bg-green-500 rounded-full" style={{ width: "93.3%" }} />
                      </div>
                    </div>
                    <Button variant="outline" className="w-full">View Detailed Report</Button>
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>

          {/* FIREWALL */}
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
                    {["192.168.1.1", "203.0.113.45"].map((ip, i) => (
                      <div key={i} className="flex items-center justify-between p-2 border rounded bg-green-500/5 border-green-500/20">
                        <span className="text-sm">{ip}</span>
                        <Button variant="ghost" size="sm" className="text-destructive">
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                  <div className="flex gap-2">
                    <Input placeholder="Add IP address..." />
                    <Button>Add</Button>
                  </div>
                </div>

                <div className="border-t pt-4">
                  <h4 className="font-medium mb-2">IP Blacklist (Block these IPs)</h4>
                  <div className="space-y-2 mb-3">
                    {["14.23.55.12"].map((ip, i) => (
                      <div key={i} className="flex items-center justify-between p-2 border rounded bg-red-500/5 border-red-500/20">
                        <span className="text-sm">{ip}</span>
                        <Button variant="ghost" size="sm" className="text-destructive">
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                  <div className="flex gap-2">
                    <Input placeholder="Add IP to block..." />
                    <Button>Block</Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Rate Limiting</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <label className="text-sm font-medium">Login Attempts Limit</label>
                  <Input defaultValue="5" type="number" className="mt-1" />
                  <p className="text-xs text-muted-foreground mt-1">Max attempts before lockout</p>
                </div>
                <div>
                  <label className="text-sm font-medium">API Rate Limit</label>
                  <Input defaultValue="1000" type="number" className="mt-1" />
                  <p className="text-xs text-muted-foreground mt-1">Requests per hour per IP</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* ADVANCED THREAT PROTECTION */}
          <TabsContent value="threat" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <ShieldAlert className="w-5 h-5" /> DDoS Protection
                </CardTitle>
                <CardDescription>Protect against distributed denial-of-service attacks</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between p-3 border rounded-lg bg-green-500/5 border-green-500/20">
                  <div>
                    <p className="font-medium text-sm">DDoS Protection</p>
                    <p className="text-xs text-muted-foreground">Automatic traffic analysis and filtering</p>
                  </div>
                  <Switch defaultChecked />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Max Requests/Second</Label>
                    <Input type="number" defaultValue="100" />
                  </div>
                  <div className="space-y-2">
                    <Label>Burst Limit</Label>
                    <Input type="number" defaultValue="500" />
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-sm">Challenge Mode</p>
                    <p className="text-xs text-muted-foreground">Show CAPTCHA for suspicious traffic</p>
                  </div>
                  <Switch />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Database className="w-5 h-5" /> SQL Injection Detection
                </CardTitle>
                <CardDescription>Block malicious SQL queries</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between p-3 border rounded-lg">
                  <div>
                    <p className="font-medium text-sm">Enable SQL Injection Protection</p>
                    <p className="text-xs text-muted-foreground">Automatically detect and block SQL injection attempts</p>
                  </div>
                  <Switch defaultChecked />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-sm">Log Blocked Attempts</p>
                    <p className="text-xs text-muted-foreground">Record all blocked injection attempts</p>
                  </div>
                  <Switch defaultChecked />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-sm">Auto-ban Repeat Offenders</p>
                    <p className="text-xs text-muted-foreground">Block IPs after 3 injection attempts</p>
                  </div>
                  <Switch defaultChecked />
                </div>
                <div className="p-3 bg-muted rounded-lg">
                  <p className="text-xs text-muted-foreground mb-1">Blocked this month</p>
                  <p className="text-2xl font-bold text-red-500">127 attempts</p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Code className="w-5 h-5" /> XSS Protection
                </CardTitle>
                <CardDescription>Prevent cross-site scripting attacks</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between p-3 border rounded-lg">
                  <div>
                    <p className="font-medium text-sm">Enable XSS Protection</p>
                    <p className="text-xs text-muted-foreground">Filter malicious scripts from user input</p>
                  </div>
                  <Switch defaultChecked />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-sm">Strict Mode</p>
                    <p className="text-xs text-muted-foreground">Block all inline scripts (may affect functionality)</p>
                  </div>
                  <Switch />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-sm">HTML Sanitization</p>
                    <p className="text-xs text-muted-foreground">Clean HTML in user-submitted content</p>
                  </div>
                  <Switch defaultChecked />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* COMPLIANCE & AUDIT */}
          <TabsContent value="compliance" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Scale className="w-5 h-5" /> GDPR Compliance
                </CardTitle>
                <CardDescription>European data protection regulation compliance</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  {[
                    { label: "Cookie Consent", status: "Active", color: "green" },
                    { label: "Privacy Policy", status: "Updated", color: "green" },
                    { label: "Data Export", status: "Available", color: "green" },
                    { label: "Right to Erasure", status: "Enabled", color: "green" },
                  ].map((item, i) => (
                    <div key={i} className="flex items-center justify-between p-3 border rounded-lg">
                      <span className="text-sm">{item.label}</span>
                      <Badge variant="outline" className={`text-${item.color}-500 border-${item.color}-500/50`}>
                        {item.status}
                      </Badge>
                    </div>
                  ))}
                </div>

                <Separator />

                <div className="space-y-3">
                  <h4 className="font-medium text-sm">GDPR Tools</h4>
                  <Button variant="outline" className="w-full justify-start">
                    <Download className="w-4 h-4 mr-2" /> Export User Data (Subject Access Request)
                  </Button>
                  <Button variant="outline" className="w-full justify-start">
                    <Trash2 className="w-4 h-4 mr-2" /> Process Erasure Request
                  </Button>
                  <Button variant="outline" className="w-full justify-start">
                    <FileText className="w-4 h-4 mr-2" /> Generate Privacy Report
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Timer className="w-5 h-5" /> Data Retention Policies
                </CardTitle>
                <CardDescription>Configure how long data is kept</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>User Activity Logs</Label>
                    <select className="w-full p-2 rounded-md border border-input bg-background">
                      <option>30 days</option>
                      <option>90 days</option>
                      <option>1 year</option>
                      <option>Forever</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <Label>Security Logs</Label>
                    <select className="w-full p-2 rounded-md border border-input bg-background">
                      <option>90 days</option>
                      <option>1 year</option>
                      <option>2 years</option>
                      <option>Forever</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <Label>Analytics Data</Label>
                    <select className="w-full p-2 rounded-md border border-input bg-background">
                      <option>1 year</option>
                      <option>2 years</option>
                      <option>5 years</option>
                      <option>Forever</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <Label>Deleted User Data</Label>
                    <select className="w-full p-2 rounded-md border border-input bg-background">
                      <option>Immediately</option>
                      <option>30 days</option>
                      <option>90 days</option>
                    </select>
                  </div>
                </div>

                <div className="flex items-center justify-between p-3 border rounded-lg">
                  <div>
                    <p className="font-medium text-sm">Auto-purge Expired Data</p>
                    <p className="text-xs text-muted-foreground">Automatically delete data past retention period</p>
                  </div>
                  <Switch defaultChecked />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileCheck className="w-5 h-5" /> Audit Trail
                </CardTitle>
                <CardDescription>Complete record of system changes</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex gap-2">
                  <Button variant="outline" className="flex-1">
                    <Download className="w-4 h-4 mr-2" /> Export Audit Log (CSV)
                  </Button>
                  <Button variant="outline" className="flex-1">
                    <Download className="w-4 h-4 mr-2" /> Export Audit Log (JSON)
                  </Button>
                </div>

                <div className="space-y-2">
                  {[
                    { action: "Settings changed by Admin", time: "2 hours ago", type: "info" },
                    { action: "New user created: john@example.com", time: "Yesterday", type: "success" },
                    { action: "Post deleted: 'Old Article'", time: "2 days ago", type: "warning" },
                    { action: "Backup created", time: "3 days ago", type: "info" },
                  ].map((log, i) => (
                    <div key={i} className="flex items-center gap-3 p-2 border rounded text-sm">
                      {log.type === "success" && <CheckCircle className="w-4 h-4 text-green-500" />}
                      {log.type === "warning" && <AlertTriangle className="w-4 h-4 text-yellow-500" />}
                      {log.type === "info" && <AlertCircle className="w-4 h-4 text-blue-500" />}
                      <span className="flex-1">{log.action}</span>
                      <span className="text-xs text-muted-foreground">{log.time}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* API SECURITY */}
          <TabsContent value="api-security" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Key className="w-5 h-5" /> JWT Token Management
                </CardTitle>
                <CardDescription>Configure JSON Web Token settings</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Access Token Expiry</Label>
                    <select className="w-full p-2 rounded-md border border-input bg-background">
                      <option>15 minutes</option>
                      <option>1 hour</option>
                      <option>24 hours</option>
                      <option>7 days</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <Label>Refresh Token Expiry</Label>
                    <select className="w-full p-2 rounded-md border border-input bg-background">
                      <option>7 days</option>
                      <option>30 days</option>
                      <option>90 days</option>
                    </select>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>JWT Secret Key</Label>
                  <div className="flex gap-2">
                    <Input type="password" defaultValue="••••••••••••••••••••••••" />
                    <Button variant="outline">
                      <RefreshCw className="w-4 h-4" />
                    </Button>
                  </div>
                  <p className="text-xs text-muted-foreground">Regenerating will invalidate all existing tokens</p>
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-sm">Require Token Refresh</p>
                    <p className="text-xs text-muted-foreground">Force token refresh on sensitive actions</p>
                  </div>
                  <Switch defaultChecked />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <RefreshCw className="w-5 h-5" /> API Key Rotation
                </CardTitle>
                <CardDescription>Automatic key rotation policies</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between p-3 border rounded-lg">
                  <div>
                    <p className="font-medium text-sm">Enable Auto-rotation</p>
                    <p className="text-xs text-muted-foreground">Automatically rotate API keys periodically</p>
                  </div>
                  <Switch />
                </div>
                <div className="space-y-2">
                  <Label>Rotation Interval</Label>
                  <select className="w-full p-2 rounded-md border border-input bg-background">
                    <option>Weekly</option>
                    <option>Monthly</option>
                    <option>Quarterly</option>
                    <option>Yearly</option>
                  </select>
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-sm">Notify on Rotation</p>
                    <p className="text-xs text-muted-foreground">Send email when keys are rotated</p>
                  </div>
                  <Switch defaultChecked />
                </div>
                <Button className="w-full">Rotate All Keys Now</Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Server className="w-5 h-5" /> OAuth Configuration
                </CardTitle>
                <CardDescription>Configure OAuth 2.0 providers</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {[
                  { name: "Google", status: "Connected", icon: "🔗" },
                  { name: "GitHub", status: "Connected", icon: "🔗" },
                  { name: "Discord", status: "Not Connected", icon: "⚡" },
                  { name: "Twitter", status: "Not Connected", icon: "🐦" },
                ].map((provider, i) => (
                  <div key={i} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <span className="text-xl">{provider.icon}</span>
                      <div>
                        <p className="font-medium text-sm">{provider.name}</p>
                        <p className="text-xs text-muted-foreground">{provider.status}</p>
                      </div>
                    </div>
                    <Button variant="outline" size="sm">
                      {provider.status === "Connected" ? "Configure" : "Connect"}
                    </Button>
                  </div>
                ))}
              </CardContent>
            </Card>
          </TabsContent>

          {/* CONTENT SECURITY POLICY */}
          <TabsContent value="csp" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="w-5 h-5" /> Content Security Policy (CSP)
                </CardTitle>
                <CardDescription>Control which resources can be loaded</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between p-3 border rounded-lg bg-blue-500/5 border-blue-500/20">
                  <div>
                    <p className="font-medium text-sm">Enable CSP Headers</p>
                    <p className="text-xs text-muted-foreground">Add Content-Security-Policy headers to responses</p>
                  </div>
                  <Switch defaultChecked />
                </div>

                <div className="space-y-2">
                  <Label>CSP Mode</Label>
                  <select className="w-full p-2 rounded-md border border-input bg-background">
                    <option>Report Only (Testing)</option>
                    <option>Enforce (Production)</option>
                  </select>
                </div>

                <Separator />

                <div className="space-y-3">
                  <h4 className="font-medium text-sm">Policy Directives</h4>
                  {[
                    { directive: "default-src", value: "'self'" },
                    { directive: "script-src", value: "'self' 'unsafe-inline' https://cdn.example.com" },
                    { directive: "style-src", value: "'self' 'unsafe-inline' https://fonts.googleapis.com" },
                    { directive: "img-src", value: "'self' data: https:" },
                    { directive: "font-src", value: "'self' https://fonts.gstatic.com" },
                    { directive: "connect-src", value: "'self' https://api.example.com" },
                  ].map((item, i) => (
                    <div key={i} className="grid grid-cols-3 gap-2">
                      <code className="text-xs bg-muted px-2 py-2 rounded">{item.directive}</code>
                      <Input defaultValue={item.value} className="col-span-2 font-mono text-xs" />
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Trusted Domains</CardTitle>
                <CardDescription>Manage allowed external domains</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <h4 className="font-medium text-sm">Whitelisted Domains</h4>
                  {[
                    "fonts.googleapis.com",
                    "fonts.gstatic.com",
                    "cdn.jsdelivr.net",
                    "api.stripe.com",
                  ].map((domain, i) => (
                    <div key={i} className="flex items-center justify-between p-2 border rounded">
                      <span className="text-sm font-mono">{domain}</span>
                      <Button variant="ghost" size="sm" className="text-destructive">
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  ))}
                </div>
                <div className="flex gap-2">
                  <Input placeholder="Add trusted domain..." />
                  <Button>Add</Button>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>CSP Violation Reports</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="p-4 bg-muted rounded-lg text-center">
                  <p className="text-2xl font-bold">12</p>
                  <p className="text-xs text-muted-foreground">Violations this week</p>
                </div>
                {[
                  { blocked: "https://malicious-script.com/tracker.js", directive: "script-src", time: "2 hours ago" },
                  { blocked: "inline script on /contact", directive: "script-src", time: "Yesterday" },
                ].map((report, i) => (
                  <div key={i} className="p-3 border rounded-lg">
                    <div className="flex items-center gap-2 mb-1">
                      <XCircle className="w-4 h-4 text-red-500" />
                      <span className="text-sm font-medium">Blocked by {report.directive}</span>
                    </div>
                    <p className="text-xs text-muted-foreground font-mono truncate">{report.blocked}</p>
                    <p className="text-xs text-muted-foreground mt-1">{report.time}</p>
                  </div>
                ))}
              </CardContent>
            </Card>
          </TabsContent>

          {/* SESSION MANAGEMENT */}
          <TabsContent value="sessions" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="w-5 h-5" /> Active Sessions
                </CardTitle>
                <CardDescription>Monitor and manage user sessions</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-3 gap-4">
                  <div className="p-4 border rounded-lg text-center">
                    <p className="text-2xl font-bold text-green-500">24</p>
                    <p className="text-xs text-muted-foreground">Active Now</p>
                  </div>
                  <div className="p-4 border rounded-lg text-center">
                    <p className="text-2xl font-bold text-yellow-500">5</p>
                    <p className="text-xs text-muted-foreground">Idle</p>
                  </div>
                  <div className="p-4 border rounded-lg text-center">
                    <p className="text-2xl font-bold">156</p>
                    <p className="text-xs text-muted-foreground">Total Today</p>
                  </div>
                </div>

                <div className="space-y-2">
                  {[
                    { user: "admin@loideveloper.com", device: "Chrome / MacOS", ip: "192.168.1.1", status: "Active", time: "Now" },
                    { user: "admin@loideveloper.com", device: "Safari / iOS", ip: "203.0.113.45", status: "Active", time: "5 mins ago" },
                    { user: "editor@example.com", device: "Firefox / Windows", ip: "10.0.0.50", status: "Idle", time: "30 mins ago" },
                  ].map((session, i) => (
                    <div key={i} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center gap-3">
                        <Monitor className="w-5 h-5 text-muted-foreground" />
                        <div>
                          <p className="font-medium text-sm">{session.user}</p>
                          <p className="text-xs text-muted-foreground">{session.device} • {session.ip}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant={session.status === "Active" ? "default" : "secondary"}>
                          {session.status}
                        </Badge>
                        <Button variant="ghost" size="sm" className="text-destructive">
                          <LogOut className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>

                <Button variant="destructive" className="w-full">
                  <LogOut className="w-4 h-4 mr-2" /> Force Logout All Users
                </Button>
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
                    <select className="w-full p-2 rounded-md border border-input bg-background">
                      <option>15 minutes</option>
                      <option>30 minutes</option>
                      <option>1 hour</option>
                      <option>4 hours</option>
                      <option>Never</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <Label>Max Session Duration</Label>
                    <select className="w-full p-2 rounded-md border border-input bg-background">
                      <option>8 hours</option>
                      <option>24 hours</option>
                      <option>7 days</option>
                      <option>30 days</option>
                    </select>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-sm">Force Logout Inactive Users</p>
                    <p className="text-xs text-muted-foreground">Auto-logout users after idle timeout</p>
                  </div>
                  <Switch defaultChecked />
                </div>

                <div className="space-y-2">
                  <Label>Concurrent Session Limit</Label>
                  <select className="w-full p-2 rounded-md border border-input bg-background">
                    <option>Unlimited</option>
                    <option>1 session per user</option>
                    <option>3 sessions per user</option>
                    <option>5 sessions per user</option>
                  </select>
                </div>
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
                  <Switch />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-sm">Alert on New Device</p>
                    <p className="text-xs text-muted-foreground">Notify when login from unrecognized device</p>
                  </div>
                  <Switch defaultChecked />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-sm">Block Suspicious Devices</p>
                    <p className="text-xs text-muted-foreground">Require verification for flagged devices</p>
                  </div>
                  <Switch />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* VULNERABILITY SCANNER */}
          <TabsContent value="scanner" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Vulnerability Scanner</CardTitle>
                <CardDescription>Automated security scanning for threats and vulnerabilities</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="p-4 bg-blue-500/5 border border-blue-500/20 rounded-lg">
                  <p className="font-medium text-sm mb-2">Last Scan: 2 days ago</p>
                  <p className="text-xs text-muted-foreground mb-3">Status: All clear ✓</p>
                  <Button>Run Scan Now</Button>
                </div>

                <div>
                  <h4 className="font-medium text-sm mb-3">Scan History</h4>
                  <div className="space-y-2">
                    {[
                      { date: "2 days ago", issues: 0, status: "Clean" },
                      { date: "9 days ago", issues: 2, status: "Fixed" },
                      { date: "16 days ago", issues: 1, status: "Fixed" },
                    ].map((scan, i) => (
                      <div key={i} className="flex items-center justify-between p-2 border rounded text-sm">
                        <span>{scan.date}</span>
                        <Badge variant={scan.status === "Clean" ? "default" : "secondary"}>
                          {scan.issues > 0 ? `${scan.issues} issues` : "Clean"}
                        </Badge>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <h4 className="font-medium text-sm mb-2">Scan Settings</h4>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <label className="text-sm">Auto-scan Schedule</label>
                      <select className="p-1 rounded border bg-background text-sm">
                        <option>Weekly</option>
                        <option>Daily</option>
                        <option>Monthly</option>
                      </select>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* ACTIVITY LOG */}
          <TabsContent value="activity" className="space-y-4">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Security Activity Log</CardTitle>
                  <Button variant="outline" size="sm" className="gap-1">
                    <Filter className="w-4 h-4" /> Filter
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                {[
                  { action: "Login Success", ip: "192.168.1.1", location: "Ho Chi Minh, VN", time: "Just now", type: "success" },
                  { action: "Settings Updated", ip: "192.168.1.1", location: "Ho Chi Minh, VN", time: "2 hours ago", type: "info" },
                  { action: "Failed Login Attempt", ip: "14.23.55.12", location: "Hanoi, VN", time: "5 hours ago", type: "warning" },
                  { action: "Backup Created", ip: "System", location: "Server", time: "Yesterday", type: "success" },
                  { action: "Security Scan Completed", ip: "System", location: "Server", time: "2 days ago", type: "info" },
                ].map((log, i) => (
                  <div key={i} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className={`w-2 h-2 rounded-full ${
                        log.type === "success" ? "bg-green-500" : 
                        log.type === "warning" ? "bg-yellow-500" : 
                        "bg-blue-500"
                      }`} />
                      <div>
                        <p className="font-medium text-sm">{log.action}</p>
                        <p className="text-xs text-muted-foreground">{log.ip} • {log.location}</p>
                      </div>
                    </div>
                    <span className="text-xs text-muted-foreground">{log.time}</span>
                  </div>
                ))}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Export & Audit</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <Button variant="outline" className="w-full">Download Logs (CSV)</Button>
                <Button variant="outline" className="w-full">Download Logs (JSON)</Button>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </AdminLayout>
  );
}
