import { AdminLayout } from "@/layouts/AdminLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import { 
  Upload, 
  Search, 
  Image as ImageIcon, 
  File, 
  Trash2,
  Eye,
  Loader2,
  X,
  Copy,
  Grid3x3,
  List,
  FileText,
  Folder
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

function getFileIcon(mimeType: string) {
  if (mimeType.startsWith('image/')) {
    return <ImageIcon className="w-12 h-12 text-blue-500" />;
  }
  return <FileText className="w-12 h-12 text-muted-foreground" />;
}

export default function AdminMedia() {
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState("");
  const [filterType, setFilterType] = useState("all");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [uploadDialogOpen, setUploadDialogOpen] = useState(false);
  const [previewItem, setPreviewItem] = useState<MediaItem | null>(null);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { data: mediaItems = [], isLoading, error } = useQuery<MediaItem[]>({
    queryKey: ['/api/media'],
    retry: 3,
  });

  // Debug logging
  console.log('Media page state:', { 
    isLoading, 
    error: error?.message, 
    itemsCount: mediaItems.length 
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

    try {
      if (files.length === 1) {
        // Single file upload
        const formData = new FormData();
        formData.append('file', files[0]);
        
        const response = await fetch('/api/upload/file', {
          method: 'POST',
          body: formData,
          credentials: 'include',
        });
        
        if (!response.ok) {
          const error = await response.json();
          throw new Error(error.message || 'Upload failed');
        }
        
        toast({ title: "Success", description: "File uploaded successfully" });
        queryClient.invalidateQueries({ queryKey: ['/api/media'] });
      } else {
        // Multiple files upload
        const formData = new FormData();
        Array.from(files).forEach(file => {
          formData.append('files', file);
        });
        
        const response = await fetch('/api/upload/files', {
          method: 'POST',
          body: formData,
          credentials: 'include',
        });
        
        if (!response.ok) {
          const error = await response.json();
          throw new Error(error.message || 'Upload failed');
        }
        
        toast({ title: "Success", description: `${files.length} files uploaded successfully` });
        queryClient.invalidateQueries({ queryKey: ['/api/media'] });
      }
    } catch (error: any) {
      console.error('Upload error:', error);
      toast({ title: "Error", description: error.message || 'Upload failed', variant: "destructive" });
    }

    setUploading(false);
    setUploadDialogOpen(false);
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
    const matchesSearch = searchQuery === "" || 
      item.originalName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.filename.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesType = filterType === "all" ||
      (filterType === "images" && item.mimeType.startsWith("image/")) ||
      (filterType === "docs" && !item.mimeType.startsWith("image/"));
    
    return matchesSearch && matchesType;
  });

  const imageCount = mediaItems.filter(m => m.mimeType.startsWith("image/")).length;
  const docCount = mediaItems.filter(m => !m.mimeType.startsWith("image/")).length;
  const totalSize = mediaItems.reduce((sum, m) => sum + m.size, 0);
  const maxStorage = 500 * 1024 * 1024;
  const storagePercent = Math.round((totalSize / maxStorage) * 100);

  if (isLoading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center h-64">
          <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
          <p className="ml-2 text-muted-foreground">Loading media...</p>
        </div>
      </AdminLayout>
    );
  }

  if (error) {
    console.error('Media error:', error);
    return (
      <AdminLayout>
        <div className="flex flex-col items-center justify-center h-64">
          <p className="text-destructive mb-4">Error loading media: {error instanceof Error ? error.message : 'Unknown error'}</p>
          <Button onClick={() => window.location.reload()}>Reload Page</Button>
        </div>
      </AdminLayout>
    );
  }

  // Add explicit check for empty state
  if (!isLoading && !error && mediaItems.length === 0) {
    console.log('Media: No items found, showing empty state');
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-heading font-bold" data-testid="text-media-title">Media Library</h1>
            <p className="text-muted-foreground">
              {mediaItems.length} files ({formatFileSize(totalSize)} total)
            </p>
          </div>
          <div className="flex gap-2">
            <Button 
              onClick={() => setUploadDialogOpen(true)}
              data-testid="button-upload-files"
            >
              <Upload className="w-4 h-4 mr-2" /> Upload Files
            </Button>
          </div>
        </div>

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

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card className="cursor-pointer hover:border-primary transition-colors" onClick={() => setFilterType("images")}>
            <CardContent className="p-4">
              <div className="flex items-start justify-between mb-3">
                <div className="p-3 bg-blue-500/10 rounded-lg">
                  <ImageIcon className="w-6 h-6 text-blue-500" />
                </div>
              </div>
              <h4 className="font-bold mb-1">Images</h4>
              <div className="flex gap-2 text-xs text-muted-foreground">
                <span>{imageCount} files</span>
                <span>-</span>
                <span>{formatFileSize(mediaItems.filter(m => m.mimeType.startsWith("image/")).reduce((s, m) => s + m.size, 0))}</span>
              </div>
            </CardContent>
          </Card>
          <Card className="cursor-pointer hover:border-primary transition-colors" onClick={() => setFilterType("docs")}>
            <CardContent className="p-4">
              <div className="flex items-start justify-between mb-3">
                <div className="p-3 bg-orange-500/10 rounded-lg">
                  <FileText className="w-6 h-6 text-orange-500" />
                </div>
              </div>
              <h4 className="font-bold mb-1">Documents</h4>
              <div className="flex gap-2 text-xs text-muted-foreground">
                <span>{docCount} files</span>
                <span>-</span>
                <span>{formatFileSize(mediaItems.filter(m => !m.mimeType.startsWith("image/")).reduce((s, m) => s + m.size, 0))}</span>
              </div>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardContent className="pt-6">
            <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
              <div className="relative flex-1 w-full">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input 
                  placeholder="Search files..." 
                  className="pl-9"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  data-testid="input-search-media"
                />
              </div>
              <div className="flex items-center gap-2">
                <Tabs value={filterType} onValueChange={setFilterType} className="w-auto">
                  <TabsList>
                    <TabsTrigger value="all" data-testid="tab-all">All ({mediaItems.length})</TabsTrigger>
                    <TabsTrigger value="images" data-testid="tab-images">Images ({imageCount})</TabsTrigger>
                    <TabsTrigger value="docs" data-testid="tab-docs">Docs ({docCount})</TabsTrigger>
                  </TabsList>
                </Tabs>
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

        {filteredMedia.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <ImageIcon className="w-12 h-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">No files found</h3>
              <p className="text-muted-foreground text-sm mb-4">
                {searchQuery ? "Try adjusting your search" : "Upload your first file"}
              </p>
              <Button onClick={() => setUploadDialogOpen(true)}>
                <Upload className="w-4 h-4 mr-2" /> Upload Files
              </Button>
            </CardContent>
          </Card>
        ) : viewMode === "grid" ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
            {filteredMedia.map((item) => (
              <div 
                key={item.id} 
                className="group relative bg-card border border-border rounded-lg overflow-hidden hover:shadow-md transition-all"
                data-testid={`media-item-${item.id}`}
              >
                <div className="aspect-square bg-muted flex items-center justify-center relative overflow-hidden">
                  {item.mimeType.startsWith("image/") ? (
                    <img 
                      src={item.url} 
                      alt={item.alt || item.originalName} 
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" 
                    />
                  ) : (
                    getFileIcon(item.mimeType)
                  )}
                  
                  <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                    <Button 
                      size="icon" 
                      variant="secondary" 
                      className="h-8 w-8 rounded-full"
                      onClick={() => setPreviewItem(item)}
                      title="Preview"
                    >
                      <Eye size={14} />
                    </Button>
                    <Button 
                      size="icon" 
                      variant="secondary" 
                      className="h-8 w-8 rounded-full"
                      onClick={() => copyToClipboard(item.url)}
                      title="Copy URL"
                    >
                      <Copy size={14} />
                    </Button>
                    <Button 
                      size="icon" 
                      variant="secondary" 
                      className="h-8 w-8 rounded-full text-destructive"
                      onClick={() => handleDelete(item.id, item.originalName)}
                      title="Delete"
                    >
                      <Trash2 size={14} />
                    </Button>
                  </div>
                </div>
                <div className="p-3">
                  <div className="font-medium text-sm truncate" title={item.originalName}>
                    {item.originalName}
                  </div>
                  <div className="text-xs text-muted-foreground flex justify-between mt-1">
                    <span>{item.mimeType.split('/')[1]?.toUpperCase() || 'FILE'}</span>
                    <span>{formatFileSize(item.size)}</span>
                  </div>
                </div>
              </div>
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
                    data-testid={`media-row-${file.id}`}
                  >
                    <div className="flex items-center gap-3">
                      {file.mimeType.startsWith("image/") ? (
                        <div className="w-10 h-10 rounded overflow-hidden bg-muted flex items-center justify-center">
                          <img 
                            src={file.url} 
                            alt={file.alt || file.originalName}
                            className="w-full h-full object-cover"
                          />
                        </div>
                      ) : (
                        <div className="w-10 h-10 rounded bg-muted flex items-center justify-center">
                          <FileText className="w-5 h-5 text-muted-foreground" />
                        </div>
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

        <Dialog open={uploadDialogOpen} onOpenChange={setUploadDialogOpen}>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>Upload Files</DialogTitle>
              <DialogDescription>
                Select files to upload to your media library
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
                  data-testid="input-file-upload"
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
                  {getFileIcon(previewItem?.mimeType || '')}
                  <p className="text-muted-foreground mt-4">Preview not available</p>
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
