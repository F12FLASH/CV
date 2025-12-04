import { AdminLayout } from "@/layouts/AdminLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  RotateCcw, 
  Clock, 
  ShieldCheck,
  AlertTriangle,
  HardDrive,
  RefreshCw,
  Trash2,
  Activity,
  Users,
  FileText,
  Briefcase,
  MessageSquare,
  Loader2,
  CheckCircle,
  XCircle,
  Info,
  Database
} from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
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
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";
import { formatDistanceToNow } from "date-fns";

function formatUptime(seconds: number): string {
  const days = Math.floor(seconds / 86400);
  const hours = Math.floor((seconds % 86400) / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);

  if (days > 0) {
    return `${days}d ${hours}h ${minutes}m`;
  } else if (hours > 0) {
    return `${hours}h ${minutes}m`;
  } else {
    return `${minutes}m`;
  }
}

function getIconForType(type: string) {
  switch (type) {
    case "success": return <CheckCircle className="w-4 h-4 text-green-500" />;
    case "error": return <XCircle className="w-4 h-4 text-red-500" />;
    case "warning": return <AlertTriangle className="w-4 h-4 text-yellow-500" />;
    default: return <Info className="w-4 h-4 text-blue-500" />;
  }
}

export default function AdminSystem() {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: systemStats, isLoading: statsLoading, refetch: refetchStats } = useQuery({
    queryKey: ["/api/system/stats"],
    queryFn: () => api.getSystemStats(),
    refetchInterval: 30000,
  });

  const { data: activityLogs = [], isLoading: logsLoading, refetch: refetchLogs } = useQuery({
    queryKey: ["/api/system/activity-logs"],
    queryFn: () => api.getSystemActivityLogs(100, 0),
  });

  const clearLogsMutation = useMutation({
    mutationFn: () => api.clearActivityLogs(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/system/activity-logs"] });
      queryClient.invalidateQueries({ queryKey: ["/api/system/stats"] });
      refetchStats();
      refetchLogs();
      toast({ title: "Success", description: "Activity logs cleared" });
    },
    onError: (error: any) => {
      toast({ title: "Error", description: error.message || "Failed to clear logs", variant: "destructive" });
    },
  });

  const resetMutation = useMutation({
    mutationFn: () => api.resetSystem(),
    onSuccess: (data) => {
      refetchStats();
      refetchLogs();
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

  return (
    <AdminLayout>
      <div className="space-y-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-heading font-bold">System & Monitoring</h1>
            <p className="text-muted-foreground">Monitor system health and activity logs</p>
          </div>
          <div className="flex gap-2">
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
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card className={getStatusBgColor(systemStats?.status || "Healthy")}>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                    <ShieldCheck className={`w-4 h-4 ${getStatusColor(systemStats?.status || "Healthy")}`} /> 
                    System Status
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className={`text-2xl font-bold ${getStatusColor(systemStats?.status || "Healthy")}`}>
                    {systemStats?.status || "Checking..."}
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    Last check: {systemStats?.lastCheck ? formatDistanceToNow(new Date(systemStats.lastCheck), { addSuffix: true }) : "Unknown"}
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                    <HardDrive className="w-4 h-4 text-primary" /> Database Size
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{systemStats?.databaseSize || "Unknown"}</div>
                  <p className="text-xs text-muted-foreground mt-1">
                    {systemStats?.tableStats?.reduce((sum, t) => sum + t.count, 0) || 0} total records
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                    <Clock className="w-4 h-4 text-blue-500" /> Server Uptime
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {systemStats?.serverUptime ? formatUptime(systemStats.serverUptime) : "Unknown"}
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">Since last restart</p>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Database className="w-5 h-5" />
                  Database Tables
                </CardTitle>
                <CardDescription>Record counts per table</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
                  {systemStats?.tableStats?.map((table) => (
                    <div 
                      key={table.name} 
                      className="flex items-center gap-3 p-3 rounded-lg bg-muted/50"
                    >
                      <div className="p-2 rounded-md bg-primary/10">
                        {table.name === "Users" && <Users className="w-4 h-4 text-primary" />}
                        {table.name === "Projects" && <Briefcase className="w-4 h-4 text-primary" />}
                        {table.name === "Posts" && <FileText className="w-4 h-4 text-primary" />}
                        {table.name === "Messages" && <MessageSquare className="w-4 h-4 text-primary" />}
                        {!["Users", "Projects", "Posts", "Messages"].includes(table.name) && 
                          <Database className="w-4 h-4 text-primary" />}
                      </div>
                      <div>
                        <p className="font-semibold">{table.count}</p>
                        <p className="text-xs text-muted-foreground">{table.name}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </>
        )}

        <Card>
          <CardHeader>
            <div className="flex items-center justify-between gap-4">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <Activity className="w-5 h-5" />
                  Activity Log
                </CardTitle>
                <CardDescription>Recent system and user activities</CardDescription>
              </div>
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button 
                    variant="outline" 
                    size="sm"
                    className="text-destructive"
                    data-testid="button-clear-logs"
                  >
                    <Trash2 className="w-4 h-4 mr-2" /> Clear Logs
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Clear Activity Logs</AlertDialogTitle>
                    <AlertDialogDescription>
                      This will permanently delete all activity logs. This action cannot be undone.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction 
                      onClick={() => clearLogsMutation.mutate()}
                      className="bg-destructive text-destructive-foreground"
                    >
                      {clearLogsMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : "Clear All"}
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
          </CardHeader>
          <CardContent>
            {logsLoading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="w-6 h-6 animate-spin text-primary" />
              </div>
            ) : activityLogs && activityLogs.length > 0 ? (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Action</TableHead>
                    <TableHead>User</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead className="text-right">Time</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {activityLogs.map((log: any) => (
                    <TableRow key={log.id}>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          {getIconForType(log.type)}
                          <span className="font-medium">{log.action}</span>
                        </div>
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {log.userName || "System"}
                      </TableCell>
                      <TableCell>
                        <Badge 
                          variant={
                            log.type === "success" ? "default" : 
                            log.type === "error" ? "destructive" : 
                            log.type === "warning" ? "secondary" : "outline"
                          }
                          className="text-xs"
                        >
                          {log.type}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right text-muted-foreground text-sm">
                        {log.createdAt ? formatDistanceToNow(new Date(log.createdAt), { addSuffix: true }) : "Unknown"}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <Activity className="w-12 h-12 mx-auto mb-4 opacity-20" />
                <p>No activity logs found</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
}