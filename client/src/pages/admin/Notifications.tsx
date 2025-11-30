
import { AdminLayout } from "@/layouts/AdminLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Bell, Mail, MessageSquare, CheckCircle, Trash2 } from "lucide-react";

export default function AdminNotifications() {
  const notifications = [
    { id: 1, type: "comment", message: "New comment on 'React 19 Features'", time: "5 min ago", read: false },
    { id: 2, type: "message", message: "New contact form submission", time: "1 hour ago", read: false },
    { id: 3, type: "system", message: "Database backup completed", time: "2 hours ago", read: true },
    { id: 4, type: "email", message: "12 new newsletter subscribers", time: "5 hours ago", read: true },
  ];

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-heading font-bold">Notifications</h1>
            <p className="text-muted-foreground">Manage system and user notifications</p>
          </div>
          <Button variant="outline">Mark All as Read</Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Recent Notifications</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {notifications.map((notif) => (
                  <div key={notif.id} className={`flex items-start gap-4 p-3 rounded-lg border ${!notif.read ? 'bg-primary/5 border-primary/20' : 'border-border'}`}>
                    <div className={`p-2 rounded-full ${
                      notif.type === 'comment' ? 'bg-blue-500/10 text-blue-500' :
                      notif.type === 'message' ? 'bg-green-500/10 text-green-500' :
                      notif.type === 'email' ? 'bg-purple-500/10 text-purple-500' :
                      'bg-muted text-muted-foreground'
                    }`}>
                      {notif.type === 'comment' ? <MessageSquare className="w-4 h-4" /> :
                       notif.type === 'message' ? <Mail className="w-4 h-4" /> :
                       notif.type === 'email' ? <Mail className="w-4 h-4" /> :
                       <Bell className="w-4 h-4" />}
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-sm">{notif.message}</p>
                      <p className="text-xs text-muted-foreground mt-1">{notif.time}</p>
                    </div>
                    <div className="flex gap-2">
                      {!notif.read && (
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <CheckCircle className="w-4 h-4" />
                        </Button>
                      )}
                      <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive">
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>

          <div className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Notification Settings</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-sm">Email Notifications</p>
                    <p className="text-xs text-muted-foreground">Receive notifications via email</p>
                  </div>
                  <Switch defaultChecked />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-sm">Comment Alerts</p>
                    <p className="text-xs text-muted-foreground">New comments on posts</p>
                  </div>
                  <Switch defaultChecked />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-sm">System Updates</p>
                    <p className="text-xs text-muted-foreground">Important system events</p>
                  </div>
                  <Switch defaultChecked />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-sm">Newsletter Stats</p>
                    <p className="text-xs text-muted-foreground">Weekly subscriber updates</p>
                  </div>
                  <Switch />
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
