import { AdminLayout } from "@/layouts/AdminLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Pagination } from "@/components/admin/pagination";
import { useState } from "react";
import { Plus, Eye, Edit, Trash, Calendar, Save, X } from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import type { Post, InsertPost } from "@shared/schema";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { RichTextEditor } from "@/components/admin/RichTextEditor";
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
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface Category {
  id: number;
  name: string;
  slug: string;
  type: string;
  description?: string;
}

interface PostFormData {
  title: string;
  slug: string;
  content: string;
  excerpt: string;
  category: string;
  author: string;
  status: "Published" | "Draft" | "Archived";
  tags: string[];
  featuredImage: string | null;
  publishedAt: Date | null;
}

const getDefaultFormData = (): PostFormData => ({
  title: "",
  slug: "",
  content: "",
  excerpt: "",
  category: "",
  author: "Loi Developer",
  status: "Draft",
  tags: [],
  featuredImage: null,
  publishedAt: null,
});

function generateSlug(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

export default function AdminPostsEnhanced() {
  const queryClient = useQueryClient();
  const { data: posts = [], isLoading } = useQuery({
    queryKey: ["admin-posts"],
    queryFn: () => api.getPosts(),
  });

  const { data: categories = [] } = useQuery({
    queryKey: ["/api/categories", "post"],
    queryFn: () =>
      fetch("/api/categories?type=post", { credentials: "include" })
        .then(res => res.json() as Promise<Category[]>)
        .catch(() => []),
  });

  const createMutation = useMutation({
    mutationFn: (data: InsertPost) => api.createPost(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-posts"] });
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: Partial<Post> }) => 
      api.updatePost(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-posts"] });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => api.deletePost(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-posts"] });
    },
  });

  const addPost = async (data: InsertPost) => {
    await createMutation.mutateAsync(data);
  };

  const updatePost = async (id: number, data: Partial<Post>) => {
    await updateMutation.mutateAsync({ id, data });
  };

  const deletePost = async (id: number) => {
    await deleteMutation.mutateAsync(id);
  };

  const [currentPage, setCurrentPage] = useState(1);
  const [activeTab, setActiveTab] = useState("published");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [editingPost, setEditingPost] = useState<number | null>(null);
  const [postToDelete, setPostToDelete] = useState<number | null>(null);
  const [formData, setFormData] = useState<PostFormData>(getDefaultFormData());
  const [tagsInput, setTagsInput] = useState("");

  const postsPerPage = 5;

  const filteredPosts = posts.filter((p) => {
    if (activeTab === "published") return p.status === "Published";
    if (activeTab === "draft") return p.status === "Draft";
    if (activeTab === "archived") return p.status === "Archived";
    return true;
  });

  const totalPages = Math.ceil(filteredPosts.length / postsPerPage);
  const paginatedPosts = filteredPosts.slice(
    (currentPage - 1) * postsPerPage,
    currentPage * postsPerPage
  );

  const handleOpenDialog = (postId?: number) => {
    if (postId) {
      const post = posts.find((p) => p.id === postId);
      if (post) {
        setEditingPost(postId);
        let parsedPublishedAt: Date | null = null;
        if (post.publishedAt) {
          const date = new Date(post.publishedAt);
          if (!isNaN(date.getTime())) {
            parsedPublishedAt = date;
          }
        }
        setFormData({
          title: post.title,
          slug: post.slug,
          content: post.content || "",
          excerpt: post.excerpt || "",
          category: post.category,
          author: post.author,
          status: post.status,
          tags: post.tags || [],
          featuredImage: post.featuredImage,
          publishedAt: parsedPublishedAt,
        });
        setTagsInput(post.tags?.join(", ") || "");
      }
    } else {
      setEditingPost(null);
      setFormData(getDefaultFormData());
      setTagsInput("");
    }
    setIsDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setIsDialogOpen(false);
    setEditingPost(null);
    setFormData(getDefaultFormData());
    setTagsInput("");
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

  const [formError, setFormError] = useState<string | null>(null);

  const isSaving = createMutation.isPending || updateMutation.isPending;

  const getPublishedAtForSubmit = (): string | null => {
    if (formData.status !== "Published") {
      return null;
    }

    if (formData.publishedAt instanceof Date && !isNaN(formData.publishedAt.getTime())) {
      return formData.publishedAt.toISOString();
    }

    if (formData.publishedAt && typeof formData.publishedAt === 'string') {
      const date = new Date(formData.publishedAt);
      if (!isNaN(date.getTime())) {
        return date.toISOString();
      }
    }

    return new Date().toISOString();
  };

  const handleSubmit = async () => {
    const error = validateForm();
    if (error) {
      setFormError(error);
      return;
    }
    setFormError(null);

    try {
      const tags = tagsInput
        .split(",")
        .map((t) => t.trim())
        .filter(Boolean);

      const publishedAt = getPublishedAtForSubmit();

      const postData = {
        title: formData.title.trim(),
        slug: formData.slug.trim() || generateSlug(formData.title),
        content: formData.content.trim(),
        excerpt: formData.excerpt.trim() || null,
        category: formData.category,
        author: formData.author.trim(),
        status: formData.status,
        tags,
        featuredImage: formData.featuredImage,
        publishedAt,
      };

      if (editingPost) {
        await updatePost(editingPost, postData as any);
      } else {
        await addPost(postData as any);
      }
      handleCloseDialog();
    } catch (error: any) {
      console.error("Error saving post:", error);
      setFormError(error.message || "Failed to save post");
    }
  };

  const handleDeleteClick = (id: number) => {
    setPostToDelete(id);
    setIsDeleteDialogOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (postToDelete) {
      await deletePost(postToDelete);
      setPostToDelete(null);
    }
    setIsDeleteDialogOpen(false);
  };

  const formatDate = (date: Date | string | null) => {
    if (!date) return "N/A";
    return new Date(date).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const bgImages = ['/images/blog/bg-1.png', '/images/blog/bg-2.png', '/images/blog/bg-3.png'];

  const renderPostCard = (post: any) => {
    const imageUrl = post.featuredImage || bgImages[post.id % bgImages.length];
    return (
    <Card key={post.id} data-testid={`card-post-${post.id}`} className="overflow-hidden">
      <div 
        className="h-32 bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: `url('${imageUrl}')` }}
      >
        <div className="w-full h-full bg-black/40" />
      </div>
      <CardContent className="p-4">
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2 flex-wrap">
              <h3 className="font-bold" data-testid={`text-post-title-${post.id}`}>{post.title}</h3>
              <Badge variant="secondary">{post.category}</Badge>
              <Badge
                variant={post.status === "Published" ? "default" : "outline"}
                className={post.status === "Published" ? "bg-green-500" : ""}
              >
                {post.status}
              </Badge>
            </div>
            <p className="text-sm text-muted-foreground mb-2 line-clamp-2">
              {post.excerpt || post.content?.substring(0, 100) || "No excerpt available"}
            </p>
            <div className="flex gap-4 text-xs text-muted-foreground flex-wrap">
              <span className="flex items-center gap-1">
                <Calendar className="w-3 h-3" /> {formatDate(post.publishedAt || post.createdAt)}
              </span>
              <span className="flex items-center gap-1">
                <Eye className="w-3 h-3" /> {post.views || 0} views
              </span>
              {post.tags && post.tags.length > 0 && (
                <span className="text-primary">
                  {post.tags.slice(0, 3).join(", ")}
                  {post.tags.length > 3 && "..."}
                </span>
              )}
            </div>
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleOpenDialog(post.id)}
              data-testid={`button-edit-post-${post.id}`}
            >
              <Edit className="w-4 h-4" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="text-destructive hover:text-destructive"
              onClick={() => handleDeleteClick(post.id)}
              data-testid={`button-delete-post-${post.id}`}
            >
              <Trash className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
    );
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-heading font-bold">Blog Posts</h1>
            <p className="text-muted-foreground">
              Manage your blog content ({posts.length} posts)
            </p>
          </div>
          <Button
            className="bg-primary gap-2"
            onClick={() => handleOpenDialog()}
            data-testid="button-new-post"
          >
            <Plus className="w-4 h-4" /> New Post
          </Button>
        </div>

        <Tabs value={activeTab} onValueChange={(v) => { setActiveTab(v); setCurrentPage(1); }}>
          <TabsList>
            <TabsTrigger value="published" data-testid="tab-published">
              Published ({posts.filter((p) => p.status === "Published").length})
            </TabsTrigger>
            <TabsTrigger value="draft" data-testid="tab-draft">
              Drafts ({posts.filter((p) => p.status === "Draft").length})
            </TabsTrigger>
            <TabsTrigger value="archived" data-testid="tab-archived">
              Archived ({posts.filter((p) => p.status === "Archived").length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value={activeTab} className="space-y-4 mt-4">
            {isLoading ? (
              <Card>
                <CardContent className="p-8 text-center text-muted-foreground">
                  Loading posts...
                </CardContent>
              </Card>
            ) : paginatedPosts.length === 0 ? (
              <Card>
                <CardContent className="p-8 text-center text-muted-foreground">
                  No posts found. Click "New Post" to create one.
                </CardContent>
              </Card>
            ) : (
              <>
                {paginatedPosts.map(renderPostCard)}
                {totalPages > 1 && (
                  <Pagination
                    currentPage={currentPage}
                    totalPages={totalPages}
                    onPageChange={setCurrentPage}
                  />
                )}
              </>
            )}
          </TabsContent>
        </Tabs>
      </div>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingPost ? "Edit Post" : "Create New Post"}
            </DialogTitle>
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
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, slug: e.target.value }))
                }
                data-testid="input-post-slug"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="category">Category</Label>
                <Select
                  value={formData.category}
                  onValueChange={(v) =>
                    setFormData((prev) => ({ ...prev, category: v }))
                  }
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
                      <SelectItem value="default" disabled>No categories available</SelectItem>
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
                onChange={(content) =>
                  setFormData((prev) => ({ ...prev, content }))
                }
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="excerpt">Excerpt</Label>
              <Textarea
                id="excerpt"
                placeholder="Brief summary of the post"
                value={formData.excerpt}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, excerpt: e.target.value }))
                }
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
                    placeholder="Image URL (e.g., /images/blog/bg-1.png or https://...)"
                    value={formData.featuredImage || ''}
                    onChange={(e) =>
                      setFormData((prev) => ({ ...prev, featuredImage: e.target.value || null }))
                    }
                    data-testid="input-post-image"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setFormData((prev) => ({ ...prev, featuredImage: null }))}
                    data-testid="button-clear-image"
                  >
                    Clear
                  </Button>
                </div>
                <div>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        const reader = new FileReader();
                        reader.onload = (event) => {
                          const result = event.target?.result as string;
                          setFormData((prev) => ({ ...prev, featuredImage: result }));
                        };
                        reader.readAsDataURL(file);
                      }
                    }}
                    data-testid="input-file-upload"
                    className="block w-full text-sm text-muted-foreground
                      file:mr-4 file:py-2 file:px-4
                      file:rounded-md file:border-0
                      file:text-sm file:font-semibold
                      file:bg-primary file:text-primary-foreground
                      hover:file:bg-primary/90
                      file:cursor-pointer cursor-pointer"
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    Hỗ trợ tải ảnh từ thiết bị (JPG, PNG, GIF, WebP, v.v.)
                  </p>
                </div>
              </div>
              {formData.featuredImage && (
                <div className="mt-2 border border-border rounded-md overflow-hidden">
                  <img
                    src={formData.featuredImage}
                    alt="Featured preview"
                    className="w-full h-40 object-cover"
                    onError={(e) => {
                      // Fallback if image fails to load
                      (e.target as HTMLImageElement).src = '/images/blog/bg-1.png';
                    }}
                  />
                </div>
              )}
              <p className="text-xs text-muted-foreground">
                Hỗ trợ: Tải từ thiết bị hoặc dán link ảnh. Ảnh mặc định: /images/blog/bg-1.png, bg-2.png, bg-3.png
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
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, author: e.target.value }))
                }
                data-testid="input-post-author"
              />
            </div>
          </div>

          <DialogFooter className="flex-col sm:flex-row gap-2">
            {formError && (
              <p className="text-destructive text-sm w-full sm:w-auto sm:flex-1" data-testid="text-form-error">
                {formError}
              </p>
            )}
            <div className="flex gap-2">
              <Button variant="outline" onClick={handleCloseDialog}>
                <X className="w-4 h-4 mr-2" /> Cancel
              </Button>
              <Button
                onClick={handleSubmit}
                disabled={isSaving}
                data-testid="button-save-post"
              >
                <Save className="w-4 h-4 mr-2" />
                {isSaving ? "Saving..." : editingPost ? "Update Post" : "Create Post"}
              </Button>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the
              post from the database.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              data-testid="button-confirm-delete"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </AdminLayout>
  );
}