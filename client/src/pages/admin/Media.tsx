import { AdminLayout } from "@/layouts/AdminLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Upload, Search, Image as ImageIcon, File, MoreVertical } from "lucide-react";

const mediaItems = [
  { id: 1, name: "hero-bg.jpg", type: "image/jpeg", size: "1.2 MB", url: "https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=300&q=80" },
  { id: 2, name: "avatar-3d.png", type: "image/png", size: "450 KB", url: "https://images.unsplash.com/photo-1633332755192-727a05c4013d?auto=format&fit=crop&w=300&q=80" },
  { id: 3, name: "project-1.jpg", type: "image/jpeg", size: "2.4 MB", url: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=300&q=80" },
  { id: 4, name: "cv-resume.pdf", type: "application/pdf", size: "156 KB", url: null },
  { id: 5, name: "logo-white.svg", type: "image/svg+xml", size: "12 KB", url: "https://images.unsplash.com/photo-1568952433726-3896e3881c65?auto=format&fit=crop&w=300&q=80" },
  { id: 6, name: "banner.jpg", type: "image/jpeg", size: "3.1 MB", url: "https://images.unsplash.com/photo-1550751827-4bd374c3f58b?auto=format&fit=crop&w=300&q=80" },
];

export default function AdminMedia() {
  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-heading font-bold">Media Library</h1>
            <p className="text-muted-foreground">Manage your images and documents</p>
          </div>
          <div className="flex gap-2">
             <Button variant="outline">Create Folder</Button>
             <Button className="bg-primary hover:bg-primary/90">
              <Upload className="w-4 h-4 mr-2" /> Upload Files
            </Button>
          </div>
        </div>

        {/* Toolbar */}
        <div className="flex flex-col sm:flex-row gap-4 bg-card p-4 rounded-lg border border-border">
          <div className="relative flex-1">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input placeholder="Search files..." className="pl-9" />
          </div>
          <Tabs defaultValue="all" className="w-auto">
            <TabsList>
              <TabsTrigger value="all">All</TabsTrigger>
              <TabsTrigger value="images">Images</TabsTrigger>
              <TabsTrigger value="docs">Documents</TabsTrigger>
            </TabsList>
          </Tabs>
        </div>

        {/* Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
          {mediaItems.map((item) => (
            <div key={item.id} className="group relative bg-card border border-border rounded-lg overflow-hidden hover:shadow-md transition-all">
              <div className="aspect-square bg-muted flex items-center justify-center relative overflow-hidden">
                {item.url ? (
                  <img src={item.url} alt={item.name} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />
                ) : (
                  <File className="w-12 h-12 text-muted-foreground" />
                )}
                
                {/* Overlay Actions */}
                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                  <Button size="icon" variant="secondary" className="h-8 w-8 rounded-full">
                    <MoreVertical size={14} />
                  </Button>
                </div>
              </div>
              <div className="p-3">
                <div className="font-medium text-sm truncate" title={item.name}>{item.name}</div>
                <div className="text-xs text-muted-foreground flex justify-between mt-1">
                  <span>{item.type.split('/')[1].toUpperCase()}</span>
                  <span>{item.size}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </AdminLayout>
  );
}
