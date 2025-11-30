import { AdminLayout } from "@/layouts/AdminLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { 
  Save, Upload, Mail, Database, Zap, Key, Plug, Bell, Webhook, Code2, Palette, 
  FileText, AlertCircle, CheckCircle, Clock, Globe, DollarSign, Hash, Languages,
  HardDrive, RefreshCw, Download, Trash2, Terminal, Bug, Gauge, Server
} from "lucide-react";
import { useState } from "react";
import { SettingsPerformance } from "./SettingsPerformance";
import { SettingsIntegrations } from "./SettingsIntegrations";

export default function AdminSettingsEnhanced() {
  const [logoFile, setLogoFile] = useState<string | null>(null);

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-heading font-bold">Settings</h1>
            <p className="text-muted-foreground">Manage your website configuration</p>
          </div>
          <Button className="bg-primary hover:bg-primary/90">
            <Save className="w-4 h-4 mr-2" /> Save Changes
          </Button>
        </div>

        <Tabs defaultValue="general" className="space-y-6">
          <TabsList className="flex flex-wrap gap-1 h-auto p-1">
            <TabsTrigger value="general">General</TabsTrigger>
            <TabsTrigger value="branding">Branding</TabsTrigger>
            <TabsTrigger value="seo">SEO</TabsTrigger>
            <TabsTrigger value="email">Email</TabsTrigger>
            <TabsTrigger value="storage">Storage</TabsTrigger>
            <TabsTrigger value="performance">Performance</TabsTrigger>
            <TabsTrigger value="integrations">Integrations</TabsTrigger>
            <TabsTrigger value="notifications">Notifications</TabsTrigger>
            <TabsTrigger value="webhooks">Webhooks</TabsTrigger>
            <TabsTrigger value="developer">Developer</TabsTrigger>
            <TabsTrigger value="localization">Localization</TabsTrigger>
            <TabsTrigger value="theme">Theme</TabsTrigger>
            <TabsTrigger value="database">Database</TabsTrigger>
            <TabsTrigger value="logging">Logging</TabsTrigger>
          </TabsList>

          {/* GENERAL TAB */}
          <TabsContent value="general" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Site Information</CardTitle>
                <CardDescription>Basic information about your portfolio website.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>Site Title</Label>
                  <Input defaultValue="Loi Developer - Full-stack Creative" />
                </div>
                <div className="space-y-2">
                  <Label>Tagline</Label>
                  <Input defaultValue="Building digital experiences with code." />
                </div>
                <div className="space-y-2">
                  <Label>Contact Email</Label>
                  <Input type="email" defaultValue="loideveloper@example.com" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Maintenance Mode</CardTitle>
                <CardDescription>Temporarily disable access to the public site.</CardDescription>
              </CardHeader>
              <CardContent className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Enable Maintenance Mode</Label>
                  <p className="text-sm text-muted-foreground">Visitors will see a "Coming Soon" page.</p>
                </div>
                <Switch />
              </CardContent>
            </Card>
          </TabsContent>

          {/* BRANDING TAB */}
          <TabsContent value="branding" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Logo & Favicon</CardTitle>
                <CardDescription>Upload your site logo and favicon.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-3">
                  <Label>Site Logo</Label>
                  <div className="border-2 border-dashed rounded-lg p-6 flex flex-col items-center justify-center">
                    <Upload className="w-8 h-8 text-muted-foreground mb-2" />
                    <p className="text-sm font-medium">Drop image or click to upload</p>
                    <p className="text-xs text-muted-foreground">PNG, SVG, JPG (Max 2MB)</p>
                  </div>
                </div>
                <Separator />
                <div className="space-y-3">
                  <Label>Favicon</Label>
                  <div className="flex gap-2">
                    <div className="w-16 h-16 rounded-lg border border-border flex items-center justify-center bg-muted">
                      <span className="text-2xl">🚀</span>
                    </div>
                    <Button variant="outline">Change Favicon</Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* SEO TAB */}
          <TabsContent value="seo" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>SEO Configuration</CardTitle>
                <CardDescription>Optimize your site for search engines.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>Meta Description (Default)</Label>
                  <Input placeholder="Describe your website..." defaultValue="Full-stack Developer & Creative Coder" />
                </div>
                <div className="space-y-2">
                  <Label>Default Keywords</Label>
                  <Input placeholder="web development, full-stack, react, node.js" />
                </div>
                <div className="space-y-2">
                  <Label>Google Analytics ID</Label>
                  <Input placeholder="UA-XXXXXXXXX-X" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Open Graph & Twitter Cards</CardTitle>
                <CardDescription>Control how your site appears on social media.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>Open Graph Image URL</Label>
                  <Input placeholder="https://example.com/og-image.png" />
                </div>
                <div className="space-y-2">
                  <Label>Twitter Card Type</Label>
                  <select className="w-full p-2 rounded-md border border-input bg-background">
                    <option>summary_large_image</option>
                    <option>summary</option>
                    <option>app</option>
                  </select>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Robots.txt & Sitemap</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <Button variant="outline" className="w-full justify-start">Edit robots.txt</Button>
                <Button variant="outline" className="w-full justify-start">Regenerate Sitemap</Button>
              </CardContent>
            </Card>
          </TabsContent>

          {/* EMAIL TAB */}
          <TabsContent value="email" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Mail className="w-5 h-5" /> SMTP Configuration
                </CardTitle>
                <CardDescription>Configure email settings for notifications and newsletters.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>SMTP Host</Label>
                  <Input placeholder="smtp.gmail.com" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>SMTP Port</Label>
                    <Input placeholder="587" />
                  </div>
                  <div className="space-y-2">
                    <Label>SMTP User</Label>
                    <Input placeholder="your-email@gmail.com" />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>SMTP Password</Label>
                  <Input type="password" placeholder="••••••••" />
                </div>
                <div className="flex items-center gap-2">
                  <Switch />
                  <Label>Use TLS/SSL</Label>
                </div>
                <Button variant="outline" className="w-full">Send Test Email</Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Email Templates</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <Button variant="outline" className="w-full justify-start">Edit Welcome Email</Button>
                <Button variant="outline" className="w-full justify-start">Edit Notification Email</Button>
                <Button variant="outline" className="w-full justify-start">Edit Newsletter Template</Button>
              </CardContent>
            </Card>
          </TabsContent>

          {/* STORAGE TAB */}
          <TabsContent value="storage" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Database className="w-5 h-5" /> Cloud Storage
                </CardTitle>
                <CardDescription>Configure cloud storage for file uploads.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>Storage Provider</Label>
                  <select className="w-full p-2 rounded-md border border-input bg-background">
                    <option>AWS S3</option>
                    <option>Cloudinary</option>
                    <option>Google Cloud Storage</option>
                    <option>Local Storage</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <Label>API Key</Label>
                  <Input type="password" placeholder="••••••••" />
                </div>
                <div className="space-y-2">
                  <Label>API Secret</Label>
                  <Input type="password" placeholder="••••••••" />
                </div>
                <div className="space-y-2">
                  <Label>Bucket/Container Name</Label>
                  <Input placeholder="my-bucket-name" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Storage Limits</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span>Storage Used</span>
                    <span className="font-medium">2.4 GB / 10 GB</span>
                  </div>
                  <div className="w-full bg-muted rounded-full h-2">
                    <div className="bg-primary h-2 rounded-full" style={{ width: "24%" }} />
                  </div>
                </div>
                <Button variant="outline" className="w-full">View File Management</Button>
              </CardContent>
            </Card>
          </TabsContent>

          {/* PERFORMANCE TAB */}
          <TabsContent value="performance" className="space-y-4">
            <SettingsPerformance />
          </TabsContent>

          {/* INTEGRATIONS TAB */}
          <TabsContent value="integrations" className="space-y-4">
            <SettingsIntegrations />
          </TabsContent>

          {/* NOTIFICATIONS & ALERTS TAB */}
          <TabsContent value="notifications" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Bell className="w-5 h-5" /> Notification Preferences
                </CardTitle>
                <CardDescription>Configure how and when you receive notifications</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <h4 className="font-medium">Email Notifications</h4>
                  <div className="space-y-3">
                    {[
                      { label: "New contact form submissions", desc: "Receive email when someone contacts you", enabled: true },
                      { label: "New comments", desc: "Get notified when comments are posted", enabled: true },
                      { label: "Security alerts", desc: "Important security-related notifications", enabled: true },
                      { label: "Newsletter subscriptions", desc: "When new users subscribe", enabled: false },
                      { label: "Weekly analytics summary", desc: "Weekly report of site performance", enabled: true },
                    ].map((item, i) => (
                      <div key={i} className="flex items-center justify-between p-3 border rounded-lg">
                        <div>
                          <p className="font-medium text-sm">{item.label}</p>
                          <p className="text-xs text-muted-foreground">{item.desc}</p>
                        </div>
                        <Switch defaultChecked={item.enabled} />
                      </div>
                    ))}
                  </div>
                </div>

                <Separator />

                <div className="space-y-4">
                  <h4 className="font-medium">Push Notifications</h4>
                  <div className="space-y-3">
                    {[
                      { label: "Browser notifications", desc: "Show desktop notifications", enabled: false },
                      { label: "Mobile push", desc: "Send to mobile devices", enabled: false },
                    ].map((item, i) => (
                      <div key={i} className="flex items-center justify-between p-3 border rounded-lg">
                        <div>
                          <p className="font-medium text-sm">{item.label}</p>
                          <p className="text-xs text-muted-foreground">{item.desc}</p>
                        </div>
                        <Switch defaultChecked={item.enabled} />
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Channel Priority & Routing</CardTitle>
                <CardDescription>Configure notification delivery channels and priority</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  {[
                    { channel: "Email", priority: 1, enabled: true, desc: "Primary notification channel" },
                    { channel: "Browser Push", priority: 2, enabled: false, desc: "Desktop notifications" },
                    { channel: "SMS", priority: 3, enabled: false, desc: "Text messages for critical alerts" },
                    { channel: "Slack", priority: 4, enabled: true, desc: "Team notifications" },
                    { channel: "Discord", priority: 5, enabled: true, desc: "Community updates" },
                  ].map((item, i) => (
                    <div key={i} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-xs font-bold">
                          {item.priority}
                        </div>
                        <div>
                          <p className="font-medium text-sm">{item.channel}</p>
                          <p className="text-xs text-muted-foreground">{item.desc}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button variant="ghost" size="sm">↑</Button>
                        <Button variant="ghost" size="sm">↓</Button>
                        <Switch defaultChecked={item.enabled} />
                      </div>
                    </div>
                  ))}
                </div>
                <div className="flex items-center justify-between p-3 border rounded-lg bg-muted/50">
                  <div>
                    <p className="font-medium text-sm">Fallback Routing</p>
                    <p className="text-xs text-muted-foreground">Try next channel if delivery fails</p>
                  </div>
                  <Switch defaultChecked />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Alert Thresholds</CardTitle>
                <CardDescription>Set triggers for automatic alerts</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Storage Usage Alert (%)</Label>
                    <Input type="number" defaultValue="80" />
                  </div>
                  <div className="space-y-2">
                    <Label>Failed Login Attempts</Label>
                    <Input type="number" defaultValue="5" />
                  </div>
                  <div className="space-y-2">
                    <Label>Error Rate Threshold (%)</Label>
                    <Input type="number" defaultValue="5" />
                  </div>
                  <div className="space-y-2">
                    <Label>Response Time (ms)</Label>
                    <Input type="number" defaultValue="3000" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Notification History</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {[
                  { message: "Storage usage reached 75%", time: "2 hours ago", type: "warning" },
                  { message: "Weekly backup completed successfully", time: "Yesterday", type: "success" },
                  { message: "3 failed login attempts detected", time: "2 days ago", type: "error" },
                ].map((notif, i) => (
                  <div key={i} className="flex items-center gap-3 p-3 border rounded-lg">
                    {notif.type === "warning" && <AlertCircle className="w-5 h-5 text-yellow-500" />}
                    {notif.type === "success" && <CheckCircle className="w-5 h-5 text-green-500" />}
                    {notif.type === "error" && <AlertCircle className="w-5 h-5 text-red-500" />}
                    <div className="flex-1">
                      <p className="text-sm">{notif.message}</p>
                      <p className="text-xs text-muted-foreground">{notif.time}</p>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </TabsContent>

          {/* WEBHOOKS TAB */}
          <TabsContent value="webhooks" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Webhook className="w-5 h-5" /> Webhook Endpoints
                </CardTitle>
                <CardDescription>Configure webhooks for external integrations</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  {[
                    { name: "Discord Notifications", url: "https://discord.com/api/webhooks/...", events: ["new_comment", "contact_form"], status: "active", lastDelivery: "2 mins ago", successRate: "98%" },
                    { name: "Slack Channel", url: "https://hooks.slack.com/services/...", events: ["security_alert"], status: "active", lastDelivery: "1 hour ago", successRate: "100%" },
                    { name: "Custom API", url: "https://api.myapp.com/webhook", events: ["all"], status: "inactive", lastDelivery: "Never", successRate: "N/A" },
                  ].map((webhook, i) => (
                    <div key={i} className="p-4 border rounded-lg space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <h4 className="font-medium">{webhook.name}</h4>
                          <Badge variant={webhook.status === "active" ? "default" : "secondary"}>
                            {webhook.status}
                          </Badge>
                        </div>
                        <div className="flex gap-2">
                          <Button variant="outline" size="sm">Test</Button>
                          <Button variant="ghost" size="sm">Edit</Button>
                          <Button variant="ghost" size="sm" className="text-destructive">Delete</Button>
                        </div>
                      </div>
                      <p className="text-xs text-muted-foreground font-mono truncate">{webhook.url}</p>
                      <div className="flex items-center justify-between">
                        <div className="flex gap-1 flex-wrap">
                          {webhook.events.map((event, j) => (
                            <Badge key={j} variant="outline" className="text-xs">{event}</Badge>
                          ))}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          Last: {webhook.lastDelivery} • Success: {webhook.successRate}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                <Button className="w-full">+ Add New Webhook</Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Available Events</CardTitle>
                <CardDescription>Events that can trigger webhooks</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    "new_post", "post_updated", "post_deleted",
                    "new_comment", "comment_approved", "comment_deleted",
                    "contact_form", "newsletter_subscribe",
                    "user_login", "user_logout", "security_alert",
                    "backup_complete", "error_occurred"
                  ].map((event, i) => (
                    <div key={i} className="flex items-center gap-2 p-2 border rounded text-sm">
                      <div className="w-2 h-2 bg-primary rounded-full" />
                      {event}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Webhook Logs</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {[
                  { endpoint: "Discord", event: "new_comment", status: "200", time: "Just now" },
                  { endpoint: "Slack", event: "security_alert", status: "200", time: "5 mins ago" },
                  { endpoint: "Custom API", event: "contact_form", status: "500", time: "1 hour ago" },
                ].map((log, i) => (
                  <div key={i} className="flex items-center justify-between p-2 border rounded text-sm">
                    <div className="flex items-center gap-3">
                      <Badge variant={log.status === "200" ? "default" : "destructive"}>{log.status}</Badge>
                      <span>{log.endpoint}</span>
                      <span className="text-muted-foreground">→ {log.event}</span>
                    </div>
                    <span className="text-xs text-muted-foreground">{log.time}</span>
                  </div>
                ))}
              </CardContent>
            </Card>
          </TabsContent>

          {/* DEVELOPER SETTINGS TAB */}
          <TabsContent value="developer" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Bug className="w-5 h-5" /> Debug Mode
                </CardTitle>
                <CardDescription>Enable debugging features for development</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between p-3 border rounded-lg bg-yellow-500/5 border-yellow-500/20">
                  <div>
                    <p className="font-medium text-sm">Enable Debug Mode</p>
                    <p className="text-xs text-muted-foreground">Shows detailed error messages and stack traces</p>
                  </div>
                  <Switch />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-sm">Show Query Debug</p>
                    <p className="text-xs text-muted-foreground">Display database queries in console</p>
                  </div>
                  <Switch />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-sm">Performance Profiling</p>
                    <p className="text-xs text-muted-foreground">Track execution time of functions</p>
                  </div>
                  <Switch />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Gauge className="w-5 h-5" /> API Rate Limits
                </CardTitle>
                <CardDescription>Configure rate limiting for API endpoints</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Requests per minute (global)</Label>
                    <Input type="number" defaultValue="60" />
                  </div>
                  <div className="space-y-2">
                    <Label>Requests per minute (per IP)</Label>
                    <Input type="number" defaultValue="30" />
                  </div>
                </div>
                <div className="space-y-3">
                  <h4 className="font-medium text-sm">Endpoint-specific limits</h4>
                  {[
                    { endpoint: "/api/contact", limit: 5, window: "1 hour" },
                    { endpoint: "/api/auth/login", limit: 10, window: "15 mins" },
                    { endpoint: "/api/upload", limit: 20, window: "1 hour" },
                  ].map((item, i) => (
                    <div key={i} className="flex items-center justify-between p-2 border rounded text-sm">
                      <code className="text-xs bg-muted px-2 py-1 rounded">{item.endpoint}</code>
                      <span>{item.limit} requests / {item.window}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Terminal className="w-5 h-5" /> Advanced Options
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>Custom Headers</Label>
                  <Textarea 
                    placeholder="X-Custom-Header: value&#10;X-Another-Header: value"
                    className="font-mono text-sm"
                    rows={3}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-sm">Enable CORS</p>
                    <p className="text-xs text-muted-foreground">Allow cross-origin requests</p>
                  </div>
                  <Switch defaultChecked />
                </div>
                <div className="space-y-2">
                  <Label>Allowed Origins (CORS)</Label>
                  <Input placeholder="https://example.com, https://app.example.com" />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-sm">GraphQL Introspection</p>
                    <p className="text-xs text-muted-foreground">Allow schema introspection queries</p>
                  </div>
                  <Switch />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* LOCALIZATION TAB (Enhanced) */}
          <TabsContent value="localization" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Globe className="w-5 h-5" /> Regional Settings
                </CardTitle>
                <CardDescription>Configure timezone and language preferences</CardDescription>
              </CardHeader>
              <CardContent className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Timezone</Label>
                  <select className="w-full p-2 rounded-md border border-input bg-background">
                    <option>UTC+07:00 (Vietnam)</option>
                    <option>UTC+08:00 (Asia/Shanghai)</option>
                    <option>UTC+09:00 (Asia/Tokyo)</option>
                    <option>UTC+00:00 (London)</option>
                    <option>UTC-05:00 (New York)</option>
                    <option>UTC-08:00 (Los Angeles)</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <Label>Default Language</Label>
                  <select className="w-full p-2 rounded-md border border-input bg-background">
                    <option>English</option>
                    <option>Tiếng Việt</option>
                    <option>中文</option>
                    <option>日本語</option>
                    <option>한국어</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <Label>Date Format</Label>
                  <select className="w-full p-2 rounded-md border border-input bg-background">
                    <option>MM/DD/YYYY</option>
                    <option>DD/MM/YYYY</option>
                    <option>YYYY-MM-DD</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <Label>Time Format</Label>
                  <select className="w-full p-2 rounded-md border border-input bg-background">
                    <option>12 Hour (AM/PM)</option>
                    <option>24 Hour</option>
                  </select>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <DollarSign className="w-5 h-5" /> Currency Settings
                </CardTitle>
                <CardDescription>Configure currency display preferences</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Default Currency</Label>
                    <select className="w-full p-2 rounded-md border border-input bg-background">
                      <option>USD ($)</option>
                      <option>VND (₫)</option>
                      <option>EUR (€)</option>
                      <option>GBP (£)</option>
                      <option>JPY (¥)</option>
                      <option>CNY (¥)</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <Label>Currency Position</Label>
                    <select className="w-full p-2 rounded-md border border-input bg-background">
                      <option>Before amount ($100)</option>
                      <option>After amount (100$)</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <Label>Decimal Separator</Label>
                    <select className="w-full p-2 rounded-md border border-input bg-background">
                      <option>Period (1,000.00)</option>
                      <option>Comma (1.000,00)</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <Label>Decimal Places</Label>
                    <Input type="number" defaultValue="2" min="0" max="4" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Hash className="w-5 h-5" /> Number Formatting
                </CardTitle>
                <CardDescription>Configure number display preferences</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Thousand Separator</Label>
                    <select className="w-full p-2 rounded-md border border-input bg-background">
                      <option>Comma (1,000)</option>
                      <option>Period (1.000)</option>
                      <option>Space (1 000)</option>
                      <option>None (1000)</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <Label>Measurement System</Label>
                    <select className="w-full p-2 rounded-md border border-input bg-background">
                      <option>Metric (km, kg, °C)</option>
                      <option>Imperial (mi, lb, °F)</option>
                    </select>
                  </div>
                </div>
                <div className="p-3 bg-muted rounded-lg">
                  <p className="text-sm font-medium mb-2">Preview:</p>
                  <div className="grid grid-cols-3 gap-4 text-sm">
                    <div><span className="text-muted-foreground">Number:</span> 1,234,567.89</div>
                    <div><span className="text-muted-foreground">Currency:</span> $1,234.56</div>
                    <div><span className="text-muted-foreground">Date:</span> 03/20/2024</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Languages className="w-5 h-5" /> Custom Translations
                </CardTitle>
                <CardDescription>Manage custom translation strings</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex gap-2">
                  <Button variant="outline" className="flex-1">Import Translations</Button>
                  <Button variant="outline" className="flex-1">Export Translations</Button>
                </div>
                <div className="space-y-2">
                  <h4 className="font-medium text-sm">Translation Keys</h4>
                  {[
                    { key: "site.title", en: "Loi Developer", vi: "Loi Developer" },
                    { key: "nav.home", en: "Home", vi: "Trang chủ" },
                    { key: "nav.about", en: "About", vi: "Giới thiệu" },
                    { key: "nav.contact", en: "Contact", vi: "Liên hệ" },
                  ].map((item, i) => (
                    <div key={i} className="grid grid-cols-3 gap-2 p-2 border rounded text-sm">
                      <code className="text-xs bg-muted px-2 py-1 rounded">{item.key}</code>
                      <Input defaultValue={item.en} className="h-8" />
                      <Input defaultValue={item.vi} className="h-8" />
                    </div>
                  ))}
                </div>
                <Button variant="outline" className="w-full">+ Add Translation Key</Button>
              </CardContent>
            </Card>
          </TabsContent>

          {/* THEME CUSTOMIZATION TAB */}
          <TabsContent value="theme" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Palette className="w-5 h-5" /> Color Scheme
                </CardTitle>
                <CardDescription>Customize your site colors</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  {[
                    { label: "Primary Color", value: "#7c3aed", desc: "Main brand color" },
                    { label: "Secondary Color", value: "#3b82f6", desc: "Supporting color" },
                    { label: "Accent Color", value: "#10b981", desc: "Highlights & CTAs" },
                    { label: "Background", value: "#0a0a0a", desc: "Page background" },
                    { label: "Card Background", value: "#171717", desc: "Card surfaces" },
                    { label: "Text Color", value: "#fafafa", desc: "Primary text" },
                  ].map((color, i) => (
                    <div key={i} className="space-y-2">
                      <Label>{color.label}</Label>
                      <div className="flex gap-2">
                        <div 
                          className="w-10 h-10 rounded border cursor-pointer" 
                          style={{ backgroundColor: color.value }}
                        />
                        <Input defaultValue={color.value} className="font-mono" />
                      </div>
                      <p className="text-xs text-muted-foreground">{color.desc}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Typography</CardTitle>
                <CardDescription>Configure fonts and text styles</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Heading Font</Label>
                    <select className="w-full p-2 rounded-md border border-input bg-background">
                      <option>Space Grotesk</option>
                      <option>Inter</option>
                      <option>Poppins</option>
                      <option>Montserrat</option>
                      <option>Playfair Display</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <Label>Body Font</Label>
                    <select className="w-full p-2 rounded-md border border-input bg-background">
                      <option>Inter</option>
                      <option>Open Sans</option>
                      <option>Roboto</option>
                      <option>Lato</option>
                      <option>Source Sans Pro</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <Label>Base Font Size</Label>
                    <select className="w-full p-2 rounded-md border border-input bg-background">
                      <option>14px</option>
                      <option>16px</option>
                      <option>18px</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <Label>Line Height</Label>
                    <select className="w-full p-2 rounded-md border border-input bg-background">
                      <option>1.4</option>
                      <option>1.5</option>
                      <option>1.6</option>
                      <option>1.75</option>
                    </select>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Layout & Spacing</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Border Radius</Label>
                    <select className="w-full p-2 rounded-md border border-input bg-background">
                      <option>None (0px)</option>
                      <option>Small (4px)</option>
                      <option>Medium (8px)</option>
                      <option>Large (12px)</option>
                      <option>Full (9999px)</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <Label>Container Width</Label>
                    <select className="w-full p-2 rounded-md border border-input bg-background">
                      <option>Narrow (960px)</option>
                      <option>Default (1200px)</option>
                      <option>Wide (1400px)</option>
                      <option>Full Width</option>
                    </select>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-sm">Enable Animations</p>
                    <p className="text-xs text-muted-foreground">Smooth transitions and hover effects</p>
                  </div>
                  <Switch defaultChecked />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-sm">Glassmorphism Effects</p>
                    <p className="text-xs text-muted-foreground">Blur and transparency on cards</p>
                  </div>
                  <Switch defaultChecked />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Theme Presets</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-4 gap-3">
                  {[
                    { name: "Dark Purple", colors: ["#7c3aed", "#0a0a0a"] },
                    { name: "Ocean Blue", colors: ["#0ea5e9", "#0f172a"] },
                    { name: "Forest Green", colors: ["#10b981", "#022c22"] },
                    { name: "Sunset Orange", colors: ["#f97316", "#1c1917"] },
                    { name: "Rose Pink", colors: ["#f43f5e", "#18181b"] },
                    { name: "Light Mode", colors: ["#7c3aed", "#ffffff"] },
                    { name: "Minimal", colors: ["#171717", "#fafafa"] },
                    { name: "Custom", colors: ["#gradient", "#gradient"] },
                  ].map((preset, i) => (
                    <div 
                      key={i} 
                      className="p-3 border rounded-lg cursor-pointer hover:border-primary transition-colors"
                    >
                      <div className="flex gap-1 mb-2">
                        <div className="w-6 h-6 rounded" style={{ backgroundColor: preset.colors[0] }} />
                        <div className="w-6 h-6 rounded" style={{ backgroundColor: preset.colors[1] }} />
                      </div>
                      <p className="text-xs font-medium">{preset.name}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* DATABASE MANAGEMENT TAB */}
          <TabsContent value="database" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <HardDrive className="w-5 h-5" /> Database Status
                </CardTitle>
                <CardDescription>Monitor your database health</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-4 gap-4">
                  {[
                    { label: "Status", value: "Connected", color: "text-green-500" },
                    { label: "Size", value: "45.2 MB", color: "text-primary" },
                    { label: "Tables", value: "12", color: "text-primary" },
                    { label: "Uptime", value: "99.9%", color: "text-green-500" },
                  ].map((stat, i) => (
                    <div key={i} className="p-4 border rounded-lg text-center">
                      <p className="text-xs text-muted-foreground">{stat.label}</p>
                      <p className={`text-lg font-bold ${stat.color}`}>{stat.value}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Download className="w-5 h-5" /> Backup & Restore
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex gap-2">
                  <Button className="flex-1">
                    <Download className="w-4 h-4 mr-2" /> Create Backup
                  </Button>
                  <Button variant="outline" className="flex-1">
                    <Upload className="w-4 h-4 mr-2" /> Restore Backup
                  </Button>
                </div>

                <div className="space-y-2">
                  <h4 className="font-medium text-sm">Recent Backups</h4>
                  {[
                    { name: "backup_2024-03-20_14-30.sql", size: "42 MB", date: "Today, 2:30 PM" },
                    { name: "backup_2024-03-19_14-30.sql", size: "41 MB", date: "Yesterday" },
                    { name: "backup_2024-03-18_14-30.sql", size: "40 MB", date: "2 days ago" },
                  ].map((backup, i) => (
                    <div key={i} className="flex items-center justify-between p-3 border rounded-lg">
                      <div>
                        <p className="text-sm font-mono">{backup.name}</p>
                        <p className="text-xs text-muted-foreground">{backup.size} • {backup.date}</p>
                      </div>
                      <div className="flex gap-2">
                        <Button variant="ghost" size="sm">
                          <Download className="w-4 h-4" />
                        </Button>
                        <Button variant="ghost" size="sm" className="text-destructive">
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <RefreshCw className="w-5 h-5" /> Maintenance
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button variant="outline" className="w-full justify-start">
                  <RefreshCw className="w-4 h-4 mr-2" /> Optimize Tables
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  <Trash2 className="w-4 h-4 mr-2" /> Clear Cache
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  <Database className="w-4 h-4 mr-2" /> Run Migrations
                </Button>
                <Button variant="outline" className="w-full justify-start text-destructive">
                  <AlertCircle className="w-4 h-4 mr-2" /> Reset Database (Danger)
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Auto Backup Settings</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-sm">Enable Auto Backup</p>
                    <p className="text-xs text-muted-foreground">Automatically backup database</p>
                  </div>
                  <Switch defaultChecked />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Backup Frequency</Label>
                    <select className="w-full p-2 rounded-md border border-input bg-background">
                      <option>Daily</option>
                      <option>Every 12 hours</option>
                      <option>Weekly</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <Label>Retention Period</Label>
                    <select className="w-full p-2 rounded-md border border-input bg-background">
                      <option>7 days</option>
                      <option>14 days</option>
                      <option>30 days</option>
                      <option>90 days</option>
                    </select>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* LOGGING CONFIGURATION TAB */}
          <TabsContent value="logging" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="w-5 h-5" /> Logging Configuration
                </CardTitle>
                <CardDescription>Configure what gets logged and where</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>Log Level</Label>
                  <select className="w-full p-2 rounded-md border border-input bg-background">
                    <option>Error - Only critical errors</option>
                    <option>Warning - Errors and warnings</option>
                    <option>Info - General information</option>
                    <option>Debug - Detailed debug information</option>
                    <option>Verbose - Everything</option>
                  </select>
                </div>

                <Separator />

                <div className="space-y-3">
                  <h4 className="font-medium text-sm">Log Categories</h4>
                  {[
                    { label: "Authentication logs", desc: "Login attempts, logouts, password changes", enabled: true },
                    { label: "API request logs", desc: "All API endpoint calls", enabled: true },
                    { label: "Database query logs", desc: "SQL queries and execution time", enabled: false },
                    { label: "Error logs", desc: "Application errors and exceptions", enabled: true },
                    { label: "Security logs", desc: "Security-related events", enabled: true },
                    { label: "Performance logs", desc: "Slow queries and bottlenecks", enabled: false },
                  ].map((item, i) => (
                    <div key={i} className="flex items-center justify-between p-3 border rounded-lg">
                      <div>
                        <p className="font-medium text-sm">{item.label}</p>
                        <p className="text-xs text-muted-foreground">{item.desc}</p>
                      </div>
                      <Switch defaultChecked={item.enabled} />
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Log Storage</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Log Retention</Label>
                    <select className="w-full p-2 rounded-md border border-input bg-background">
                      <option>7 days</option>
                      <option>14 days</option>
                      <option>30 days</option>
                      <option>90 days</option>
                      <option>1 year</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <Label>Max Log Size</Label>
                    <select className="w-full p-2 rounded-md border border-input bg-background">
                      <option>100 MB</option>
                      <option>500 MB</option>
                      <option>1 GB</option>
                      <option>5 GB</option>
                    </select>
                  </div>
                </div>

                <div className="p-4 bg-muted rounded-lg">
                  <div className="flex justify-between text-sm mb-2">
                    <span>Current Log Size</span>
                    <span className="font-medium">127 MB / 500 MB</span>
                  </div>
                  <div className="w-full bg-background rounded-full h-2">
                    <div className="bg-primary h-2 rounded-full" style={{ width: "25%" }} />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Log Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button variant="outline" className="w-full justify-start">
                  <Download className="w-4 h-4 mr-2" /> Export Logs (Last 7 days)
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  <FileText className="w-4 h-4 mr-2" /> View Live Logs
                </Button>
                <Button variant="outline" className="w-full justify-start text-destructive">
                  <Trash2 className="w-4 h-4 mr-2" /> Clear All Logs
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>External Log Services</CardTitle>
                <CardDescription>Send logs to external monitoring services</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <Server className="w-5 h-5 text-muted-foreground" />
                    <div>
                      <p className="font-medium text-sm">Sentry</p>
                      <p className="text-xs text-muted-foreground">Error tracking and monitoring</p>
                    </div>
                  </div>
                  <Badge variant="secondary">Not Connected</Badge>
                </div>
                <div className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <Server className="w-5 h-5 text-muted-foreground" />
                    <div>
                      <p className="font-medium text-sm">Datadog</p>
                      <p className="text-xs text-muted-foreground">Infrastructure monitoring</p>
                    </div>
                  </div>
                  <Badge variant="secondary">Not Connected</Badge>
                </div>
                <div className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <Server className="w-5 h-5 text-muted-foreground" />
                    <div>
                      <p className="font-medium text-sm">Loggly</p>
                      <p className="text-xs text-muted-foreground">Cloud log management</p>
                    </div>
                  </div>
                  <Badge variant="secondary">Not Connected</Badge>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </AdminLayout>
  );
}
