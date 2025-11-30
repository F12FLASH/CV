import { AdminLayout } from "@/layouts/AdminLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Shield, Key, Lock, Smartphone, Globe, AlertTriangle, Download, Trash2, Filter } from "lucide-react";

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
          <TabsList className="grid w-full max-w-3xl grid-cols-5">
            <TabsTrigger value="authentication">Authentication</TabsTrigger>
            <TabsTrigger value="firewall">Firewall</TabsTrigger>
            <TabsTrigger value="backup">Backup</TabsTrigger>
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

          {/* BACKUP */}
          <TabsContent value="backup" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Backup Management</CardTitle>
                <CardDescription>Create and restore backups of your data</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex gap-2">
                  <Button className="flex-1">Create Backup Now</Button>
                  <Button variant="outline" className="flex-1">Schedule Backup</Button>
                </div>

                <div className="space-y-2">
                  <h4 className="font-medium text-sm">Recent Backups</h4>
                  {[
                    { date: "Today, 2:30 PM", size: "124 MB", status: "Complete" },
                    { date: "Yesterday, 2:15 PM", size: "118 MB", status: "Complete" },
                    { date: "2 days ago, 2:00 PM", size: "115 MB", status: "Complete" },
                  ].map((backup, i) => (
                    <div key={i} className="flex items-center justify-between p-3 border rounded-lg">
                      <div>
                        <p className="text-sm font-medium">{backup.date}</p>
                        <p className="text-xs text-muted-foreground">{backup.size}</p>
                      </div>
                      <div className="flex gap-2">
                        <Badge variant="outline">{backup.status}</Badge>
                        <Button variant="ghost" size="sm">
                          <Download className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Automatic Backup Schedule</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <label className="text-sm font-medium">Backup Frequency</label>
                  <select className="w-full p-2 rounded-md border border-input bg-background mt-1">
                    <option>Daily</option>
                    <option>Every 3 days</option>
                    <option>Weekly</option>
                    <option>Monthly</option>
                  </select>
                </div>
                <div>
                  <label className="text-sm font-medium">Backup Time</label>
                  <Input type="time" defaultValue="02:00" className="mt-1" />
                </div>
                <div className="flex items-center justify-between">
                  <label className="text-sm font-medium">Auto Delete Old Backups</label>
                  <Switch defaultChecked />
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
