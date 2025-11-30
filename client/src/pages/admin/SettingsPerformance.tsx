import { AdminLayout } from "@/layouts/AdminLayout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Zap, Globe, BarChart3 } from "lucide-react";

export function SettingsPerformance() {
  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="w-5 h-5" /> Caching Configuration
          </CardTitle>
          <CardDescription>Optimize site performance with caching</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Enable Browser Cache</Label>
              <p className="text-xs text-muted-foreground">Cache assets on visitor's browser</p>
            </div>
            <Switch defaultChecked />
          </div>
          <div>
            <Label className="text-sm">Cache TTL (Time to Live)</Label>
            <Input type="number" defaultValue="3600" className="mt-1" />
            <p className="text-xs text-muted-foreground mt-1">Time in seconds (3600 = 1 hour)</p>
          </div>
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Enable Server-Side Cache</Label>
              <p className="text-xs text-muted-foreground">Cache dynamic content</p>
            </div>
            <Switch defaultChecked />
          </div>
          <Button variant="outline" className="w-full">Clear All Cache</Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Globe className="w-5 h-5" /> CDN Configuration
          </CardTitle>
          <CardDescription>Content Delivery Network for global performance</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <Label>Enable CDN</Label>
            <Switch />
          </div>
          <div>
            <Label className="text-sm">CDN Provider</Label>
            <select className="w-full p-2 rounded-md border border-input bg-background mt-1">
              <option>CloudFlare</option>
              <option>Bunny CDN</option>
              <option>AWS CloudFront</option>
              <option>Akamai</option>
            </select>
          </div>
          <div>
            <Label className="text-sm">API Key</Label>
            <Input type="password" placeholder="••••••••" />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="w-5 h-5" /> Performance Metrics
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <div className="p-3 bg-muted rounded">
              <p className="text-xs text-muted-foreground">Page Load Time</p>
              <p className="font-bold">1.2s</p>
            </div>
            <div className="p-3 bg-muted rounded">
              <p className="text-xs text-muted-foreground">Core Web Vitals</p>
              <p className="font-bold text-green-600">Good</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
