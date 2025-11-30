import { AdminLayout } from "@/layouts/AdminLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Filter, Download, Calendar, User, Activity, AlertTriangle } from "lucide-react";

export default function AdminActivityLog() {
  const logs = [
    { id: 1, action: "Published Post", details: "'Getting Started with React 19'", user: "Loi Developer", ip: "192.168.1.1", timestamp: "Mar 20, 2:30 PM", type: "success" },
    { id: 2, action: "Updated Project", details: "E-commerce Platform", user: "Loi Developer", ip: "192.168.1.1", timestamp: "Mar 20, 1:45 PM", type: "info" },
    { id: 3, action: "Deleted Comment", details: "Spam content", user: "Admin", ip: "192.168.1.50", timestamp: "Mar 20, 12:15 PM", type: "warning" },
    { id: 4, action: "Failed Login", details: "Invalid credentials", user: "Unknown", ip: "203.0.113.45", timestamp: "Mar 20, 11:00 AM", type: "error" },
  ];

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-heading font-bold">Activity Log</h1>
            <p className="text-muted-foreground">Detailed record of all system activities</p>
          </div>
          <Button variant="outline" className="gap-2">
            <Download className="w-4 h-4" /> Export Log
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {[
            { label: "Total Activities", value: "1,234", icon: Activity },
            { label: "Today", value: "42", icon: Calendar },
            { label: "Active Users", value: "18", icon: User },
            { label: "Failed Actions", value: "3", icon: AlertTriangle },
          ].map((stat, i) => (
            <Card key={i}>
              <CardContent className="p-4">
                <p className="text-sm text-muted-foreground">{stat.label}</p>
                <h3 className="text-2xl font-bold mt-1">{stat.value}</h3>
              </CardContent>
            </Card>
          ))}
        </div>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Activity Timeline</CardTitle>
            <Button variant="outline" size="sm" className="gap-2">
              <Filter className="w-4 h-4" /> Filters
            </Button>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {logs.map((log) => (
                <div key={log.id} className="border-l-4 border-l-primary/50 pl-4 pb-4 last:pb-0">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="font-bold">{log.action}</h4>
                        <Badge variant={log.type === "error" ? "destructive" : log.type === "warning" ? "secondary" : "default"}>
                          {log.type}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">{log.details}</p>
                      <div className="flex gap-4 mt-2 text-xs text-muted-foreground">
                        <span>User: {log.user}</span>
                        <span>IP: {log.ip}</span>
                      </div>
                    </div>
                    <span className="text-xs text-muted-foreground whitespace-nowrap">{log.timestamp}</span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
}
