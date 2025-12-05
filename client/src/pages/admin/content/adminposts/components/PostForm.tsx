import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Save, X, Loader2 } from "lucide-react";
import { RichTextEditor } from "@/components/admin/RichTextEditor";
import type { Post, PostFormData, Category } from "../types";
import { getEmptyPostForm, mapPostToFormData, generateSlug } from "../types";
import { uploadImage } from "../hooks";

interface PostFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  editingPost: Post | null;
  categories: Category[];
  onSubmit: (data: PostFormData, tagsInput: string, isEditing: boolean) => Promise<void>;
  isPending: boolean;
}

export function PostForm({
  open,
  onOpenChange,
  editingPost,
  categories,
  onSubmit,
  isPending,
}: PostFormProps) {
  const imageInputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [formData, setFormData] = useState<PostFormData>(getEmptyPostForm());
  const [tagsInput, setTagsInput] = useState("");
  const [formError, setFormError] = useState<string | null>(null);

  useEffect(() => {
    if (open) {
      if (editingPost) {
        const mapped = mapPostToFormData(editingPost);
        setFormData(mapped.formData);
        setTagsInput(mapped.tagsInput);
      } else {
        setFormData(getEmptyPostForm());
        setTagsInput("");
      }
      setFormError(null);
    }
  }, [open, editingPost]);

  const handleImageUpload = async (file: File) => {
    setUploading(true);
    try {
      const url = await uploadImage(file);
      setFormData((prev) => ({ ...prev, featuredImage: url }));
    } catch (error: any) {
      console.error("Upload failed:", error);
    } finally {
      setUploading(false);
    }
  };

  const handleTitleChange = (title: string) => {
    setFormData((prev) => ({
      ...prev,
      title,
      slug: editingPost ? prev.slug : generateSlug(title),
    }));
  };

  const validateForm = (): string | null => {
    if (!formData.title.trim()) return "Title is required";
    if (!formData.content.trim()) return "Content is required";
    if (!formData.category.trim()) return "Category is required";
    if (!formData.author.trim()) return "Author is required";
    return null;
  };

  const handleSubmit = async () => {
    const error = validateForm();
    if (error) {
      setFormError(error);
      return;
    }
    setFormError(null);

    try {
      await onSubmit(formData, tagsInput, !!editingPost);
      onOpenChange(false);
    } catch (error: any) {
      console.error("Error saving post:", error);
      setFormError(error.message || "Failed to save post");
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{editingPost ? "Edit Post" : "Create New Post"}</DialogTitle>
          <DialogDescription>
            {editingPost
              ? "Update the post details below."
              : "Fill in the details to create a new blog post."}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="title">Title *</Label>
            <Input
              id="title"
              placeholder="Enter post title"
              value={formData.title}
              onChange={(e) => handleTitleChange(e.target.value)}
              data-testid="input-post-title"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="slug">Slug</Label>
            <Input
              id="slug"
              placeholder="post-url-slug"
              value={formData.slug}
              onChange={(e) => setFormData((prev) => ({ ...prev, slug: e.target.value }))}
              data-testid="input-post-slug"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="category">Category</Label>
              <Select
                value={formData.category}
                onValueChange={(v) => setFormData((prev) => ({ ...prev, category: v }))}
              >
                <SelectTrigger data-testid="select-post-category">
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  {categories.length > 0 ? (
                    categories.map((cat: Category) => (
                      <SelectItem key={cat.id} value={cat.slug} data-testid={`option-${cat.slug}`}>
                        {cat.name}
                      </SelectItem>
                    ))
                  ) : (
                    <SelectItem value="default" disabled>
                      No categories available
                    </SelectItem>
                  )}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="status">Status</Label>
              <Select
                value={formData.status}
                onValueChange={(v: "Published" | "Draft" | "Archived") =>
                  setFormData((prev) => ({ ...prev, status: v }))
                }
              >
                <SelectTrigger data-testid="select-post-status">
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Draft">Draft</SelectItem>
                  <SelectItem value="Published">Published</SelectItem>
                  <SelectItem value="Archived">Archived</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="content">Content *</Label>
            <RichTextEditor
              value={formData.content}
              onChange={(content) => setFormData((prev) => ({ ...prev, content }))}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="excerpt">Excerpt</Label>
            <Textarea
              id="excerpt"
              placeholder="Brief summary of the post"
              value={formData.excerpt}
              onChange={(e) => setFormData((prev) => ({ ...prev, excerpt: e.target.value }))}
              rows={2}
              data-testid="input-post-excerpt"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="image">Featured Image</Label>
            <div className="space-y-2">
              <div className="flex gap-2">
                <Input
                  id="image"
                  placeholder="Image URL (e.g., /uploads/images/... or https://...)"
                  value={formData.featuredImage || ""}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, featuredImage: e.target.value || null }))
                  }
                  data-testid="input-post-image"
                />
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => imageInputRef.current?.click()}
                  disabled={uploading}
                  data-testid="button-upload-image"
                >
                  {uploading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Upload"}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setFormData((prev) => ({ ...prev, featuredImage: null }))}
                  data-testid="button-clear-image"
                >
                  Clear
                </Button>
              </div>
              <input
                ref={imageInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) {
                    handleImageUpload(file);
                  }
                }}
                data-testid="input-file-upload"
              />
              <p className="text-xs text-muted-foreground">
                Upload from device (JPG, PNG, GIF, WebP) - saved to /uploads/images/
              </p>
            </div>
            {formData.featuredImage && (
              <div className="mt-2 border border-border rounded-md overflow-hidden">
                <img
                  src={formData.featuredImage}
                  alt="Featured preview"
                  className="w-full h-40 object-cover"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = "/images/blog/bg-1.png";
                  }}
                />
              </div>
            )}
            <p className="text-xs text-muted-foreground">
              Supports: Upload from device or paste image URL. Defaults: /images/blog/bg-1.png,
              bg-2.png, bg-3.png
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="tags">Tags (comma-separated)</Label>
            <Input
              id="tags"
              placeholder="react, javascript, web development"
              value={tagsInput}
              onChange={(e) => setTagsInput(e.target.value)}
              data-testid="input-post-tags"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="author">Author</Label>
            <Input
              id="author"
              placeholder="Author name"
              value={formData.author}
              onChange={(e) => setFormData((prev) => ({ ...prev, author: e.target.value }))}
              data-testid="input-post-author"
            />
          </div>
        </div>

        <DialogFooter className="flex-col sm:flex-row gap-2">
          {formError && (
            <p
              className="text-destructive text-sm w-full sm:w-auto sm:flex-1"
              data-testid="text-form-error"
            >
              {formError}
            </p>
          )}
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={() => onOpenChange(false)}
              data-testid="button-cancel"
            >
              <X className="w-4 h-4 mr-2" /> Cancel
            </Button>
            <Button onClick={handleSubmit} disabled={isPending} data-testid="button-save-post">
              {isPending ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <Save className="w-4 h-4 mr-2" />
              )}
              {editingPost ? "Update Post" : "Create Post"}
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
