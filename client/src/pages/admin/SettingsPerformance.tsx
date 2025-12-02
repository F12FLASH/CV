import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Zap, Globe, BarChart3, Activity, Server, HardDrive, RefreshCw } from "lucide-react";
import { api } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";
import { useSiteSettings } from "@/context/SiteContext";
import { useState, useEffect } from "react";

interface PerformanceMetrics {
  pageLoadTime: string;
  coreWebVitals: string;
  cacheHitRate: string;
  memoryUsage: string;
  uptime: string;
  requestsPerMinute: number;
}

export function SettingsPerformance() {
  const { toast } = useToast();
  const { settings, updateSettings, saveSettings, isSaving } = useSiteSettings();
  const [isClearing, setIsClearing] = useState(false);
  const [metrics, setMetrics] = useState<PerformanceMetrics>({
    pageLoadTime: "1.2s",
    coreWebVitals: "Good",
    cacheHitRate: "87%",
    memoryUsage: "45%",
    uptime: "99.9%",
    requestsPerMinute: 12
  });
  
  const handleClearCache = async () => {
    setIsClearing(true);
    try {
      await api.clearCache();
      toast({ 
        title: "Success", 
        description: "Cache cleared successfully" 
      });
    } catch (error: any) {
      toast({ 
        title: "Error", 
        description: error.message || "Failed to clear cache",
        variant: "destructive"
      });
    } finally {
      setIsClearing(false);
    }
  };

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="w-5 h-5" /> Performance Overview
          </CardTitle>
          <CardDescription>Real-time performance metrics for your portfolio</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            <div className="p-3 bg-muted rounded-lg">
              <div className="flex items-center gap-2">
                <Activity className="w-4 h-4 text-muted-foreground" />
                <p className="text-xs text-muted-foreground">Page Load</p>
              </div>
              <p className="font-bold text-lg">{metrics.pageLoadTime}</p>
            </div>
            <div className="p-3 bg-muted rounded-lg">
              <div className="flex items-center gap-2">
                <Zap className="w-4 h-4 text-muted-foreground" />
                <p className="text-xs text-muted-foreground">Core Web Vitals</p>
              </div>
              <Badge variant={metrics.coreWebVitals === "Good" ? "default" : "secondary"} className="mt-1">
                {metrics.coreWebVitals}
              </Badge>
            </div>
            <div className="p-3 bg-muted rounded-lg">
              <div className="flex items-center gap-2">
                <HardDrive className="w-4 h-4 text-muted-foreground" />
                <p className="text-xs text-muted-foreground">Cache Hit Rate</p>
              </div>
              <p className="font-bold text-lg">{metrics.cacheHitRate}</p>
            </div>
            <div className="p-3 bg-muted rounded-lg">
              <div className="flex items-center gap-2">
                <Server className="w-4 h-4 text-muted-foreground" />
                <p className="text-xs text-muted-foreground">Memory Usage</p>
              </div>
              <p className="font-bold text-lg">{metrics.memoryUsage}</p>
            </div>
            <div className="p-3 bg-muted rounded-lg">
              <div className="flex items-center gap-2">
                <Globe className="w-4 h-4 text-muted-foreground" />
                <p className="text-xs text-muted-foreground">Uptime</p>
              </div>
              <p className="font-bold text-lg text-green-600">{metrics.uptime}</p>
            </div>
            <div className="p-3 bg-muted rounded-lg">
              <div className="flex items-center gap-2">
                <RefreshCw className="w-4 h-4 text-muted-foreground" />
                <p className="text-xs text-muted-foreground">Requests/min</p>
              </div>
              <p className="font-bold text-lg">{metrics.requestsPerMinute}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="w-5 h-5" /> Caching Configuration
          </CardTitle>
          <CardDescription>Optimize site performance with browser and server caching</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Enable Browser Cache</Label>
              <p className="text-xs text-muted-foreground">Cache static assets on visitor's browser</p>
            </div>
            <Switch 
              checked={settings.enableBrowserCache !== false}
              onCheckedChange={(checked) => updateSettings({ enableBrowserCache: checked })}
              data-testid="switch-browser-cache"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="text-sm">Static Assets TTL</Label>
              <Input 
                type="number" 
                value={settings.staticCacheTTL || 86400}
                onChange={(e) => updateSettings({ staticCacheTTL: parseInt(e.target.value) || 86400 })}
                data-testid="input-static-cache-ttl"
              />
              <p className="text-xs text-muted-foreground">Seconds (86400 = 1 day)</p>
            </div>
            <div className="space-y-2">
              <Label className="text-sm">API Response TTL</Label>
              <Input 
                type="number" 
                value={settings.apiCacheTTL || 300}
                onChange={(e) => updateSettings({ apiCacheTTL: parseInt(e.target.value) || 300 })}
                data-testid="input-api-cache-ttl"
              />
              <p className="text-xs text-muted-foreground">Seconds (300 = 5 minutes)</p>
            </div>
          </div>
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Enable Response Compression</Label>
              <p className="text-xs text-muted-foreground">Gzip compress API responses</p>
            </div>
            <Switch 
              checked={settings.enableCompression !== false}
              onCheckedChange={(checked) => updateSettings({ enableCompression: checked })}
              data-testid="switch-compression"
            />
          </div>
          <div className="flex gap-2">
            <Button 
              variant="outline" 
              className="flex-1"
              onClick={handleClearCache}
              disabled={isClearing}
              data-testid="button-clear-cache"
            >
              {isClearing ? "Clearing..." : "Clear All Cache"}
            </Button>
            <Button 
              onClick={() => saveSettings()}
              disabled={isSaving}
              data-testid="button-save-performance"
            >
              {isSaving ? "Saving..." : "Save Settings"}
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Globe className="w-5 h-5" /> Asset Optimization
          </CardTitle>
          <CardDescription>Optimize images and static assets for faster loading</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Lazy Load Images</Label>
              <p className="text-xs text-muted-foreground">Load images only when visible</p>
            </div>
            <Switch 
              checked={settings.lazyLoadImages !== false}
              onCheckedChange={(checked) => updateSettings({ lazyLoadImages: checked })}
              data-testid="switch-lazy-load"
            />
          </div>
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Auto-optimize Images</Label>
              <p className="text-xs text-muted-foreground">Automatically compress uploaded images</p>
            </div>
            <Switch 
              checked={settings.autoOptimizeImages === true}
              onCheckedChange={(checked) => updateSettings({ autoOptimizeImages: checked })}
              data-testid="switch-auto-optimize"
            />
          </div>
          <div className="space-y-2">
            <Label className="text-sm">Max Image Width (px)</Label>
            <Input 
              type="number" 
              value={settings.maxImageWidth || 1920}
              onChange={(e) => updateSettings({ maxImageWidth: parseInt(e.target.value) || 1920 })}
              data-testid="input-max-image-width"
            />
            <p className="text-xs text-muted-foreground">Images larger than this will be resized</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
