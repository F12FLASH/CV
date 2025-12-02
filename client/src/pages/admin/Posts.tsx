import { useState, useRef } from "react";
import { AdminLayout } from "@/layouts/AdminLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { api } from "@/lib/api";
import { 
  Plus, 
  Search, 
  Filter, 
  Edit,
  Trash,
  FileText,
  Calendar,
  Eye,
  Star,
  Loader2,
  User
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent } from "@/components/ui/card";
import { formatDistanceToNow } from "date-fns";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

type Post = {
  id: number;
  title: string;
  slug: string;
  category: string;
  author: string;
  status: "Published" | "Draft";
  content: string | null;
  excerpt: string | null;
  featuredImage: string | null;
  tags: string[];
  featured: boolean;
  views: number;
  publishedAt: string | null;
  createdAt: string;
  updatedAt: string;
};

type PostFormData = {
  title: string;
  slug: string;
  category: string;
  author: string;
  status: "Published" | "Draft";
  content: string;
  excerpt: string;
  featuredImage: string;
  tags: string[];
  featured: boolean;
};

const getDefaultFormData = (): PostFormData => ({
  title: "",
  slug: "",
  category: "general",
  author: "Admin",
  status: "Draft",
  content: "",
  excerpt: "",
  featuredImage: "",
  tags: [],
  featured: false,
});

const generateSlug = (title: string) => {
  return title
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_]+/g, "-")
    .replace(/^-+|-+$/g, "");
};

