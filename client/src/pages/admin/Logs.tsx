
import { AdminLayout } from "@/layouts/AdminLayout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Download, RefreshCw, Trash2, Filter } from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";
import { useState } from "react";
import { formatDistanceToNow } from "date-fns";

export default function AdminLogs() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [logLevel, setLogLevel] = useState<string>("all");

  const { data: logs = [], isLoading, refetch } = useQuery({
    queryKey: ["/api/logs", logLevel],
    queryFn: () => api.getLogs(logLevel),
  });

  const clearLogsMutation = useMutation({
    mutationFn: () => api.clearActivityLogs(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/logs"] });
      toast({ title: "Success", description: "Logs cleared" });
    },
  });

  const exportLogs = async () => {
    try {
      await api.exportLogs();
      toast({ title: "Success", description: "Logs exported" });
    } catch (error: any) {
      toast({ 
        title: "Error", 
        description: error.message,
        variant: "destructive" 
      });
    }
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-heading font-bold">System Logs</h1>
            <p className="text-muted-foreground">Advanced log management and analysis</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => refetch()}>
              <RefreshCw className="w-4 h-4 mr-2" /> Refresh
            </Button>
            <Button variant="outline" onClick={exportLogs}>
              <Download className="w-4 h-4 mr-2" /> Export
            </Button>
            <Button 
              variant="destructive" 
              onClick={() => clearLogsMutation.mutate()}
            >
              <Trash2 className="w-4 h-4 mr-2" /> Clear All
            </Button>
          </div>
        </div>

        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Activity Logs</CardTitle>
              <div className="flex items-center gap-2">
                <Filter className="w-4 h-4 text-muted-foreground" />
                <Select value={logLevel} onValueChange={setLogLevel}>
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Filter by level" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Levels</SelectItem>
                    <SelectItem value="info">Info</SelectItem>
                    <SelectItem value="warning">Warning</SelectItem>
                    <SelectItem value="error">Error</SelectItem>
                    <SelectItem value="success">Success</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <CardDescription>
              View and filter system activity logs ({logs.length} entries)
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="text-center py-8">Loading logs...</div>
            ) : logs.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                No logs found
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Timestamp</TableHead>
                    <TableHead>User</TableHead>
                    <TableHead>Action</TableHead>
                    <TableHead>Type</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {logs.map((log: any) => (
                    <TableRow key={log.id}>
                      <TableCell className="text-sm">
                        {formatDistanceToNow(new Date(log.createdAt), { 
                          addSuffix: true 
                        })}
                      </TableCell>
                      <TableCell>{log.userName || "System"}</TableCell>
                      <TableCell>{log.action}</TableCell>
                      <TableCell>
                        <Badge 
                          variant={
                            log.type === "success" ? "default" :
                            log.type === "error" ? "destructive" :
                            log.type === "warning" ? "secondary" : "outline"
                          }
                        >
                          {log.type}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
}
