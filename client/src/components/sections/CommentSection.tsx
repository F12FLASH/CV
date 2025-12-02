import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { MessageSquare, Send, Loader2, Reply, ChevronDown, ChevronUp } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { formatDistanceToNow } from "date-fns";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import type { Comment } from "@shared/schema";

interface CommentSectionProps {
  postId?: number;
  projectId?: number;
  title?: string;
}

interface CommentWithReplies extends Comment {
  replies?: CommentWithReplies[];
}

const commentFormSchema = z.object({
  authorName: z.string().min(2, "Name must be at least 2 characters"),
  authorEmail: z.string().email("Please enter a valid email"),
  content: z.string().min(10, "Comment must be at least 10 characters"),
});

type CommentFormValues = z.infer<typeof commentFormSchema>;

function organizeComments(comments: Comment[]): CommentWithReplies[] {
  const commentMap = new Map<number, CommentWithReplies>();
  const rootComments: CommentWithReplies[] = [];

  comments.forEach(comment => {
    commentMap.set(comment.id, { ...comment, replies: [] });
  });

  comments.forEach(comment => {
    const commentWithReplies = commentMap.get(comment.id)!;
    if (comment.parentId && commentMap.has(comment.parentId)) {
      commentMap.get(comment.parentId)!.replies!.push(commentWithReplies);
    } else {
      rootComments.push(commentWithReplies);
    }
  });

  return rootComments;
}

interface CommentItemProps {
  comment: CommentWithReplies;
  depth: number;
  replyingTo: number | null;
  setReplyingTo: (id: number | null) => void;
  expandedReplies: Set<number>;
  toggleReplies: (id: number) => void;
  replyForm: ReturnType<typeof useForm<CommentFormValues>>;
  onReplySubmit: (data: CommentFormValues, parentId: number) => void;
  submitMutation: any;
}

function CommentItem({
  comment,
  depth,
  replyingTo,
  setReplyingTo,
  expandedReplies,
  toggleReplies,
  replyForm,
  onReplySubmit,
  submitMutation,
}: CommentItemProps) {
  const hasReplies = comment.replies && comment.replies.length > 0;
  const isExpanded = expandedReplies.has(comment.id);
  const isReplying = replyingTo === comment.id;
  const maxDepth = 3;

  return (
    <div 
      className={`${depth > 0 ? 'ml-6 pl-4 border-l-2 border-muted' : ''}`}
      data-testid={`comment-${comment.id}`}
    >
      <div className="flex gap-4 p-4 rounded-lg bg-muted/30">
        <Avatar className="w-10 h-10 shrink-0">
          <AvatarFallback className="bg-primary/10 text-primary font-semibold">
            {comment.authorName.charAt(0).toUpperCase()}
          </AvatarFallback>
        </Avatar>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1 flex-wrap">
            <span className="font-semibold">{comment.authorName}</span>
            <span className="text-xs text-muted-foreground">
              {comment.createdAt && formatDistanceToNow(new Date(comment.createdAt), { addSuffix: true })}
            </span>
          </div>
          <p className="text-foreground/90 mb-2">{comment.content}</p>
          
          <div className="flex items-center gap-2 flex-wrap">
            {depth < maxDepth && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setReplyingTo(isReplying ? null : comment.id)}
                data-testid={`button-reply-${comment.id}`}
              >
                <Reply className="w-4 h-4 mr-1" />
                {isReplying ? "Cancel" : "Reply"}
              </Button>
            )}
            {hasReplies && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => toggleReplies(comment.id)}
                data-testid={`button-toggle-replies-${comment.id}`}
              >
                {isExpanded ? (
                  <>
                    <ChevronUp className="w-4 h-4 mr-1" />
                    Hide {comment.replies!.length} {comment.replies!.length === 1 ? 'reply' : 'replies'}
                  </>
                ) : (
                  <>
                    <ChevronDown className="w-4 h-4 mr-1" />
                    Show {comment.replies!.length} {comment.replies!.length === 1 ? 'reply' : 'replies'}
                  </>
                )}
              </Button>
            )}
          </div>
        </div>
      </div>

      {isReplying && (
        <div className="mt-3 ml-14">
          <Form {...replyForm}>
            <form 
              onSubmit={replyForm.handleSubmit((data) => onReplySubmit(data, comment.id))} 
              className="space-y-3 p-3 bg-muted/30 rounded-lg"
            >
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <FormField
                  control={replyForm.control}
                  name="authorName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-sm">Name</FormLabel>
                      <FormControl>
                        <Input placeholder="Your name" {...field} data-testid={`input-reply-name-${comment.id}`} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={replyForm.control}
                  name="authorEmail"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-sm">Email</FormLabel>
                      <FormControl>
                        <Input type="email" placeholder="your@email.com" {...field} data-testid={`input-reply-email-${comment.id}`} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <FormField
                control={replyForm.control}
                name="content"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sm">Reply</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder={`Reply to ${comment.authorName}...`}
                        className="min-h-[80px]" 
                        {...field} 
                        data-testid={`textarea-reply-content-${comment.id}`}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button 
                type="submit" 
                size="sm"
                disabled={submitMutation.isPending}
                data-testid={`button-submit-reply-${comment.id}`}
              >
                {submitMutation.isPending ? (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <Send className="w-4 h-4 mr-2" />
                )}
                Post Reply
              </Button>
            </form>
          </Form>
        </div>
      )}

      {hasReplies && isExpanded && (
        <div className="mt-3 space-y-3">
          {comment.replies!.map((reply) => (
            <CommentItem
              key={reply.id}
              comment={reply}
              depth={depth + 1}
              replyingTo={replyingTo}
              setReplyingTo={setReplyingTo}
              expandedReplies={expandedReplies}
              toggleReplies={toggleReplies}
              replyForm={replyForm}
              onReplySubmit={onReplySubmit}
              submitMutation={submitMutation}
            />
          ))}
        </div>
      )}
    </div>
  );
}

