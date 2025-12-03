import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { api } from "@/lib/api";
import { 
  Database, HardDrive, Download, Upload, Trash2, 
  RefreshCw, CheckCircle, AlertCircle 
} from "lucide-react";

interface DatabaseStatus {
  status: string;
  uptime: string;
  tables: Record<string, number>;
  totalRecords: number;
  databaseSize: string;
}

interface BackupFile {
  filename: string;
  size: number;
  sizeFormatted: string;
  created: string;
  modified: string;
}

export function DatabaseTab() {
  const { toast } = useToast();
  const [status, setStatus] = useState<DatabaseStatus | null>(null);
  const [backups, setBackups] = useState<BackupFile[]>([]);
  const [loading, setLoading] = useState(true);
  const [creatingBackup, setCreatingBackup] = useState(false);

  const loadData = async () => {
    setLoading(true);
    try {
      const [statusData, backupsData] = await Promise.all([
        api.getDatabaseStatus(),
        api.getBackups()
      ]);
      setStatus(statusData);
      setBackups(backupsData);
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
  }, []);

  const handleCreateBackup = async () => {
    setCreatingBackup(true);
    try {
      const result = await api.createBackup();
      toast({
        title: "Backup Created",
        description: `${result.filename} (${result.sizeFormatted}) - ${result.recordCount} records`
      });
      loadData();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setCreatingBackup(false);
    }
  };

  const handleDownloadBackup = async (filename: string) => {
    try {
      await api.downloadBackup(filename);
      toast({
        title: "Success",
        description: "Backup download started"
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive"
      });
    }
  };

  const handleDeleteBackup = async (filename: string) => {
    if (!confirm(`Delete backup "${filename}"?`)) return;
    
    try {
      await api.deleteBackup(filename);
      toast({
        title: "Success",
        description: "Backup deleted successfully"
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

  const handleRestoreBackup = async () => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = ".json";
    input.onchange = async (e: any) => {
      const file = e.target.files[0];
      if (file) {
        try {
          const result = await api.restoreBackup(file);
          toast({
            title: result.success ? "Success" : "Info",
            description: result.message
          });
        } catch (error: any) {
          toast({
            title: "Error",
            description: error.message,
            variant: "destructive"
          });
        }
      }
    };
    input.click();
  };

  const handleClearCache = async () => {
    try {
      await api.clearCache();
      toast({
        title: "Success",
        description: "Cache cleared successfully"
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive"
      });
    }
  };

  if (loading && !status) {
    return (
      <div className="flex items-center justify-center p-8">
        <RefreshCw className="w-6 h-6 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <HardDrive className="w-5 h-5" /> Database Status
          </CardTitle>
          <CardDescription>Monitor your database health</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {status && (
            <>
              <div className="grid grid-cols-4 gap-4">
                <div className="p-4 border rounded-lg text-center">
                  <p className="text-xs text-muted-foreground">Status</p>
                  <p className={`text-lg font-bold flex items-center justify-center gap-1 ${status.status === "Connected" ? "text-green-500" : "text-red-500"}`}>
                    {status.status === "Connected" ? <CheckCircle className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
                    {status.status}
                  </p>
                </div>
                <div className="p-4 border rounded-lg text-center">
                  <p className="text-xs text-muted-foreground">Total Records</p>
                  <p className="text-lg font-bold">{status.totalRecords}</p>
                </div>
                <div className="p-4 border rounded-lg text-center">
                  <p className="text-xs text-muted-foreground">Tables</p>
                  <p className="text-lg font-bold">{Object.keys(status.tables).length}</p>
                </div>
                <div className="p-4 border rounded-lg text-center">
                  <p className="text-xs text-muted-foreground">Uptime</p>
                  <p className="text-lg font-bold text-green-500">{status.uptime}</p>
                </div>
              </div>

              <div className="p-4 bg-muted rounded-lg">
                <h4 className="font-medium text-sm mb-3">Table Statistics</h4>
                <div className="grid grid-cols-5 gap-2">
                  {Object.entries(status.tables).map(([table, count]) => (
                    <div key={table} className="text-center p-2 bg-background rounded">
                      <p className="text-xs text-muted-foreground capitalize">{table}</p>
                      <p className="text-sm font-bold">{count}</p>
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Download className="w-5 h-5" /> Backup & Restore
            </CardTitle>
            <Button variant="outline" size="sm" onClick={loadData} data-testid="button-refresh-backups">
              <RefreshCw className="w-4 h-4 mr-1" /> Refresh
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-2">
            <Button 
              variant="default" 
              className="w-full"
              onClick={handleCreateBackup}
              disabled={creatingBackup}
              data-testid="button-create-backup"
            >
              {creatingBackup ? (
                <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <Download className="w-4 h-4 mr-2" />
              )}
              Create Backup
            </Button>
            <Button 
              variant="outline" 
              className="w-full"
              onClick={handleRestoreBackup}
              data-testid="button-restore-backup"
            >
              <Upload className="w-4 h-4 mr-2" /> Restore from Backup
            </Button>
          </div>

          <div className="space-y-2">
            <h4 className="font-medium text-sm">Available Backups</h4>
            {backups.length === 0 ? (
              <p className="text-center text-muted-foreground py-4">No backups found</p>
            ) : (
              <div className="max-h-64 overflow-y-auto space-y-2">
                {backups.map((backup, i) => (
                  <div
                    key={i}
                    className="flex items-center justify-between p-3 border rounded-lg"
                    data-testid={`backup-item-${i}`}
                  >
                    <div>
                      <p className="text-sm font-mono">{backup.filename}</p>
                      <p className="text-xs text-muted-foreground">
                        {backup.sizeFormatted} &bull; {new Date(backup.created).toLocaleString()}
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={() => handleDownloadBackup(backup.filename)}
                        data-testid={`button-download-backup-${i}`}
                      >
                        <Download className="w-4 h-4" />
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="text-destructive"
                        onClick={() => handleDeleteBackup(backup.filename)}
                        data-testid={`button-delete-backup-${i}`}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <RefreshCw className="w-5 h-5" /> Maintenance
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <Button 
            variant="outline" 
            className="w-full justify-start"
            onClick={handleClearCache}
            data-testid="button-clear-cache"
          >
            <Trash2 className="w-4 h-4 mr-2" /> Clear Cache
          </Button>
          <Button 
            variant="outline" 
            className="w-full justify-start"
            onClick={loadData}
            data-testid="button-refresh-status"
          >
            <Database className="w-4 h-4 mr-2" /> Refresh Status
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}