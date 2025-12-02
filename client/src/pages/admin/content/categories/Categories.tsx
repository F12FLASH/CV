
import { AdminLayout } from "@/layouts/AdminLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Plus, Edit, Trash, GripVertical, Folder } from "lucide-react";
import { useState } from "react";

export default function AdminCategories() {
  const [categories] = useState([
    { id: 1, name: "Web Development", slug: "web-dev", count: 12, color: "#7c3aed" },
    { id: 2, name: "Mobile Apps", slug: "mobile", count: 8, color: "#3b82f6" },
    { id: 3, name: "UI/UX Design", slug: "design", count: 15, color: "#10b981" },
    { id: 4, name: "DevOps", slug: "devops", count: 5, color: "#f59e0b" },
  ]);

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-heading font-bold">Categories</h1>
            <p className="text-muted-foreground">Manage content categories and tags</p>
          </div>
          <Button className="bg-primary gap-2">
            <Plus className="w-4 h-4" /> Add Category
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Categories */}
          <Card>
            <CardHeader>
              <CardTitle>Categories</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {categories.map((cat) => (
                <div key={cat.id} className="flex items-center gap-4 p-3 border rounded-lg group hover:border-primary/50 transition-colors">
                  <div className="cursor-grab text-muted-foreground">
                    <GripVertical className="w-5 h-5" />
                  </div>
                  <div className="w-8 h-8 rounded-full flex items-center justify-center" style={{ backgroundColor: `${cat.color}20` }}>
                    <Folder className="w-4 h-4" style={{ color: cat.color }} />
                  </div>
                  <div className="flex-1">
                    <h4 className="font-medium">{cat.name}</h4>
                    <p className="text-xs text-muted-foreground">Slug: {cat.slug}</p>
                  </div>
                  <Badge variant="secondary">{cat.count} items</Badge>
                  <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Button variant="ghost" size="icon" className="h-8 w-8">
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive">
                      <Trash className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Add New Category */}
          <Card className="border-primary/20 bg-primary/5">
            <CardHeader>
              <CardTitle>Add New Category</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium mb-2 block">Category Name</label>
                <Input placeholder="e.g., Web Development" />
              </div>
              <div>
                <label className="text-sm font-medium mb-2 block">Slug</label>
                <Input placeholder="e.g., web-development" />
              </div>
              <div>
                <label className="text-sm font-medium mb-2 block">Color</label>
                <div className="flex gap-2">
                  <Input type="color" defaultValue="#7c3aed" className="w-16 h-10" />
                  <Input defaultValue="#7c3aed" className="font-mono" />
                </div>
              </div>
              <div>
                <label className="text-sm font-medium mb-2 block">Description (optional)</label>
                <Input placeholder="Brief description..." />
              </div>
              <Button className="w-full">Create Category</Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </AdminLayout>
  );
}
