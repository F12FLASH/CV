import { AdminLayout } from "@/layouts/AdminLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { 
  Upload, 
  Search, 
  Image as ImageIcon, 
  File, 
  Trash2,
  Download,
  Eye,
  Loader2,
  X,
  FolderPlus,
  Copy
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
  return <File className="w-12 h-12 text-muted-foreground" />;
}

export default function AdminMedia() {
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState("");
  const [filterType, setFilterType] = useState("all");
  const [uploadDialogOpen, setUploadDialogOpen] = useState(false);
  const [previewItem, setPreviewItem] = useState<MediaItem | null>(null);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { data: mediaItems = [], isLoading, refetch } = useQuery<MediaItem[]>({
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
            <h1 className="text-3xl font-heading font-bold">Media Library</h1>
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
          <CardContent className="pt-6">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input 
                  placeholder="Search files..." 
                  className="pl-9"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  data-testid="input-search-media"
                />
              </div>
              <Tabs value={filterType} onValueChange={setFilterType} className="w-auto">
                <TabsList>
                  <TabsTrigger value="all">All ({mediaItems.length})</TabsTrigger>
                  <TabsTrigger value="images">Images ({imageCount})</TabsTrigger>
                  <TabsTrigger value="docs">Documents ({docCount})</TabsTrigger>
                </TabsList>
              </Tabs>
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
        ) : (
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
                  accept="image/*,.pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx"
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
                <div className="flex items-center justify-center py-12">
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
