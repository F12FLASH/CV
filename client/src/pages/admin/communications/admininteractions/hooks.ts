import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import type { Comment, Review, FAQ, FAQFormData } from "./types";

export function useComments() {
  return useQuery<Comment[]>({
    queryKey: ["/api/comments"],
  });
}

export function useReviews() {
  return useQuery<Review[]>({
    queryKey: ["/api/reviews"],
  });
}

export function useFAQs() {
  return useQuery<FAQ[]>({
    queryKey: ["/api/faqs"],
  });
}

export function usePosts() {
  return useQuery<any[]>({
    queryKey: ["/api/posts"],
  });
}

export function useProjectsList() {
  return useQuery<any[]>({
    queryKey: ["/api/projects"],
  });
}

export function useDeleteComment() {
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (id: number) => {
      return apiRequest("DELETE", `/api/comments/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/comments"] });
      toast({ title: "Comment deleted" });
    },
  });
}

export function useMarkCommentAsRead() {
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (id: number) => {
      return apiRequest("PUT", `/api/comments/${id}/read`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/comments"] });
      toast({ title: "Comment marked as read" });
    },
  });
}

export function useApproveComment() {
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (id: number) => {
      return apiRequest("PUT", `/api/comments/${id}/approve`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/comments"] });
      toast({ title: "Comment approved" });
    },
  });
}

export function useRejectComment() {
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (id: number) => {
      return apiRequest("DELETE", `/api/comments/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/comments"] });
      toast({ title: "Comment rejected" });
    },
  });
}

export function useDeleteReview() {
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (id: number) => {
      return apiRequest("DELETE", `/api/reviews/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/reviews"] });
      toast({ title: "Review deleted" });
    },
  });
}

export function useMarkReviewAsRead() {
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (id: number) => {
      return apiRequest("PUT", `/api/reviews/${id}/read`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/reviews"] });
      toast({ title: "Review marked as read" });
    },
  });
}

export function useCreateFAQ(onSuccess?: () => void) {
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (data: FAQFormData) => {
      return apiRequest("POST", "/api/faqs", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/faqs"] });
      toast({ title: "FAQ created successfully" });
      onSuccess?.();
    },
    onError: (error: any) => {
      toast({ title: "Error creating FAQ", description: error.message, variant: "destructive" });
    },
  });
}

export function useUpdateFAQ(onSuccess?: () => void) {
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ id, data }: { id: number; data: Partial<FAQ> }) => {
      return apiRequest("PUT", `/api/faqs/${id}`, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/faqs"] });
      toast({ title: "FAQ updated successfully" });
      onSuccess?.();
    },
    onError: (error: any) => {
      toast({ title: "Error updating FAQ", description: error.message, variant: "destructive" });
    },
  });
}

export function useDeleteFAQ() {
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (id: number) => {
      return apiRequest("DELETE", `/api/faqs/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/faqs"] });
      toast({ title: "FAQ deleted" });
    },
  });
}
