import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Star, Send, Loader2 } from "lucide-react";
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
import type { Review } from "@shared/schema";

interface ReviewSectionProps {
  projectId: number;
  title?: string;
  compact?: boolean;
}

const reviewFormSchema = z.object({
  authorName: z.string().min(2, "Name must be at least 2 characters"),
  authorEmail: z.string().email("Please enter a valid email"),
  content: z.string().min(10, "Review must be at least 10 characters"),
  rating: z.number().min(1).max(5),
});

type ReviewFormValues = z.infer<typeof reviewFormSchema>;

export function ReviewSection({ projectId, title = "Reviews", compact = false }: ReviewSectionProps) {
  const { toast } = useToast();
  const [showForm, setShowForm] = useState(false);
  const [hoverRating, setHoverRating] = useState(0);

  const { data: reviews = [], isLoading } = useQuery<Review[]>({
    queryKey: ['/api/reviews', { projectId, approved: true }],
    queryFn: async () => {
      const params = new URLSearchParams();
      params.append('projectId', projectId.toString());
      params.append('approved', 'true');
      const response = await fetch(`/api/reviews?${params}`);
      if (!response.ok) throw new Error('Failed to fetch reviews');
      return response.json();
    }
  });

  const averageRating = reviews.length > 0 
    ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length 
    : 0;

  const form = useForm<ReviewFormValues>({
    resolver: zodResolver(reviewFormSchema),
    defaultValues: {
      authorName: "",
      authorEmail: "",
      content: "",
      rating: 5,
    },
  });

  const submitMutation = useMutation({
    mutationFn: async (data: ReviewFormValues) => {
      const payload = {
        ...data,
        projectId,
        status: 'Pending',
      };
      console.log('Submitting review:', payload);
      const response = await fetch('/api/reviews', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(payload),
      });
      const responseText = await response.text();
      console.log('Response status:', response.status, 'Body:', responseText);
      if (!response.ok) {
        throw new Error(`Failed to submit review: ${responseText}`);
      }
      return JSON.parse(responseText);
    },
    onSuccess: (data) => {
      console.log('Review created successfully:', data);
      toast({
        title: "Review submitted",
        description: "Your review is pending approval and will appear shortly.",
      });
      form.reset();
      setShowForm(false);
      queryClient.invalidateQueries({ queryKey: ['/api/reviews'] });
    },
    onError: (error: any) => {
      console.error('Review submission error:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to submit review. Please try again.",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: ReviewFormValues) => {
    submitMutation.mutate(data);
  };

  const StarRating = ({ rating, interactive = false, size = "md" }: { rating: number; interactive?: boolean; size?: "sm" | "md" }) => {
    const starSize = size === "sm" ? "w-4 h-4" : "w-5 h-5";
    return (
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`${starSize} ${
              star <= (interactive ? hoverRating || rating : rating)
                ? "text-yellow-500 fill-yellow-500"
                : "text-gray-300 dark:text-gray-600"
            } ${interactive ? "cursor-pointer transition-colors" : ""}`}
            onMouseEnter={() => interactive && setHoverRating(star)}
            onMouseLeave={() => interactive && setHoverRating(0)}
            onClick={() => {
              if (interactive) {
                form.setValue("rating", star);
                setHoverRating(0);
              }
            }}
          />
        ))}
      </div>
    );
  };

  if (compact) {
    return (
      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <StarRating rating={Math.round(averageRating)} size="sm" />
          <span className="text-sm text-muted-foreground">
            ({reviews.length} review{reviews.length !== 1 ? 's' : ''})
          </span>
        </div>
      </div>
    );
  }

  return (
    <Card className="mt-4">
      <CardHeader className="flex flex-row items-center justify-between gap-4 pb-4">
        <div>
          <CardTitle className="flex items-center gap-2">
            <Star className="w-5 h-5" />
            {title}
          </CardTitle>
          {reviews.length > 0 && (
            <div className="flex items-center gap-2 mt-1">
              <StarRating rating={Math.round(averageRating)} size="sm" />
              <span className="text-sm text-muted-foreground">
                {averageRating.toFixed(1)} ({reviews.length} review{reviews.length !== 1 ? 's' : ''})
              </span>
            </div>
          )}
        </div>
        <Button 
          variant="outline" 
          size="sm"
          onClick={() => setShowForm(!showForm)}
          data-testid="button-add-review"
        >
          {showForm ? "Cancel" : "Add Review"}
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
                        <Input placeholder="Your name" {...field} data-testid="input-review-name" />
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
                        <Input type="email" placeholder="your@email.com" {...field} data-testid="input-review-email" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <FormField
                control={form.control}
                name="rating"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Rating</FormLabel>
                    <FormControl>
                      <StarRating rating={field.value} interactive />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="content"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Your Review</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="Share your experience..." 
                        className="min-h-[100px]" 
                        {...field} 
                        data-testid="textarea-review-content"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button 
                type="submit" 
                disabled={submitMutation.isPending}
                data-testid="button-submit-review"
              >
                {submitMutation.isPending ? (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <Send className="w-4 h-4 mr-2" />
                )}
                Submit Review
              </Button>
            </form>
          </Form>
        )}

        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
          </div>
        ) : reviews.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <Star className="w-10 h-10 mx-auto mb-3 opacity-50" />
            <p>No reviews yet. Be the first to share your experience!</p>
          </div>
        ) : (
          <div className="space-y-4">
            {reviews.map((review) => (
              <div 
                key={review.id} 
                className="flex gap-4 p-4 rounded-lg bg-muted/30"
                data-testid={`review-${review.id}`}
              >
                <Avatar className="w-10 h-10">
                  <AvatarFallback className="bg-primary/10 text-primary font-semibold">
                    {review.authorName.charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1 flex-wrap">
                    <span className="font-semibold">{review.authorName}</span>
                    <StarRating rating={review.rating} size="sm" />
                    <span className="text-xs text-muted-foreground">
                      {review.createdAt && formatDistanceToNow(new Date(review.createdAt), { addSuffix: true })}
                    </span>
                  </div>
                  <p className="text-foreground/90">{review.content}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
