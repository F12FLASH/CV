import { AdminLayout } from "@/layouts/AdminLayout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { useMockData } from "@/context/MockContext";
import { useQuery } from "@tanstack/react-query";
import { 
  Users, 
  Eye, 
  Activity,
  Clock,
  AlertTriangle,
  Globe,
  FileText,
  Briefcase,
  MessageSquare,
  CheckCircle,
  XCircle,
  Info,
  Zap
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
  Cell
} from "recharts";

const data = [
  { name: "Mon", visits: 4000, views: 2400 },
  { name: "Tue", visits: 3000, views: 1398 },
  { name: "Wed", visits: 2000, views: 9800 },
  { name: "Thu", visits: 2780, views: 3908 },
  { name: "Fri", visits: 1890, views: 4800 },
  { name: "Sat", visits: 2390, views: 3800 },
  { name: "Sun", visits: 3490, views: 4300 },
];

const trafficSourceData = [
  { name: "Organic", value: 400, color: "#7c3aed" },
  { name: "Social", value: 300, color: "#3b82f6" },
  { name: "Direct", value: 300, color: "#10b981" },
  { name: "Referral", value: 200, color: "#f59e0b" },
];

const serverStats = [
  { name: "CPU", value: 45 },
  { name: "RAM", value: 60 },
  { name: "Storage", value: 25 },
];

