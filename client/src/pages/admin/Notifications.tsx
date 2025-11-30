import { AdminLayout } from "@/layouts/AdminLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { useMockData } from "@/context/MockContext";
import { Bell, Mail, MessageSquare, CheckCircle, Trash2, AlertCircle } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { useState } from "react";

export default function AdminNotifications() {
  const { messages } = useMockData();
  const [emailNotif, setEmailNotif] = useState(true);
  const [commentAlerts, setCommentAlerts] = useState(true);
  const [systemUpdates, setSystemUpdates] = useState(true);
  const [newsletterStats, setNewsletterStats] = useState(false);

  const getMessageType = (subject: string | null): string => {
    if (!subject) return "system";
    const subjectLower = subject.toLowerCase();
    if (subjectLower.includes("comment")) return "comment";
    if (subjectLower.includes("contact") || subjectLower.includes("message")) return "message";
    if (subjectLower.includes("newsletter") || subjectLower.includes("subscriber")) return "email";
    return "system";
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "comment":
        return <MessageSquare className="w-4 h-4" />;
      case "message":
        return <Mail className="w-4 h-4" />;
      case "email":
        return <Mail className="w-4 h-4" />;
      default:
        return <Bell className="w-4 h-4" />;
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case "comment":
        return "bg-blue-500/10 text-blue-500";
      case "message":
        return "bg-green-500/10 text-green-500";
      case "email":
        return "bg-purple-500/10 text-purple-500";
      default:
        return "bg-muted text-muted-foreground";
    }
  };

  const unreadCount = messages.filter(m => !m.read).length;

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-heading font-bold">Notifications</h1>
            <p className="text-muted-foreground">
              Manage system and contact form notifications
              {unreadCount > 0 && <span className="ml-2 text-primary font-medium">({unreadCount} unread)</span>}
            </p>
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
                {messages.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <Bell className="w-8 h-8 mx-auto mb-2 opacity-50" />
                    <p>No notifications yet</p>
                  </div>
                ) : (
                  messages.map((msg) => {
                    const msgType = getMessageType(msg.subject);
                    return (
                      <div 
                        key={msg.id} 
                        className={`flex items-start gap-4 p-3 rounded-lg border ${!msg.read ? 'bg-primary/5 border-primary/20' : 'border-border'}`}
                      >
                        <div className={`p-2 rounded-full ${getTypeColor(msgType)}`}>
                          {getTypeIcon(msgType)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 justify-between">
                            <p className="font-medium text-sm truncate">{msg.sender || 'Unknown'}</p>
                            {msg.createdAt && (
                              <span className="text-xs text-muted-foreground flex-shrink-0">
                                {formatDistanceToNow(new Date(msg.createdAt), { addSuffix: true })}
                              </span>
                            )}
                          </div>
                          <p className="text-sm font-medium truncate mt-1">
                            {msg.subject || 'No subject'}
                          </p>
                          <p className="text-xs text-muted-foreground truncate mt-1">
                            {msg.message}
                          </p>
                        </div>
                        <div className="flex gap-2 flex-shrink-0">
                          {!msg.read && (
                            <Button variant="ghost" size="icon" className="h-8 w-8" title="Mark as read">
                              <CheckCircle className="w-4 h-4" />
                            </Button>
                          )}
                          <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" title="Delete">
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    );
                  })
                )}
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
                  <Switch checked={emailNotif} onCheckedChange={setEmailNotif} />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-sm">Comment Alerts</p>
                    <p className="text-xs text-muted-foreground">New comments on posts</p>
                  </div>
                  <Switch checked={commentAlerts} onCheckedChange={setCommentAlerts} />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-sm">System Updates</p>
                    <p className="text-xs text-muted-foreground">Important system events</p>
                  </div>
                  <Switch checked={systemUpdates} onCheckedChange={setSystemUpdates} />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-sm">Newsletter Stats</p>
                    <p className="text-xs text-muted-foreground">Weekly subscriber updates</p>
                  </div>
                  <Switch checked={newsletterStats} onCheckedChange={setNewsletterStats} />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <AlertCircle className="w-4 h-4" />
                  Quick Stats
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <p className="text-xs text-muted-foreground">Unread Messages</p>
                  <p className="text-2xl font-bold text-primary">{unreadCount}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Total Messages</p>
                  <p className="text-2xl font-bold">{messages.length}</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
