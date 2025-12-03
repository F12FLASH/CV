import { AdminLayout } from "@/layouts/AdminLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Filter, 
  Download, 
  Calendar, 
  User, 
  Activity, 
  AlertTriangle,
  Search,
  RefreshCw,
  ChevronLeft,
  ChevronRight,
  FileText,
  Settings,
  MessageSquare,
  LogIn,
  LogOut,
  Trash2,
  Edit,
  Plus,
  Eye,
  Shield,
  Info,
  Bug
} from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { formatDistanceToNow, format } from "date-fns";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { api } from "@/lib/api";

type ActivityLog = {
  id: number;
  action: string;
  userId: number | null;
  userName: string | null;
  type: string;
  metadata: any;
  createdAt: string;
};

const getActionIcon = (action: string) => {
  const lowerAction = action.toLowerCase();
  if (lowerAction.includes('login')) return <LogIn className="w-4 h-4" />;
  if (lowerAction.includes('logout')) return <LogOut className="w-4 h-4" />;
  if (lowerAction.includes('delete')) return <Trash2 className="w-4 h-4" />;
  if (lowerAction.includes('update') || lowerAction.includes('edit')) return <Edit className="w-4 h-4" />;
  if (lowerAction.includes('create') || lowerAction.includes('add') || lowerAction.includes('publish')) return <Plus className="w-4 h-4" />;
  if (lowerAction.includes('view')) return <Eye className="w-4 h-4" />;
  if (lowerAction.includes('comment')) return <MessageSquare className="w-4 h-4" />;
  if (lowerAction.includes('setting')) return <Settings className="w-4 h-4" />;
  if (lowerAction.includes('security') || lowerAction.includes('password')) return <Shield className="w-4 h-4" />;
  return <FileText className="w-4 h-4" />;
};

const getTypeBadgeVariant = (type: string): "default" | "secondary" | "destructive" | "outline" => {
  switch (type) {
    case 'error': return 'destructive';
    case 'warning': return 'secondary';
    case 'success': return 'default';
    default: return 'outline';
  }
};

const getTypeLabel = (type: string) => {
  switch (type) {
    case 'error': return 'Error';
    case 'warning': return 'Warning';
    case 'success': return 'Success';
    case 'info': return 'Info';
    default: return type;
  }
};

type SystemLog = {
  id: number;
  eventType: string;
  action: string | null;
  userId: number | null;
  userName: string | null;
  ipAddress: string | null;
  userAgent: string | null;
  requestPath: string | null;
  requestBody: string | null;
  blocked: boolean;
  createdAt: string;
};

