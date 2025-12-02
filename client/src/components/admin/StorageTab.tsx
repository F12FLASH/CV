import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { api } from "@/lib/api";
import { 
  Database, HardDrive, Image, FileText, Film, 
  Trash2, RefreshCw, Upload, FolderOpen 
} from "lucide-react";

interface StorageStats {
  total: {
    size: number;
    sizeFormatted: string;
    files: number;
    maxStorage: number;
    maxStorageFormatted: string;
    usagePercent: string;
  };
  folders: {
    images: { size: number; sizeFormatted: string; files: number };
    documents: { size: number; sizeFormatted: string; files: number };
    media: { size: number; sizeFormatted: string; files: number };
  };
}

interface StorageFile {
  name: string;
  path: string;
  size: number;
  sizeFormatted: string;
  type: string;
  folder: string;
  modified: string;
}

export function StorageTab() {
  const { toast } = useToast();
  const [stats, setStats] = useState<StorageStats | null>(null);
  const [files, setFiles] = useState<StorageFile[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedFolder, setSelectedFolder] = useState<string>("all");

  const loadData = async () => {
    setLoading(true);
    try {
      const [statsData, filesData] = await Promise.all([
        api.getStorageStats(),
        api.getStorageFiles(selectedFolder === "all" ? undefined : selectedFolder)
      ]);
      setStats(statsData);
      setFiles(filesData);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [selectedFolder]);

  const handleDeleteFile = async (folder: string, filename: string) => {
    if (!confirm(`Delete file "${filename}"?`)) return;
    
    try {
      await api.deleteStorageFile(folder, filename);
      toast({
        title: "Success",
        description: "File deleted successfully"
      });
      loadData();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive"
      });
    }
  };

  const handleUpload = async () => {
    const input = document.createElement("input");
    input.type = "file";
    input.multiple = true;
    input.onchange = async (e: any) => {
      const fileList = e.target.files;
      if (fileList.length === 0) return;
      
      try {
        for (const file of fileList) {
          await api.uploadFile(file);
        }
        toast({
          title: "Success",
          description: `Uploaded ${fileList.length} file(s) successfully`
        });
        loadData();
      } catch (error: any) {
        toast({
          title: "Error",
          description: error.message,
          variant: "destructive"
        });
      }
    };
    input.click();
  };

  const getFolderIcon = (folder: string) => {
    switch (folder) {
      case "images": return <Image className="w-4 h-4" />;
      case "documents": return <FileText className="w-4 h-4" />;
      case "media": return <Film className="w-4 h-4" />;
      default: return <FolderOpen className="w-4 h-4" />;
    }
  };

  if (loading && !stats) {
    return (
      <div className="flex items-center justify-center p-8">
        <RefreshCw className="w-6 h-6 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <HardDrive className="w-5 h-5" /> Storage Overview
          </CardTitle>
          <CardDescription>
            Local file storage management
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {stats && (
            <>
              <div className="p-4 bg-muted rounded-lg">
                <div className="flex justify-between text-sm mb-2">
                  <span>Storage Used</span>
                  <span className="font-medium">
                    {stats.total.sizeFormatted} / {stats.total.maxStorageFormatted}
                  </span>
                </div>
                <div className="w-full bg-background rounded-full h-3">
                  <div 
                    className="bg-primary h-3 rounded-full transition-all"
                    style={{ width: `${Math.min(parseFloat(stats.total.usagePercent), 100)}%` }}
                  />
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  {stats.total.usagePercent}% used ({stats.total.files} files)
                </p>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div className="p-4 border rounded-lg text-center">
                  <Image className="w-6 h-6 mx-auto mb-2 text-blue-500" />
                  <p className="text-xs text-muted-foreground">Images</p>
                  <p className="text-lg font-bold">{stats.folders.images.files}</p>
                  <p className="text-xs text-muted-foreground">{stats.folders.images.sizeFormatted}</p>
                </div>
                <div className="p-4 border rounded-lg text-center">
                  <FileText className="w-6 h-6 mx-auto mb-2 text-green-500" />
                  <p className="text-xs text-muted-foreground">Documents</p>
                  <p className="text-lg font-bold">{stats.folders.documents.files}</p>
                  <p className="text-xs text-muted-foreground">{stats.folders.documents.sizeFormatted}</p>
                </div>
                <div className="p-4 border rounded-lg text-center">
                  <Film className="w-6 h-6 mx-auto mb-2 text-purple-500" />
                  <p className="text-xs text-muted-foreground">Media</p>
                  <p className="text-lg font-bold">{stats.folders.media.files}</p>
                  <p className="text-xs text-muted-foreground">{stats.folders.media.sizeFormatted}</p>
                </div>
              </div>
            </>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Database className="w-5 h-5" /> File Manager
            </CardTitle>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={loadData} data-testid="button-refresh-storage">
                <RefreshCw className="w-4 h-4 mr-1" /> Refresh
              </Button>
              <Button size="sm" onClick={handleUpload} data-testid="button-upload-file">
                <Upload className="w-4 h-4 mr-1" /> Upload
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-2">
            {["all", "images", "documents", "media"].map(folder => (
              <Button
                key={folder}
                variant={selectedFolder === folder ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedFolder(folder)}
                data-testid={`button-folder-${folder}`}
              >
                {folder === "all" ? "All" : folder.charAt(0).toUpperCase() + folder.slice(1)}
              </Button>
            ))}
          </div>

          <div className="space-y-2 max-h-96 overflow-y-auto">
            {files.length === 0 ? (
              <p className="text-center text-muted-foreground py-8">No files found</p>
            ) : (
              files.map((file, i) => (
                <div
                  key={i}
                  className="flex items-center justify-between p-3 border rounded-lg"
                  data-testid={`file-item-${i}`}
                >
                  <div className="flex items-center gap-3">
                    {getFolderIcon(file.folder)}
                    <div>
                      <p className="text-sm font-medium truncate max-w-xs">{file.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {file.sizeFormatted} &bull; {file.folder} &bull; {new Date(file.modified).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="text-xs">{file.type}</Badge>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-destructive"
                      onClick={() => handleDeleteFile(file.folder, file.name)}
                      data-testid={`button-delete-file-${i}`}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}