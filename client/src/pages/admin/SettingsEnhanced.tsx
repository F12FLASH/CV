import { AdminLayout } from "@/layouts/AdminLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Save, Upload, Mail, Database, Zap, Key } from "lucide-react";
import { useState } from "react";

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
          <TabsList className="grid w-full max-w-4xl grid-cols-6">
            <TabsTrigger value="general">General</TabsTrigger>
            <TabsTrigger value="branding">Branding</TabsTrigger>
            <TabsTrigger value="seo">SEO</TabsTrigger>
            <TabsTrigger value="email">Email</TabsTrigger>
            <TabsTrigger value="storage">Storage</TabsTrigger>
            <TabsTrigger value="security">Security</TabsTrigger>
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
                <CardTitle>Localization</CardTitle>
                <CardDescription>Set timezone and language preferences.</CardDescription>
              </CardHeader>
              <CardContent className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Timezone</Label>
                  <select className="w-full p-2 rounded-md border border-input bg-background">
                    <option>UTC+07:00 (Vietnam)</option>
                    <option>UTC+08:00 (Asia/Shanghai)</option>
                    <option>UTC+09:00 (Asia/Tokyo)</option>
                    <option>UTC+00:00 (London)</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <Label>Language</Label>
                  <select className="w-full p-2 rounded-md border border-input bg-background">
                    <option>English</option>
                    <option>Tiếng Việt</option>
                    <option>中文</option>
                    <option>日本語</option>
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

          {/* SECURITY TAB */}
          <TabsContent value="security" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Security Settings</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Two-Factor Authentication (2FA)</Label>
                    <p className="text-sm text-muted-foreground">Require a code from your authenticator app.</p>
                  </div>
                  <Switch />
                </div>
                <Separator />
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Session Timeout</Label>
                    <p className="text-sm text-muted-foreground">Auto logout after inactivity.</p>
                  </div>
                  <select className="p-1 rounded border bg-background text-sm">
                    <option>15 minutes</option>
                    <option>30 minutes</option>
                    <option>1 hour</option>
                    <option>Never</option>
                  </select>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </AdminLayout>
  );
}
