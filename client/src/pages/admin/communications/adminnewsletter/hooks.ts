import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import type { NewsletterSettings } from "./types";

export function useNewsletterSettings() {
  return useQuery<NewsletterSettings>({
    queryKey: ['/api/newsletter/settings'],
  });
}

export function useUpdateNewsletterSettings() {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (settings: NewsletterSettings) => {
      const response = await apiRequest('POST', '/api/newsletter/settings', settings);
      return response as unknown as NewsletterSettings;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['/api/newsletter/settings'] });
      queryClient.setQueryData(['/api/newsletter/settings'], data);
      toast({ title: "Newsletter settings saved successfully" });
    },
    onError: () => {
      toast({ title: "Failed to save settings", variant: "destructive" });
    },
  });
}
