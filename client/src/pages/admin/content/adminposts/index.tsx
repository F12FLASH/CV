import { useState } from "react";
import { AdminLayout } from "@/layouts/AdminLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Pagination } from "@/components/admin/pagination";
import { Plus } from "lucide-react";
import { usePosts, usePostCategories, useCreatePost, useUpdatePost, useDeletePost } from "./hooks";
import { PostCard, PostForm, DeletePostDialog } from "./components";
import type { Post, PostFormData } from "./types";
import { generateSlug } from "./types";

export default function AdminPostsPage() {
  const [currentPage, setCurrentPage] = useState(1);
  const [activeTab, setActiveTab] = useState("published");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [editingPost, setEditingPost] = useState<Post | null>(null);
  const [postToDelete, setPostToDelete] = useState<number | null>(null);

  const postsPerPage = 5;

  const { data: posts = [], isLoading } = usePosts();
  const { data: categories = [] } = usePostCategories();

  const createMutation = useCreatePost();
  const updateMutation = useUpdatePost();
  const deleteMutation = useDeletePost();

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
        setEditingPost(post);
      }
    } else {
      setEditingPost(null);
    }
    setIsDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setIsDialogOpen(false);
    setEditingPost(null);
  };

  const getPublishedAtForSubmit = (formData: PostFormData): string | null => {
    if (formData.status !== "Published") {
      return null;
    }

    if (formData.publishedAt instanceof Date && !isNaN(formData.publishedAt.getTime())) {
      return formData.publishedAt.toISOString();
    }

    if (formData.publishedAt && typeof formData.publishedAt === "string") {
      const date = new Date(formData.publishedAt);
      if (!isNaN(date.getTime())) {
        return date.toISOString();
      }
    }

    return new Date().toISOString();
  };

  const handleSubmit = async (
    formData: PostFormData,
    tagsInput: string,
    isEditing: boolean
  ) => {
    const tags = tagsInput
      .split(",")
      .map((t) => t.trim())
      .filter(Boolean);

    const publishedAt = getPublishedAtForSubmit(formData);

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

    if (isEditing && editingPost) {
      await updateMutation.mutateAsync({ id: editingPost.id, data: postData as any });
    } else {
      await createMutation.mutateAsync(postData as any);
    }
  };

  const handleDeleteClick = (id: number) => {
    setPostToDelete(id);
    setIsDeleteDialogOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (postToDelete) {
      await deleteMutation.mutateAsync(postToDelete);
      setPostToDelete(null);
    }
    setIsDeleteDialogOpen(false);
  };

  const isSaving = createMutation.isPending || updateMutation.isPending;

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

        <Tabs
          value={activeTab}
          onValueChange={(v) => {
            setActiveTab(v);
            setCurrentPage(1);
          }}
        >
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
                {paginatedPosts.map((post) => (
                  <PostCard
                    key={post.id}
                    post={post}
                    onEdit={handleOpenDialog}
                    onDelete={handleDeleteClick}
                  />
                ))}
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

      <PostForm
        open={isDialogOpen}
        onOpenChange={(open) => {
          if (!open) handleCloseDialog();
          else setIsDialogOpen(open);
        }}
        editingPost={editingPost}
        categories={categories}
        onSubmit={handleSubmit}
        isPending={isSaving}
      />

      <DeletePostDialog
        open={isDeleteDialogOpen}
        onOpenChange={(open) => setIsDeleteDialogOpen(open)}
        onConfirm={handleConfirmDelete}
      />
    </AdminLayout>
  );
}
