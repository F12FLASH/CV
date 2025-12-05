import { AdminLayout } from "@/layouts/AdminLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { 
  RotateCcw, 
  Clock, 
  ShieldCheck,
  AlertTriangle,
  HardDrive,
  RefreshCw,
  Users,
  FileText,
  Briefcase,
  MessageSquare,
  Loader2,
  CheckCircle,
  XCircle,
  Database,
  Server,
  Cpu,
  MemoryStick,
  Zap,
  Globe,
  Activity,
  TrendingUp,
  HardDriveDownload,
  Layers
} from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { useQuery, useMutation } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";
import { formatDistanceToNow, format } from "date-fns";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

function formatUptime(seconds: number): string {
  const days = Math.floor(seconds / 86400);
  const hours = Math.floor((seconds % 86400) / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = Math.floor(seconds % 60);

  if (days > 0) {
    return `${days}d ${hours}h ${minutes}m`;
  } else if (hours > 0) {
    return `${hours}h ${minutes}m ${secs}s`;
  } else if (minutes > 0) {
    return `${minutes}m ${secs}s`;
  } else {
    return `${secs}s`;
  }
}

function formatBytes(bytes: number): string {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

const tableIcons: Record<string, any> = {
  "Users": Users,
  "Projects": Briefcase,
  "Posts": FileText,
  "Messages": MessageSquare,
};

export default function AdminSystem() {
  const { toast } = useToast();

  const { data: systemStats, isLoading: statsLoading, refetch: refetchStats } = useQuery({
    queryKey: ["/api/system/stats"],
    queryFn: () => api.getSystemStats(),
    refetchInterval: 30000,
  });

  const resetMutation = useMutation({
    mutationFn: () => api.resetSystem(),
    onSuccess: (data) => {
      refetchStats();
      toast({ title: "Info", description: data.message });
    },
    onError: (error: any) => {
      toast({ title: "Error", description: error.message || "Failed to reset system", variant: "destructive" });
    },
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Healthy": return "text-green-500";
      case "Warning": return "text-yellow-500";
      case "Error": return "text-red-500";
      default: return "text-muted-foreground";
    }
  };

  const getStatusBgColor = (status: string) => {
    switch (status) {
      case "Healthy": return "bg-green-500/5 border-green-500/20";
      case "Warning": return "bg-yellow-500/5 border-yellow-500/20";
      case "Error": return "bg-red-500/5 border-red-500/20";
      default: return "";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "Healthy": return <CheckCircle className="w-5 h-5 text-green-500" />;
      case "Warning": return <AlertTriangle className="w-5 h-5 text-yellow-500" />;
      case "Error": return <XCircle className="w-5 h-5 text-red-500" />;
      default: return <Activity className="w-5 h-5 text-muted-foreground" />;
    }
  };

  const totalRecords = systemStats?.tableStats?.reduce((sum, t) => sum + t.count, 0) || 0;

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-heading font-bold" data-testid="text-page-title">System & Monitoring</h1>
            <p className="text-muted-foreground">Monitor system health, performance metrics and database status</p>
          </div>
          <div className="flex gap-2 flex-wrap">
            <Button 
              variant="outline" 
              onClick={() => refetchStats()}
              disabled={statsLoading}
              data-testid="button-refresh-stats"
            >
              <RefreshCw className={`w-4 h-4 mr-2 ${statsLoading ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button 
                  variant="outline" 
                  className="text-destructive border-destructive/50"
                  data-testid="button-reset-system"
                >
                  <RotateCcw className="w-4 h-4 mr-2" /> Reset System
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Reset System</AlertDialogTitle>
                  <AlertDialogDescription>
                    This action will attempt to reset the system. This operation is restricted in this environment.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction 
                    onClick={() => resetMutation.mutate()}
                    className="bg-destructive text-destructive-foreground"
                  >
                    {resetMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : "Reset"}
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </div>

        {statsLoading ? (
          <div className="flex items-center justify-center py-20">
            <div className="text-center">
              <Loader2 className="w-10 h-10 animate-spin text-primary mx-auto mb-4" />
              <p className="text-muted-foreground">Loading system information...</p>
            </div>
          </div>
        ) : (
          <Tabs defaultValue="overview" className="space-y-6">
            <TabsList className="grid w-full max-w-md grid-cols-3">
              <TabsTrigger value="overview" className="gap-2" data-testid="tab-overview">
                <Activity className="w-4 h-4" /> Overview
              </TabsTrigger>
              <TabsTrigger value="database" className="gap-2" data-testid="tab-database">
                <Database className="w-4 h-4" /> Database
              </TabsTrigger>
              <TabsTrigger value="server" className="gap-2" data-testid="tab-server">
                <Server className="w-4 h-4" /> Server
              </TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <Card className={`${getStatusBgColor(systemStats?.status || "Healthy")} transition-all`}>
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between">
                      <div className="space-y-2">
                        <p className="text-sm font-medium text-muted-foreground">System Status</p>
                        <div className={`text-2xl font-bold ${getStatusColor(systemStats?.status || "Healthy")}`}>
                          {systemStats?.status || "Checking..."}
                        </div>
                        <p className="text-xs text-muted-foreground">
                          Last check: {systemStats?.lastCheck ? formatDistanceToNow(new Date(systemStats.lastCheck), { addSuffix: true }) : "Unknown"}
                        </p>
                      </div>
                      <div className={`p-3 rounded-xl ${
                        systemStats?.status === "Healthy" ? "bg-green-500/10" :
                        systemStats?.status === "Warning" ? "bg-yellow-500/10" :
                        systemStats?.status === "Error" ? "bg-red-500/10" : "bg-muted"
                      }`}>
                        {getStatusIcon(systemStats?.status || "Unknown")}
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between">
                      <div className="space-y-2">
                        <p className="text-sm font-medium text-muted-foreground">Server Uptime</p>
                        <div className="text-2xl font-bold">
                          {systemStats?.serverUptime ? formatUptime(systemStats.serverUptime) : "Unknown"}
                        </div>
                        <p className="text-xs text-muted-foreground">Since last restart</p>
                      </div>
                      <div className="p-3 rounded-xl bg-blue-500/10">
                        <Clock className="w-5 h-5 text-blue-500" />
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between">
                      <div className="space-y-2">
                        <p className="text-sm font-medium text-muted-foreground">Database Size</p>
                        <div className="text-2xl font-bold">{systemStats?.databaseSize || "Unknown"}</div>
                        <p className="text-xs text-muted-foreground">{totalRecords.toLocaleString()} total records</p>
                      </div>
                      <div className="p-3 rounded-xl bg-purple-500/10">
                        <HardDrive className="w-5 h-5 text-purple-500" />
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between">
                      <div className="space-y-2">
                        <p className="text-sm font-medium text-muted-foreground">Total Tables</p>
                        <div className="text-2xl font-bold">{systemStats?.tableStats?.length || 0}</div>
                        <p className="text-xs text-muted-foreground">Active database tables</p>
                      </div>
                      <div className="p-3 rounded-xl bg-orange-500/10">
                        <Layers className="w-5 h-5 text-orange-500" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-lg">
                      <ShieldCheck className="w-5 h-5 text-green-500" />
                      System Health
                    </CardTitle>
                    <CardDescription>Current system health indicators</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div className="w-2 h-2 rounded-full bg-green-500"></div>
                          <span className="text-sm">Database Connection</span>
                        </div>
                        <Badge variant="outline" className="bg-green-500/10 text-green-600 border-green-500/30">Connected</Badge>
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div className="w-2 h-2 rounded-full bg-green-500"></div>
                          <span className="text-sm">API Server</span>
                        </div>
                        <Badge variant="outline" className="bg-green-500/10 text-green-600 border-green-500/30">Running</Badge>
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div className="w-2 h-2 rounded-full bg-green-500"></div>
                          <span className="text-sm">WebSocket</span>
                        </div>
                        <Badge variant="outline" className="bg-green-500/10 text-green-600 border-green-500/30">Active</Badge>
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div className="w-2 h-2 rounded-full bg-green-500"></div>
                          <span className="text-sm">Cron Jobs</span>
                        </div>
                        <Badge variant="outline" className="bg-green-500/10 text-green-600 border-green-500/30">Running</Badge>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-lg">
                      <TrendingUp className="w-5 h-5 text-primary" />
                      Quick Stats
                    </CardTitle>
                    <CardDescription>Key performance indicators</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="p-4 rounded-lg bg-muted/50">
                        <div className="flex items-center gap-2 text-muted-foreground text-sm mb-1">
                          <Globe className="w-4 h-4" />
                          Environment
                        </div>
                        <p className="font-semibold">Production</p>
                      </div>
                      <div className="p-4 rounded-lg bg-muted/50">
                        <div className="flex items-center gap-2 text-muted-foreground text-sm mb-1">
                          <Zap className="w-4 h-4" />
                          Node.js
                        </div>
                        <p className="font-semibold">v20.x</p>
                      </div>
                      <div className="p-4 rounded-lg bg-muted/50">
                        <div className="flex items-center gap-2 text-muted-foreground text-sm mb-1">
                          <Database className="w-4 h-4" />
                          PostgreSQL
                        </div>
                        <p className="font-semibold">v16.x</p>
                      </div>
                      <div className="p-4 rounded-lg bg-muted/50">
                        <div className="flex items-center gap-2 text-muted-foreground text-sm mb-1">
                          <Clock className="w-4 h-4" />
                          Timezone
                        </div>
                        <p className="font-semibold">UTC</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="database" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Database className="w-5 h-5" />
                    Database Tables
                  </CardTitle>
                  <CardDescription>Record counts and storage information per table</CardDescription>
                </CardHeader>
                <CardContent>
                  {systemStats?.tableStats && systemStats.tableStats.length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                      {systemStats.tableStats.map((table) => {
                        const IconComponent = tableIcons[table.name] || Database;
                        const maxCount = Math.max(...(systemStats.tableStats?.map(t => t.count) || [1]));
                        const percentage = maxCount > 0 ? (table.count / maxCount) * 100 : 0;
                        
                        return (
                          <div 
                            key={table.name} 
                            className="p-4 rounded-xl border bg-card transition-all hover:shadow-md hover:border-primary/30"
                            data-testid={`table-stat-${table.name.toLowerCase()}`}
                          >
                            <div className="flex items-start justify-between mb-3">
                              <div className="p-2 rounded-lg bg-primary/10">
                                <IconComponent className="w-4 h-4 text-primary" />
                              </div>
                              <Badge variant="secondary" className="text-xs">
                                {table.count.toLocaleString()}
                              </Badge>
                            </div>
                            <h4 className="font-semibold text-sm mb-1">{table.name}</h4>
                            <div className="space-y-2">
                              <Progress value={percentage} className="h-1.5" />
                              <p className="text-xs text-muted-foreground">
                                {((table.count / totalRecords) * 100).toFixed(1)}% of total
                              </p>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <div className="text-center py-8 text-muted-foreground">
                      <Database className="w-12 h-12 mx-auto mb-4 opacity-20" />
                      <p>No table statistics available</p>
                    </div>
                  )}
                </CardContent>
              </Card>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center gap-4">
                      <div className="p-3 rounded-xl bg-blue-500/10">
                        <HardDriveDownload className="w-6 h-6 text-blue-500" />
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Database Size</p>
                        <p className="text-2xl font-bold">{systemStats?.databaseSize || "Unknown"}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center gap-4">
                      <div className="p-3 rounded-xl bg-green-500/10">
                        <Layers className="w-6 h-6 text-green-500" />
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Total Tables</p>
                        <p className="text-2xl font-bold">{systemStats?.tableStats?.length || 0}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center gap-4">
                      <div className="p-3 rounded-xl bg-purple-500/10">
                        <FileText className="w-6 h-6 text-purple-500" />
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Total Records</p>
                        <p className="text-2xl font-bold">{totalRecords.toLocaleString()}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="server" className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-lg">
                      <Server className="w-5 h-5" />
                      Server Information
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-3">
                      <div className="flex items-center justify-between py-2 border-b">
                        <span className="text-muted-foreground">Platform</span>
                        <span className="font-medium">Linux (NixOS)</span>
                      </div>
                      <div className="flex items-center justify-between py-2 border-b">
                        <span className="text-muted-foreground">Node.js Version</span>
                        <span className="font-medium">v20.19.x</span>
                      </div>
                      <div className="flex items-center justify-between py-2 border-b">
                        <span className="text-muted-foreground">Uptime</span>
                        <span className="font-medium">{systemStats?.serverUptime ? formatUptime(systemStats.serverUptime) : "Unknown"}</span>
                      </div>
                      <div className="flex items-center justify-between py-2 border-b">
                        <span className="text-muted-foreground">Environment</span>
                        <Badge variant="outline">Development</Badge>
                      </div>
                      <div className="flex items-center justify-between py-2">
                        <span className="text-muted-foreground">Last Check</span>
                        <span className="font-medium text-sm">
                          {systemStats?.lastCheck ? format(new Date(systemStats.lastCheck), 'MMM d, yyyy HH:mm:ss') : "Unknown"}
                        </span>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-lg">
                      <Cpu className="w-5 h-5" />
                      Resources
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <span className="flex items-center gap-2">
                          <Cpu className="w-4 h-4 text-blue-500" />
                          CPU Usage
                        </span>
                        <span className="font-medium">~5%</span>
                      </div>
                      <Progress value={5} className="h-2" />
                    </div>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <span className="flex items-center gap-2">
                          <MemoryStick className="w-4 h-4 text-green-500" />
                          Memory Usage
                        </span>
                        <span className="font-medium">~128 MB</span>
                      </div>
                      <Progress value={15} className="h-2" />
                    </div>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <span className="flex items-center gap-2">
                          <HardDrive className="w-4 h-4 text-purple-500" />
                          Disk Usage
                        </span>
                        <span className="font-medium">~{systemStats?.databaseSize || "N/A"}</span>
                      </div>
                      <Progress value={10} className="h-2" />
                    </div>
                  </CardContent>
                </Card>
              </div>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <Activity className="w-5 h-5" />
                    Active Services
                  </CardTitle>
                  <CardDescription>Currently running background services</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    <div className="flex items-center gap-3 p-4 rounded-lg border">
                      <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
                      <div>
                        <p className="font-medium text-sm">Express Server</p>
                        <p className="text-xs text-muted-foreground">Port 5000</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 p-4 rounded-lg border">
                      <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
                      <div>
                        <p className="font-medium text-sm">WebSocket</p>
                        <p className="text-xs text-muted-foreground">Real-time events</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 p-4 rounded-lg border">
                      <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
                      <div>
                        <p className="font-medium text-sm">Cron Scheduler</p>
                        <p className="text-xs text-muted-foreground">Background tasks</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 p-4 rounded-lg border">
                      <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
                      <div>
                        <p className="font-medium text-sm">PostgreSQL</p>
                        <p className="text-xs text-muted-foreground">Database</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        )}
      </div>
    </AdminLayout>
  );
}
