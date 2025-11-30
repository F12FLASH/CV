import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Upload, Trash2, Eye, ChevronLeft, ChevronRight, Link as LinkIcon } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface Image {
  id: number;
  url: string;
  alt: string;
}

interface ImageGalleryProps {
  images: Image[];
  onAddImage?: (url: string, alt: string) => void;
  onDeleteImage?: (id: number) => void;
  onReorder?: (images: Image[]) => void;
}

export function ImageGallery({
  images,
  onAddImage,
  onDeleteImage,
  onReorder,
}: ImageGalleryProps) {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [draggedItem, setDraggedItem] = useState<number | null>(null);
  const [showUploadDialog, setShowUploadDialog] = useState(false);
  const [imageUrl, setImageUrl] = useState("");
  const [imageAlt, setImageAlt] = useState("");
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDragStart = (index: number) => {
    setDraggedItem(index);
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    const reader = new FileReader();
    reader.onloadend = () => {
      const base64String = reader.result as string;
      setImageUrl(base64String);
      setImageAlt(file.name);
      setUploading(false);
    };
    reader.readAsDataURL(file);
  };

  const handleAddImage = () => {
    if (imageUrl && onAddImage) {
      onAddImage(imageUrl, imageAlt || "Image");
      setImageUrl("");
      setImageAlt("");
      setShowUploadDialog(false);
    }
  };

  const openUploadDialog = () => {
    setShowUploadDialog(true);
    setImageUrl("");
    setImageAlt("");
  };

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    if (draggedItem === null || draggedItem === index) return;

    const newImages = [...images];
    const [draggedImage] = newImages.splice(draggedItem, 1);
    newImages.splice(index, 0, draggedImage);
    onReorder?.(newImages);
    setDraggedItem(index);
  };

  const next = () => setSelectedIndex((i) => (i + 1) % images.length);
  const prev = () =>
    setSelectedIndex((i) => (i - 1 + images.length) % images.length);

  return (
    <div className="space-y-4">
      {/* Lightbox Preview */}
      {images.length > 0 && (
        <Card className="relative bg-muted aspect-video overflow-hidden flex items-center justify-center">
          <div className="w-full h-full bg-gradient-to-br from-muted to-muted/50 flex items-center justify-center">
            <div className="text-center">
              <Eye className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
              <p className="text-sm text-muted-foreground">{images[selectedIndex]?.alt}</p>
            </div>
          </div>

          {images.length > 1 && (
            <>
              <Button
                variant="ghost"
                size="icon"
                className="absolute left-2 top-1/2 -translate-y-1/2"
                onClick={prev}
              >
                <ChevronLeft className="w-6 h-6" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="absolute right-2 top-1/2 -translate-y-1/2"
                onClick={next}
              >
                <ChevronRight className="w-6 h-6" />
              </Button>
              <div className="absolute bottom-2 left-1/2 -translate-x-1/2 text-xs bg-black/50 text-white px-2 py-1 rounded">
                {selectedIndex + 1} / {images.length}
              </div>
            </>
          )}
        </Card>
      )}

      {/* Thumbnails & Drag-drop */}
      <div className="space-y-2">
        <div className="flex justify-between items-center">
          <h4 className="font-medium text-sm">Gallery ({images.length})</h4>
          {onAddImage && (
            <Button size="sm" variant="outline" onClick={openUploadDialog} className="gap-2">
              <Upload className="w-4 h-4" /> Add Image
            </Button>
          )}
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          {images.map((img, idx) => (
            <div
              key={img.id}
              draggable
              onDragStart={() => handleDragStart(idx)}
              onDragOver={(e) => handleDragOver(e, idx)}
              onDragEnd={() => setDraggedItem(null)}
              className={`relative group aspect-square rounded-lg overflow-hidden border-2 transition-all cursor-move ${
                selectedIndex === idx
                  ? "border-primary"
                  : "border-border hover:border-primary/50"
              } ${draggedItem === idx ? "opacity-50" : ""}`}
              onClick={() => setSelectedIndex(idx)}
            >
              <div className="w-full h-full bg-gradient-to-br from-muted to-muted/50 flex items-center justify-center">
                <span className="text-xs text-muted-foreground text-center px-1">
                  {img.alt}
                </span>
              </div>
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/50 transition-colors flex items-center justify-center opacity-0 group-hover:opacity-100">
                {onDeleteImage && (
                  <Button
                    variant="destructive"
                    size="icon"
                    className="h-6 w-6"
                    onClick={(e) => {
                      e.stopPropagation();
                      onDeleteImage(img.id);
                    }}
                  >
                    <Trash2 className="w-3 h-3" />
                  </Button>
                )}
              </div>
            </div>
          ))}
        </div>
        <p className="text-xs text-muted-foreground">Drag to reorder images</p>
      </div>

      {/* Upload Dialog */}
      <Dialog open={showUploadDialog} onOpenChange={setShowUploadDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Image</DialogTitle>
          </DialogHeader>
          <Tabs defaultValue="url">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="url">From URL</TabsTrigger>
              <TabsTrigger value="upload">Upload File</TabsTrigger>
            </TabsList>
            <TabsContent value="url" className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="image-url">Image URL</Label>
                <Input
                  id="image-url"
                  placeholder="https://example.com/image.jpg or /images/blog/bg-1.png"
                  value={imageUrl}
                  onChange={(e) => setImageUrl(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="image-alt">Image Description</Label>
                <Input
                  id="image-alt"
                  placeholder="Description of the image"
                  value={imageAlt}
                  onChange={(e) => setImageAlt(e.target.value)}
                />
              </div>
              {imageUrl && (
                <div className="border rounded-md overflow-hidden">
                  <img src={imageUrl} alt="Preview" className="w-full h-40 object-cover" />
                </div>
              )}
            </TabsContent>
            <TabsContent value="upload" className="space-y-4">
              <div className="space-y-2">
                <Label>Upload Image</Label>
                <div className="border-2 border-dashed rounded-lg p-8 text-center cursor-pointer hover:border-primary/50" onClick={() => fileInputRef.current?.click()}>
                  <Upload className="w-8 h-8 mx-auto mb-2 text-muted-foreground" />
                  <p className="text-sm text-muted-foreground">Click to upload or drag and drop</p>
                  <p className="text-xs text-muted-foreground mt-1">PNG, JPG, GIF, WebP (Max 10MB)</p>
                </div>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleFileUpload}
                  className="hidden"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="upload-alt">Image Description</Label>
                <Input
                  id="upload-alt"
                  placeholder="Description of the image"
                  value={imageAlt}
                  onChange={(e) => setImageAlt(e.target.value)}
                />
              </div>
              {imageUrl && (
                <div className="border rounded-md overflow-hidden">
                  <img src={imageUrl} alt="Preview" className="w-full h-40 object-cover" />
                </div>
              )}
            </TabsContent>
          </Tabs>
          <div className="flex gap-2 justify-end">
            <Button variant="outline" onClick={() => setShowUploadDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleAddImage} disabled={!imageUrl || uploading}>
              {uploading ? "Uploading..." : "Add Image"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
