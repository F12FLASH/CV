import { AdminLayout } from "@/layouts/AdminLayout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
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

const trafficData = [
  { date: "Mon", desktop: 2400, mobile: 1398 },
  { date: "Tue", desktop: 1398, mobile: 2800 },
  { date: "Wed", desktop: 9800, mobile: 3908 },
  { date: "Thu", desktop: 3908, mobile: 4800 },
  { date: "Fri", desktop: 4800, mobile: 3800 },
  { date: "Sat", desktop: 3800, mobile: 4300 },
  { date: "Sun", desktop: 4300, mobile: 2400 },
];

const deviceData = [
  { name: "Desktop", value: 65, color: "#7c3aed" },
  { name: "Mobile", value: 25, color: "#3b82f6" },
  { name: "Tablet", value: 10, color: "#10b981" },
];

export default function AdminAnalytics() {
  return (
    <AdminLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-heading font-bold">Analytics</h1>
          <p className="text-muted-foreground">Detailed insights into your website performance</p>
        </div>

        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList>
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="audience">Audience</TabsTrigger>
            <TabsTrigger value="behavior">Behavior</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Page Views</CardTitle>
                  <CardDescription>Last 7 days</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold">45,231</div>
                  <p className="text-xs text-green-500 mt-1">+20.1% from last week</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle>Avg. Time on Site</CardTitle>
                  <CardDescription>User engagement</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold">4m 12s</div>
                  <p className="text-xs text-green-500 mt-1">+1.2% from last week</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle>Bounce Rate</CardTitle>
                  <CardDescription>Single page sessions</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold">42.3%</div>
                  <p className="text-xs text-red-500 mt-1">-4% from last week</p>
                </CardContent>
              </Card>
            </div>

            <Card className="p-6">
              <CardHeader className="px-0 pt-0">
                <CardTitle>Traffic Source</CardTitle>
              </CardHeader>
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={trafficData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                    <XAxis dataKey="date" stroke="rgba(255,255,255,0.5)" />
                    <YAxis stroke="rgba(255,255,255,0.5)" />
                    <Tooltip 
                      contentStyle={{ backgroundColor: "#1e293b", border: "none", borderRadius: "8px" }}
                    />
                    <Line type="monotone" dataKey="desktop" stroke="#7c3aed" strokeWidth={2} />
                    <Line type="monotone" dataKey="mobile" stroke="#3b82f6" strokeWidth={2} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </Card>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Devices</CardTitle>
                </CardHeader>
                <CardContent className="flex justify-center">
                  <div className="h-[250px] w-[250px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={deviceData}
                          innerRadius={60}
                          outerRadius={80}
                          paddingAngle={5}
                          dataKey="value"
                        >
                          {deviceData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                        <Tooltip 
                           contentStyle={{ backgroundColor: "#1e293b", border: "none", borderRadius: "8px" }}
                        />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                  <div className="flex flex-col justify-center gap-2 ml-4">
                    {deviceData.map((d) => (
                      <div key={d.name} className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full" style={{ backgroundColor: d.color }} />
                        <span className="text-sm">{d.name} ({d.value}%)</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle>Top Pages</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {[
                      { path: "/", views: "12.5k" },
                      { path: "/projects", views: "8.2k" },
                      { path: "/blog/react-19", views: "5.1k" },
                      { path: "/about", views: "3.4k" },
                    ].map((page, i) => (
                      <div key={i} className="flex items-center justify-between border-b border-border pb-2 last:border-0">
                        <span className="font-mono text-sm text-primary">{page.path}</span>
                        <span className="font-bold">{page.views}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </AdminLayout>
  );
}
