import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { useLocation } from "wouter";
import { useToast } from "@/hooks/use-toast";

export interface User {
  id: number;
  username: string;
  email: string;
  fullName?: string;
  avatar?: string;
  role: string;
  createdAt?: string;
}

export function useAuth() {
  const queryClient = useQueryClient();
  const [, setLocation] = useLocation();
  const { toast } = useToast();

  const { data: user, isLoading, refetch, error } = useQuery<User | null>({
    queryKey: ["currentUser"],
    queryFn: async () => {
      try {
        return await api.getCurrentUser();
      } catch {
        return null;
      }
    },
    retry: false,
    staleTime: 5 * 60 * 1000,
  });

  const loginMutation = useMutation({
    mutationFn: ({ username, password }: { username: string; password: string }) =>
      api.login(username, password),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["currentUser"] });
      refetch();
      toast({ title: "Login successful", description: "Welcome back!" });
    },
    onError: (error: Error) => {
      toast({ 
        title: "Login failed", 
        description: error.message || "Invalid credentials",
        variant: "destructive" 
      });
    },
  });

  const logoutMutation = useMutation({
    mutationFn: api.logout,
    onSuccess: () => {
      queryClient.removeQueries({ queryKey: ["currentUser"] });
      queryClient.invalidateQueries();
      setLocation("/admin/login");
      toast({ title: "Logged out", description: "You have been logged out successfully" });
    },
    onError: (error: Error) => {
      toast({ 
        title: "Logout failed", 
        description: error.message,
        variant: "destructive" 
      });
    },
  });

  const registerMutation = useMutation({
    mutationFn: (data: { username: string; password: string; email: string; fullName?: string }) => 
      api.register(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["currentUser"] });
      toast({ title: "Registration successful", description: "Account created successfully" });
    },
    onError: (error: Error) => {
      toast({ 
        title: "Registration failed", 
        description: error.message || "Could not create account",
        variant: "destructive" 
      });
    },
  });

  return {
    user: user ?? null,
    isLoading,
    isAuthenticated: !!user,
    error,
    loginMutation,
    logoutMutation,
    registerMutation,
    refetch,
  };
}
