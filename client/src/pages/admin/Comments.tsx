import { AdminLayout } from "@/layouts/AdminLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { 
  Search, 
  Trash, 
  GripVertical,
  Edit,
  Plus,
  Star,
  MessageSquare,
  Loader2,
  Eye,
  HelpCircle,
  Save,
  X
} from "lucide-react";
import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { formatDistanceToNow } from "date-fns";
import type { Comment, Review, FAQ } from "@shared/schema";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";

export default function AdminComments() {
  const [activeTab, setActiveTab] = useState("comments");
  const [searchQuery, setSearchQuery] = useState("");
  const [faqDialogOpen, setFaqDialogOpen] = useState(false);
  const [editingFaq, setEditingFaq] = useState<FAQ | null>(null);
  const [faqForm, setFaqForm] = useState({ question: "", answer: "", visible: true, order: 0 });
  const { toast } = useToast();

  const { data: comments = [], isLoading: commentsLoading } = useQuery<Comment[]>({
    queryKey: ['/api/comments']
  });

  const { data: reviews = [], isLoading: reviewsLoading } = useQuery<Review[]>({
    queryKey: ['/api/reviews']
  });

  const { data: faqs = [], isLoading: faqsLoading } = useQuery<FAQ[]>({
    queryKey: ['/api/faqs']
  });

  const { data: posts = [] } = useQuery<any[]>({
    queryKey: ['/api/posts']
  });

  const { data: projects = [] } = useQuery<any[]>({
    queryKey: ['/api/projects']
  });

  const deleteCommentMutation = useMutation({
    mutationFn: async (id: number) => {
      return apiRequest("DELETE", `/api/comments/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/comments'] });
      toast({ title: "Comment deleted" });
    }
  });

  const markCommentAsReadMutation = useMutation({
    mutationFn: async (id: number) => {
      return apiRequest("PUT", `/api/comments/${id}/read`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/comments'] });
      toast({ title: "Comment marked as read" });
    }
  });

  const deleteReviewMutation = useMutation({
    mutationFn: async (id: number) => {
      return apiRequest("DELETE", `/api/reviews/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/reviews'] });
      toast({ title: "Review deleted" });
    }
  });

  const markReviewAsReadMutation = useMutation({
    mutationFn: async (id: number) => {
      return apiRequest("PUT", `/api/reviews/${id}/read`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/reviews'] });
      toast({ title: "Review marked as read" });
    }
  });

  const createFaqMutation = useMutation({
    mutationFn: async (data: { question: string; answer: string; visible: boolean; order: number }) => {
      return apiRequest("POST", "/api/faqs", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/faqs'] });
      toast({ title: "FAQ created successfully" });
      setFaqDialogOpen(false);
      resetFaqForm();
    },
    onError: (error: any) => {
      toast({ title: "Error creating FAQ", description: error.message, variant: "destructive" });
    }
  });

  const updateFaqMutation = useMutation({
    mutationFn: async ({ id, data }: { id: number; data: Partial<FAQ> }) => {
      return apiRequest("PUT", `/api/faqs/${id}`, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/faqs'] });
      toast({ title: "FAQ updated successfully" });
      setFaqDialogOpen(false);
      setEditingFaq(null);
      resetFaqForm();
    },
    onError: (error: any) => {
      toast({ title: "Error updating FAQ", description: error.message, variant: "destructive" });
    }
  });

  const deleteFaqMutation = useMutation({
    mutationFn: async (id: number) => {
      return apiRequest("DELETE", `/api/faqs/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/faqs'] });
      toast({ title: "FAQ deleted" });
    }
  });

  const resetFaqForm = () => {
    setFaqForm({ question: "", answer: "", visible: true, order: faqs.length });
    setEditingFaq(null);
  };

  const openFaqDialog = (faq?: FAQ) => {
    if (faq) {
      setEditingFaq(faq);
      setFaqForm({
        question: faq.question,
        answer: faq.answer,
        visible: faq.visible,
        order: faq.order
      });
    } else {
      resetFaqForm();
      setFaqForm(prev => ({ ...prev, order: faqs.length }));
    }
    setFaqDialogOpen(true);
  };

  const handleFaqSubmit = () => {
    if (!faqForm.question.trim() || !faqForm.answer.trim()) {
      toast({ title: "Please fill in all fields", variant: "destructive" });
      return;
    }
    
    if (editingFaq) {
      updateFaqMutation.mutate({ id: editingFaq.id, data: faqForm });
    } else {
      createFaqMutation.mutate(faqForm);
    }
  };

  const getPostTitle = (postId: number | null) => {
    if (!postId) return null;
    const post = posts.find((p: any) => p.id === postId);
    return post?.title || "Unknown Post";
  };

  const getProjectTitle = (projectId: number | null) => {
    if (!projectId) return null;
    const project = projects.find((p: any) => p.id === projectId);
    return project?.title || "Unknown Project";
  };

  const filteredComments = comments.filter(comment => 
    comment.authorName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    comment.content.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredReviews = reviews.filter(review =>
    review.authorName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    review.content.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredFaqs = faqs.filter(faq =>
    faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
    faq.answer.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Approved': return 'border-l-green-500';
      case 'Pending': return 'border-l-yellow-500';
      case 'Spam': return 'border-l-red-500';
      default: return 'border-l-gray-500';
    }
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-heading font-bold" data-testid="text-page-title">Interactions</h1>
            <p className="text-muted-foreground">Manage user comments, reviews, and FAQs</p>
          </div>
        </div>

        <Tabs defaultValue="comments" value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full max-w-md grid-cols-3">
            <TabsTrigger value="comments" data-testid="tab-comments">
              Comments
              {comments.filter(c => c.status === 'Pending').length > 0 && (
                <Badge variant="destructive" className="ml-2 h-5 w-5 p-0 flex items-center justify-center text-xs">
                  {comments.filter(c => c.status === 'Pending').length}
                </Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="reviews" data-testid="tab-reviews">
              Reviews
              {reviews.filter(r => r.status === 'Pending').length > 0 && (
                <Badge variant="destructive" className="ml-2 h-5 w-5 p-0 flex items-center justify-center text-xs">
                  {reviews.filter(r => r.status === 'Pending').length}
                </Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="faqs" data-testid="tab-faqs">
              FAQs
              <Badge variant="secondary" className="ml-2">{faqs.length}</Badge>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="comments" className="space-y-6 mt-6">
            <div className="flex justify-between gap-4">
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input 
                  placeholder="Search comments..." 
                  className="pl-9" 
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  data-testid="input-search-comments"
                />
              </div>
            </div>

            {commentsLoading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
              </div>
            ) : filteredComments.length === 0 ? (
              <div className="text-center py-12">
                <MessageSquare className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold">No comments yet</h3>
                <p className="text-muted-foreground">Comments will appear here when users leave them on your content.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {filteredComments.map((comment) => (
                  <Card key={comment.id} className={`border-l-4 ${getStatusColor(comment.status)}`} data-testid={`card-comment-${comment.id}`}>
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex gap-4">
                          <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center font-bold text-primary">
                            {comment.authorName.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="font-semibold">{comment.authorName}</span>
                              <span className="text-xs text-muted-foreground">
                                {comment.createdAt && formatDistanceToNow(new Date(comment.createdAt), { addSuffix: true })}
                              </span>
                              <Badge variant={comment.status === 'Approved' ? 'default' : comment.status === 'Pending' ? 'secondary' : 'destructive'} className="text-xs">
                                {comment.status}
                              </Badge>
                              {!comment.read && (
                                <Badge variant="outline" className="text-xs bg-blue-50 dark:bg-blue-950 text-blue-600 dark:text-blue-400">New</Badge>
                              )}
                            </div>
                            <p className="text-sm mt-1 text-foreground/90">{comment.content}</p>
                            <p className="text-xs text-primary mt-2">
                              On: {comment.postId ? getPostTitle(comment.postId) : getProjectTitle(comment.projectId)}
                            </p>
                          </div>
                        </div>
                        <div className="flex gap-1">
                          {!comment.read && (
                            <Button 
                              variant="ghost" 
                              size="icon" 
                              className="text-primary"
                              onClick={() => markCommentAsReadMutation.mutate(comment.id)}
                              disabled={markCommentAsReadMutation.isPending}
                              title="Mark as read"
                              data-testid={`button-read-comment-${comment.id}`}
                            >
                              <Eye className="w-4 h-4" />
                            </Button>
                          )}
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            className="text-destructive"
                            onClick={() => deleteCommentMutation.mutate(comment.id)}
                            disabled={deleteCommentMutation.isPending}
                            data-testid={`button-delete-comment-${comment.id}`}
                          >
                            <Trash className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="reviews" className="space-y-6 mt-6">
            <div className="flex justify-between gap-4">
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input 
                  placeholder="Search reviews..." 
                  className="pl-9"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  data-testid="input-search-reviews"
                />
              </div>
            </div>

            {reviewsLoading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
              </div>
            ) : filteredReviews.length === 0 ? (
              <div className="text-center py-12">
                <Star className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold">No reviews yet</h3>
                <p className="text-muted-foreground">Reviews will appear here when users rate your projects.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {filteredReviews.map((review) => (
                  <Card key={review.id} className={`border-l-4 ${getStatusColor(review.status)}`} data-testid={`card-review-${review.id}`}>
                    <CardHeader className="flex flex-row items-start justify-between gap-4 pb-2">
                      <div>
                        <CardTitle className="text-lg flex items-center gap-2">
                          {review.authorName}
                          {!review.read && (
                            <Badge variant="outline" className="text-xs bg-blue-50 dark:bg-blue-950 text-blue-600 dark:text-blue-400">New</Badge>
                          )}
                        </CardTitle>
                        <p className="text-sm text-muted-foreground">
                          Project: {getProjectTitle(review.projectId)}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {review.createdAt && formatDistanceToNow(new Date(review.createdAt), { addSuffix: true })}
                        </p>
                      </div>
                      <div className="flex">
                        {[1, 2, 3, 4, 5].map(s => (
                          <Star 
                            key={s} 
                            className={`w-4 h-4 ${s <= review.rating ? 'text-yellow-500 fill-yellow-500' : 'text-gray-300'}`} 
                          />
                        ))}
                      </div>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm italic">"{review.content}"</p>
                      <div className="flex justify-between items-center gap-2 mt-4">
                        <Badge variant="default">
                          {review.status}
                        </Badge>
                        <div className="flex gap-1">
                          {!review.read && (
                            <Button 
                              variant="ghost" 
                              size="icon" 
                              className="text-primary"
                              onClick={() => markReviewAsReadMutation.mutate(review.id)}
                              disabled={markReviewAsReadMutation.isPending}
                              title="Mark as read"
                              data-testid={`button-read-review-${review.id}`}
                            >
                              <Eye className="w-4 h-4" />
                            </Button>
                          )}
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            className="text-destructive"
                            onClick={() => deleteReviewMutation.mutate(review.id)}
                            disabled={deleteReviewMutation.isPending}
                            data-testid={`button-delete-review-${review.id}`}
                          >
                            <Trash className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="faqs" className="space-y-6 mt-6">
            <div className="flex justify-between gap-4 flex-wrap">
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input 
                  placeholder="Search FAQs..." 
                  className="pl-9" 
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  data-testid="input-search-faqs" 
                />
              </div>
              <Button onClick={() => openFaqDialog()} data-testid="button-add-faq">
                <Plus className="w-4 h-4 mr-2" /> Add Question
              </Button>
            </div>
            
            {faqsLoading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
              </div>
            ) : filteredFaqs.length === 0 ? (
              <div className="text-center py-12">
                <HelpCircle className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold">No FAQs yet</h3>
                <p className="text-muted-foreground">Add frequently asked questions to help your visitors.</p>
                <Button onClick={() => openFaqDialog()} className="mt-4">
                  <Plus className="w-4 h-4 mr-2" /> Add Your First FAQ
                </Button>
              </div>
            ) : (
              <div className="space-y-2">
                {filteredFaqs.map((faq) => (
                  <div 
                    key={faq.id} 
                    className={`flex items-center gap-4 p-4 bg-card border border-border rounded-lg group ${!faq.visible ? 'opacity-60' : ''}`} 
                    data-testid={`card-faq-${faq.id}`}
                  >
                    <div className="cursor-grab text-muted-foreground hover:text-foreground">
                      <GripVertical className="w-5 h-5" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <h4 className="font-semibold">{faq.question}</h4>
                        {!faq.visible && (
                          <Badge variant="outline" className="text-xs">Hidden</Badge>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground line-clamp-2">{faq.answer}</p>
                    </div>
                    <div className="invisible group-hover:visible flex gap-2">
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        onClick={() => openFaqDialog(faq)}
                        data-testid={`button-edit-faq-${faq.id}`}
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="text-destructive"
                        onClick={() => deleteFaqMutation.mutate(faq.id)}
                        disabled={deleteFaqMutation.isPending}
                        data-testid={`button-delete-faq-${faq.id}`}
                      >
                        <Trash className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>

      <Dialog open={faqDialogOpen} onOpenChange={setFaqDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>{editingFaq ? "Edit FAQ" : "Add New FAQ"}</DialogTitle>
            <DialogDescription>
              {editingFaq ? "Update this frequently asked question." : "Add a new frequently asked question to help your visitors."}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="question">Question</Label>
              <Input
                id="question"
                placeholder="e.g., What technologies do you specialize in?"
                value={faqForm.question}
                onChange={(e) => setFaqForm({ ...faqForm, question: e.target.value })}
                data-testid="input-faq-question"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="answer">Answer</Label>
              <Textarea
                id="answer"
                placeholder="Provide a helpful answer..."
                rows={4}
                value={faqForm.answer}
                onChange={(e) => setFaqForm({ ...faqForm, answer: e.target.value })}
                data-testid="input-faq-answer"
              />
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Switch
                  id="visible"
                  checked={faqForm.visible}
                  onCheckedChange={(checked) => setFaqForm({ ...faqForm, visible: checked })}
                  data-testid="switch-faq-visible"
                />
                <Label htmlFor="visible">Visible on website</Label>
              </div>
              <div className="flex items-center space-x-2">
                <Label htmlFor="order" className="text-sm">Order:</Label>
                <Input
                  id="order"
                  type="number"
                  className="w-20"
                  min="0"
                  value={faqForm.order}
                  onChange={(e) => setFaqForm({ ...faqForm, order: parseInt(e.target.value) || 0 })}
                  data-testid="input-faq-order"
                />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setFaqDialogOpen(false)}>
              <X className="w-4 h-4 mr-2" /> Cancel
            </Button>
            <Button 
              onClick={handleFaqSubmit}
              disabled={createFaqMutation.isPending || updateFaqMutation.isPending}
              data-testid="button-save-faq"
            >
              {(createFaqMutation.isPending || updateFaqMutation.isPending) ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <Save className="w-4 h-4 mr-2" />
              )}
              {editingFaq ? "Update" : "Save"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AdminLayout>
  );
}
