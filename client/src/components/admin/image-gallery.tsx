import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Upload, Trash2, Eye, ChevronLeft, ChevronRight } from "lucide-react";

interface Image {
  id: number;
  url: string;
  alt: string;
}

interface ImageGalleryProps {
  images: Image[];
  onAddImage?: () => void;
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

  const handleDragStart = (index: number) => {
    setDraggedItem(index);
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
            <Button size="sm" variant="outline" onClick={onAddImage} className="gap-2">
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
    </div>
  );
}
