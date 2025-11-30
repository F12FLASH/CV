
import { AdminLayout } from "@/layouts/AdminLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Zap, Trash2, RefreshCw, Database, Image, FileText } from "lucide-react";

export default function AdminCache() {
  const cacheItems = [
    { name: "Application Cache", size: "24.5 MB", items: 1247, icon: Zap, color: "text-purple-500" },
    { name: "Database Queries", size: "12.8 MB", items: 856, icon: Database, color: "text-blue-500" },
    { name: "Image Cache", size: "156 MB", items: 342, icon: Image, color: "text-green-500" },
    { name: "Page Cache", size: "8.2 MB", items: 124, icon: FileText, color: "text-yellow-500" },
  ];

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-heading font-bold">Cache Manager</h1>
            <p className="text-muted-foreground">Manage and clear application cache</p>
          </div>
          <Button variant="destructive" className="gap-2">
            <Trash2 className="w-4 h-4" /> Clear All Cache
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {cacheItems.map((item, i) => (
            <Card key={i}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`p-3 rounded-lg bg-muted ${item.color}`}>
                      <item.icon className="w-6 h-6" />
                    </div>
                    <div>
                      <CardTitle className="text-lg">{item.name}</CardTitle>
                      <CardDescription>{item.items} items</CardDescription>
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-2xl font-bold">{item.size}</p>
                    <p className="text-xs text-muted-foreground">Total size</p>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm">
                      <RefreshCw className="w-4 h-4 mr-1" /> Refresh
                    </Button>
                    <Button variant="destructive" size="sm">
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Cache Statistics</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center p-4 bg-muted rounded-lg">
                <p className="text-2xl font-bold text-primary">94%</p>
                <p className="text-xs text-muted-foreground">Hit Rate</p>
              </div>
              <div className="text-center p-4 bg-muted rounded-lg">
                <p className="text-2xl font-bold text-green-500">201 MB</p>
                <p className="text-xs text-muted-foreground">Total Cache</p>
              </div>
              <div className="text-center p-4 bg-muted rounded-lg">
                <p className="text-2xl font-bold text-yellow-500">2,569</p>
                <p className="text-xs text-muted-foreground">Cached Items</p>
              </div>
              <div className="text-center p-4 bg-muted rounded-lg">
                <p className="text-2xl font-bold text-blue-500">2h ago</p>
                <p className="text-xs text-muted-foreground">Last Cleared</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
}
