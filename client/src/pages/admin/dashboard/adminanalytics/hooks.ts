import { useQuery } from "@tanstack/react-query";
import type { DashboardStats, AnalyticsDayData } from "./types";

export function useDashboardStats() {
  return useQuery<DashboardStats>({
    queryKey: ["/api/dashboard/stats"],
    queryFn: async () => {
      const res = await fetch("/api/dashboard/stats", { credentials: "include" });
      if (!res.ok) throw new Error("Failed to fetch stats");
      return res.json();
    },
  });
}

export function usePosts() {
  return useQuery<any[]>({
    queryKey: ["/api/posts"],
    queryFn: async () => {
      const res = await fetch("/api/posts", { credentials: "include" });
      if (!res.ok) throw new Error("Failed to fetch posts");
      return res.json();
    },
  });
}

export function useProjects() {
  return useQuery<any[]>({
    queryKey: ["/api/projects"],
    queryFn: async () => {
      const res = await fetch("/api/projects", { credentials: "include" });
      if (!res.ok) throw new Error("Failed to fetch projects");
      return res.json();
    },
  });
}

export function useAnalyticsDaily(days: number = 7) {
  return useQuery<AnalyticsDayData[]>({
    queryKey: ['/api/analytics/daily', { days }],
    queryFn: async () => {
      const res = await fetch(`/api/analytics/daily?days=${days}`, { credentials: 'include' });
      if (!res.ok) throw new Error('Failed to fetch analytics');
      return res.json();
    },
  });
}
