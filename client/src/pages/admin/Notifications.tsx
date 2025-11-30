
import { AdminLayout } from "@/layouts/AdminLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { useMockData } from "@/context/MockContext";
import { Bell, Mail, MessageSquare, CheckCircle, Trash2, AlertCircle, Search, Filter, Check, X } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { useState } from "react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export default function AdminNotifications() {
  const { messages, markAsRead, deleteMessage } = useMockData();
  const [emailNotif, setEmailNotif] = useState(true);
  const [commentAlerts, setCommentAlerts] = useState(true);
  const [systemUpdates, setSystemUpdates] = useState(true);
  const [newsletterStats, setNewsletterStats] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterType, setFilterType] = useState<string>("all");
  const [filterRead, setFilterRead] = useState<string>("all");

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
        return "bg-blue-500/10 text-blue-500 border-blue-500/20";
      case "message":
        return "bg-green-500/10 text-green-500 border-green-500/20";
      case "email":
        return "bg-purple-500/10 text-purple-500 border-purple-500/20";
      default:
        return "bg-muted text-muted-foreground border-border";
    }
  };

  const unreadCount = messages.filter(m => !m.read).length;

  // Filter messages
  const filteredMessages = messages.filter(msg => {
    const msgType = getMessageType(msg.subject);
    const matchesSearch = searchQuery === "" || 
      msg.sender?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      msg.subject?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      msg.message?.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesType = filterType === "all" || msgType === filterType;
    const matchesRead = filterRead === "all" || 
      (filterRead === "unread" && !msg.read) ||
      (filterRead === "read" && msg.read);

    return matchesSearch && matchesType && matchesRead;
  });

  const handleMarkAllAsRead = () => {
    messages.forEach(msg => {
      if (!msg.read) {
        markAsRead(msg.id);
      }
    });
  };

  const handleDeleteAll = () => {
    if (confirm("Are you sure you want to delete all notifications?")) {
      messages.forEach(msg => deleteMessage(msg.id));
    }
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-heading font-bold">Notifications</h1>
            <p className="text-muted-foreground">
              Manage system and contact form notifications
              {unreadCount > 0 && (
                <span className="ml-2 text-primary font-medium">
                  ({unreadCount} unread)
                </span>
              )}
            </p>
          </div>
          <div className="flex gap-2">
            <Button 
              variant="outline" 
              onClick={handleMarkAllAsRead}
              disabled={unreadCount === 0}
            >
              <Check className="w-4 h-4 mr-2" />
              Mark All as Read
            </Button>
            <Button 
              variant="outline" 
              onClick={handleDeleteAll}
              disabled={messages.length === 0}
              className="text-destructive hover:bg-destructive/10"
            >
              <Trash2 className="w-4 h-4 mr-2" />
              Delete All
            </Button>
          </div>
        </div>

        {/* Filters */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  type="search"
                  placeholder="Search notifications..."
                  className="pl-9"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" className="gap-2">
                    <Filter className="w-4 h-4" />
                    Type: {filterType === "all" ? "All" : filterType}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => setFilterType("all")}>
                    All Types
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setFilterType("message")}>
                    Messages
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setFilterType("comment")}>
                    Comments
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setFilterType("email")}>
                    Email
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setFilterType("system")}>
                    System
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" className="gap-2">
                    <Filter className="w-4 h-4" />
                    Status: {filterRead === "all" ? "All" : filterRead === "unread" ? "Unread" : "Read"}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => setFilterRead("all")}>
                    All
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setFilterRead("unread")}>
                    Unread Only
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setFilterRead("read")}>
                    Read Only
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Notifications List */}
          <div className="lg:col-span-2 space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>All Notifications ({filteredMessages.length})</span>
                  {filteredMessages.length > 0 && (
                    <Badge variant="secondary">
                      {filteredMessages.filter(m => !m.read).length} unread
                    </Badge>
                  )}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 max-h-[600px] overflow-y-auto">
                {filteredMessages.length === 0 ? (
                  <div className="text-center py-12 text-muted-foreground">
                    <Bell className="w-12 h-12 mx-auto mb-3 opacity-50" />
                    <p className="text-lg font-medium">No notifications found</p>
                    <p className="text-sm mt-1">
                      {searchQuery || filterType !== "all" || filterRead !== "all"
                        ? "Try adjusting your filters"
                        : "You're all caught up!"}
                    </p>
                  </div>
                ) : (
                  filteredMessages.map((msg) => {
                    const msgType = getMessageType(msg.subject);
                    return (
                      <div
                        key={msg.id}
                        className={`flex items-start gap-4 p-4 rounded-lg border transition-all ${
                          !msg.read
                            ? "bg-primary/5 border-primary/20 shadow-sm"
                            : "border-border hover:bg-muted/50"
                        }`}
                      >
                        <div className={`p-2.5 rounded-full border ${getTypeColor(msgType)}`}>
                          {getTypeIcon(msgType)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 justify-between mb-1">
                            <div className="flex items-center gap-2">
                              <p className="font-medium text-sm truncate">
                                {msg.sender || "Unknown"}
                              </p>
                              {!msg.read && (
                                <Badge variant="default" className="h-5 px-1.5 text-xs">
                                  New
                                </Badge>
                              )}
                            </div>
                            {msg.createdAt && (
                              <span className="text-xs text-muted-foreground flex-shrink-0">
                                {formatDistanceToNow(new Date(msg.createdAt), {
                                  addSuffix: true,
                                })}
                              </span>
                            )}
                          </div>
                          <p className="text-sm font-medium truncate mb-1">
                            {msg.subject || "No subject"}
                          </p>
                          <p className="text-sm text-muted-foreground line-clamp-2">
                            {msg.message || "No message content"}
                          </p>
                        </div>
                        <div className="flex gap-1 flex-shrink-0">
                          {!msg.read && (
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 text-primary hover:text-primary hover:bg-primary/10"
                              title="Mark as read"
                              onClick={() => markAsRead(msg.id)}
                            >
                              <CheckCircle className="w-4 h-4" />
                            </Button>
                          )}
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10"
                            title="Delete"
                            onClick={() => {
                              if (confirm("Delete this notification?")) {
                                deleteMessage(msg.id);
                              }
                            }}
                          >
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

          {/* Sidebar */}
          <div className="space-y-4">
            {/* Quick Stats */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <AlertCircle className="w-4 h-4" />
                  Quick Stats
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between p-3 rounded-lg bg-primary/5 border border-primary/10">
                  <div>
                    <p className="text-xs text-muted-foreground">Unread Messages</p>
                    <p className="text-2xl font-bold text-primary">{unreadCount}</p>
                  </div>
                  <Bell className="w-8 h-8 text-primary/50" />
                </div>
                <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50 border">
                  <div>
                    <p className="text-xs text-muted-foreground">Total Messages</p>
                    <p className="text-2xl font-bold">{messages.length}</p>
                  </div>
                  <Mail className="w-8 h-8 text-muted-foreground/50" />
                </div>
                <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50 border">
                  <div>
                    <p className="text-xs text-muted-foreground">Read Messages</p>
                    <p className="text-2xl font-bold">
                      {messages.length - unreadCount}
                    </p>
                  </div>
                  <CheckCircle className="w-8 h-8 text-muted-foreground/50" />
                </div>
              </CardContent>
            </Card>

            {/* Notification Settings */}
            <Card>
              <CardHeader>
                <CardTitle>Notification Settings</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-sm">Email Notifications</p>
                    <p className="text-xs text-muted-foreground">
                      Receive notifications via email
                    </p>
                  </div>
                  <Switch checked={emailNotif} onCheckedChange={setEmailNotif} />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-sm">Comment Alerts</p>
                    <p className="text-xs text-muted-foreground">
                      New comments on posts
                    </p>
                  </div>
                  <Switch
                    checked={commentAlerts}
                    onCheckedChange={setCommentAlerts}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-sm">System Updates</p>
                    <p className="text-xs text-muted-foreground">
                      Important system events
                    </p>
                  </div>
                  <Switch
                    checked={systemUpdates}
                    onCheckedChange={setSystemUpdates}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-sm">Newsletter Stats</p>
                    <p className="text-xs text-muted-foreground">
                      Weekly subscriber updates
                    </p>
                  </div>
                  <Switch
                    checked={newsletterStats}
                    onCheckedChange={setNewsletterStats}
                  />
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
