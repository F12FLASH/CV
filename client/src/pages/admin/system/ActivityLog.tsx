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
  Bug,
  Globe,
  Clock,
  AlertCircle,
  CheckCircle,
  XCircle,
  Lock
} from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { formatDistanceToNow, format } from "date-fns";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

type ActivityLog = {
  id: number;
  action: string;
  userId: number | null;
  userName: string | null;
  type: string;
  metadata: any;
  createdAt: string;
};

type SecurityLog = {
  id: number;
  eventType: string;
  action: string | null;
  userId: number | null;
  userName: string | null;
  ipAddress: string | null;
  userAgent: string | null;
  requestPath: string | null;
  blocked: boolean;
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

const getSecurityEventIcon = (eventType: string) => {
  const type = eventType.toLowerCase();
  if (type.includes('login_success')) return <CheckCircle className="w-4 h-4 text-green-500" />;
  if (type.includes('login_failed')) return <XCircle className="w-4 h-4 text-red-500" />;
  if (type.includes('blocked') || type.includes('ip_blocked')) return <Lock className="w-4 h-4 text-red-500" />;
  if (type.includes('bot')) return <Bug className="w-4 h-4 text-yellow-500" />;
  if (type.includes('ddos') || type.includes('injection') || type.includes('xss')) return <AlertTriangle className="w-4 h-4 text-red-500" />;
  if (type.includes('2fa') || type.includes('password')) return <Shield className="w-4 h-4 text-blue-500" />;
  return <Info className="w-4 h-4 text-muted-foreground" />;
};

const getSecurityEventBadge = (eventType: string): "default" | "secondary" | "destructive" | "outline" => {
  const type = eventType.toLowerCase();
  if (type.includes('success')) return 'default';
  if (type.includes('failed') || type.includes('blocked') || type.includes('ddos') || type.includes('injection') || type.includes('xss')) return 'destructive';
  if (type.includes('attempt') || type.includes('warning') || type.includes('bot')) return 'secondary';
  return 'outline';
};

const formatEventType = (eventType: string) => {
  return eventType
    .replace(/_/g, ' ')
    .replace(/\b\w/g, c => c.toUpperCase());
};

export default function AdminActivityLog() {
  const [activeTab, setActiveTab] = useState("activity");
  const [searchQuery, setSearchQuery] = useState("");
  const [filterType, setFilterType] = useState<string>("all");
  const [page, setPage] = useState(1);
  const [securitySearch, setSecuritySearch] = useState("");
  const [securityFilter, setSecurityFilter] = useState("all");
  const [loginSearch, setLoginSearch] = useState("");
  const pageSize = 20;
  const { toast } = useToast();

  const { data: logs = [], isLoading, refetch } = useQuery<ActivityLog[]>({
    queryKey: ['/api/activity-logs'],
  });

  const { data: securityLogs = [], isLoading: isLoadingSecurityLogs, refetch: refetchSecurityLogs } = useQuery<SecurityLog[]>({
    queryKey: ['/api/security/logs'],
  });

  const { data: loginHistory = [], isLoading: isLoadingLoginHistory, refetch: refetchLoginHistory } = useQuery<SecurityLog[]>({
    queryKey: ['/api/security/login-history'],
  });

  const filteredLogs = logs.filter(log => {
    const matchesSearch = searchQuery === "" ||
      log.action.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (log.userName && log.userName.toLowerCase().includes(searchQuery.toLowerCase()));
    
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

  const filteredSecurityLogs = securityLogs.filter(log => {
    const matchesSearch = securitySearch === "" ||
      (log.action && log.action.toLowerCase().includes(securitySearch.toLowerCase())) ||
      log.eventType.toLowerCase().includes(securitySearch.toLowerCase()) ||
      (log.ipAddress && log.ipAddress.toLowerCase().includes(securitySearch.toLowerCase()));
    
    const matchesFilter = securityFilter === "all" || log.eventType.toLowerCase().includes(securityFilter.toLowerCase());
    
    return matchesSearch && matchesFilter;
  });

  const filteredLoginHistory = loginHistory.filter(log => {
    return loginSearch === "" ||
      (log.userName && log.userName.toLowerCase().includes(loginSearch.toLowerCase())) ||
      (log.ipAddress && log.ipAddress.toLowerCase().includes(loginSearch.toLowerCase()));
  });

  const loginSuccessCount = loginHistory.filter(l => l.eventType === 'login_success').length;
  const loginFailedCount = loginHistory.filter(l => l.eventType === 'login_failed').length;
  const blockedCount = securityLogs.filter(l => l.blocked).length;

  const handleExport = (type: 'activity' | 'security' | 'login') => {
    let data: any[];
    let filename: string;
    
    if (type === 'activity') {
      data = filteredLogs;
      filename = `activity-log-${format(new Date(), 'yyyy-MM-dd')}.csv`;
    } else if (type === 'security') {
      data = filteredSecurityLogs;
      filename = `security-log-${format(new Date(), 'yyyy-MM-dd')}.csv`;
    } else {
      data = filteredLoginHistory;
      filename = `login-history-${format(new Date(), 'yyyy-MM-dd')}.csv`;
    }

    const csvContent = type === 'activity' 
      ? [
          ['ID', 'Action', 'User', 'Type', 'Timestamp'].join(','),
          ...data.map((log: any) => [
            log.id,
            `"${log.action}"`,
            log.userName || 'System',
            log.type,
            format(new Date(log.createdAt), 'yyyy-MM-dd HH:mm:ss'),
          ].join(','))
        ].join('\n')
      : [
          ['ID', 'Event', 'User', 'IP Address', 'Status', 'Timestamp'].join(','),
          ...data.map((log: any) => [
            log.id,
            `"${log.eventType}"`,
            log.userName || 'Unknown',
            log.ipAddress || 'N/A',
            log.blocked ? 'Blocked' : 'Allowed',
            format(new Date(log.createdAt), 'yyyy-MM-dd HH:mm:ss'),
          ].join(','))
        ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    window.URL.revokeObjectURL(url);
    
    toast({ title: "Exported", description: `${filename} downloaded` });
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-heading font-bold" data-testid="text-page-title">System Logs</h1>
            <p className="text-muted-foreground">Monitor user activities, login history and security events</p>
          </div>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-3 max-w-lg">
            <TabsTrigger value="activity" className="gap-2" data-testid="tab-activity">
              <Activity className="w-4 h-4" /> Activity
            </TabsTrigger>
            <TabsTrigger value="login" className="gap-2" data-testid="tab-login">
              <LogIn className="w-4 h-4" /> Login
            </TabsTrigger>
            <TabsTrigger value="security" className="gap-2" data-testid="tab-security">
              <Shield className="w-4 h-4" /> Security
            </TabsTrigger>
          </TabsList>

          {/* Activity Logs Tab */}
          <TabsContent value="activity" className="space-y-6 mt-6">
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
                      <p className="text-sm text-muted-foreground">Errors</p>
                      <h3 className="text-2xl font-bold" data-testid="text-error-count">{errorLogs.length}</h3>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 space-y-0">
                <CardTitle>Activity Timeline</CardTitle>
                <div className="flex flex-wrap gap-2 items-center">
                  <div className="relative">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                      type="search"
                      placeholder="Search..."
                      className="pl-9 w-[180px]"
                      value={searchQuery}
                      onChange={(e) => { setSearchQuery(e.target.value); setPage(1); }}
                      data-testid="input-search-activity"
                    />
                  </div>
                  <Select value={filterType} onValueChange={(value) => { setFilterType(value); setPage(1); }}>
                    <SelectTrigger className="w-[120px]" data-testid="select-filter-type">
                      <Filter className="w-4 h-4 mr-2" />
                      <SelectValue placeholder="Type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All</SelectItem>
                      <SelectItem value="info">Info</SelectItem>
                      <SelectItem value="success">Success</SelectItem>
                      <SelectItem value="warning">Warning</SelectItem>
                      <SelectItem value="error">Error</SelectItem>
                    </SelectContent>
                  </Select>
                  <Button variant="outline" size="icon" onClick={() => refetch()} disabled={isLoading} data-testid="button-refresh-activity">
                    <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
                  </Button>
                  <Button variant="outline" size="sm" className="gap-2" onClick={() => handleExport('activity')} disabled={filteredLogs.length === 0} data-testid="button-export-activity">
                    <Download className="w-4 h-4" /> Export
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <div className="space-y-4">
                    {[1, 2, 3, 4, 5].map((i) => (
                      <div key={i} className="animate-pulse flex gap-4 p-3 border rounded-lg">
                        <div className="w-10 h-10 bg-muted rounded-lg" />
                        <div className="flex-1 space-y-2">
                          <div className="h-4 bg-muted rounded w-1/3" />
                          <div className="h-3 bg-muted rounded w-1/2" />
                        </div>
                      </div>
                    ))}
                  </div>
                ) : paginatedLogs.length === 0 ? (
                  <div className="text-center py-12 text-muted-foreground">
                    <Activity className="w-12 h-12 mx-auto mb-3 opacity-50" />
                    <p className="text-lg font-medium">No activity logs found</p>
                    <p className="text-sm mt-1">
                      {searchQuery || filterType !== "all" ? "Try adjusting your filters" : "Activity will appear here"}
                    </p>
                  </div>
                ) : (
                  <ScrollArea className="h-[500px]">
                    <div className="space-y-3">
                      {paginatedLogs.map((log) => (
                        <div 
                          key={log.id} 
                          className={`flex items-start gap-4 p-3 rounded-lg border transition-colors hover:bg-muted/50 ${
                            log.type === 'error' ? 'border-red-500/30 bg-red-500/5' 
                            : log.type === 'warning' ? 'border-yellow-500/30 bg-yellow-500/5'
                            : log.type === 'success' ? 'border-green-500/30 bg-green-500/5'
                            : ''
                          }`}
                          data-testid={`activity-log-${log.id}`}
                        >
                          <div className={`p-2 rounded-lg ${
                            log.type === 'error' ? 'bg-red-500/10 text-red-500' 
                            : log.type === 'warning' ? 'bg-yellow-500/10 text-yellow-500'
                            : log.type === 'success' ? 'bg-green-500/10 text-green-500'
                            : 'bg-primary/10 text-primary'
                          }`}>
                            {getActionIcon(log.action)}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 flex-wrap">
                              <h4 className="font-semibold text-sm">{log.action}</h4>
                              <Badge variant={getTypeBadgeVariant(log.type)} className="text-xs">
                                {getTypeLabel(log.type)}
                              </Badge>
                            </div>
                            {log.metadata && (
                              <p className="text-xs text-muted-foreground mt-1 truncate">
                                {typeof log.metadata === 'object' 
                                  ? (log.metadata.details || log.metadata.description || JSON.stringify(log.metadata))
                                  : log.metadata
                                }
                              </p>
                            )}
                            <div className="flex gap-3 mt-2 text-xs text-muted-foreground">
                              <span className="flex items-center gap-1">
                                <User className="w-3 h-3" />
                                {log.userName || 'System'}
                              </span>
                              <span className="flex items-center gap-1">
                                <Clock className="w-3 h-3" />
                                {formatDistanceToNow(new Date(log.createdAt), { addSuffix: true })}
                              </span>
                            </div>
                          </div>
                          <div className="text-right text-xs text-muted-foreground/70 flex-shrink-0">
                            {format(new Date(log.createdAt), 'MMM d')}
                            <br />
                            {format(new Date(log.createdAt), 'h:mm a')}
                          </div>
                        </div>
                      ))}
                    </div>
                  </ScrollArea>
                )}

                {totalPages > 1 && (
                  <div className="flex items-center justify-between mt-4 pt-4 border-t">
                    <p className="text-sm text-muted-foreground">
                      {((page - 1) * pageSize) + 1} - {Math.min(page * pageSize, filteredLogs.length)} of {filteredLogs.length}
                    </p>
                    <div className="flex items-center gap-2">
                      <Button variant="outline" size="sm" onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}>
                        <ChevronLeft className="w-4 h-4" />
                      </Button>
                      <span className="text-sm px-2">Page {page} / {totalPages}</span>
                      <Button variant="outline" size="sm" onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages}>
                        <ChevronRight className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Login History Tab */}
          <TabsContent value="login" className="space-y-6 mt-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-green-500/10">
                      <CheckCircle className="w-5 h-5 text-green-500" />
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Successful Logins</p>
                      <h3 className="text-2xl font-bold text-green-600" data-testid="text-login-success">{loginSuccessCount}</h3>
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-red-500/10">
                      <XCircle className="w-5 h-5 text-red-500" />
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Failed Attempts</p>
                      <h3 className="text-2xl font-bold text-red-600" data-testid="text-login-failed">{loginFailedCount}</h3>
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-blue-500/10">
                      <Activity className="w-5 h-5 text-blue-500" />
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Total Events</p>
                      <h3 className="text-2xl font-bold" data-testid="text-login-total">{loginHistory.length}</h3>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 space-y-0">
                <div>
                  <CardTitle>Login History</CardTitle>
                  <CardDescription>Track all authentication attempts</CardDescription>
                </div>
                <div className="flex flex-wrap gap-2 items-center">
                  <div className="relative">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                      type="search"
                      placeholder="Search user or IP..."
                      className="pl-9 w-[200px]"
                      value={loginSearch}
                      onChange={(e) => setLoginSearch(e.target.value)}
                      data-testid="input-search-login"
                    />
                  </div>
                  <Button variant="outline" size="icon" onClick={() => refetchLoginHistory()} disabled={isLoadingLoginHistory}>
                    <RefreshCw className={`w-4 h-4 ${isLoadingLoginHistory ? 'animate-spin' : ''}`} />
                  </Button>
                  <Button variant="outline" size="sm" className="gap-2" onClick={() => handleExport('login')}>
                    <Download className="w-4 h-4" /> Export
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                {isLoadingLoginHistory ? (
                  <div className="space-y-2">
                    {[1, 2, 3].map(i => <div key={i} className="h-12 bg-muted rounded animate-pulse" />)}
                  </div>
                ) : filteredLoginHistory.length === 0 ? (
                  <div className="text-center py-12 text-muted-foreground">
                    <LogIn className="w-12 h-12 mx-auto mb-3 opacity-50" />
                    <p className="text-lg font-medium">No login history</p>
                  </div>
                ) : (
                  <div className="rounded-md border">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Status</TableHead>
                          <TableHead>User</TableHead>
                          <TableHead>IP Address</TableHead>
                          <TableHead className="hidden md:table-cell">User Agent</TableHead>
                          <TableHead>Time</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {filteredLoginHistory.slice(0, 50).map((log) => (
                          <TableRow key={log.id}>
                            <TableCell>
                              <div className="flex items-center gap-2">
                                {log.eventType === 'login_success' ? (
                                  <Badge variant="default" className="gap-1 bg-green-600">
                                    <CheckCircle className="w-3 h-3" />
                                    Success
                                  </Badge>
                                ) : (
                                  <Badge variant="destructive" className="gap-1">
                                    <XCircle className="w-3 h-3" />
                                    Failed
                                  </Badge>
                                )}
                              </div>
                            </TableCell>
                            <TableCell className="font-medium">{log.userName || 'Unknown'}</TableCell>
                            <TableCell>
                              <div className="flex items-center gap-1">
                                <Globe className="w-3 h-3 text-muted-foreground" />
                                <code className="text-xs bg-muted px-1 py-0.5 rounded">{log.ipAddress || 'N/A'}</code>
                              </div>
                            </TableCell>
                            <TableCell className="hidden md:table-cell max-w-[200px]">
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <span className="text-xs text-muted-foreground truncate block cursor-help">
                                    {log.userAgent ? log.userAgent.substring(0, 50) + '...' : 'N/A'}
                                  </span>
                                </TooltipTrigger>
                                <TooltipContent className="max-w-sm">
                                  <p className="text-xs">{log.userAgent || 'N/A'}</p>
                                </TooltipContent>
                              </Tooltip>
                            </TableCell>
                            <TableCell>
                              <div className="text-xs">
                                <div>{format(new Date(log.createdAt), 'MMM d, yyyy')}</div>
                                <div className="text-muted-foreground">{format(new Date(log.createdAt), 'h:mm:ss a')}</div>
                              </div>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Security Logs Tab */}
          <TabsContent value="security" className="space-y-6 mt-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-primary/10">
                      <Shield className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Total Events</p>
                      <h3 className="text-2xl font-bold" data-testid="text-security-total">{securityLogs.length}</h3>
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-red-500/10">
                      <Lock className="w-5 h-5 text-red-500" />
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Blocked</p>
                      <h3 className="text-2xl font-bold text-red-600" data-testid="text-blocked-count">{blockedCount}</h3>
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-yellow-500/10">
                      <Bug className="w-5 h-5 text-yellow-500" />
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Bot Attempts</p>
                      <h3 className="text-2xl font-bold" data-testid="text-bot-count">
                        {securityLogs.filter(l => l.eventType.toLowerCase().includes('bot')).length}
                      </h3>
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-orange-500/10">
                      <AlertTriangle className="w-5 h-5 text-orange-500" />
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Threats</p>
                      <h3 className="text-2xl font-bold" data-testid="text-threat-count">
                        {securityLogs.filter(l => 
                          l.eventType.toLowerCase().includes('ddos') || 
                          l.eventType.toLowerCase().includes('injection') ||
                          l.eventType.toLowerCase().includes('xss')
                        ).length}
                      </h3>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 space-y-0">
                <div>
                  <CardTitle>Security Events</CardTitle>
                  <CardDescription>Monitor security threats and blocked attempts</CardDescription>
                </div>
                <div className="flex flex-wrap gap-2 items-center">
                  <div className="relative">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                      type="search"
                      placeholder="Search..."
                      className="pl-9 w-[180px]"
                      value={securitySearch}
                      onChange={(e) => setSecuritySearch(e.target.value)}
                      data-testid="input-search-security"
                    />
                  </div>
                  <Select value={securityFilter} onValueChange={setSecurityFilter}>
                    <SelectTrigger className="w-[140px]">
                      <Filter className="w-4 h-4 mr-2" />
                      <SelectValue placeholder="Filter" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Events</SelectItem>
                      <SelectItem value="login">Login</SelectItem>
                      <SelectItem value="blocked">Blocked</SelectItem>
                      <SelectItem value="bot">Bot</SelectItem>
                      <SelectItem value="ddos">DDoS</SelectItem>
                      <SelectItem value="injection">SQL Injection</SelectItem>
                      <SelectItem value="xss">XSS</SelectItem>
                    </SelectContent>
                  </Select>
                  <Button variant="outline" size="icon" onClick={() => refetchSecurityLogs()} disabled={isLoadingSecurityLogs}>
                    <RefreshCw className={`w-4 h-4 ${isLoadingSecurityLogs ? 'animate-spin' : ''}`} />
                  </Button>
                  <Button variant="outline" size="sm" className="gap-2" onClick={() => handleExport('security')}>
                    <Download className="w-4 h-4" /> Export
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                {isLoadingSecurityLogs ? (
                  <div className="space-y-2">
                    {[1, 2, 3].map(i => <div key={i} className="h-16 bg-muted rounded animate-pulse" />)}
                  </div>
                ) : filteredSecurityLogs.length === 0 ? (
                  <div className="text-center py-12 text-muted-foreground">
                    <Shield className="w-12 h-12 mx-auto mb-3 opacity-50" />
                    <p className="text-lg font-medium">No security events</p>
                    <p className="text-sm mt-1">Your system is secure</p>
                  </div>
                ) : (
                  <ScrollArea className="h-[500px]">
                    <div className="space-y-3">
                      {filteredSecurityLogs.map((log) => (
                        <div 
                          key={log.id}
                          className={`p-4 rounded-lg border transition-colors ${
                            log.blocked ? 'border-red-500/30 bg-red-500/5' : 'hover:bg-muted/50'
                          }`}
                        >
                          <div className="flex items-start justify-between gap-4">
                            <div className="flex items-start gap-3">
                              <div className={`p-2 rounded-lg ${
                                log.blocked ? 'bg-red-500/10' : 
                                log.eventType.includes('success') ? 'bg-green-500/10' : 'bg-muted'
                              }`}>
                                {getSecurityEventIcon(log.eventType)}
                              </div>
                              <div className="space-y-1">
                                <div className="flex items-center gap-2 flex-wrap">
                                  <span className="font-semibold text-sm">{formatEventType(log.eventType)}</span>
                                  <Badge variant={getSecurityEventBadge(log.eventType)} className="text-xs">
                                    {log.blocked ? 'Blocked' : 'Logged'}
                                  </Badge>
                                </div>
                                {log.action && (
                                  <p className="text-sm text-muted-foreground">{log.action}</p>
                                )}
                                <div className="flex flex-wrap gap-3 text-xs text-muted-foreground">
                                  {log.userName && (
                                    <span className="flex items-center gap-1">
                                      <User className="w-3 h-3" />
                                      {log.userName}
                                    </span>
                                  )}
                                  {log.ipAddress && (
                                    <span className="flex items-center gap-1">
                                      <Globe className="w-3 h-3" />
                                      <code className="bg-muted px-1 rounded">{log.ipAddress}</code>
                                    </span>
                                  )}
                                  {log.requestPath && (
                                    <span className="flex items-center gap-1">
                                      <FileText className="w-3 h-3" />
                                      {log.requestPath}
                                    </span>
                                  )}
                                </div>
                              </div>
                            </div>
                            <div className="text-right text-xs text-muted-foreground flex-shrink-0">
                              <div>{format(new Date(log.createdAt), 'MMM d, yyyy')}</div>
                              <div>{format(new Date(log.createdAt), 'h:mm:ss a')}</div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </ScrollArea>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </AdminLayout>
  );
}
