import { AdminLayout } from "@/layouts/AdminLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Database, 
  RotateCcw, 
  Download, 
  Clock, 
  ShieldCheck,
  AlertTriangle,
  HardDrive,
  RefreshCw
} from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export default function AdminSystem() {
  return (
    <AdminLayout>
      <div className="space-y-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-heading font-bold">System & Backup</h1>
            <p className="text-muted-foreground">Manage database backups and system health</p>
          </div>
          <div className="flex gap-2">
             <Button variant="outline" className="gap-2 text-destructive border-destructive/50 hover:bg-destructive/10">
                <RotateCcw className="w-4 h-4" /> Reset System
             </Button>
             <Button className="bg-primary gap-2">
                <Database className="w-4 h-4" /> Create Backup Now
             </Button>
          </div>
        </div>

        {/* System Status */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
           <Card className="bg-green-500/5 border-green-500/20">
              <CardHeader className="pb-2">
                 <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4 text-green-500" /> System Status
                 </CardTitle>
              </CardHeader>
              <CardContent>
                 <div className="text-2xl font-bold text-green-500">Healthy</div>
                 <p className="text-xs text-muted-foreground mt-1">Last check: 2 mins ago</p>
              </CardContent>
           </Card>
           <Card>
              <CardHeader className="pb-2">
                 <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                    <HardDrive className="w-4 h-4 text-primary" /> Database Size
                 </CardTitle>
              </CardHeader>
              <CardContent>
                 <div className="text-2xl font-bold">45.2 MB</div>
                 <div className="w-full bg-muted rounded-full h-1.5 mt-2 overflow-hidden">
                    <div className="bg-primary h-full rounded-full" style={{ width: '15%' }} />
                 </div>
                 <p className="text-xs text-muted-foreground mt-1">15% of 500MB limit</p>
              </CardContent>
           </Card>
           <Card>
              <CardHeader className="pb-2">
                 <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                    <Clock className="w-4 h-4 text-blue-500" /> Next Auto-Backup
                 </CardTitle>
              </CardHeader>
              <CardContent>
                 <div className="text-2xl font-bold">02:00 AM</div>
                 <p className="text-xs text-muted-foreground mt-1">Scheduled Daily</p>
              </CardContent>
           </Card>
        </div>

        {/* Backups List */}
        <Card>
           <CardHeader>
              <CardTitle>Backup Points</CardTitle>
              <CardDescription>List of available restore points</CardDescription>
           </CardHeader>
           <CardContent>
              <Table>
                 <TableHeader>
                    <TableRow>
                       <TableHead>Backup Name</TableHead>
                       <TableHead>Type</TableHead>
                       <TableHead>Size</TableHead>
                       <TableHead>Date Created</TableHead>
                       <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                 </TableHeader>
                 <TableBody>
                    {[
                       { name: "daily_backup_2024_03_20", type: "Auto", size: "45.1 MB", date: "Mar 20, 2024 - 02:00 AM" },
                       { name: "manual_pre_update", type: "Manual", size: "44.8 MB", date: "Mar 19, 2024 - 14:30 PM" },
                       { name: "daily_backup_2024_03_19", type: "Auto", size: "44.5 MB", date: "Mar 19, 2024 - 02:00 AM" },
                       { name: "daily_backup_2024_03_18", type: "Auto", size: "44.2 MB", date: "Mar 18, 2024 - 02:00 AM" },
                    ].map((backup, i) => (
                       <TableRow key={i}>
                          <TableCell className="font-mono text-sm">{backup.name}</TableCell>
                          <TableCell>
                             <Badge variant={backup.type === 'Auto' ? 'secondary' : 'default'}>
                                {backup.type}
                             </Badge>
                          </TableCell>
                          <TableCell>{backup.size}</TableCell>
                          <TableCell>{backup.date}</TableCell>
                          <TableCell className="text-right">
                             <div className="flex justify-end gap-2">
                                <Button variant="outline" size="sm" className="gap-1">
                                   <Download className="w-3 h-3" /> Download
                                </Button>
                                <Button variant="default" size="sm" className="gap-1">
                                   <RefreshCw className="w-3 h-3" /> Restore
                                </Button>
                             </div>
                          </TableCell>
                       </TableRow>
                    ))}
                 </TableBody>
              </Table>
           </CardContent>
        </Card>

        {/* Audit Log */}
        <Card>
           <CardHeader>
              <CardTitle>Audit Log</CardTitle>
              <CardDescription>Detailed record of system activities</CardDescription>
           </CardHeader>
           <CardContent>
              <div className="space-y-4">
                 {[
                    { action: "System Backup Created", user: "System", ip: "127.0.0.1", time: "2 hours ago", icon: Database },
                    { action: "Failed Login Attempt", user: "Unknown", ip: "192.168.1.42", time: "5 hours ago", icon: AlertTriangle, color: "text-red-500" },
                    { action: "Plugin 'SEO Pro' Updated", user: "Admin", ip: "10.0.0.5", time: "1 day ago", icon: RefreshCw },
                 ].map((log, i) => (
                    <div key={i} className="flex items-center justify-between border-b last:border-0 pb-4 last:pb-0">
                       <div className="flex items-center gap-4">
                          <div className={`p-2 rounded-full bg-muted ${log.color || ''}`}>
                             <log.icon className="w-4 h-4" />
                          </div>
                          <div>
                             <p className="font-medium">{log.action}</p>
                             <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                <span>User: {log.user}</span>
                                <span>•</span>
                                <span>IP: {log.ip}</span>
                             </div>
                          </div>
                       </div>
                       <span className="text-xs text-muted-foreground">{log.time}</span>
                    </div>
                 ))}
              </div>
           </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
}