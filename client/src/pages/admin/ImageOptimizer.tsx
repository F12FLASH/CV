
import { AdminLayout } from "@/layouts/AdminLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Slider } from "@/components/ui/slider";
import { 
  Upload, 
  Image as ImageIcon,
  Zap,
  Download,
  Trash2,
  Settings,
  CheckCircle
} from "lucide-react";
import { useState } from "react";

export default function AdminImageOptimizer() {
  const [quality, setQuality] = useState([80]);
  const [images] = useState([
    { id: 1, name: "hero-bg.jpg", original: "2.4 MB", optimized: "456 KB", saved: "81%", status: "completed" },
    { id: 2, name: "project-1.png", original: "1.8 MB", optimized: "340 KB", saved: "81%", status: "completed" },
    { id: 3, name: "avatar.jpg", original: "890 KB", optimized: "180 KB", saved: "80%", status: "processing" },
  ]);

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-heading font-bold">Image Optimizer</h1>
            <p className="text-muted-foreground">Compress and optimize images for better performance</p>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="pt-6">
              <p className="text-xs text-muted-foreground">Total Images</p>
              <p className="font-bold text-2xl">156</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <p className="text-xs text-muted-foreground">Optimized</p>
              <p className="font-bold text-2xl text-green-600">142</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <p className="text-xs text-muted-foreground">Space Saved</p>
              <p className="font-bold text-2xl">45.2 MB</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <p className="text-xs text-muted-foreground">Avg Compression</p>
              <p className="font-bold text-2xl">78%</p>
            </CardContent>
          </Card>
        </div>

        {/* Upload Area */}
        <Card>
          <CardContent className="p-6">
            <div className="border-2 border-dashed rounded-lg p-12 flex flex-col items-center justify-center cursor-pointer hover:border-primary/50 hover:bg-primary/5 transition-all">
              <Upload className="w-12 h-12 text-muted-foreground mb-3" />
              <h3 className="font-bold mb-1">Drop images here or click to upload</h3>
              <p className="text-sm text-muted-foreground">JPG, PNG, WebP (Max 10MB each)</p>
            </div>
          </CardContent>
        </Card>

        {/* Settings */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="w-5 h-5" /> Optimization Settings
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <div className="flex justify-between mb-2">
                  <label className="text-sm font-medium">Quality</label>
                  <span className="text-sm text-muted-foreground">{quality[0]}%</span>
                </div>
                <Slider value={quality} onValueChange={setQuality} min={1} max={100} step={1} />
              </div>
              
              <div>
                <label className="text-sm font-medium block mb-2">Output Format</label>
                <select className="w-full p-2 border rounded-md bg-background">
                  <option>Auto (Recommended)</option>
                  <option>WebP</option>
                  <option>JPEG</option>
                  <option>PNG</option>
                </select>
              </div>

              <div>
                <label className="text-sm font-medium block mb-2">Max Width (px)</label>
                <input type="number" defaultValue="1920" className="w-full p-2 border rounded-md" />
              </div>

              <Button className="w-full">
                <Zap className="w-4 h-4 mr-2" /> Optimize All
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Processing Queue</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {images.map((img) => (
                  <div key={img.id} className="border rounded-lg p-3">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <ImageIcon className="w-4 h-4 text-muted-foreground" />
                        <span className="font-medium text-sm">{img.name}</span>
                      </div>
                      {img.status === "completed" ? (
                        <CheckCircle className="w-4 h-4 text-green-500" />
                      ) : (
                        <Badge variant="secondary">Processing</Badge>
                      )}
                    </div>
                    
                    {img.status === "processing" ? (
                      <Progress value={65} className="h-1" />
                    ) : (
                      <div className="flex justify-between text-xs text-muted-foreground">
                        <span>{img.original} → {img.optimized}</span>
                        <span className="text-green-600 font-medium">-{img.saved}</span>
                      </div>
                    )}

                    {img.status === "completed" && (
                      <div className="flex gap-2 mt-2">
                        <Button variant="outline" size="sm" className="flex-1">
                          <Download className="w-3 h-3 mr-1" /> Download
                        </Button>
                        <Button variant="ghost" size="sm">
                          <Trash2 className="w-3 h-3" />
                        </Button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </AdminLayout>
  );
}
