import { AdminLayout } from "@/layouts/AdminLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
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
  Shield
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

export default function AdminActivityLog() {
  const [searchQuery, setSearchQuery] = useState("");
  const [filterType, setFilterType] = useState<string>("all");
  const [page, setPage] = useState(1);
  const pageSize = 20;

  const { data: logs = [], isLoading, refetch } = useQuery<ActivityLog[]>({
    queryKey: ['/api/system/activity-logs'],
    queryFn: async () => {
      const res = await fetch(`/api/system/activity-logs?limit=1000&offset=0`, { credentials: 'include' });
      if (!res.ok) throw new Error('Failed to fetch activity logs');
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
            <h1 className="text-3xl font-heading font-bold" data-testid="text-page-title">Activity Log</h1>
            <p className="text-muted-foreground">Detailed record of all system activities</p>
          </div>
          <div className="flex gap-2">
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
      </div>
    </AdminLayout>
  );
}