export default function AdminDashboard() {
  const { activityLogs, posts, projects, messages } = useMockData();
  const { data: comments = [] } = useQuery<any[]>({
    queryKey: ['/api/comments'],
  });
  const { data: reviews = [] } = useQuery<any[]>({
    queryKey: ['/api/reviews'],
  });

  const unreadMessages = messages.filter((m: any) => !m.read).length;
  const unreadComments = comments.filter((c: any) => !c.read).length;
  const unreadReviews = reviews.filter((r: any) => !r.read).length;
  const totalUnread = unreadMessages + unreadComments + unreadReviews;

  return (
    <AdminLayout>
      <div className="space-y-8 animate-in fade-in duration-500">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
             <h1 className="text-3xl font-heading font-bold">Dashboard</h1>
             <p className="text-muted-foreground">Welcome back, Admin. Here's what's happening today.</p>
          </div>
          <div className="flex items-center gap-2 text-sm bg-green-500/10 text-green-500 px-3 py-1 rounded-full border border-green-500/20">
            <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
            System Operational
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[
            { title: "Total Views", value: "45.2K", change: "+12%", icon: Eye, color: "text-blue-500" },
            { title: "Active Users", value: "1,203", change: "+5%", icon: Users, color: "text-green-500" },
            { title: "Bounce Rate", value: "42.3%", change: "-2%", icon: Activity, color: "text-yellow-500" },
            { title: "Avg. Session", value: "4m 32s", change: "+8%", icon: Clock, color: "text-purple-500" },
          ].map((stat, i) => (
            <Card key={i} className="bg-card/50 backdrop-blur-sm border-primary/10 hover:border-primary/30 transition-all hover:-translate-y-1 duration-300">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  {stat.title}
                </CardTitle>
                <stat.icon className={`h-4 w-4 ${stat.color}`} />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stat.value}</div>
                <p className="text-xs text-muted-foreground mt-1">
                  <span className={stat.change.startsWith("+") ? "text-green-500" : "text-red-500"}>
                    {stat.change}
                  </span>{" "}
                  from last month
                </p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Content & Performance Overview */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
           {/* Quick Content Stats */}
           <Card className="md:col-span-2 bg-card/50 backdrop-blur-sm border-primary/10">
              <CardHeader>
                <CardTitle>Content Overview</CardTitle>
                <CardDescription>Quick summary of your content status</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                   <div className="p-4 rounded-xl bg-primary/5 border border-primary/10 flex flex-col items-center justify-center text-center gap-2 hover:bg-primary/10 transition-colors">
                      <FileText className="h-8 w-8 text-primary mb-1" />
                      <span className="text-2xl font-bold">{posts.length}</span>
                      <span className="text-xs text-muted-foreground">Total Posts</span>
                   </div>
                   <div className="p-4 rounded-xl bg-blue-500/5 border border-blue-500/10 flex flex-col items-center justify-center text-center gap-2 hover:bg-blue-500/10 transition-colors">
                      <Briefcase className="h-8 w-8 text-blue-500 mb-1" />
                      <span className="text-2xl font-bold">{projects.length}</span>
                      <span className="text-xs text-muted-foreground">Projects</span>
                   </div>
                   <div className="p-4 rounded-xl bg-yellow-500/5 border border-yellow-500/10 flex flex-col items-center justify-center text-center gap-2 hover:bg-yellow-500/10 transition-colors">
                      <MessageSquare className="h-8 w-8 text-yellow-500 mb-1" />
                      <span className="text-2xl font-bold">{totalUnread}</span>
                      <span className="text-xs text-muted-foreground">Unread</span>
                   </div>
                   <div className="p-4 rounded-xl bg-purple-500/5 border border-purple-500/10 flex flex-col items-center justify-center text-center gap-2 hover:bg-purple-500/10 transition-colors">
                      <Users className="h-8 w-8 text-purple-500 mb-1" />
                      <span className="text-2xl font-bold">12</span>
                      <span className="text-xs text-muted-foreground">New Subs</span>
                   </div>
                </div>
              </CardContent>
           </Card>

           {/* Performance Score */}
           <Card className="bg-card/50 backdrop-blur-sm border-primary/10 flex flex-col justify-center relative overflow-hidden">
              <div className="absolute top-0 right-0 p-4 opacity-10">
                 <Zap size={120} />
              </div>
              <CardHeader>
                 <CardTitle>Site Performance</CardTitle>
                 <CardDescription>PageSpeed Insights</CardDescription>
              </CardHeader>
              <CardContent className="flex flex-col items-center justify-center pt-0">
                 <div className="relative w-32 h-32 flex items-center justify-center">
                    <svg className="w-full h-full transform -rotate-90">
                       <circle cx="64" cy="64" r="56" stroke="currentColor" strokeWidth="12" fill="transparent" className="text-muted/20" />
                       <circle cx="64" cy="64" r="56" stroke="currentColor" strokeWidth="12" fill="transparent" strokeDasharray={351.86} strokeDashoffset={351.86 * (1 - 0.92)} className="text-green-500" />
                    </svg>
                    <span className="absolute text-4xl font-bold text-green-500">92</span>
                 </div>
                 <div className="flex gap-4 mt-4 text-sm">
                    <div className="flex items-center gap-1"><CheckCircle size={14} className="text-green-500"/> Desktop: 98</div>
                    <div className="flex items-center gap-1"><CheckCircle size={14} className="text-green-500"/> Mobile: 92</div>
                 </div>
              </CardContent>
           </Card>
        </div>

        {/* Charts & Traffic */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Card className="lg:col-span-2 bg-card/50 backdrop-blur-sm border-primary/10">
            <CardHeader>
              <CardTitle>Traffic Analytics</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={data}>
                    <defs>
                      <linearGradient id="colorVisits" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#7c3aed" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="#7c3aed" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                    <XAxis dataKey="name" stroke="rgba(255,255,255,0.5)" />
                    <YAxis stroke="rgba(255,255,255,0.5)" />
                    <Tooltip 
                      contentStyle={{ backgroundColor: "#1e293b", border: "none", borderRadius: "8px" }}
                    />
                    <Area 
                      type="monotone" 
                      dataKey="visits" 
                      stroke="#7c3aed" 
                      fillOpacity={1} 
                      fill="url(#colorVisits)" 
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-card/50 backdrop-blur-sm border-primary/10">
            <CardHeader>
              <CardTitle>Traffic Sources</CardTitle>
            </CardHeader>
            <CardContent>
               <div className="h-[200px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={trafficSourceData}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={80}
                        paddingAngle={5}
                        dataKey="value"
                      >
                        {trafficSourceData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip contentStyle={{ backgroundColor: "#1e293b", border: "none", borderRadius: "8px" }} />
                    </PieChart>
                  </ResponsiveContainer>
               </div>
               <div className="space-y-2 mt-4">
                  {trafficSourceData.map((item) => (
                     <div key={item.name} className="flex items-center justify-between text-sm">
                        <div className="flex items-center gap-2">
                           <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }} />
                           <span>{item.name}</span>
                        </div>
                        <span className="font-medium">{Math.round((item.value / 1200) * 100)}%</span>
                     </div>
                  ))}
               </div>
            </CardContent>
          </Card>
        </div>

        {/* Activity Logs & Notifications */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
           {/* Activity Log */}
           <Card className="lg:col-span-2 bg-card/50 backdrop-blur-sm border-primary/10">
              <CardHeader className="flex flex-row items-center justify-between">
                 <CardTitle>Activity Log</CardTitle>
                 <CardDescription>Recent system actions</CardDescription>
              </CardHeader>
              <CardContent>
                 <div className="space-y-6">
                    {activityLogs?.map((log) => (
                       <div key={log.id} className="flex items-start gap-4 pb-4 border-b border-border/50 last:border-0 last:pb-0">
                          <div className={`mt-1 p-2 rounded-full ${
                             log.type === 'success' ? 'bg-green-500/10 text-green-500' :
                             log.type === 'warning' ? 'bg-yellow-500/10 text-yellow-500' :
                             log.type === 'error' ? 'bg-red-500/10 text-red-500' :
                             'bg-blue-500/10 text-blue-500'
                          }`}>
                             {log.type === 'success' ? <CheckCircle size={16} /> :
                              log.type === 'warning' ? <AlertTriangle size={16} /> :
                              log.type === 'error' ? <XCircle size={16} /> :
                              <Info size={16} />}
                          </div>
                          <div className="flex-1">
                             <p className="text-sm font-medium">{log.action}</p>
                             <div className="flex items-center gap-2 text-xs text-muted-foreground mt-1">
                                <span>{log.user}</span>
                                <span>•</span>
                                <span>{log.time}</span>
                             </div>
                          </div>
                       </div>
                    ))}
                 </div>
              </CardContent>
           </Card>

           {/* Notifications */}
           <Card className="bg-card/50 backdrop-blur-sm border-primary/10">
              <CardHeader>
                 <CardTitle>System Notifications</CardTitle>
              </CardHeader>
              <CardContent>
                 <div className="space-y-4">
                    {notifications?.map((notif) => (
                       <div key={notif.id} className="p-3 rounded-lg bg-muted/50 border border-border flex gap-3">
                          <div className={`w-1 h-full rounded-full ${
                             notif.type === 'update' ? 'bg-blue-500' :
                             notif.type === 'security' ? 'bg-red-500' :
                             'bg-green-500'
                          }`} />
                          <div>
                             <p className="text-sm font-medium">{notif.message}</p>
                             <p className="text-xs text-muted-foreground mt-1">{notif.date}</p>
                          </div>
                       </div>
                    ))}
                    <div className="p-3 rounded-lg bg-primary/10 border border-primary/20 text-center cursor-pointer hover:bg-primary/20 transition-colors">
                       <span className="text-xs font-medium text-primary">View All Notifications</span>
                    </div>
                 </div>
              </CardContent>
           </Card>
        </div>
      </div>
    </AdminLayout>
  );
}
