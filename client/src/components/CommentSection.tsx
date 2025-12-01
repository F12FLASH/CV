import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { MessageSquare, Send, Loader2 } from "lucide-react";
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

const commentFormSchema = z.object({
  authorName: z.string().min(2, "Name must be at least 2 characters"),
  authorEmail: z.string().email("Please enter a valid email"),
  content: z.string().min(10, "Comment must be at least 10 characters"),
});

type CommentFormValues = z.infer<typeof commentFormSchema>;

export function CommentSection({ postId, projectId, title = "Comments" }: CommentSectionProps) {
  const { toast } = useToast();
  const [showForm, setShowForm] = useState(false);

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

  const form = useForm<CommentFormValues>({
    resolver: zodResolver(commentFormSchema),
    defaultValues: {
      authorName: "",
      authorEmail: "",
      content: "",
    },
  });

  const submitMutation = useMutation({
    mutationFn: async (data: CommentFormValues) => {
      const payload = {
        ...data,
        postId: postId || null,
        projectId: projectId || null,
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
        description: "Your comment is pending approval and will appear shortly.",
      });
      form.reset();
      setShowForm(false);
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
        ) : comments.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <MessageSquare className="w-10 h-10 mx-auto mb-3 opacity-50" />
            <p>No comments yet. Be the first to share your thoughts!</p>
          </div>
        ) : (
          <div className="space-y-4">
            {comments.map((comment) => (
              <div 
                key={comment.id} 
                className="flex gap-4 p-4 rounded-lg bg-muted/30"
                data-testid={`comment-${comment.id}`}
              >
                <Avatar className="w-10 h-10">
                  <AvatarFallback className="bg-primary/10 text-primary font-semibold">
                    {comment.authorName.charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-semibold">{comment.authorName}</span>
                    <span className="text-xs text-muted-foreground">
                      {comment.createdAt && formatDistanceToNow(new Date(comment.createdAt), { addSuffix: true })}
                    </span>
                  </div>
                  <p className="text-foreground/90">{comment.content}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