export function CommentSection({ postId, projectId, title = "Comments" }: CommentSectionProps) {
  const { toast } = useToast();
  const [showForm, setShowForm] = useState(false);
  const [replyingTo, setReplyingTo] = useState<number | null>(null);
  const [expandedReplies, setExpandedReplies] = useState<Set<number>>(new Set());

  const queryKey = postId 
    ? ['/api/comments', { postId, approved: true }]
    : ['/api/comments', { projectId, approved: true }];

  const { data: comments = [], isLoading } = useQuery<Comment[]>({
    queryKey,
    queryFn: async () => {
      const params = new URLSearchParams();
      if (postId) params.append('postId', postId.toString());
      if (projectId) params.append('projectId', projectId.toString());
      params.append('approved', 'true');
      const response = await fetch(`/api/comments?${params}`);
      if (!response.ok) throw new Error('Failed to fetch comments');
      return response.json();
    }
  });

  const organizedComments = organizeComments(comments);

  const form = useForm<CommentFormValues>({
    resolver: zodResolver(commentFormSchema),
    defaultValues: {
      authorName: "",
      authorEmail: "",
      content: "",
    },
  });

  const replyForm = useForm<CommentFormValues>({
    resolver: zodResolver(commentFormSchema),
    defaultValues: {
      authorName: "",
      authorEmail: "",
      content: "",
    },
  });

  const submitMutation = useMutation({
    mutationFn: async (data: CommentFormValues & { parentId?: number | null }) => {
      const payload = {
        ...data,
        postId: postId || null,
        projectId: projectId || null,
        parentId: data.parentId || null,
        status: 'Approved',
      };
      const response = await fetch('/api/comments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(payload),
      });
      const responseText = await response.text();
      if (!response.ok) {
        throw new Error(`Failed to submit comment: ${responseText}`);
      }
      return JSON.parse(responseText);
    },
    onSuccess: (data) => {
      toast({
        title: "Comment submitted",
        description: "Your comment has been posted successfully.",
      });
      form.reset();
      replyForm.reset();
      setShowForm(false);
      setReplyingTo(null);
      queryClient.invalidateQueries({ queryKey: ['/api/comments'] });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to submit comment. Please try again.",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: CommentFormValues) => {
    submitMutation.mutate(data);
  };

  const onReplySubmit = (data: CommentFormValues, parentId: number) => {
    submitMutation.mutate({ ...data, parentId });
  };

  const toggleReplies = (commentId: number) => {
    setExpandedReplies(prev => {
      const newSet = new Set(prev);
      if (newSet.has(commentId)) {
        newSet.delete(commentId);
      } else {
        newSet.add(commentId);
      }
      return newSet;
    });
  };

  return (
    <Card className="mt-8">
      <CardHeader className="flex flex-row items-center justify-between gap-4 pb-4">
        <CardTitle className="flex items-center gap-2">
          <MessageSquare className="w-5 h-5" />
          {title} ({comments.length})
        </CardTitle>
        <Button 
          variant="outline" 
          size="sm"
          onClick={() => setShowForm(!showForm)}
          data-testid="button-add-comment"
        >
          {showForm ? "Cancel" : "Add Comment"}
        </Button>
      </CardHeader>
      <CardContent className="space-y-6">
        {showForm && (
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 p-4 bg-muted/50 rounded-lg">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="authorName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Name</FormLabel>
                      <FormControl>
                        <Input placeholder="Your name" {...field} data-testid="input-comment-name" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="authorEmail"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email</FormLabel>
                      <FormControl>
                        <Input type="email" placeholder="your@email.com" {...field} data-testid="input-comment-email" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <FormField
                control={form.control}
                name="content"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Comment</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="Share your thoughts..." 
                        className="min-h-[100px]" 
                        {...field} 
                        data-testid="textarea-comment-content"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button 
                type="submit" 
                disabled={submitMutation.isPending}
                data-testid="button-submit-comment"
              >
                {submitMutation.isPending ? (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <Send className="w-4 h-4 mr-2" />
                )}
                Submit Comment
              </Button>
            </form>
          </Form>
        )}

        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
          </div>
        ) : organizedComments.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <MessageSquare className="w-10 h-10 mx-auto mb-3 opacity-50" />
            <p>No comments yet. Be the first to share your thoughts!</p>
          </div>
        ) : (
          <div className="space-y-4">
            {organizedComments.map((comment) => (
              <CommentItem
                key={comment.id}
                comment={comment}
                depth={0}
                replyingTo={replyingTo}
                setReplyingTo={setReplyingTo}
                expandedReplies={expandedReplies}
                toggleReplies={toggleReplies}
                replyForm={replyForm}
                onReplySubmit={onReplySubmit}
                submitMutation={submitMutation}
              />
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
