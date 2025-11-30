import { AdminLayout } from "@/layouts/AdminLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  Users, 
  Eye, 
  Activity,
  Clock,
  AlertTriangle,
  Globe
} from "lucide-react";
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
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

const serverStats = [
  { name: "CPU", value: 45 },
  { name: "RAM", value: 60 },
  { name: "Storage", value: 25 },
];

export default function AdminDashboard() {
  return (
    <AdminLayout>
      <div className="space-y-8">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-heading font-bold">Dashboard</h1>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
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
            <Card key={i} className="bg-card/50 backdrop-blur-sm border-primary/10 hover:border-primary/30 transition-colors">
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

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Card className="lg:col-span-2 bg-card/50 backdrop-blur-sm border-primary/10">
            <CardHeader>
              <CardTitle>Traffic Overview</CardTitle>
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
              <CardTitle>System Health</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {serverStats.map((stat) => (
                  <div key={stat.name} className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>{stat.name}</span>
                      <span className="text-muted-foreground">{stat.value}%</span>
                    </div>
                    <div className="h-2 bg-muted rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-gradient-to-r from-primary to-secondary" 
                        style={{ width: `${stat.value}%` }}
                      />
                    </div>
                  </div>
                ))}
                
                <div className="mt-6 pt-6 border-t border-border">
                  <h4 className="text-sm font-medium mb-4">Recent Alerts</h4>
                  <div className="space-y-3">
                    <div className="flex items-start gap-3 text-sm">
                      <AlertTriangle className="w-4 h-4 text-yellow-500 mt-0.5" />
                      <div>
                        <p className="font-medium text-yellow-500">High Memory Usage</p>
                        <p className="text-muted-foreground text-xs">5 minutes ago</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3 text-sm">
                      <Globe className="w-4 h-4 text-blue-500 mt-0.5" />
                      <div>
                        <p className="font-medium text-blue-500">New Location Detected</p>
                        <p className="text-muted-foreground text-xs">1 hour ago</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </AdminLayout>
  );
}
