import { AdminLayout } from "@/layouts/AdminLayout";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { useQuery } from "@tanstack/react-query";
import {
  Users,
  Eye,
  Activity,
  Clock,
  AlertTriangle,
  FileText,
  Briefcase,
  MessageSquare,
  CheckCircle,
  XCircle,
  Info,
  Zap,
  Star,
  Settings,
  Mail,
  TrendingUp,
  ArrowUpRight,
  ArrowDownRight,
} from "lucide-react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
} from "recharts";
import { formatDistanceToNow } from "date-fns";
import type {
  Post,
  Project,
  Message,
  Comment,
  Review,
  ActivityLog,
  Skill,
  Service,
  Testimonial,
} from "@shared/schema";
import { Link } from "wouter";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/use-auth";


export default function AdminDashboard() {
  const { user } = useAuth();

  const { data: posts = [] } = useQuery<Post[]>({
    queryKey: ["/api/posts"],
  });

  const { data: projects = [] } = useQuery<Project[]>({
    queryKey: ["/api/projects"],
  });

  const {
    data: messages = [],
    isLoading: messagesLoading,
    isError: messagesError,
  } = useQuery<Message[]>({
    queryKey: ["/api/messages"],
    retry: false,
    enabled: !!user,
  });

  const { data: comments = [] } = useQuery<Comment[]>({
    queryKey: ["/api/comments"],
  });

  const { data: reviews = [] } = useQuery<Review[]>({
    queryKey: ["/api/reviews"],
  });

  const { data: activityLogs = [] } = useQuery<ActivityLog[]>({
    queryKey: ["/api/activity-logs"],
  });

  const { data: skills = [] } = useQuery<Skill[]>({
    queryKey: ["/api/skills"],
  });

  const { data: services = [] } = useQuery<Service[]>({
    queryKey: ["/api/services"],
  });

  const { data: testimonials = [] } = useQuery<Testimonial[]>({
    queryKey: ["/api/testimonials"],
  });

  const { data: users = [] } = useQuery<any[]>({
    queryKey: ["/api/users"],
  });

  const unreadMessages = messages.filter((m) => !m.read).length;
  const unreadComments = comments.filter((c) => !c.read).length;
  const unreadReviews = reviews.filter((r) => !r.read).length;
  const totalUnread = unreadMessages + unreadComments + unreadReviews;

  const publishedPosts = posts.filter((p) => p.status === "Published").length;
  const publishedProjects = projects.filter(
    (p) => p.status === "Published",
  ).length;
  const pendingComments = comments.filter((c) => c.status === "Pending").length;
  const pendingReviews = reviews.filter((r) => r.status === "Pending").length;
  const activeServices = services.filter((s) => s.active).length;
  const activeTestimonials = testimonials.filter((t) => t.active).length;

  const totalViews =
    projects.reduce((sum, p) => sum + (p.views || 0), 0) +
    posts.reduce((sum, p) => sum + (p.views || 0), 0);

  const avgRating =
    reviews.length > 0
      ? (
          reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
        ).toFixed(1)
      : "0.0";

  const recentLogs = activityLogs.slice(0, 6);

  const statusDistribution = [
    { name: "Published", value: publishedPosts + publishedProjects, color: "hsl(var(--primary))" },
    { name: "Draft", value: posts.filter(p => p.status === "Draft").length + projects.filter(p => p.status === "Draft").length, color: "hsl(var(--chart-2))" },
    { name: "Pending", value: posts.filter(p => p.status === "Pending" || p.status === "Review").length + projects.filter(p => p.status === "Pending" || p.status === "Review").length, color: "hsl(var(--chart-3))" },
  ];

  const contentDistribution = [
    { name: "Posts", value: posts.length, color: "hsl(var(--primary))" },
    { name: "Projects", value: projects.length, color: "hsl(var(--chart-2))" },
    { name: "Services", value: services.length, color: "hsl(var(--chart-3))" },
    { name: "Skills", value: skills.length, color: "hsl(var(--chart-4))" },
  ];

  return (
    <AdminLayout>
      <div className="space-y-8 animate-in fade-in duration-500">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1
              className="text-3xl font-heading font-bold"
              data-testid="text-dashboard-title"
            >
              Dashboard
            </h1>
            <p className="text-muted-foreground">
              Welcome back! Here's what's happening with your portfolio.
            </p>
          </div>
          <div className="flex items-center gap-2 text-sm bg-green-500/10 text-green-500 px-3 py-1 rounded-full border border-green-500/20">
            <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
            System Operational
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card
            className="bg-card/50 backdrop-blur-sm border-primary/10 hover:border-primary/30 transition-all hover:-translate-y-1 duration-300"
            data-testid="card-total-views"
          >
            <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Total Views
              </CardTitle>
              <Eye className="h-4 w-4 text-blue-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {totalViews.toLocaleString()}
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                <span className="text-green-500 flex items-center gap-1">
                  <ArrowUpRight className="h-3 w-3" /> +12%
                </span>
                from last month
              </p>
            </CardContent>
          </Card>

          <Card
            className="bg-card/50 backdrop-blur-sm border-primary/10 hover:border-primary/30 transition-all hover:-translate-y-1 duration-300"
            data-testid="card-total-content"
          >
            <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Total Content
              </CardTitle>
              <FileText className="h-4 w-4 text-green-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {posts.length + projects.length}
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                {publishedPosts} posts, {publishedProjects} projects published
              </p>
            </CardContent>
          </Card>

          <Card
            className="bg-card/50 backdrop-blur-sm border-primary/10 hover:border-primary/30 transition-all hover:-translate-y-1 duration-300"
            data-testid="card-unread"
          >
            <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Unread Items
              </CardTitle>
              <MessageSquare className="h-4 w-4 text-yellow-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalUnread}</div>
              <p className="text-xs text-muted-foreground mt-1">
                {unreadMessages} messages, {unreadComments} comments,{" "}
                {unreadReviews} reviews
              </p>
            </CardContent>
          </Card>

          <Card
            className="bg-card/50 backdrop-blur-sm border-primary/10 hover:border-primary/30 transition-all hover:-translate-y-1 duration-300"
            data-testid="card-avg-rating"
          >
            <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Avg. Rating
              </CardTitle>
              <Star className="h-4 w-4 text-purple-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold flex items-center gap-1">
                {avgRating}
                <Star className="h-4 w-4 text-yellow-500 fill-yellow-500" />
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                Based on {reviews.length} reviews
              </p>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="md:col-span-2 bg-card/50 backdrop-blur-sm border-primary/10">
            <CardHeader>
              <CardTitle>Content Overview</CardTitle>
              <CardDescription>
                Quick summary of your content status
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <Link href="/admin/posts">
                  <div
                    className="p-4 rounded-xl bg-primary/5 border border-primary/10 flex flex-col items-center justify-center text-center gap-2 hover:bg-primary/10 transition-colors cursor-pointer"
                    data-testid="card-posts-count"
                  >
                    <FileText className="h-8 w-8 text-primary mb-1" />
                    <span className="text-2xl font-bold">{posts.length}</span>
                    <span className="text-xs text-muted-foreground">
                      Blog Posts
                    </span>
                  </div>
                </Link>
                <Link href="/admin/projects">
                  <div
                    className="p-4 rounded-xl bg-blue-500/5 border border-blue-500/10 flex flex-col items-center justify-center text-center gap-2 hover:bg-blue-500/10 transition-colors cursor-pointer"
                    data-testid="card-projects-count"
                  >
                    <Briefcase className="h-8 w-8 text-blue-500 mb-1" />
                    <span className="text-2xl font-bold">
                      {projects.length}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      Projects
                    </span>
                  </div>
                </Link>
                <Link href="/admin/comments">
                  <div
                    className="p-4 rounded-xl bg-yellow-500/5 border border-yellow-500/10 flex flex-col items-center justify-center text-center gap-2 hover:bg-yellow-500/10 transition-colors cursor-pointer"
                    data-testid="card-pending-count"
                  >
                    <MessageSquare className="h-8 w-8 text-yellow-500 mb-1" />
                    <span className="text-2xl font-bold">
                      {pendingComments + pendingReviews}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      Pending
                    </span>
                  </div>
                </Link>
                <Link href="/admin/inbox">
                  <div
                    className="p-4 rounded-xl bg-purple-500/5 border border-purple-500/10 flex flex-col items-center justify-center text-center gap-2 hover:bg-purple-500/10 transition-colors cursor-pointer"
                    data-testid="card-messages-count"
                  >
                    <Mail className="h-8 w-8 text-purple-500 mb-1" />
                    <span className="text-2xl font-bold">
                      {messages.length}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      Messages
                    </span>
                  </div>
                </Link>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-card/50 backdrop-blur-sm border-primary/10 flex flex-col justify-center relative overflow-hidden">
            <div className="absolute top-0 right-0 p-4 opacity-10">
              <Zap size={120} />
            </div>
            <CardHeader>
              <CardTitle>Portfolio Stats</CardTitle>
              <CardDescription>Skills & Services</CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col gap-4">
              <div className="flex justify-between items-center p-3 rounded-lg bg-muted/50">
                <span className="text-sm">Skills</span>
                <Badge variant="secondary">{skills.length}</Badge>
              </div>
              <div className="flex justify-between items-center p-3 rounded-lg bg-muted/50">
                <span className="text-sm">Active Services</span>
                <Badge variant="secondary">
                  {activeServices} / {services.length}
                </Badge>
              </div>
              <div className="flex justify-between items-center p-3 rounded-lg bg-muted/50">
                <span className="text-sm">Testimonials</span>
                <Badge variant="secondary">{activeTestimonials}</Badge>
              </div>
              <div className="flex justify-between items-center p-3 rounded-lg bg-muted/50">
                <span className="text-sm">Users</span>
                <Badge variant="secondary">{users.length}</Badge>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Card className="lg:col-span-2 bg-card/50 backdrop-blur-sm border-primary/10">
            <CardHeader>
              <CardTitle>Content Distribution</CardTitle>
              <CardDescription>
                Overview of your portfolio content
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={contentDistribution}>
                    <CartesianGrid
                      strokeDasharray="3 3"
                      stroke="hsl(var(--border))"
                    />
                    <XAxis
                      dataKey="name"
                      stroke="hsl(var(--muted-foreground))"
                    />
                    <YAxis stroke="hsl(var(--muted-foreground))" />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "hsl(var(--card))",
                        border: "1px solid hsl(var(--border))",
                        borderRadius: "8px",
                      }}
                    />
                    <Bar
                      dataKey="value"
                      fill="hsl(var(--primary))"
                      radius={[4, 4, 0, 0]}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-card/50 backdrop-blur-sm border-primary/10">
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Link href="/admin/posts">
                <Button
                  variant="outline"
                  className="w-full justify-start gap-2"
                  data-testid="button-new-post"
                >
                  <FileText className="h-4 w-4" /> New Blog Post
                </Button>
              </Link>
              <Link href="/admin/projects">
                <Button
                  variant="outline"
                  className="w-full justify-start gap-2"
                  data-testid="button-new-project"
                >
                  <Briefcase className="h-4 w-4" /> New Project
                </Button>
              </Link>
              <Link href="/admin/inbox">
                <Button
                  variant="outline"
                  className="w-full justify-start gap-2"
                  data-testid="button-view-messages"
                >
                  <Mail className="h-4 w-4" /> View Messages
                  {unreadMessages > 0 && (
                    <Badge variant="destructive" className="ml-auto">
                      {unreadMessages}
                    </Badge>
                  )}
                </Button>
              </Link>
              <Link href="/admin/settings">
                <Button
                  variant="outline"
                  className="w-full justify-start gap-2"
                  data-testid="button-settings"
                >
                  <Settings className="h-4 w-4" /> Site Settings
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Card className="lg:col-span-2 bg-card/50 backdrop-blur-sm border-primary/10">
            <CardHeader className="flex flex-row items-center justify-between gap-2">
              <div>
                <CardTitle>Recent Activity</CardTitle>
                <CardDescription>Latest system actions</CardDescription>
              </div>
              <Link href="/admin/activity">
                <Button variant="ghost" size="sm">
                  View All
                </Button>
              </Link>
            </CardHeader>
            <CardContent>
              {recentLogs.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <Activity className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>No recent activity</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {recentLogs.map((log) => (
                    <div
                      key={log.id}
                      className="flex items-start gap-4 pb-4 border-b border-border/50 last:border-0 last:pb-0"
                      data-testid={`activity-log-${log.id}`}
                    >
                      <div
                        className={`mt-1 p-2 rounded-full ${
                          log.type === "success"
                            ? "bg-green-500/10 text-green-500"
                            : log.type === "warning"
                              ? "bg-yellow-500/10 text-yellow-500"
                              : log.type === "error"
                                ? "bg-red-500/10 text-red-500"
                                : "bg-blue-500/10 text-blue-500"
                        }`}
                      >
                        {log.type === "success" ? (
                          <CheckCircle size={16} />
                        ) : log.type === "warning" ? (
                          <AlertTriangle size={16} />
                        ) : log.type === "error" ? (
                          <XCircle size={16} />
                        ) : (
                          <Info size={16} />
                        )}
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-medium">{log.action}</p>
                        <div className="flex items-center gap-2 text-xs text-muted-foreground mt-1">
                          <span>{log.userName || "System"}</span>
                          <span>•</span>
                          <span>
                            {log.createdAt &&
                              formatDistanceToNow(new Date(log.createdAt), {
                                addSuffix: true,
                              })}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="bg-card/50 backdrop-blur-sm border-primary/10">
            <CardHeader>
              <CardTitle>Recent Messages</CardTitle>
            </CardHeader>
            <CardContent>
              {messages.length === 0 && !messagesLoading && !messagesError ? (
                <div className="text-center py-8 text-muted-foreground">
                  <Mail className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>No messages yet</p>
                </div>
              ) : messagesError ? (
                <div className="text-center py-8 text-red-500">
                  <AlertTriangle className="w-12 h-12 mx-auto mb-4" />
                  <p>Could not load messages.</p>
                  <p className="text-xs text-muted-foreground">
                    Please ensure you are logged in as an admin.
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {messages.slice(0, 4).map((msg) => (
                    <div
                      key={msg.id}
                      className="p-3 rounded-lg bg-muted/50 border border-border"
                      data-testid={`message-${msg.id}`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium truncate">
                            {msg.sender}
                          </p>
                          <p className="text-xs text-muted-foreground truncate">
                            {msg.email}
                          </p>
                          <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                            {msg.message}
                          </p>
                        </div>
                        {!msg.read && (
                          <Badge
                            variant="secondary"
                            className="text-xs shrink-0"
                          >
                            New
                          </Badge>
                        )}
                      </div>
                    </div>
                  ))}
                  <Link href="/admin/inbox">
                    <div className="p-3 rounded-lg bg-primary/10 border border-primary/20 text-center cursor-pointer hover:bg-primary/20 transition-colors">
                      <span className="text-xs font-medium text-primary">
                        View All Messages
                      </span>
                    </div>
                  </Link>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </AdminLayout>
  );
}