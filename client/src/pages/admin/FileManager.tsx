
import { AdminLayout } from "@/layouts/AdminLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Upload, 
  Search, 
  FolderPlus,
  File,
  Folder,
  Image as ImageIcon,
  FileText,
  Download,
  Trash2,
  MoreVertical,
  Grid3x3,
  List,
  ArrowLeft
} from "lucide-react";
import { useState } from "react";

export default function FileManager() {
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [currentPath, setCurrentPath] = useState("/");

  const folders = [
    { name: "Images", count: 45, size: "12.5 MB" },
    { name: "Documents", count: 12, size: "3.2 MB" },
    { name: "Videos", count: 5, size: "125 MB" },
    { name: "Projects", count: 8, size: "45 MB" },
  ];

  const files = [
    { name: "hero-background.jpg", type: "image", size: "1.2 MB", date: "Mar 20, 2024" },
    { name: "portfolio.pdf", type: "document", size: "450 KB", date: "Mar 19, 2024" },
    { name: "logo.svg", type: "image", size: "12 KB", date: "Mar 18, 2024" },
    { name: "presentation.pptx", type: "document", size: "5.5 MB", date: "Mar 17, 2024" },
  ];

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-heading font-bold">File Manager</h1>
            <p className="text-muted-foreground">Browse and manage your files</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline">
              <FolderPlus className="w-4 h-4 mr-2" /> New Folder
            </Button>
            <Button className="bg-primary">
              <Upload className="w-4 h-4 mr-2" /> Upload Files
            </Button>
          </div>
        </div>

        {/* Toolbar */}
        <Card>
          <CardContent className="p-4">
            <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
              {/* Breadcrumb */}
              <div className="flex items-center gap-2 text-sm">
                <Button variant="ghost" size="icon" className="h-8 w-8">
                  <ArrowLeft className="w-4 h-4" />
                </Button>
                <span className="text-muted-foreground">Home</span>
                <span className="text-muted-foreground">/</span>
                <span className="font-medium">{currentPath}</span>
              </div>

              {/* Search & View Toggle */}
              <div className="flex gap-2 w-full sm:w-auto">
                <div className="relative flex-1 sm:w-64">
                  <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input placeholder="Search files..." className="pl-9" />
                </div>
                <div className="flex gap-1 border rounded-md p-1">
                  <Button 
                    variant={viewMode === "grid" ? "secondary" : "ghost"} 
                    size="icon"
                    className="h-8 w-8"
                    onClick={() => setViewMode("grid")}
                  >
                    <Grid3x3 className="w-4 h-4" />
                  </Button>
                  <Button 
                    variant={viewMode === "list" ? "secondary" : "ghost"} 
                    size="icon"
                    className="h-8 w-8"
                    onClick={() => setViewMode("list")}
                  >
                    <List className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Storage Stats */}
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium">Storage Used</span>
              <span className="text-sm text-muted-foreground">186.2 MB / 500 MB</span>
            </div>
            <div className="w-full bg-muted rounded-full h-2 overflow-hidden">
              <div className="bg-primary h-full rounded-full" style={{ width: '37%' }} />
            </div>
          </CardContent>
        </Card>

        {/* Folders Section */}
        <div>
          <h3 className="text-lg font-bold mb-4">Folders</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {folders.map((folder, i) => (
              <Card key={i} className="cursor-pointer hover:border-primary transition-colors group">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div className="p-3 bg-primary/10 rounded-lg">
                      <Folder className="w-6 h-6 text-primary" />
                    </div>
                    <Button variant="ghost" size="icon" className="h-8 w-8 opacity-0 group-hover:opacity-100">
                      <MoreVertical className="w-4 h-4" />
                    </Button>
                  </div>
                  <h4 className="font-bold mb-1">{folder.name}</h4>
                  <div className="flex gap-2 text-xs text-muted-foreground">
                    <span>{folder.count} files</span>
                    <span>•</span>
                    <span>{folder.size}</span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Files Section */}
        <div>
          <h3 className="text-lg font-bold mb-4">Recent Files</h3>
          {viewMode === "grid" ? (
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
              {files.map((file, i) => (
                <Card key={i} className="group hover:border-primary transition-colors cursor-pointer">
                  <div className="aspect-square bg-muted flex items-center justify-center relative overflow-hidden">
                    {file.type === "image" ? (
                      <ImageIcon className="w-12 h-12 text-muted-foreground" />
                    ) : (
                      <FileText className="w-12 h-12 text-muted-foreground" />
                    )}
                    <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                      <Button size="icon" variant="secondary" className="h-8 w-8">
                        <Download className="w-4 h-4" />
                      </Button>
                      <Button size="icon" variant="secondary" className="h-8 w-8">
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                  <CardContent className="p-3">
                    <p className="font-medium text-sm truncate" title={file.name}>{file.name}</p>
                    <p className="text-xs text-muted-foreground">{file.size}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <Card>
              <CardContent className="p-0">
                <div className="divide-y">
                  {files.map((file, i) => (
                    <div key={i} className="flex items-center justify-between p-4 hover:bg-muted/50 cursor-pointer group">
                      <div className="flex items-center gap-3">
                        {file.type === "image" ? (
                          <ImageIcon className="w-5 h-5 text-muted-foreground" />
                        ) : (
                          <FileText className="w-5 h-5 text-muted-foreground" />
                        )}
                        <div>
                          <p className="font-medium text-sm">{file.name}</p>
                          <p className="text-xs text-muted-foreground">{file.date}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <span className="text-sm text-muted-foreground">{file.size}</span>
                        <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <Button variant="ghost" size="icon" className="h-8 w-8">
                            <Download className="w-4 h-4" />
                          </Button>
                          <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive">
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </AdminLayout>
  );
}
