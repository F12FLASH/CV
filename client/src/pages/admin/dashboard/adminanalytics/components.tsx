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
import { Eye, FileText, Briefcase, MessageSquare, Star } from "lucide-react";
import type { DashboardStats, TrafficData, TopContent, ContentStatusData } from "./types";

interface StatsCardsProps {
  stats: DashboardStats | undefined;
}

export function StatsCards({ stats }: StatsCardsProps) {
  const cards = [
    { title: "Total Views", value: stats?.totalViews || 0, icon: Eye, description: "All-time page views" },
    { title: "Posts", value: stats?.totalPosts || 0, icon: FileText, description: `${stats?.publishedPosts || 0} published` },
    { title: "Projects", value: stats?.totalProjects || 0, icon: Briefcase, description: `${stats?.publishedProjects || 0} published` },
    { title: "Comments", value: stats?.totalComments || 0, icon: MessageSquare, description: "Total comments" },
    { title: "Reviews", value: stats?.totalReviews || 0, icon: Star, description: `${stats?.pendingReviews || 0} pending` },
  ];

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
      {cards.map((card) => (
        <Card key={card.title}>
          <CardHeader className="flex flex-row items-center justify-between gap-2 pb-2">
            <CardTitle className="text-sm font-medium">{card.title}</CardTitle>
            <card.icon className="w-4 h-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{card.value.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">{card.description}</p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

interface TrafficChartProps {
  data: TrafficData[];
}

export function TrafficChart({ data }: TrafficChartProps) {
  return (
    <Card className="col-span-2">
      <CardHeader>
        <CardTitle>Traffic Overview</CardTitle>
        <CardDescription>Views by content type over the last 7 days</CardDescription>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
            <XAxis dataKey="date" className="text-xs" />
            <YAxis className="text-xs" />
            <Tooltip 
              contentStyle={{ 
                backgroundColor: 'hsl(var(--card))', 
                border: '1px solid hsl(var(--border))',
                borderRadius: '8px'
              }} 
            />
            <Line 
              type="monotone" 
              dataKey="posts" 
              stroke="hsl(var(--primary))" 
              strokeWidth={2}
              name="Posts"
            />
            <Line 
              type="monotone" 
              dataKey="projects" 
              stroke="hsl(var(--secondary))" 
              strokeWidth={2}
              name="Projects"
            />
          </LineChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}

interface ContentDistributionProps {
  data: ContentStatusData[];
}

export function ContentDistribution({ data }: ContentDistributionProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Content Distribution</CardTitle>
        <CardDescription>Published vs Draft content</CardDescription>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              innerRadius={60}
              outerRadius={100}
              paddingAngle={5}
              dataKey="value"
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip 
              contentStyle={{ 
                backgroundColor: 'hsl(var(--card))', 
                border: '1px solid hsl(var(--border))',
                borderRadius: '8px'
              }} 
            />
          </PieChart>
        </ResponsiveContainer>
        <div className="flex flex-wrap justify-center gap-4 mt-4">
          {data.map((item) => (
            <div key={item.name} className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }} />
              <span className="text-xs text-muted-foreground">{item.name}: {item.value}</span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

interface TopContentListProps {
  content: TopContent[];
}

export function TopContentList({ content }: TopContentListProps) {
  return (
    <Card className="col-span-2">
      <CardHeader>
        <CardTitle>Top Content</CardTitle>
        <CardDescription>Most viewed posts and projects</CardDescription>
      </CardHeader>
      <CardContent>
        {content.length === 0 ? (
          <p className="text-muted-foreground text-center py-8">No content with views yet</p>
        ) : (
          <div className="space-y-4">
            {content.map((item, index) => (
              <div key={item.path} className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="text-lg font-bold text-muted-foreground">#{index + 1}</span>
                  <div>
                    <p className="font-medium">{item.title}</p>
                    <p className="text-xs text-muted-foreground">{item.path}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant={item.type === "post" ? "default" : "secondary"}>
                    {item.type}
                  </Badge>
                  <span className="text-sm font-medium">{item.views.toLocaleString()} views</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
