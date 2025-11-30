import { AdminLayout } from "@/layouts/AdminLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useState } from "react";
import { File, Folder, Plus, Upload, Download, Trash2, Grid3X3, List, Search } from "lucide-react";
import { Input } from "@/components/ui/input";

export default function AdminFileManager() {
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [currentPath, setCurrentPath] = useState("/");

  const files = [
    { id: 1, name: "portfolio.pdf", type: "file", size: "2.4 MB", modified: "Mar 20, 2024" },
    { id: 2, name: "Projects", type: "folder", modified: "Mar 19, 2024" },
    { id: 3, name: "Design Assets", type: "folder", modified: "Mar 18, 2024" },
    { id: 4, name: "resume.docx", type: "file", size: "1.2 MB", modified: "Mar 17, 2024" },
  ];

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-heading font-bold">File Manager</h1>
            <p className="text-muted-foreground">Manage and organize your files</p>
          </div>
          <Button className="bg-primary gap-2">
            <Upload className="w-4 h-4" /> Upload Files
          </Button>
        </div>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>My Files</CardTitle>
              <p className="text-sm text-muted-foreground">Current path: {currentPath}</p>
            </div>
            <div className="flex gap-2">
              <Button variant={viewMode === "grid" ? "default" : "outline"} size="icon" onClick={() => setViewMode("grid")}>
                <Grid3X3 className="w-4 h-4" />
              </Button>
              <Button variant={viewMode === "list" ? "default" : "outline"} size="icon" onClick={() => setViewMode("list")}>
                <List className="w-4 h-4" />
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="relative mb-6">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input placeholder="Search files..." className="pl-9" />
            </div>

            {viewMode === "grid" ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {files.map((file) => (
                  <div key={file.id} className="border border-border rounded-lg p-4 hover:bg-muted/50 transition-colors group">
                    <div className="flex items-center justify-between mb-3">
                      <div className="p-2 bg-muted rounded">
                        {file.type === "folder" ? <Folder className="w-5 h-5 text-blue-500" /> : <File className="w-5 h-5 text-gray-500" />}
                      </div>
                      <Button variant="ghost" size="icon" className="h-6 w-6 opacity-0 group-hover:opacity-100">
                        <Trash2 className="w-4 h-4 text-destructive" />
                      </Button>
                    </div>
                    <h4 className="font-medium truncate">{file.name}</h4>
                    {file.type === "file" && <p className="text-xs text-muted-foreground">{file.size}</p>}
                    <p className="text-xs text-muted-foreground">{file.modified}</p>
                  </div>
                ))}
              </div>
            ) : (
              <div className="space-y-2">
                {files.map((file) => (
                  <div key={file.id} className="flex items-center justify-between p-4 border border-border rounded-lg hover:bg-muted/50">
                    <div className="flex items-center gap-4 flex-1">
                      {file.type === "folder" ? <Folder className="w-5 h-5 text-blue-500" /> : <File className="w-5 h-5 text-gray-500" />}
                      <div className="flex-1">
                        <p className="font-medium">{file.name}</p>
                        <p className="text-xs text-muted-foreground">{file.modified}</p>
                      </div>
                    </div>
                    {file.type === "file" && <span className="text-sm text-muted-foreground mr-4">{file.size}</span>}
                    <Button variant="ghost" size="icon"><Trash2 className="w-4 h-4 text-destructive" /></Button>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
}
