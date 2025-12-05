import { useState } from "react";
import { AdminLayout } from "@/layouts/AdminLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Plus, Loader2, MessageSquare, Star, HelpCircle } from "lucide-react";
import {
  useComments,
  useReviews,
  useFAQs,
  usePosts,
  useProjectsList,
  useDeleteComment,
  useMarkCommentAsRead,
  useApproveComment,
  useRejectComment,
  useDeleteReview,
  useMarkReviewAsRead,
  useCreateFAQ,
  useUpdateFAQ,
  useDeleteFAQ,
} from "./hooks";
import { CommentCard, ReviewCard, FAQCard, FAQForm } from "./components";
import type { FAQ, FAQFormData } from "./types";

export default function AdminInteractionsPage() {
  const [activeTab, setActiveTab] = useState("comments");
  const [isFAQFormOpen, setIsFAQFormOpen] = useState(false);
  const [editingFAQ, setEditingFAQ] = useState<FAQ | null>(null);

  const { data: comments = [], isLoading: loadingComments } = useComments();
  const { data: reviews = [], isLoading: loadingReviews } = useReviews();
  const { data: faqs = [], isLoading: loadingFAQs } = useFAQs();
  const { data: posts = [] } = usePosts();
  const { data: projects = [] } = useProjectsList();

  const deleteCommentMutation = useDeleteComment();
  const markCommentAsReadMutation = useMarkCommentAsRead();
  const approveCommentMutation = useApproveComment();
  const rejectCommentMutation = useRejectComment();
  const deleteReviewMutation = useDeleteReview();
  const markReviewAsReadMutation = useMarkReviewAsRead();

  const handleFAQFormClose = () => {
    setIsFAQFormOpen(false);
    setEditingFAQ(null);
  };

  const createFAQMutation = useCreateFAQ(handleFAQFormClose);
  const updateFAQMutation = useUpdateFAQ(handleFAQFormClose);
  const deleteFAQMutation = useDeleteFAQ();

  const handleOpenFAQForm = (faq?: FAQ) => {
    if (faq) {
      setEditingFAQ(faq);
    } else {
      setEditingFAQ(null);
    }
    setIsFAQFormOpen(true);
  };

  const handleFAQSubmit = (data: FAQFormData, isEditing: boolean) => {
    if (isEditing && editingFAQ) {
      updateFAQMutation.mutate({ id: editingFAQ.id, data });
    } else {
      createFAQMutation.mutate(data);
    }
  };

  const handleToggleFAQVisibility = (faq: FAQ) => {
    updateFAQMutation.mutate({ id: faq.id, data: { visible: !faq.visible } });
  };

  const pendingCommentsCount = comments.filter((c) => c.status === "Pending").length;
  const unreadReviewsCount = reviews.filter((r) => !r.read).length;

  const isFAQPending = createFAQMutation.isPending || updateFAQMutation.isPending;

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-heading font-bold">Interactions</h1>
            <p className="text-muted-foreground">
              Manage comments, reviews, and FAQs
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between gap-2 pb-2">
              <CardTitle className="text-sm font-medium">Comments</CardTitle>
              <MessageSquare className="w-4 h-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{comments.length}</div>
              <p className="text-xs text-muted-foreground">
                {pendingCommentsCount} pending approval
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between gap-2 pb-2">
              <CardTitle className="text-sm font-medium">Reviews</CardTitle>
              <Star className="w-4 h-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{reviews.length}</div>
              <p className="text-xs text-muted-foreground">{unreadReviewsCount} unread</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between gap-2 pb-2">
              <CardTitle className="text-sm font-medium">FAQs</CardTitle>
              <HelpCircle className="w-4 h-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{faqs.length}</div>
              <p className="text-xs text-muted-foreground">
                {faqs.filter((f) => f.visible).length} visible
              </p>
            </CardContent>
          </Card>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList>
            <TabsTrigger value="comments" data-testid="tab-comments">
              Comments ({comments.length})
            </TabsTrigger>
            <TabsTrigger value="reviews" data-testid="tab-reviews">
              Reviews ({reviews.length})
            </TabsTrigger>
            <TabsTrigger value="faqs" data-testid="tab-faqs">
              FAQs ({faqs.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="comments" className="space-y-4 mt-4">
            {loadingComments ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
              </div>
            ) : comments.length === 0 ? (
              <Card>
                <CardContent className="flex flex-col items-center justify-center py-12">
                  <MessageSquare className="w-12 h-12 text-muted-foreground mb-4" />
                  <p className="text-muted-foreground">No comments yet</p>
                </CardContent>
              </Card>
            ) : (
              comments.map((comment) => (
                <CommentCard
                  key={comment.id}
                  comment={comment}
                  posts={posts}
                  onApprove={(id) => approveCommentMutation.mutate(id)}
                  onReject={(id) => rejectCommentMutation.mutate(id)}
                  onMarkAsRead={(id) => markCommentAsReadMutation.mutate(id)}
                />
              ))
            )}
          </TabsContent>

          <TabsContent value="reviews" className="space-y-4 mt-4">
            {loadingReviews ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
              </div>
            ) : reviews.length === 0 ? (
              <Card>
                <CardContent className="flex flex-col items-center justify-center py-12">
                  <Star className="w-12 h-12 text-muted-foreground mb-4" />
                  <p className="text-muted-foreground">No reviews yet</p>
                </CardContent>
              </Card>
            ) : (
              reviews.map((review) => (
                <ReviewCard
                  key={review.id}
                  review={review}
                  projects={projects}
                  onDelete={(id) => deleteReviewMutation.mutate(id)}
                  onMarkAsRead={(id) => markReviewAsReadMutation.mutate(id)}
                />
              ))
            )}
          </TabsContent>

          <TabsContent value="faqs" className="space-y-4 mt-4">
            <div className="flex justify-end">
              <Button onClick={() => handleOpenFAQForm()} data-testid="button-create-faq">
                <Plus className="w-4 h-4 mr-2" /> New FAQ
              </Button>
            </div>

            {loadingFAQs ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
              </div>
            ) : faqs.length === 0 ? (
              <Card>
                <CardContent className="flex flex-col items-center justify-center py-12">
                  <HelpCircle className="w-12 h-12 text-muted-foreground mb-4" />
                  <p className="text-muted-foreground mb-4">No FAQs yet</p>
                  <Button onClick={() => handleOpenFAQForm()}>
                    <Plus className="w-4 h-4 mr-2" /> Create your first FAQ
                  </Button>
                </CardContent>
              </Card>
            ) : (
              faqs.map((faq) => (
                <FAQCard
                  key={faq.id}
                  faq={faq}
                  onEdit={handleOpenFAQForm}
                  onDelete={(id) => deleteFAQMutation.mutate(id)}
                  onToggleVisibility={handleToggleFAQVisibility}
                />
              ))
            )}
          </TabsContent>
        </Tabs>
      </div>

      <FAQForm
        open={isFAQFormOpen}
        onOpenChange={(open) => {
          if (!open) handleFAQFormClose();
          else setIsFAQFormOpen(open);
        }}
        editingFAQ={editingFAQ}
        onSubmit={handleFAQSubmit}
        isPending={isFAQPending}
        defaultOrder={faqs.length}
      />
    </AdminLayout>
  );
}
