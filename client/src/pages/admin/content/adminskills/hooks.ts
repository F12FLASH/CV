import { useQuery, useMutation } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import type { Skill, SkillFormData } from "./types";

export function useSkills() {
  return useQuery<Skill[]>({
    queryKey: ["/api/skills"],
  });
}

export function useCreateSkill(onSuccess?: () => void) {
  const { toast } = useToast();

  return useMutation({
    mutationFn: (data: SkillFormData) => api.createSkill(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/skills"] });
      queryClient.invalidateQueries({ queryKey: ["skills"] });
      toast({ title: "Success", description: "Skill created successfully" });
      onSuccess?.();
    },
    onError: (error: any) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    },
  });
}

export function useUpdateSkill(onSuccess?: () => void) {
  const { toast } = useToast();

  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: SkillFormData }) => api.updateSkill(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/skills"] });
      queryClient.invalidateQueries({ queryKey: ["skills"] });
      toast({ title: "Success", description: "Skill updated successfully" });
      onSuccess?.();
    },
    onError: (error: any) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    },
  });
}

export function useDeleteSkill(onSuccess?: () => void) {
  const { toast } = useToast();

  return useMutation({
    mutationFn: (id: number) => api.deleteSkill(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/skills"] });
      queryClient.invalidateQueries({ queryKey: ["skills"] });
      toast({ title: "Success", description: "Skill deleted successfully" });
      onSuccess?.();
    },
    onError: (error: any) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    },
  });
}
