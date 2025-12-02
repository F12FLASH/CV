import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { api } from "@/lib/api";
import { 
  FileText, Download, Trash2, RefreshCw, 
  AlertCircle, Info, AlertTriangle, Bug
} from "lucide-react";

interface LogEntry {
  id?: number;
  action?: string;
  message?: string;
  type?: string;
  level?: string;
  timestamp?: string;
  createdAt?: string;
  source?: string;
  userName?: string;
  details?: any;
}

interface LogFile {
  filename: string;
  size: number;
  sizeFormatted: string;
  modified: string;
  date: string;
}

export function LoggingTab() {
  const { toast } = useToast();
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [logFiles, setLogFiles] = useState<LogFile[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedLevel, setSelectedLevel] = useState<string>("all");
  const [selectedSource, setSelectedSource] = useState<string>("all");

  const loadData = async () => {
    setLoading(true);
    try {
      const [logsData, filesData] = await Promise.all([
        api.getLogs(selectedLevel === "all" ? undefined : selectedLevel, 100, selectedSource === "all" ? undefined : selectedSource),
        api.getLogFiles()
      ]);
      setLogs(logsData);
      setLogFiles(filesData);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [selectedLevel, selectedSource]);

  const handleExportLogs = async () => {
    try {
      await api.exportLogs(selectedSource === "all" ? undefined : selectedSource);
      toast({
        title: "Success",
        description: "Logs exported successfully"
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive"
      });
    }
  };

  const handleClearLogs = async () => {
    if (!confirm("Delete all log files? This action cannot be undone.")) return;
    
    try {
      await api.clearAllLogs();
      toast({
        title: "Success",
        description: "All log files cleared"
      });
      loadData();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive"
      });
    }
  };

  const handleDeleteLogFile = async (filename: string) => {
    if (!confirm(`Delete log file "${filename}"?`)) return;
    
    try {
      await api.deleteLogFile(filename);
      toast({
        title: "Success",
        description: "Log file deleted"
      });
      loadData();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive"
      });
    }
  };

  const getLogIcon = (type: string) => {
    switch (type?.toLowerCase()) {
      case "error": return <AlertCircle className="w-4 h-4 text-red-500" />;
      case "warning": return <AlertTriangle className="w-4 h-4 text-yellow-500" />;
      case "debug": return <Bug className="w-4 h-4 text-purple-500" />;
      default: return <Info className="w-4 h-4 text-blue-500" />;
    }
  };

  const getLogBadgeVariant = (type: string): "default" | "secondary" | "destructive" | "outline" => {
    switch (type?.toLowerCase()) {
      case "error": return "destructive";
      case "warning": return "outline";
      default: return "secondary";
    }
  };

  if (loading && logs.length === 0) {
    return (
      <div className="flex items-center justify-center p-8">
        <RefreshCw className="w-6 h-6 animate-spin" />
      </div>
    );
  }

  const totalLogSize = logFiles.reduce((sum, file) => sum + file.size, 0);
  const formatSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / 1024 / 1024).toFixed(2)} MB`;
  };

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <FileText className="w-5 h-5" /> Log Management
              </CardTitle>
              <CardDescription>
                View and manage application logs
              </CardDescription>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={loadData} data-testid="button-refresh-logs">
                <RefreshCw className="w-4 h-4 mr-1" /> Refresh
              </Button>
              <Button variant="outline" size="sm" onClick={handleExportLogs} data-testid="button-export-logs">
                <Download className="w-4 h-4 mr-1" /> Export
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-4 flex-wrap">
            <div className="flex gap-2 items-center">
              <span className="text-sm text-muted-foreground">Level:</span>
              {["all", "info", "warning", "error", "debug"].map(level => (
                <Button
                  key={level}
                  variant={selectedLevel === level ? "default" : "outline"}
                  size="sm"
                  onClick={() => setSelectedLevel(level)}
                  data-testid={`button-filter-${level}`}
                >
                  {level.charAt(0).toUpperCase() + level.slice(1)}
                </Button>
              ))}
            </div>
            <div className="flex gap-2 items-center">
              <span className="text-sm text-muted-foreground">Source:</span>
              {["all", "database", "file"].map(source => (
                <Button
                  key={source}
                  variant={selectedSource === source ? "default" : "outline"}
                  size="sm"
                  onClick={() => setSelectedSource(source)}
                  data-testid={`button-source-${source}`}
                >
                  {source.charAt(0).toUpperCase() + source.slice(1)}
                </Button>
              ))}
            </div>
          </div>

          <div className="space-y-2 max-h-96 overflow-y-auto">
            {logs.length === 0 ? (
              <p className="text-center text-muted-foreground py-8">No logs found</p>
            ) : (
              logs.map((log, i) => (
                <div
                  key={i}
                  className="flex items-start gap-3 p-3 border rounded-lg"
                  data-testid={`log-entry-${i}`}
                >
                  {getLogIcon(log.type || log.level || "info")}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <Badge variant={getLogBadgeVariant(log.type || log.level || "info")} className="text-xs">
                        {(log.type || log.level || "info").toUpperCase()}
                      </Badge>
                      {log.source && (
                        <Badge variant="outline" className="text-xs">
                          {log.source}
                        </Badge>
                      )}
                      {log.userName && (
                        <span className="text-xs text-muted-foreground">by {log.userName}</span>
                      )}
                    </div>
                    <p className="text-sm mt-1">{log.action || log.message || "No message"}</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {new Date(log.timestamp || log.createdAt || "").toLocaleString()}
                    </p>
                  </div>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Log Files</CardTitle>
            <Button 
              variant="outline" 
              size="sm" 
              className="text-destructive"
              onClick={handleClearLogs}
              data-testid="button-clear-all-logs"
            >
              <Trash2 className="w-4 h-4 mr-1" /> Clear All
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="p-4 bg-muted rounded-lg">
            <div className="flex justify-between text-sm mb-2">
              <span>Total Log Size</span>
              <span className="font-medium">{formatSize(totalLogSize)}</span>
            </div>
            <p className="text-xs text-muted-foreground">
              {logFiles.length} log file(s)
            </p>
          </div>

          <div className="space-y-2 max-h-48 overflow-y-auto">
            {logFiles.length === 0 ? (
              <p className="text-center text-muted-foreground py-4">No log files</p>
            ) : (
              logFiles.map((file, i) => (
                <div
                  key={i}
                  className="flex items-center justify-between p-3 border rounded-lg"
                  data-testid={`log-file-${i}`}
                >
                  <div className="flex items-center gap-3">
                    <FileText className="w-4 h-4 text-muted-foreground" />
                    <div>
                      <p className="text-sm font-mono">{file.filename}</p>
                      <p className="text-xs text-muted-foreground">
                        {file.sizeFormatted} &bull; {file.date}
                      </p>
                    </div>
                  </div>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="text-destructive"
                    onClick={() => handleDeleteLogFile(file.filename)}
                    data-testid={`button-delete-logfile-${i}`}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}