export default function AdminActivityLog() {
  const [activeTab, setActiveTab] = useState("activity");
  const [searchQuery, setSearchQuery] = useState("");
  const [filterType, setFilterType] = useState<string>("all");
  const [page, setPage] = useState(1);
  const [systemLogSearch, setSystemLogSearch] = useState("");
  const [systemLogLevel, setSystemLogLevel] = useState("all");
  const pageSize = 20;
  const { toast } = useToast();

  const { data: logs = [], isLoading, refetch, error } = useQuery<ActivityLog[]>({
    queryKey: ['/api/system/activity-logs'],
    queryFn: async () => {
      const res = await fetch(`/api/system/activity-logs?limit=1000&offset=0`, { credentials: 'include' });
      if (!res.ok) {
        const errorText = await res.text();
        console.error('Failed to fetch activity logs:', errorText);
        throw new Error('Failed to fetch activity logs');
      }
      const data = await res.json();
      console.log('Activity logs loaded:', data.length);
      return data;
    },
    retry: 2,
    refetchOnWindowFocus: false,
  });

  const { data: systemLogs = [], isLoading: isLoadingSystemLogs, refetch: refetchSystemLogs } = useQuery<SystemLog[]>({
    queryKey: ['/api/system/logs'],
    queryFn: async () => {
      const res = await fetch('/api/system/logs?limit=1000', { credentials: 'include' });
      if (!res.ok) throw new Error('Failed to fetch system logs');
      return res.json();
    },
  });

  const filteredLogs = logs.filter(log => {
    const matchesSearch = searchQuery === "" ||
      log.action.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (log.userName && log.userName.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (log.metadata && JSON.stringify(log.metadata).toLowerCase().includes(searchQuery.toLowerCase()));
    
    const matchesType = filterType === "all" || log.type === filterType;
    
    return matchesSearch && matchesType;
  });

  const paginatedLogs = filteredLogs.slice((page - 1) * pageSize, page * pageSize);
  const totalPages = Math.ceil(filteredLogs.length / pageSize);

  const todayLogs = logs.filter(log => {
    const logDate = new Date(log.createdAt);
    const today = new Date();
    return logDate.toDateString() === today.toDateString();
  });

  const errorLogs = logs.filter(log => log.type === 'error');
  const uniqueUsers = new Set(logs.map(log => log.userName).filter(Boolean));

  const filteredSystemLogs = systemLogs.filter(log => {
    const matchesSearch = systemLogSearch === "" ||
      (log.action && log.action.toLowerCase().includes(systemLogSearch.toLowerCase())) ||
      log.eventType.toLowerCase().includes(systemLogSearch.toLowerCase()) ||
      (log.ipAddress && log.ipAddress.toLowerCase().includes(systemLogSearch.toLowerCase()));
    
    const matchesLevel = systemLogLevel === "all" || log.eventType === systemLogLevel;
    
    return matchesSearch && matchesLevel;
  });

  const getSystemLogIcon = (eventType: string) => {
    const type = eventType.toLowerCase();
    if (type.includes('error') || type.includes('failed') || type.includes('blocked')) return <AlertTriangle className="w-4 h-4" />;
    if (type.includes('warning') || type.includes('attempt')) return <AlertTriangle className="w-4 h-4" />;
    if (type.includes('debug')) return <Bug className="w-4 h-4" />;
    if (type.includes('login') || type.includes('auth')) return <Shield className="w-4 h-4" />;
    return <Info className="w-4 h-4" />;
  };

  const getSystemLogBadge = (eventType: string): "default" | "secondary" | "destructive" | "outline" => {
    const type = eventType.toLowerCase();
    if (type.includes('error') || type.includes('failed') || type.includes('blocked')) return 'destructive';
    if (type.includes('warning') || type.includes('attempt')) return 'secondary';
    if (type.includes('success')) return 'default';
    return 'outline';
  };

  const getSystemLogColor = (eventType: string) => {
    const type = eventType.toLowerCase();
    if (type.includes('error') || type.includes('failed') || type.includes('blocked')) return 'red';
    if (type.includes('warning') || type.includes('attempt')) return 'yellow';
    if (type.includes('success')) return 'green';
    return 'blue';
  };

  const handleClearLogs = async () => {
    if (!confirm('Are you sure you want to clear all system logs? This action cannot be undone.')) return;
    try {
      await api.clearSystemLogs();
      toast({ title: "Success", description: "System logs cleared successfully" });
      refetchSystemLogs();
    } catch (error) {
      toast({ title: "Error", description: "Failed to clear system logs", variant: "destructive" });
    }
  };

  const handleExport = () => {
    const csvContent = [
      ['ID', 'Action', 'User', 'Type', 'Timestamp', 'Details'].join(','),
      ...filteredLogs.map(log => [
        log.id,
        `"${log.action}"`,
        log.userName || 'System',
        log.type,
        format(new Date(log.createdAt), 'yyyy-MM-dd HH:mm:ss'),
        `"${log.metadata ? JSON.stringify(log.metadata).replace(/"/g, '""') : ''}"`
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `activity-log-${format(new Date(), 'yyyy-MM-dd')}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-heading font-bold" data-testid="text-page-title">Activity & System Logs</h1>
            <p className="text-muted-foreground">Monitor user activities and system events</p>
          </div>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2 max-w-md">
            <TabsTrigger value="activity" className="gap-2" data-testid="tab-activity">
              <Activity className="w-4 h-4" /> Activity Logs
            </TabsTrigger>
            <TabsTrigger value="system" className="gap-2" data-testid="tab-system">
              <FileText className="w-4 h-4" /> System Logs
            </TabsTrigger>
          </TabsList>

          <TabsContent value="activity" className="space-y-6 mt-6">
            <div className="flex justify-end gap-2">
              <Button 
                variant="outline" 
                size="icon"
                onClick={() => refetch()}
                disabled={isLoading}
                data-testid="button-refresh"
              >
                <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
              </Button>
              <Button 
                variant="outline" 
                className="gap-2"
                onClick={handleExport}
                disabled={filteredLogs.length === 0}
                data-testid="button-export"
              >
                <Download className="w-4 h-4" /> Export Log
              </Button>
            </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-primary/10">
                  <Activity className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Total Activities</p>
                  <h3 className="text-2xl font-bold" data-testid="text-total-activities">{logs.length}</h3>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-blue-500/10">
                  <Calendar className="w-5 h-5 text-blue-500" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Today</p>
                  <h3 className="text-2xl font-bold" data-testid="text-today-activities">{todayLogs.length}</h3>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-green-500/10">
                  <User className="w-5 h-5 text-green-500" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Active Users</p>
                  <h3 className="text-2xl font-bold" data-testid="text-active-users">{uniqueUsers.size}</h3>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-red-500/10">
                  <AlertTriangle className="w-5 h-5 text-red-500" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Failed Actions</p>
                  <h3 className="text-2xl font-bold" data-testid="text-failed-actions">{errorLogs.length}</h3>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 space-y-0">
            <CardTitle>Activity Timeline</CardTitle>
            <div className="flex flex-wrap gap-2">
              <div className="relative">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  type="search"
                  placeholder="Search activities..."
                  className="pl-9 w-[200px]"
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    setPage(1);
                  }}
                  data-testid="input-search"
                />
              </div>
              <Select value={filterType} onValueChange={(value) => { setFilterType(value); setPage(1); }}>
                <SelectTrigger className="w-[130px]" data-testid="select-filter-type">
                  <Filter className="w-4 h-4 mr-2" />
                  <SelectValue placeholder="Filter" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="info">Info</SelectItem>
                  <SelectItem value="success">Success</SelectItem>
                  <SelectItem value="warning">Warning</SelectItem>
                  <SelectItem value="error">Error</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="space-y-4">
                {[1, 2, 3, 4, 5].map((i) => (
                  <div key={i} className="animate-pulse border-l-4 border-l-muted pl-4 pb-4">
                    <div className="h-4 bg-muted rounded w-1/3 mb-2" />
                    <div className="h-3 bg-muted rounded w-1/2 mb-2" />
                    <div className="h-3 bg-muted rounded w-1/4" />
                  </div>
                ))}
              </div>
            ) : paginatedLogs.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                <Activity className="w-12 h-12 mx-auto mb-3 opacity-50" />
                <p className="text-lg font-medium">No activity logs found</p>
                <p className="text-sm mt-1">
                  {searchQuery || filterType !== "all" 
                    ? "Try adjusting your filters" 
                    : "Activity will appear here as actions are performed"}
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {paginatedLogs.map((log) => (
                  <div 
                    key={log.id} 
                    className={`border-l-4 pl-4 pb-4 last:pb-0 transition-colors ${
                      log.type === 'error' 
                        ? 'border-l-red-500/70' 
                        : log.type === 'warning'
                        ? 'border-l-yellow-500/70'
                        : log.type === 'success'
                        ? 'border-l-green-500/70'
                        : 'border-l-primary/50'
                    }`}
                    data-testid={`activity-log-${log.id}`}
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1 flex-wrap">
                          <div className={`p-1.5 rounded ${
                            log.type === 'error' 
                              ? 'bg-red-500/10 text-red-500' 
                              : log.type === 'warning'
                              ? 'bg-yellow-500/10 text-yellow-500'
                              : log.type === 'success'
                              ? 'bg-green-500/10 text-green-500'
                              : 'bg-primary/10 text-primary'
                          }`}>
                            {getActionIcon(log.action)}
                          </div>
                          <h4 className="font-bold">{log.action}</h4>
                          <Badge variant={getTypeBadgeVariant(log.type)}>
                            {getTypeLabel(log.type)}
                          </Badge>
                        </div>
                        {log.metadata && (
                          <p className="text-sm text-muted-foreground mb-1">
                            {typeof log.metadata === 'object' 
                              ? (log.metadata.details || log.metadata.description || JSON.stringify(log.metadata))
                              : log.metadata
                            }
                          </p>
                        )}
                        <div className="flex gap-4 mt-2 text-xs text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <User className="w-3 h-3" />
                            {log.userName || 'System'}
                          </span>
                          {log.metadata?.ip && (
                            <span>IP: {log.metadata.ip}</span>
                          )}
                        </div>
                      </div>
                      <div className="text-right flex-shrink-0">
                        <span className="text-xs text-muted-foreground whitespace-nowrap block">
                          {formatDistanceToNow(new Date(log.createdAt), { addSuffix: true })}
                        </span>
                        <span className="text-xs text-muted-foreground/70 whitespace-nowrap block mt-0.5">
                          {format(new Date(log.createdAt), 'MMM d, h:mm a')}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {totalPages > 1 && (
              <div className="flex items-center justify-between mt-6 pt-4 border-t">
                <p className="text-sm text-muted-foreground">
                  Showing {((page - 1) * pageSize) + 1} to {Math.min(page * pageSize, filteredLogs.length)} of {filteredLogs.length} entries
                </p>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setPage(p => Math.max(1, p - 1))}
                    disabled={page === 1}
                    data-testid="button-prev-page"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </Button>
                  <span className="text-sm px-2">
                    Page {page} of {totalPages}
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                    disabled={page === totalPages}
                    data-testid="button-next-page"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
          </TabsContent>

          <TabsContent value="system" className="space-y-6 mt-6">
            <div className="flex justify-end gap-2">
              <Button 
                variant="outline" 
                size="icon"
                onClick={() => refetchSystemLogs()}
                disabled={isLoadingSystemLogs}
                data-testid="button-refresh-system"
              >
                <RefreshCw className={`w-4 h-4 ${isLoadingSystemLogs ? 'animate-spin' : ''}`} />
              </Button>
              <Button 
                variant="destructive" 
                className="gap-2"
                onClick={handleClearLogs}
                data-testid="button-clear-logs"
              >
                <Trash2 className="w-4 h-4" /> Clear Logs
              </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-primary/10">
                      <FileText className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Total Logs</p>
                      <h3 className="text-2xl font-bold" data-testid="text-total-system-logs">{systemLogs.length}</h3>
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-red-500/10">
                      <AlertTriangle className="w-5 h-5 text-red-500" />
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Blocked</p>
                      <h3 className="text-2xl font-bold" data-testid="text-error-logs">{systemLogs.filter(l => l.blocked).length}</h3>
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-yellow-500/10">
                      <AlertTriangle className="w-5 h-5 text-yellow-500" />
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Attempts</p>
                      <h3 className="text-2xl font-bold" data-testid="text-warning-logs">{systemLogs.filter(l => l.eventType.toLowerCase().includes('attempt')).length}</h3>
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-green-500/10">
                      <Shield className="w-5 h-5 text-green-500" />
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Auth Events</p>
                      <h3 className="text-2xl font-bold" data-testid="text-info-logs">{systemLogs.filter(l => l.eventType.toLowerCase().includes('login')).length}</h3>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 space-y-0">
                <CardTitle>System Logs</CardTitle>
                <div className="flex flex-wrap gap-2">
                  <div className="relative">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                      type="search"
                      placeholder="Search logs..."
                      className="pl-9 w-[200px]"
                      value={systemLogSearch}
                      onChange={(e) => setSystemLogSearch(e.target.value)}
                      data-testid="input-search-system"
                    />
                  </div>
                  <Select value={systemLogLevel} onValueChange={setSystemLogLevel}>
                    <SelectTrigger className="w-[130px]" data-testid="select-filter-system-level">
                      <Filter className="w-4 h-4 mr-2" />
                      <SelectValue placeholder="Filter" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Levels</SelectItem>
                      <SelectItem value="info">Info</SelectItem>
                      <SelectItem value="warning">Warning</SelectItem>
                      <SelectItem value="error">Error</SelectItem>
                      <SelectItem value="debug">Debug</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardHeader>
              <CardContent>
                {isLoadingSystemLogs ? (
                  <div className="space-y-4">
                    {[1, 2, 3, 4, 5].map((i) => (
                      <div key={i} className="animate-pulse border-l-4 border-l-muted pl-4 pb-4">
                        <div className="h-4 bg-muted rounded w-1/3 mb-2" />
                        <div className="h-3 bg-muted rounded w-1/2 mb-2" />
                        <div className="h-3 bg-muted rounded w-1/4" />
                      </div>
                    ))}
                  </div>
                ) : filteredSystemLogs.length === 0 ? (
                  <div className="text-center py-12 text-muted-foreground">
                    <FileText className="w-12 h-12 mx-auto mb-3 opacity-50" />
                    <p className="text-lg font-medium">No system logs found</p>
                    <p className="text-sm mt-1">
                      {systemLogSearch || systemLogLevel !== "all" 
                        ? "Try adjusting your filters" 
                        : "System logs will appear here"}
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4 max-h-[600px] overflow-y-auto">
                    {filteredSystemLogs.map((log) => {
                      const color = getSystemLogColor(log.eventType);
                      return (
                        <div 
                          key={log.id} 
                          className={`border-l-4 pl-4 pb-4 last:pb-0 transition-colors ${
                            color === 'red' 
                              ? 'border-l-red-500/70' 
                              : color === 'yellow'
                              ? 'border-l-yellow-500/70'
                              : color === 'green'
                              ? 'border-l-green-500/70'
                              : 'border-l-blue-500/70'
                          }`}
                          data-testid={`system-log-${log.id}`}
                        >
                          <div className="flex items-start justify-between gap-4">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-1 flex-wrap">
                                <div className={`p-1.5 rounded ${
                                  color === 'red' 
                                    ? 'bg-red-500/10 text-red-500' 
                                    : color === 'yellow'
                                    ? 'bg-yellow-500/10 text-yellow-500'
                                    : color === 'green'
                                    ? 'bg-green-500/10 text-green-500'
                                    : 'bg-blue-500/10 text-blue-500'
                                }`}>
                                  {getSystemLogIcon(log.eventType)}
                                </div>
                                <Badge variant={getSystemLogBadge(log.eventType)}>
                                  {log.eventType.replace(/_/g, ' ').toUpperCase()}
                                </Badge>
                                {log.blocked && (
                                  <Badge variant="destructive">Blocked</Badge>
                                )}
                                {log.ipAddress && (
                                  <span className="text-xs text-muted-foreground">
                                    IP: {log.ipAddress}
                                  </span>
                                )}
                              </div>
                              <p className="text-sm">{log.action || 'No details'}</p>
                              {(log.userName || log.requestPath) && (
                                <div className="flex gap-4 mt-2 text-xs text-muted-foreground">
                                  {log.userName && (
                                    <span className="flex items-center gap-1">
                                      <User className="w-3 h-3" />
                                      {log.userName}
                                    </span>
                                  )}
                                  {log.requestPath && (
                                    <span>Path: {log.requestPath}</span>
                                  )}
                                </div>
                              )}
                            </div>
                            <div className="text-right flex-shrink-0">
                              <span className="text-xs text-muted-foreground whitespace-nowrap block">
                                {formatDistanceToNow(new Date(log.createdAt), { addSuffix: true })}
                              </span>
                              <span className="text-xs text-muted-foreground/70 whitespace-nowrap block mt-0.5">
                                {format(new Date(log.createdAt), 'MMM d, h:mm a')}
                              </span>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </AdminLayout>
  );
}
