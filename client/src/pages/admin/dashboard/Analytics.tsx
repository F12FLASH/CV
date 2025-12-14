import { AdminLayout } from "@/layouts/AdminLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  BarChart, 
  Bar, 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  PieChart, 
  Pie, 
  Cell 
} from "recharts";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Download, RefreshCw, Loader2, Eye, FileText, Briefcase, MessageSquare, Star } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { useState } from "react";

interface DashboardStats {
  totalProjects: number;
  publishedProjects: number;
  totalPosts: number;
  publishedPosts: number;
  totalMessages: number;
  unreadMessages: number;
  totalUsers: number;
  totalComments: number;
  totalReviews: number;
  pendingReviews: number;
  totalViews: number;
}

export default function AdminAnalytics() {
  const { toast } = useToast();
  const [dateRange, setDateRange] = useState("7days");

  const { data: stats, isLoading, refetch } = useQuery<DashboardStats>({
    queryKey: ["/api/dashboard/stats"],
    queryFn: async () => {
      const res = await fetch("/api/dashboard/stats", { credentials: "include" });
      if (!res.ok) throw new Error("Failed to fetch stats");
      return res.json();
    },
  });

  const { data: posts = [] } = useQuery<any[]>({
    queryKey: ["/api/posts"],
    queryFn: async () => {
      const res = await fetch("/api/posts", { credentials: "include" });
      if (!res.ok) throw new Error("Failed to fetch posts");
      return res.json();
    },
  });

  const { data: projects = [] } = useQuery<any[]>({
    queryKey: ["/api/projects"],
    queryFn: async () => {
      const res = await fetch("/api/projects", { credentials: "include" });
      if (!res.ok) throw new Error("Failed to fetch projects");
      return res.json();
    },
  });

  // Fetch real analytics data
  const { data: analyticsData } = useQuery({
    queryKey: ['/api/analytics/daily', { days: 7 }],
    queryFn: async () => {
      const res = await fetch('/api/analytics/daily?days=7', { credentials: 'include' });
      if (!res.ok) throw new Error('Failed to fetch analytics');
      return res.json();
    },
  });

  const trafficData = analyticsData?.map((day: any) => ({
    date: new Date(day.date).toLocaleDateString('en-US', { weekday: 'short' }),
    posts: day.postViews || 0,
    projects: day.projectViews || 0,
    views: day.totalViews || 0,
  })) || [];

  // Top content by views
  const topContent = [
    ...posts.filter(p => p.status === "Published").map(p => ({
      title: p.title,
      path: `/blog/${p.slug}`,
      views: p.views || 0,
      type: "post"
    })),
    ...projects.filter(p => p.status === "Published").map(p => ({
      title: p.title,
      path: `/projects/${p.id}`,
      views: p.views || 0,
      type: "project"
    }))
  ].sort((a, b) => b.views - a.views).slice(0, 5);

  // Content status data
  const contentStatusData = [
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

        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList>
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="content">Content</TabsTrigger>
            <TabsTrigger value="engagement">Engagement</TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm flex items-center gap-2">
                    <Eye className="w-4 h-4 text-primary" /> Total Views
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats?.totalViews || 0}</div>
                  <p className="text-xs text-muted-foreground mt-1">Posts + Projects</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm flex items-center gap-2">
                    <FileText className="w-4 h-4 text-blue-500" /> Posts
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats?.publishedPosts}/{stats?.totalPosts}</div>
                  <p className="text-xs text-muted-foreground mt-1">Published / Total</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm flex items-center gap-2">
                    <Briefcase className="w-4 h-4 text-purple-500" /> Projects
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats?.publishedProjects}/{stats?.totalProjects}</div>
                  <p className="text-xs text-muted-foreground mt-1">Published / Total</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm flex items-center gap-2">
                    <MessageSquare className="w-4 h-4 text-green-500" /> Messages
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats?.totalMessages}</div>
                  <p className="text-xs text-muted-foreground mt-1">
                    {stats?.unreadMessages} unread
                  </p>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Traffic Trend</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={trafficData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                      <XAxis dataKey="date" stroke="rgba(255,255,255,0.5)" />
                      <YAxis stroke="rgba(255,255,255,0.5)" />
                      <Tooltip contentStyle={{ backgroundColor: "#1e293b", border: "none", borderRadius: "8px" }} />
                      <Line type="monotone" dataKey="posts" stroke="#7c3aed" strokeWidth={2} name="Posts" />
                      <Line type="monotone" dataKey="projects" stroke="#3b82f6" strokeWidth={2} name="Projects" />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Top Content</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {topContent.length === 0 ? (
                      <p className="text-sm text-muted-foreground">No content yet</p>
                    ) : (
                      topContent.map((item, i) => (
                        <div key={i} className="flex items-center justify-between border-b border-border pb-2 last:border-0">
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium truncate">{item.title}</p>
                            <p className="text-xs text-muted-foreground">{item.type}</p>
                          </div>
                          <Badge variant="outline">{item.views} views</Badge>
                        </div>
                      ))
                    )}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Engagement Metrics</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex justify-between items-center p-3 bg-primary/5 rounded-lg">
                    <span className="text-sm">Total Comments</span>
                    <span className="font-bold">{stats?.totalComments}</span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-primary/5 rounded-lg">
                    <span className="text-sm">Total Reviews</span>
                    <span className="font-bold">{stats?.totalReviews}</span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-yellow-500/5 rounded-lg">
                    <span className="text-sm">Pending Reviews</span>
                    <span className="font-bold text-yellow-500">{stats?.pendingReviews}</span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-primary/5 rounded-lg">
                    <span className="text-sm">Total Users</span>
                    <span className="font-bold">{stats?.totalUsers}</span>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Content Tab */}
          <TabsContent value="content" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Posts Overview</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center p-3 border rounded-lg">
                      <span>Total Posts</span>
                      <Badge variant="default">{stats?.totalPosts}</Badge>
                    </div>
                    <div className="flex justify-between items-center p-3 border rounded-lg">
                      <span>Published</span>
                      <Badge variant="outline" className="bg-green-500/10">{stats?.publishedPosts}</Badge>
                    </div>
                    <div className="flex justify-between items-center p-3 border rounded-lg">
                      <span>Draft</span>
                      <Badge variant="secondary">{(stats?.totalPosts || 0) - (stats?.publishedPosts || 0)}</Badge>
                    </div>
                    <div className="flex justify-between items-center p-3 border rounded-lg">
                      <span>Total Post Views</span>
                      <Badge variant="outline">{posts.reduce((sum, p) => sum + (p.views || 0), 0)}</Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Projects Overview</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center p-3 border rounded-lg">
                      <span>Total Projects</span>
                      <Badge variant="default">{stats?.totalProjects}</Badge>
                    </div>
                    <div className="flex justify-between items-center p-3 border rounded-lg">
                      <span>Published</span>
                      <Badge variant="outline" className="bg-blue-500/10">{stats?.publishedProjects}</Badge>
                    </div>
                    <div className="flex justify-between items-center p-3 border rounded-lg">
                      <span>Draft</span>
                      <Badge variant="secondary">{(stats?.totalProjects || 0) - (stats?.publishedProjects || 0)}</Badge>
                    </div>
                    <div className="flex justify-between items-center p-3 border rounded-lg">
                      <span>Total Project Views</span>
                      <Badge variant="outline">{projects.reduce((sum, p) => sum + (p.views || 0), 0)}</Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Content Distribution</CardTitle>
              </CardHeader>
              <CardContent className="flex justify-center">
                <div className="h-[300px] w-full max-w-sm">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={contentStatusData.filter(d => d.value > 0)}
                        innerRadius={60}
                        outerRadius={100}
                        paddingAngle={5}
                        dataKey="value"
                      >
                        {contentStatusData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip contentStyle={{ backgroundColor: "#1e293b", border: "none", borderRadius: "8px" }} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Engagement Tab */}
          <TabsContent value="engagement" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm">Total Comments</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold">{stats?.totalComments}</div>
                  <p className="text-xs text-muted-foreground mt-1">User interactions</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm">Total Reviews</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold">{stats?.totalReviews}</div>
                  <p className="text-xs text-muted-foreground mt-1">Project ratings</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm">Pending Reviews</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-yellow-500">{stats?.pendingReviews}</div>
                  <p className="text-xs text-muted-foreground mt-1">Awaiting approval</p>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Message Activity</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center p-4 bg-primary/5 rounded-lg">
                    <div>
                      <p className="font-semibold">Total Messages</p>
                      <p className="text-xs text-muted-foreground">All incoming messages</p>
                    </div>
                    <div className="text-2xl font-bold">{stats?.totalMessages}</div>
                  </div>
                  <div className="flex justify-between items-center p-4 bg-red-500/5 rounded-lg">
                    <div>
                      <p className="font-semibold">Unread Messages</p>
                      <p className="text-xs text-muted-foreground">Require attention</p>
                    </div>
                    <div className="text-2xl font-bold text-red-500">{stats?.unreadMessages}</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Engagement Bar Chart</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={[
                      { name: "Comments", value: stats?.totalComments || 0 },
                      { name: "Reviews", value: stats?.totalReviews || 0 },
                      { name: "Messages", value: stats?.totalMessages || 0 },
                    ]}>
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                      <XAxis dataKey="name" stroke="rgba(255,255,255,0.5)" />
                      <YAxis stroke="rgba(255,255,255,0.5)" />
                      <Tooltip contentStyle={{ backgroundColor: "#1e293b", border: "none", borderRadius: "8px" }} />
                      <Bar dataKey="value" fill="#7c3aed" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </AdminLayout>
  );
}
