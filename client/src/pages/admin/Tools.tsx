
import { AdminLayout } from "@/layouts/AdminLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { 
  Database, 
  Download, 
  Upload, 
  RefreshCw, 
  Trash2, 
  FileJson,
  FileCode,
  Zap,
  Copy,
  CheckCircle
} from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useState } from "react";

export default function AdminTools() {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-heading font-bold">Developer Tools</h1>
          <p className="text-muted-foreground">Utilities and maintenance tools for your website</p>
        </div>

        <Tabs defaultValue="database" className="space-y-6">
          <TabsList className="grid w-full max-w-2xl grid-cols-4">
            <TabsTrigger value="database">Database</TabsTrigger>
            <TabsTrigger value="import">Import/Export</TabsTrigger>
            <TabsTrigger value="cache">Cache</TabsTrigger>
            <TabsTrigger value="generators">Generators</TabsTrigger>
          </TabsList>

          <TabsContent value="database" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Database className="w-5 h-5" />
                    Backup Database
                  </CardTitle>
                  <CardDescription>Create a backup of your entire database</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-sm text-muted-foreground">
                    Last backup: <span className="text-foreground font-medium">2 hours ago</span>
                  </p>
                  <Button className="w-full gap-2">
                    <Download className="w-4 h-4" /> Create Backup
                  </Button>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Upload className="w-5 h-5" />
                    Restore Database
                  </CardTitle>
                  <CardDescription>Restore from a previous backup file</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Input type="file" accept=".sql,.json" />
                  <Button variant="outline" className="w-full gap-2">
                    <Upload className="w-4 h-4" /> Restore from File
                  </Button>
                </CardContent>
              </Card>

              <Card className="md:col-span-2 border-red-500/20">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-red-500">
                    <Trash2 className="w-5 h-5" />
                    Reset Database
                  </CardTitle>
                  <CardDescription>Clear all data and reset to factory defaults</CardDescription>
                </CardHeader>
                <CardContent>
                  <Button variant="destructive" className="w-full gap-2">
                    <Trash2 className="w-4 h-4" /> Reset All Data (Irreversible)
                  </Button>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="import" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <FileJson className="w-5 h-5" />
                    Export Data
                  </CardTitle>
                  <CardDescription>Download your content as JSON</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Select content type:</label>
                    <select className="w-full p-2 border border-border rounded-md bg-background">
                      <option>All Content</option>
                      <option>Posts only</option>
                      <option>Projects only</option>
                      <option>Users only</option>
                    </select>
                  </div>
                  <Button className="w-full gap-2">
                    <Download className="w-4 h-4" /> Export to JSON
                  </Button>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Upload className="w-5 h-5" />
                    Import Data
                  </CardTitle>
                  <CardDescription>Upload JSON data to import</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Upload JSON file:</label>
                    <Input type="file" accept=".json" />
                  </div>
                  <Button variant="outline" className="w-full gap-2">
                    <Upload className="w-4 h-4" /> Import from JSON
                  </Button>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="cache" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <RefreshCw className="w-5 h-5" />
                    Clear Cache
                  </CardTitle>
                  <CardDescription>Remove temporary cached data</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div className="p-3 bg-muted rounded-md">
                      <div className="font-medium">Image Cache</div>
                      <div className="text-muted-foreground">124 MB</div>
                    </div>
                    <div className="p-3 bg-muted rounded-md">
                      <div className="font-medium">API Cache</div>
                      <div className="text-muted-foreground">32 MB</div>
                    </div>
                  </div>
                  <Button variant="outline" className="w-full gap-2">
                    <RefreshCw className="w-4 h-4" /> Clear All Cache
                  </Button>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Zap className="w-5 h-5" />
                    Optimize Performance
                  </CardTitle>
                  <CardDescription>Run optimization tasks</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  <Button variant="outline" className="w-full justify-start gap-2">
                    <FileCode className="w-4 h-4" /> Minify CSS/JS
                  </Button>
                  <Button variant="outline" className="w-full justify-start gap-2">
                    <Database className="w-4 h-4" /> Optimize Database
                  </Button>
                  <Button variant="outline" className="w-full justify-start gap-2">
                    <Zap className="w-4 h-4" /> Compress Images
                  </Button>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="generators" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Sitemap Generator</CardTitle>
                <CardDescription>Generate XML sitemap for SEO</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <Textarea 
                  readOnly 
                  className="font-mono text-xs bg-muted"
                  value={`<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>https://loideveloper.com/</loc>
    <lastmod>2024-01-29</lastmod>
    <priority>1.0</priority>
  </url>
</urlset>`}
                  rows={8}
                />
                <div className="flex gap-2">
                  <Button className="gap-2 flex-1" onClick={handleCopy}>
                    {copied ? <CheckCircle className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                    {copied ? "Copied!" : "Copy"}
                  </Button>
                  <Button variant="outline" className="gap-2 flex-1">
                    <Download className="w-4 h-4" /> Download
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Robots.txt Generator</CardTitle>
                <CardDescription>Configure search engine crawlers</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <Textarea 
                  className="font-mono text-xs"
                  defaultValue={`User-agent: *
Allow: /
Sitemap: https://loideveloper.com/sitemap.xml`}
                  rows={4}
                />
                <Button className="w-full gap-2">
                  <Download className="w-4 h-4" /> Save robots.txt
                </Button>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </AdminLayout>
  );
}
