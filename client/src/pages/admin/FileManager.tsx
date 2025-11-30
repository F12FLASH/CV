import { AdminLayout } from "@/layouts/AdminLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
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
  Grid3x3,
  List,
  ArrowLeft,
  Loader2,
  Copy,
  Eye,
  X
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { useState, useRef } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { formatDistanceToNow } from "date-fns";

interface MediaItem {
  id: number;
  filename: string;
  originalName: string;
  mimeType: string;
  size: number;
  url: string;
  alt: string | null;
  createdAt: Date | null;
}

function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
}

export default function FileManager() {
  const { toast } = useToast();
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [searchQuery, setSearchQuery] = useState("");
  const [uploadDialogOpen, setUploadDialogOpen] = useState(false);
  const [previewItem, setPreviewItem] = useState<MediaItem | null>(null);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { data: mediaItems = [], isLoading } = useQuery<MediaItem[]>({
    queryKey: ['/api/media'],
  });

  const createMediaMutation = useMutation({
    mutationFn: api.createMedia,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/media'] });
      toast({ title: "Success", description: "File uploaded successfully" });
      setUploadDialogOpen(false);
    },
    onError: (error: any) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    },
  });

  const deleteMediaMutation = useMutation({
    mutationFn: api.deleteMedia,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/media'] });
      toast({ title: "Success", description: "File deleted successfully" });
    },
    onError: (error: any) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    },
  });

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setUploading(true);

    for (const file of Array.from(files)) {
      try {
        const reader = new FileReader();
        reader.onload = async () => {
          const base64 = reader.result as string;
          const timestamp = Date.now();
          const filename = `${timestamp}-${file.name.replace(/[^a-zA-Z0-9.-]/g, '_')}`;
          
          await createMediaMutation.mutateAsync({
            filename,
            originalName: file.name,
            mimeType: file.type,
            size: file.size,
            url: base64,
            alt: file.name,
          });
        };
        reader.readAsDataURL(file);
      } catch (error) {
        console.error('Upload error:', error);
      }
    }

    setUploading(false);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleDelete = (id: number, name: string) => {
    if (confirm(`Delete "${name}"? This action cannot be undone.`)) {
      deleteMediaMutation.mutate(id);
    }
  };

  const copyToClipboard = (url: string) => {
    navigator.clipboard.writeText(url);
    toast({ title: "Copied", description: "URL copied to clipboard" });
  };

  const filteredMedia = mediaItems.filter(item => {
    return searchQuery === "" || 
      item.originalName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.filename.toLowerCase().includes(searchQuery.toLowerCase());
  });

  const images = mediaItems.filter(m => m.mimeType.startsWith("image/"));
  const documents = mediaItems.filter(m => !m.mimeType.startsWith("image/"));
  const totalSize = mediaItems.reduce((sum, m) => sum + m.size, 0);
  const maxStorage = 500 * 1024 * 1024;
  const storagePercent = Math.round((totalSize / maxStorage) * 100);

  const folders = [
    { name: "Images", count: images.length, size: formatFileSize(images.reduce((s, m) => s + m.size, 0)), type: "images" },
    { name: "Documents", count: documents.length, size: formatFileSize(documents.reduce((s, m) => s + m.size, 0)), type: "docs" },
  ];

  if (isLoading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center h-64">
          <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-heading font-bold">File Manager</h1>
            <p className="text-muted-foreground">
              Browse and manage your files ({mediaItems.length} files)
            </p>
          </div>
          <div className="flex gap-2">
            <Button onClick={() => setUploadDialogOpen(true)} data-testid="button-upload">
              <Upload className="w-4 h-4 mr-2" /> Upload Files
            </Button>
          </div>
        </div>

        <Card>
          <CardContent className="p-4">
            <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
              <div className="flex gap-2 w-full sm:w-auto">
                <div className="relative flex-1 sm:w-64">
                  <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input 
                    placeholder="Search files..." 
                    className="pl-9"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    data-testid="input-search-files"
                  />
                </div>
                <div className="flex gap-1 border rounded-md p-1">
                  <Button 
                    variant={viewMode === "grid" ? "secondary" : "ghost"} 
                    size="icon"
                    onClick={() => setViewMode("grid")}
                    data-testid="button-view-grid"
                  >
                    <Grid3x3 className="w-4 h-4" />
                  </Button>
                  <Button 
                    variant={viewMode === "list" ? "secondary" : "ghost"} 
                    size="icon"
                    onClick={() => setViewMode("list")}
                    data-testid="button-view-list"
                  >
                    <List className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium">Storage Used</span>
              <span className="text-sm text-muted-foreground">
                {formatFileSize(totalSize)} / 500 MB
              </span>
            </div>
            <div className="w-full bg-muted rounded-full h-2 overflow-hidden">
              <div 
                className="bg-primary h-full rounded-full transition-all" 
                style={{ width: `${Math.min(storagePercent, 100)}%` }} 
              />
            </div>
          </CardContent>
        </Card>

        <div>
          <h3 className="text-lg font-bold mb-4">Categories</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {folders.map((folder) => (
              <Card key={folder.name} className="cursor-pointer hover:border-primary transition-colors group">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div className="p-3 bg-primary/10 rounded-lg">
                      <Folder className="w-6 h-6 text-primary" />
                    </div>
                  </div>
                  <h4 className="font-bold mb-1">{folder.name}</h4>
                  <div className="flex gap-2 text-xs text-muted-foreground">
                    <span>{folder.count} files</span>
                    <span>-</span>
                    <span>{folder.size}</span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        <div>
          <h3 className="text-lg font-bold mb-4">
            {searchQuery ? `Search Results (${filteredMedia.length})` : `All Files (${mediaItems.length})`}
          </h3>
          
          {filteredMedia.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <File className="w-12 h-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">No files found</h3>
                <p className="text-muted-foreground text-sm mb-4">
                  {searchQuery ? "Try adjusting your search" : "Upload your first file to get started"}
                </p>
                <Button onClick={() => setUploadDialogOpen(true)}>
                  <Upload className="w-4 h-4 mr-2" /> Upload Files
                </Button>
              </CardContent>
            </Card>
          ) : viewMode === "grid" ? (
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
              {filteredMedia.map((file) => (
                <Card key={file.id} className="group hover:border-primary transition-colors cursor-pointer" data-testid={`file-card-${file.id}`}>
                  <div className="aspect-square bg-muted flex items-center justify-center relative overflow-hidden">
                    {file.mimeType.startsWith("image/") ? (
                      <img 
                        src={file.url} 
                        alt={file.alt || file.originalName}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <FileText className="w-12 h-12 text-muted-foreground" />
                    )}
                    <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                      <Button 
                        size="icon" 
                        variant="secondary"
                        onClick={() => setPreviewItem(file)}
                        title="Preview"
                      >
                        <Eye className="w-4 h-4" />
                      </Button>
                      <Button 
                        size="icon" 
                        variant="secondary"
                        onClick={() => copyToClipboard(file.url)}
                        title="Copy URL"
                      >
                        <Copy className="w-4 h-4" />
                      </Button>
                      <Button 
                        size="icon" 
                        variant="secondary"
                        className="text-destructive"
                        onClick={() => handleDelete(file.id, file.originalName)}
                        title="Delete"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                  <CardContent className="p-3">
                    <p className="font-medium text-sm truncate" title={file.originalName}>
                      {file.originalName}
                    </p>
                    <p className="text-xs text-muted-foreground">{formatFileSize(file.size)}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <Card>
              <CardContent className="p-0">
                <div className="divide-y">
                  {filteredMedia.map((file) => (
                    <div 
                      key={file.id} 
                      className="flex items-center justify-between p-4 hover:bg-muted/50 cursor-pointer group"
                      data-testid={`file-row-${file.id}`}
                    >
                      <div className="flex items-center gap-3">
                        {file.mimeType.startsWith("image/") ? (
                          <ImageIcon className="w-5 h-5 text-muted-foreground" />
                        ) : (
                          <FileText className="w-5 h-5 text-muted-foreground" />
                        )}
                        <div>
                          <p className="font-medium text-sm">{file.originalName}</p>
                          <p className="text-xs text-muted-foreground">
                            {file.createdAt && formatDistanceToNow(new Date(file.createdAt), { addSuffix: true })}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <span className="text-sm text-muted-foreground">{formatFileSize(file.size)}</span>
                        <div className="flex gap-1 invisible group-hover:visible transition-all">
                          <Button 
                            variant="ghost" 
                            size="icon"
                            onClick={() => setPreviewItem(file)}
                          >
                            <Eye className="w-4 h-4" />
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="icon"
                            onClick={() => copyToClipboard(file.url)}
                          >
                            <Copy className="w-4 h-4" />
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            className="text-destructive"
                            onClick={() => handleDelete(file.id, file.originalName)}
                          >
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

        <Dialog open={uploadDialogOpen} onOpenChange={setUploadDialogOpen}>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>Upload Files</DialogTitle>
              <DialogDescription>
                Select files to upload to your file manager
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4 py-4">
              <div 
                className="border-2 border-dashed border-muted-foreground/30 rounded-lg p-8 text-center cursor-pointer hover:border-primary/50 hover:bg-primary/5 transition-all"
                onClick={() => fileInputRef.current?.click()}
              >
                <Upload className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                <p className="text-sm font-medium mb-2">Click to select files</p>
                <p className="text-xs text-muted-foreground">
                  Supports images, PDFs, and documents
                </p>
                <input
                  ref={fileInputRef}
                  type="file"
                  className="hidden"
                  multiple
                  accept="image/*,.pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.txt"
                  onChange={handleFileSelect}
                  data-testid="input-file"
                />
              </div>

              {uploading && (
                <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Uploading...</span>
                </div>
              )}
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={() => setUploadDialogOpen(false)}>
                <X className="w-4 h-4 mr-2" /> Close
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        <Dialog open={!!previewItem} onOpenChange={() => setPreviewItem(null)}>
          <DialogContent className="sm:max-w-[700px]">
            <DialogHeader>
              <DialogTitle>{previewItem?.originalName}</DialogTitle>
              <DialogDescription>
                {previewItem?.mimeType} - {previewItem && formatFileSize(previewItem.size)}
              </DialogDescription>
            </DialogHeader>

            <div className="py-4">
              {previewItem?.mimeType.startsWith("image/") ? (
                <img 
                  src={previewItem.url} 
                  alt={previewItem.alt || previewItem.originalName}
                  className="max-w-full max-h-[400px] mx-auto rounded-lg"
                />
              ) : (
                <div className="flex flex-col items-center justify-center py-12">
                  <FileText className="w-16 h-16 text-muted-foreground mb-4" />
                  <p className="text-muted-foreground">Preview not available for this file type</p>
                </div>
              )}
            </div>

            <DialogFooter>
              <Button 
                variant="outline" 
                onClick={() => previewItem && copyToClipboard(previewItem.url)}
              >
                <Copy className="w-4 h-4 mr-2" /> Copy URL
              </Button>
              <Button variant="outline" onClick={() => setPreviewItem(null)}>
                <X className="w-4 h-4 mr-2" /> Close
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </AdminLayout>
  );
}