export default function AdminPosts() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [searchQuery, setSearchQuery] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingPost, setEditingPost] = useState<Post | null>(null);
  const [formData, setFormData] = useState<PostFormData>(getDefaultFormData());
  const [tagInput, setTagInput] = useState("");
  const [uploading, setUploading] = useState(false);
  const imageInputRef = useRef<HTMLInputElement>(null);

  const { data: posts = [], isLoading } = useQuery<Post[]>({
    queryKey: ["/api/posts"],
    queryFn: async () => {
      const res = await fetch("/api/posts", { credentials: "include" });
      if (!res.ok) throw new Error("Failed to fetch posts");
      return res.json();
    },
  });

  const { data: categories = [] } = useQuery<Array<{ slug: string; name: string }>>({
    queryKey: ["/api/categories", "post"],
    queryFn: async () => {
      const res = await fetch("/api/categories?type=post", { credentials: "include" });
      if (!res.ok) throw new Error("Failed to fetch categories");
      return res.json();
    },
  });

  const createMutation = useMutation({
    mutationFn: (data: any) => api.createPost(data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["/api/posts"] });
      closeDialog();
      toast({ title: "Success", description: `"${variables.title}" has been created successfully` });
    },
    onError: (error: any) => {
      toast({ title: "Error", description: error.message || "Failed to create post", variant: "destructive" });
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: any }) => api.updatePost(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["/api/posts"] });
      closeDialog();
      toast({ title: "Success", description: `Post has been updated successfully` });
    },
    onError: (error: any) => {
      toast({ title: "Error", description: error.message || "Failed to update post", variant: "destructive" });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => api.deletePost(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/posts"] });
      toast({ title: "Success", description: "Post has been deleted successfully" });
    },
    onError: (error: any) => {
      toast({ title: "Error", description: error.message || "Failed to delete post", variant: "destructive" });
    },
  });

  const handleImageUpload = async (file: File) => {
    if (!file) return;
    setUploading(true);
    try {
      const formDataUpload = new FormData();
      formDataUpload.append("file", file);
      const res = await fetch("/api/upload/file", {
        method: "POST",
        body: formDataUpload,
        credentials: "include",
      });
      if (!res.ok) throw new Error("Upload failed");
      const data = await res.json();
      setFormData(prev => ({ ...prev, featuredImage: data.url }));
      toast({ title: "Success", description: "Image uploaded" });
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } finally {
      setUploading(false);
    }
  };

  const filteredPosts = posts.filter(post => 
    post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    post.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
    post.author.toLowerCase().includes(searchQuery.toLowerCase()) ||
    post.tags?.some(t => t.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const handleDelete = (id: number) => {
    const post = posts.find(p => p.id === id);
    if (!post) return;

    const confirmed = window.confirm(
      `Are you sure you want to delete "${post.title}"?\n\nThis action cannot be undone.`
    );
    
    if (confirmed) {
      deleteMutation.mutate(id);
    }
  };

  const openAddDialog = () => {
    setEditingPost(null);
    setFormData(getDefaultFormData());
    setTagInput("");
    setIsDialogOpen(true);
  };

  const openEditDialog = (post: Post) => {
    setEditingPost(post);
    setFormData({
      title: post.title,
      slug: post.slug,
      category: post.category,
      author: post.author,
      status: post.status,
      content: post.content || "",
      excerpt: post.excerpt || "",
      featuredImage: post.featuredImage || "",
      tags: post.tags || [],
      featured: post.featured,
    });
    setTagInput("");
    setIsDialogOpen(true);
  };

  const closeDialog = () => {
    setIsDialogOpen(false);
    setEditingPost(null);
    setFormData(getDefaultFormData());
    setTagInput("");
  };

  const handleSubmit = () => {
    if (!formData.title.trim()) {
      toast({ title: "Validation Error", description: "Post title is required", variant: "destructive" });
      return;
    }

    if (!formData.slug.trim()) {
      toast({ title: "Validation Error", description: "Post slug is required", variant: "destructive" });
      return;
    }

    const postData = {
      title: formData.title.trim(),
      slug: formData.slug.trim(),
      category: formData.category || "general",
      author: formData.author.trim() || "Admin",
      status: formData.status,
      content: formData.content.trim() || null,
      excerpt: formData.excerpt.trim() || null,
      featuredImage: formData.featuredImage.trim() || null,
      tags: formData.tags,
      featured: formData.featured,
      publishedAt: formData.status === "Published" ? new Date().toISOString() : null,
    };

    if (editingPost) {
      updateMutation.mutate({ id: editingPost.id, data: postData });
    } else {
      createMutation.mutate(postData);
    }
  };

  const addTag = () => {
    const tag = tagInput.trim();
    if (!tag) {
      toast({ title: "Validation Error", description: "Please enter a tag name", variant: "destructive" });
      return;
    }
    
    if (formData.tags.includes(tag)) {
      toast({ title: "Validation Error", description: "This tag is already added", variant: "destructive" });
      return;
    }
    
    setFormData({ ...formData, tags: [...formData.tags, tag] });
    setTagInput("");
  };

  const removeTag = (tag: string) => {
    setFormData({ ...formData, tags: formData.tags.filter(t => t !== tag) });
  };

  const toggleStatus = (id: number, currentStatus: string) => {
    const post = posts.find(p => p.id === id);
    if (!post) return;

    const newStatus = currentStatus === "Published" ? "Draft" : "Published";
    const updateData: any = { status: newStatus };
    if (newStatus === "Published" && !post.publishedAt) {
      updateData.publishedAt = new Date().toISOString();
    }
    updateMutation.mutate({ id, data: updateData });
  };

  const toggleFeatured = (id: number, currentFeatured: boolean) => {
    updateMutation.mutate({ id, data: { featured: !currentFeatured } });
  };

  const isSaving = createMutation.isPending || updateMutation.isPending;

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-heading font-bold">Blog Posts</h1>
            <p className="text-muted-foreground">Manage your blog content</p>
          </div>
          <Button className="bg-primary hover:bg-primary/90" onClick={openAddDialog} data-testid="button-new-post">
            <Plus className="w-4 h-4 mr-2" /> New Post
          </Button>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 bg-card p-4 rounded-lg border border-border">
          <div className="relative flex-1">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input 
              placeholder="Search posts by title, category, author, or tags..." 
              className="pl-9"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              data-testid="input-search-posts"
            />
          </div>
          <div className="flex gap-2">
            <Button variant="outline" className="gap-2">
              <Filter className="w-4 h-4" /> Category
            </Button>
            <Button variant="outline" className="gap-2">
              <Calendar className="w-4 h-4" /> Date
            </Button>
          </div>
        </div>

        <div className="space-y-4">
          {isLoading ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
                <p className="text-muted-foreground">Loading posts...</p>
              </CardContent>
            </Card>
          ) : filteredPosts.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <FileText className="h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">No posts found</h3>
                <p className="text-muted-foreground mb-4">
                  {searchQuery ? "Try a different search term" : "Create your first blog post to get started"}
                </p>
                {!searchQuery && (
                  <Button onClick={openAddDialog}>
                    <Plus className="w-4 h-4 mr-2" /> New Post
                  </Button>
                )}
              </CardContent>
            </Card>
          ) : (
            filteredPosts.map((post) => (
              <Card key={post.id} className="overflow-hidden group" data-testid={`post-card-${post.id}`}>
                <div className="flex flex-col md:flex-row">
                  <div className="w-full md:w-48 h-32 md:h-auto relative bg-muted">
                    {post.featuredImage ? (
                      <img 
                        src={post.featuredImage} 
                        alt={post.title} 
                        className="w-full h-full object-cover" 
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <FileText className="w-12 h-12 text-muted-foreground" />
                      </div>
                    )}
                    <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                      <Button variant="secondary" size="sm" onClick={() => openEditDialog(post)}>
                        Edit Image
                      </Button>
                    </div>
                    {post.featured && (
                      <div className="absolute top-2 left-2">
                        <Badge className="bg-yellow-500 text-black">
                          <Star className="w-3 h-3 mr-1" /> Featured
                        </Badge>
                      </div>
                    )}
                  </div>

                  <CardContent className="flex-1 p-6">
                    <div className="flex flex-col md:flex-row justify-between gap-4">
                      <div className="space-y-2">
                        <div className="flex items-center gap-3">
                          <h3 className="text-xl font-bold">{post.title}</h3>
                          <Badge 
                            variant={post.status === "Published" ? "default" : "outline"}
                            className={`cursor-pointer ${post.status === "Published" ? "bg-green-500 hover:bg-green-600" : "hover:bg-muted"}`}
                            onClick={() => toggleStatus(post.id, post.status)}
                            data-testid={`badge-status-${post.id}`}
                          >
                            {post.status}
                          </Badge>
                        </div>
                        
                        <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                          <div className="flex items-center gap-1">
                            <User className="w-4 h-4" /> 
                            <span className="text-foreground font-medium">{post.author}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <FileText className="w-4 h-4" /> Category: 
                            <span className="text-foreground font-medium">{post.category}</span>
                          </div>
                          {post.createdAt && (
                            <div className="flex items-center gap-1">
                              <Calendar className="w-4 h-4" /> Created: 
                              <span className="text-foreground font-medium">
                                {formatDistanceToNow(new Date(post.createdAt), { addSuffix: true })}
                              </span>
                            </div>
                          )}
                        </div>

                        {post.tags && post.tags.length > 0 && (
                          <div className="flex flex-wrap gap-2 mt-2">
                            {post.tags.map(t => (
                              <Badge key={t} variant="secondary" className="text-xs">
                                {t}
                              </Badge>
                            ))}
                          </div>
                        )}

                        {post.excerpt && (
                          <p className="text-sm text-muted-foreground line-clamp-2 mt-2">
                            {post.excerpt}
                          </p>
                        )}
                      </div>

                      <div className="flex flex-col items-end gap-2">
                        <div className="flex gap-2">
                          <Button 
                            variant="outline" 
                            size="icon" 
                            title="Toggle Featured"
                            onClick={() => toggleFeatured(post.id, post.featured)}
                            className={post.featured ? "text-yellow-500" : ""}
                            disabled={updateMutation.isPending}
                            data-testid={`button-featured-${post.id}`}
                          >
                            <Star className="w-4 h-4" />
                          </Button>
                          <Button 
                            variant="default" 
                            size="icon" 
                            title="Edit Post"
                            onClick={() => openEditDialog(post)}
                            data-testid={`button-edit-${post.id}`}
                          >
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button 
                            variant="destructive" 
                            size="icon" 
                            title="Delete" 
                            onClick={() => handleDelete(post.id)}
                            disabled={deleteMutation.isPending}
                            data-testid={`button-delete-${post.id}`}
                          >
                            <Trash className="w-4 h-4" />
                          </Button>
                        </div>
                        <div className="text-xs text-muted-foreground mt-2">
                          <Eye className="w-3 h-3 inline mr-1" />
                          <span className="font-medium text-foreground">{post.views || 0}</span> views
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </div>
              </Card>
            ))
          )}
        </div>
      </div>

      <Dialog open={isDialogOpen} onOpenChange={(open) => !open && closeDialog()}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingPost ? "Edit Post" : "Create New Post"}</DialogTitle>
            <DialogDescription>
              {editingPost ? "Update the post details below." : "Fill in the details for your new blog post."}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2">
                <Label htmlFor="title">Post Title *</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => {
                    const newTitle = e.target.value;
                    const newSlug = generateSlug(newTitle);
                    setFormData({ ...formData, title: newTitle, slug: newSlug });
                  }}
                  placeholder="Enter post title"
                  data-testid="input-post-title"
                />
              </div>

              <div className="col-span-2">
                <Label htmlFor="slug">Slug *</Label>
                <Input
                  id="slug"
                  value={formData.slug}
                  onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                  placeholder="post-url-slug"
                  data-testid="input-post-slug"
                />
              </div>

              <div>
                <Label htmlFor="category">Category</Label>
                <Select
                  value={formData.category}
                  onValueChange={(value) => setFormData({ ...formData, category: value })}
                >
                  <SelectTrigger data-testid="select-category">
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.length === 0 ? (
                      <SelectItem value="general">General</SelectItem>
                    ) : (
                      categories.map((cat) => (
                        <SelectItem key={cat.slug} value={cat.slug}>
                          {cat.name}
                        </SelectItem>
                      ))
                    )}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="status">Status</Label>
                <Select
                  value={formData.status}
                  onValueChange={(value: "Published" | "Draft") => 
                    setFormData({ ...formData, status: value })
                  }
                >
                  <SelectTrigger data-testid="select-status">
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Draft">Draft</SelectItem>
                    <SelectItem value="Published">Published</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="author">Author</Label>
                <Input
                  id="author"
                  value={formData.author}
                  onChange={(e) => setFormData({ ...formData, author: e.target.value })}
                  placeholder="Author name"
                  data-testid="input-author"
                />
              </div>

              <div className="flex items-center gap-2">
                <Switch
                  id="featured"
                  checked={formData.featured}
                  onCheckedChange={(checked) => setFormData({ ...formData, featured: checked })}
                  data-testid="switch-featured"
                />
                <Label htmlFor="featured">Featured Post</Label>
              </div>

              <div className="col-span-2">
                <Label htmlFor="featuredImage">Featured Image</Label>
                <div className="flex gap-2">
                  <Input
                    id="featuredImage"
                    value={formData.featuredImage}
                    readOnly
                    placeholder="No image selected"
                    data-testid="input-featured-image"
                  />
                  <Button variant="outline" onClick={() => imageInputRef.current?.click()} disabled={uploading}>
                    {uploading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Upload"}
                  </Button>
                </div>
                <input
                  ref={imageInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => e.target.files?.[0] && handleImageUpload(e.target.files[0])}
                />
              </div>

              <div className="col-span-2">
                <Label htmlFor="excerpt">Excerpt</Label>
                <Textarea
                  id="excerpt"
                  value={formData.excerpt}
                  onChange={(e) => setFormData({ ...formData, excerpt: e.target.value })}
                  placeholder="Brief description of the post..."
                  rows={2}
                  data-testid="textarea-excerpt"
                />
              </div>

              <div className="col-span-2">
                <Label htmlFor="content">Content</Label>
                <Textarea
                  id="content"
                  value={formData.content}
                  onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                  placeholder="Write your post content here..."
                  rows={6}
                  data-testid="textarea-content"
                />
              </div>

              <div className="col-span-2">
                <Label>Tags</Label>
                <div className="flex gap-2 mb-2">
                  <Input
                    value={tagInput}
                    onChange={(e) => setTagInput(e.target.value)}
                    placeholder="Add tag (e.g., React)"
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        addTag();
                      }
                    }}
                    data-testid="input-tag"
                  />
                  <Button type="button" variant="outline" onClick={addTag}>
                    Add
                  </Button>
                </div>
                {formData.tags.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {formData.tags.map((tag) => (
                      <Badge key={tag} variant="secondary" className="cursor-pointer" onClick={() => removeTag(tag)}>
                        {tag} &times;
                      </Badge>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={closeDialog}>
              Cancel
            </Button>
            <Button onClick={handleSubmit} disabled={isSaving} data-testid="button-save-post">
              {isSaving ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Saving...
                </>
              ) : (
                editingPost ? "Update Post" : "Create Post"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AdminLayout>
  );
}
