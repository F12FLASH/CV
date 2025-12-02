
import { AdminLayout } from "@/layouts/AdminLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Search, Globe, FileText, Image, CheckCircle, AlertCircle } from "lucide-react";

export default function AdminSEO() {
  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-heading font-bold">SEO Optimization</h1>
            <p className="text-muted-foreground">Improve search engine visibility</p>
          </div>
          <Button className="bg-primary">Save SEO Settings</Button>
        </div>

        {/* SEO Score */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {[
            { label: "SEO Score", value: "85/100", status: "good", icon: CheckCircle },
            { label: "Meta Tags", value: "12/15", status: "warning", icon: AlertCircle },
            { label: "Image Alt", value: "Complete", status: "good", icon: Image },
            { label: "Sitemap", value: "Updated", status: "good", icon: FileText },
          ].map((metric, i) => (
            <Card key={i}>
              <CardContent className="pt-6">
                <div className="flex items-center gap-3">
                  <metric.icon className={`w-5 h-5 ${metric.status === 'good' ? 'text-green-500' : 'text-yellow-500'}`} />
                  <div>
                    <p className="text-xs text-muted-foreground">{metric.label}</p>
                    <p className="font-bold">{metric.value}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <Tabs defaultValue="meta" className="space-y-6">
          <TabsList>
            <TabsTrigger value="meta">Meta Tags</TabsTrigger>
            <TabsTrigger value="schema">Schema Markup</TabsTrigger>
            <TabsTrigger value="sitemap">Sitemap</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
          </TabsList>

          <TabsContent value="meta" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Global Meta Tags</CardTitle>
                <CardDescription>Default meta information for all pages</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="text-sm font-medium mb-2 block">Meta Title</label>
                  <Input defaultValue="Loi Developer - Full-stack Developer Portfolio" />
                  <p className="text-xs text-muted-foreground mt-1">60 characters recommended</p>
                </div>
                <div>
                  <label className="text-sm font-medium mb-2 block">Meta Description</label>
                  <Textarea 
                    defaultValue="Professional full-stack developer specializing in React, Node.js, and modern web technologies"
                    className="min-h-[80px]"
                  />
                  <p className="text-xs text-muted-foreground mt-1">160 characters recommended</p>
                </div>
                <div>
                  <label className="text-sm font-medium mb-2 block">Keywords</label>
                  <Input defaultValue="web developer, full-stack, react, node.js, portfolio" />
                </div>
                <div>
                  <label className="text-sm font-medium mb-2 block">Canonical URL</label>
                  <Input defaultValue="https://loideveloper.com" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Open Graph / Social Media</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="text-sm font-medium mb-2 block">OG Image</label>
                  <Input defaultValue="https://loideveloper.com/og-image.jpg" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium mb-2 block">Twitter Handle</label>
                    <Input placeholder="@username" />
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-2 block">Card Type</label>
                    <select className="w-full p-2 border rounded-md bg-background">
                      <option>summary_large_image</option>
                      <option>summary</option>
                    </select>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="schema" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Schema.org Structured Data</CardTitle>
              </CardHeader>
              <CardContent>
                <Textarea 
                  className="font-mono text-xs min-h-[300px]"
                  defaultValue={`{
  "@context": "https://schema.org",
  "@type": "Person",
  "name": "Loi Developer",
  "jobTitle": "Full-stack Developer",
  "url": "https://loideveloper.com"
}`}
                />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="sitemap" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>XML Sitemap</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex gap-2">
                  <Input defaultValue="https://loideveloper.com/sitemap.xml" readOnly className="bg-muted" />
                  <Button>Regenerate</Button>
                </div>
                <div className="space-y-2">
                  <p className="text-sm font-medium">Included URLs:</p>
                  <div className="space-y-1 text-sm text-muted-foreground">
                    <div className="flex justify-between">
                      <span>Homepage</span>
                      <Badge variant="secondary">Priority: 1.0</Badge>
                    </div>
                    <div className="flex justify-between">
                      <span>Projects (15 pages)</span>
                      <Badge variant="secondary">Priority: 0.8</Badge>
                    </div>
                    <div className="flex justify-between">
                      <span>Blog Posts (28 pages)</span>
                      <Badge variant="secondary">Priority: 0.7</Badge>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="analytics" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Tracking & Analytics</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="text-sm font-medium mb-2 block">Google Analytics ID</label>
                  <Input placeholder="G-XXXXXXXXXX" />
                </div>
                <div>
                  <label className="text-sm font-medium mb-2 block">Google Search Console</label>
                  <Input placeholder="Verification code" />
                </div>
                <div>
                  <label className="text-sm font-medium mb-2 block">Facebook Pixel</label>
                  <Input placeholder="Pixel ID" />
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </AdminLayout>
  );
}
