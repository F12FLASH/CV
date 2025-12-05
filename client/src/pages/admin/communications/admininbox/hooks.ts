import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import type { Message, SmtpStatus } from "./types";

export function useMessages() {
  return useQuery<Message[]>({
    queryKey: ['/api/messages'],
  });
}

export function useSmtpStatus() {
  return useQuery<SmtpStatus>({
    queryKey: ['/api/messages/smtp/status'],
  });
}

export function useMarkAsRead() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: number) => {
      return apiRequest("PUT", `/api/messages/${id}/read`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/messages'] });
    },
  });
}

export function useDeleteMessage() {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: number) => {
      return apiRequest("DELETE", `/api/messages/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/messages'] });
      toast({ title: "Message deleted" });
    },
    onError: (error: any) => {
      toast({ title: "Error", description: error.message || "Failed to delete message", variant: "destructive" });
    },
  });
}

export function useArchiveMessage() {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: number) => {
      return apiRequest("PUT", `/api/messages/${id}/archive`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/messages'] });
      toast({ title: "Message archived" });
    },
    onError: (error: any) => {
      toast({ title: "Error", description: error.message || "Failed to archive message", variant: "destructive" });
    },
  });
}

export function useReplyToMessage() {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, replyContent }: { id: number; replyContent: string }) => {
      return apiRequest("POST", `/api/messages/${id}/reply`, { replyContent });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/messages'] });
      toast({ title: "Reply sent", description: "Your reply has been sent successfully" });
    },
    onError: (error: any) => {
      toast({ title: "Failed to send reply", description: error.message || "Failed to send reply", variant: "destructive" });
    },
  });
}
