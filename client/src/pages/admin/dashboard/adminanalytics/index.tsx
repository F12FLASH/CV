import { AdminLayout } from "@/layouts/AdminLayout";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Download, RefreshCw, Loader2 } from "lucide-react";
import { useDashboardStats, usePosts, useProjects, useAnalyticsDaily } from "./hooks";
import { StatsCards, TrafficChart, ContentDistribution, TopContentList } from "./components";
import { useToast } from "@/hooks/use-toast";
import type { TrafficData, TopContent, ContentStatusData } from "./types";

export default function AdminAnalyticsPage() {
  const { toast } = useToast();

  const { data: stats, isLoading, refetch } = useDashboardStats();
  const { data: posts = [] } = usePosts();
  const { data: projects = [] } = useProjects();
  const { data: analyticsData } = useAnalyticsDaily(7);

  const trafficData: TrafficData[] = analyticsData?.map((day) => ({
    date: new Date(day.date).toLocaleDateString('en-US', { weekday: 'short' }),
    posts: day.postViews || 0,
    projects: day.projectViews || 0,
    views: day.totalViews || 0,
  })) || [];

  const topContent: TopContent[] = [
    ...posts.filter(p => p.status === "Published").map(p => ({
      title: p.title,
      path: `/blog/${p.slug}`,
      views: p.views || 0,
      type: "post" as const
    })),
    ...projects.filter(p => p.status === "Published").map(p => ({
      title: p.title,
      path: `/projects/${p.id}`,
      views: p.views || 0,
      type: "project" as const
    }))
  ].sort((a, b) => b.views - a.views).slice(0, 5);

  const contentStatusData: ContentStatusData[] = [
    { name: "Published Posts", value: stats?.publishedPosts || 0, color: "#7c3aed" },
    { name: "Draft Posts", value: (stats?.totalPosts || 0) - (stats?.publishedPosts || 0), color: "#8b5cf6" },
    { name: "Published Projects", value: stats?.publishedProjects || 0, color: "#3b82f6" },
    { name: "Draft Projects", value: (stats?.totalProjects || 0) - (stats?.publishedProjects || 0), color: "#60a5fa" },
  ];

  const handleExport = () => {
    const csvContent = [
      ["Analytics Report", new Date().toLocaleDateString()],
      [],
      ["Metric", "Value"],
      ["Total Views", stats?.totalViews || 0],
      ["Total Posts", stats?.totalPosts || 0],
      ["Published Posts", stats?.publishedPosts || 0],
      ["Total Projects", stats?.totalProjects || 0],
      ["Published Projects", stats?.publishedProjects || 0],
      ["Total Messages", stats?.totalMessages || 0],
      ["Unread Messages", stats?.unreadMessages || 0],
      ["Total Comments", stats?.totalComments || 0],
      ["Total Reviews", stats?.totalReviews || 0],
      ["Pending Reviews", stats?.pendingReviews || 0],
      ["Total Users", stats?.totalUsers || 0],
    ].map(row => row.join(",")).join("\n");

    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `analytics_${new Date().toISOString().split("T")[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
    toast({ title: "Success", description: "Analytics exported successfully" });
  };

  if (isLoading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center min-h-screen">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-heading font-bold">Analytics</h1>
            <p className="text-muted-foreground">Detailed insights into your website performance</p>
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => refetch()}
              data-testid="button-refresh-analytics"
            >
              <RefreshCw className="w-4 h-4 mr-1" /> Refresh
            </Button>
            <Button
              size="sm"
              onClick={handleExport}
              data-testid="button-export-analytics"
            >
              <Download className="w-4 h-4 mr-1" /> Export
            </Button>
          </div>
        </div>

        <StatsCards stats={stats} />

        <Tabs defaultValue="overview" className="space-y-4">
          <TabsList>
            <TabsTrigger value="overview" data-testid="tab-overview">Overview</TabsTrigger>
            <TabsTrigger value="content" data-testid="tab-content">Content</TabsTrigger>
            <TabsTrigger value="engagement" data-testid="tab-engagement">Engagement</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-4">
            <div className="grid gap-4 md:grid-cols-3">
              <TrafficChart data={trafficData} />
              <ContentDistribution data={contentStatusData} />
            </div>
          </TabsContent>

          <TabsContent value="content" className="space-y-4">
            <div className="grid gap-4 md:grid-cols-3">
              <TopContentList content={topContent} />
              <ContentDistribution data={contentStatusData} />
            </div>
          </TabsContent>

          <TabsContent value="engagement" className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <TrafficChart data={trafficData} />
              <TopContentList content={topContent} />
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </AdminLayout>
  );
}
