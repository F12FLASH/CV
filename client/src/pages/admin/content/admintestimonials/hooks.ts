import { useQuery, useMutation } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import type { TestimonialFormData } from "./types";

export function useTestimonials() {
  return useQuery({
    queryKey: ["/api/testimonials"],
    queryFn: () => api.getTestimonials(),
  });
}

export function useCreateTestimonial(onSuccess?: () => void) {
  const { toast } = useToast();

  return useMutation({
    mutationFn: (data: TestimonialFormData) => api.createTestimonial(data),
    onSuccess: () => {
      toast({ description: "Testimonial added successfully" });
      queryClient.invalidateQueries({ queryKey: ["/api/testimonials"] });
      onSuccess?.();
    },
    onError: (error) => {
      toast({
        description: error instanceof Error ? error.message : "Failed to add testimonial",
        variant: "destructive",
      });
    },
  });
}

export function useUpdateTestimonial(onSuccess?: () => void) {
  const { toast } = useToast();

  return useMutation({
    mutationFn: (data: { id: number; data: Partial<TestimonialFormData> }) =>
      api.updateTestimonial(data.id, data.data),
    onSuccess: () => {
      toast({ description: "Testimonial updated successfully" });
      queryClient.invalidateQueries({ queryKey: ["/api/testimonials"] });
      onSuccess?.();
    },
    onError: (error) => {
      toast({
        description: error instanceof Error ? error.message : "Failed to update testimonial",
        variant: "destructive",
      });
    },
  });
}

export function useDeleteTestimonial() {
  const { toast } = useToast();

  return useMutation({
    mutationFn: (id: number) => api.deleteTestimonial(id),
    onSuccess: () => {
      toast({ description: "Testimonial deleted successfully" });
      queryClient.invalidateQueries({ queryKey: ["/api/testimonials"] });
    },
    onError: (error) => {
      toast({
        description: error instanceof Error ? error.message : "Failed to delete testimonial",
        variant: "destructive",
      });
    },
  });
}
