
import { AdminLayout } from "@/layouts/AdminLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { Bell, Mail, MessageSquare, CheckCircle, Trash2, AlertCircle, Search, Filter, Check, Star } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

type NotificationItem = {
  id: string;
  type: 'message' | 'comment' | 'review';
  sender: string;
  content: string;
  subject?: string;
  read: boolean;
  createdAt: Date | null;
  originalId: number;
  rating?: number;
};

export default function AdminNotifications() {
  const { toast } = useToast();
  const [emailNotif, setEmailNotif] = useState(true);
  const [commentAlerts, setCommentAlerts] = useState(true);
  const [systemUpdates, setSystemUpdates] = useState(true);
  const [newsletterStats, setNewsletterStats] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterType, setFilterType] = useState<string>("all");
  const [filterRead, setFilterRead] = useState<string>("all");

  const { data: messages = [], refetch: refetchMessages } = useQuery<any[]>({
    queryKey: ['/api/messages'],
  });

  const { data: comments = [], refetch: refetchComments } = useQuery<any[]>({
    queryKey: ['/api/comments'],
  });

  const { data: reviews = [], refetch: refetchReviews } = useQuery<any[]>({
    queryKey: ['/api/reviews'],
  });

  const markMessageReadMutation = useMutation({
    mutationFn: (id: number) => api.markMessageAsRead(id),
    onSuccess: () => refetchMessages(),
  });

  const markCommentReadMutation = useMutation({
    mutationFn: (id: number) => api.markCommentAsRead(id),
    onSuccess: () => refetchComments(),
  });

  const markReviewReadMutation = useMutation({
    mutationFn: (id: number) => api.markReviewAsRead(id),
    onSuccess: () => refetchReviews(),
  });

  const deleteMessageMutation = useMutation({
    mutationFn: (id: number) => api.deleteMessage(id),
    onSuccess: () => refetchMessages(),
  });

  const deleteCommentMutation = useMutation({
    mutationFn: (id: number) => api.deleteComment(id),
    onSuccess: () => refetchComments(),
  });

  const deleteReviewMutation = useMutation({
    mutationFn: (id: number) => api.deleteReview(id),
    onSuccess: () => refetchReviews(),
  });

  const allNotifications: NotificationItem[] = [
    ...messages.map(m => ({
      id: `msg-${m.id}`,
      type: 'message' as const,
      sender: m.sender || 'Unknown',
      content: m.message || '',
      subject: m.subject || undefined,
      read: m.read,
      createdAt: m.createdAt ? new Date(m.createdAt) : null,
      originalId: m.id,
    })),
    ...comments.map((c: any) => ({
      id: `comment-${c.id}`,
      type: 'comment' as const,
      sender: c.authorName || 'Unknown',
      content: c.content || '',
      subject: 'New comment',
      read: c.read || false,
      createdAt: c.createdAt ? new Date(c.createdAt) : null,
      originalId: c.id,
    })),
    ...reviews.map((r: any) => ({
      id: `review-${r.id}`,
      type: 'review' as const,
      sender: r.authorName || 'Unknown',
      content: r.content || '',
      subject: `${r.rating || 5}-star review`,
      read: r.read || false,
      createdAt: r.createdAt ? new Date(r.createdAt) : null,
      originalId: r.id,
      rating: r.rating,
    })),
  ].sort((a, b) => {
    const dateA = a.createdAt ? a.createdAt.getTime() : 0;
    const dateB = b.createdAt ? b.createdAt.getTime() : 0;
    return dateB - dateA;
  });

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "comment":
        return <MessageSquare className="w-4 h-4" />;
      case "message":
        return <Mail className="w-4 h-4" />;
      case "review":
        return <Star className="w-4 h-4" />;
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
      case "review":
        return "bg-yellow-500/10 text-yellow-500 border-yellow-500/20";
      default:
        return "bg-muted text-muted-foreground border-border";
    }
  };

  const unreadCount = allNotifications.filter(n => !n.read).length;

  const filteredNotifications = allNotifications.filter(notif => {
    const matchesSearch = searchQuery === "" || 
      notif.sender?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      notif.subject?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      notif.content?.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesType = filterType === "all" || notif.type === filterType;
    const matchesRead = filterRead === "all" || 
      (filterRead === "unread" && !notif.read) ||
      (filterRead === "read" && notif.read);

    return matchesSearch && matchesType && matchesRead;
  });

  const handleMarkAllAsRead = async () => {
    try {
      for (const msg of messages) {
        await markMessageReadMutation.mutateAsync(msg.id);
      }
      toast({ title: "Success", description: `Marked all ${messages.length} messages as read` });
    } catch (error) {
      toast({ title: "Error", description: "Failed to mark messages as read", variant: "destructive" });
    }
  };

  const handleDeleteAll = async () => {
    const total = messages.length + comments.length + reviews.length;
    if (total === 0) {
      toast({ title: "Info", description: "No notifications to delete" });
      return;
    }
    
    if (confirm(`Delete all ${total} notifications? (${messages.length} messages, ${comments.length} comments, ${reviews.length} reviews)`)) {
      try {
        for (const msg of messages) {
          await deleteMessageMutation.mutateAsync(msg.id);
        }
        for (const comment of comments) {
          await deleteCommentMutation.mutateAsync(comment.id);
        }
        for (const review of reviews) {
          await deleteReviewMutation.mutateAsync(review.id);
        }
        toast({ title: "Success", description: `Deleted all ${total} notifications` });
      } catch (error) {
        toast({ title: "Error", description: "Failed to delete notifications", variant: "destructive" });
      }
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
              disabled={messages.filter(m => !m.read).length === 0}
              title="Mark all messages as read"
            >
              <Check className="w-4 h-4 mr-2" />
              Mark Messages Read
            </Button>
            <Button 
              variant="outline" 
              onClick={handleDeleteAll}
              disabled={messages.length === 0}
              className="text-destructive hover:bg-destructive/10"
              title="Delete all messages"
            >
              <Trash2 className="w-4 h-4 mr-2" />
              Delete Messages
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
                  <DropdownMenuItem onClick={() => setFilterType("review")}>
                    Reviews
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
                  <span>All Notifications ({filteredNotifications.length})</span>
                  {filteredNotifications.length > 0 && (
                    <Badge variant="secondary">
                      {filteredNotifications.filter(n => !n.read).length} unread
                    </Badge>
                  )}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 max-h-[600px] overflow-y-auto">
                {filteredNotifications.length === 0 ? (
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
                  filteredNotifications.map((notif) => (
                    <div
                      key={notif.id}
                      className={`flex items-start gap-4 p-4 rounded-lg border transition-all ${
                        !notif.read
                          ? "bg-primary/5 border-primary/20 shadow-sm"
                          : "border-border hover:bg-muted/50"
                      }`}
                    >
                      <div className={`p-2.5 rounded-full border ${getTypeColor(notif.type)}`}>
                        {getTypeIcon(notif.type)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 justify-between mb-1">
                          <div className="flex items-center gap-2">
                            <p className="font-medium text-sm truncate">
                              {notif.sender}
                            </p>
                            {!notif.read && (
                              <Badge variant="default" className="h-5 px-1.5 text-xs">
                                New
                              </Badge>
                            )}
                          </div>
                          {notif.createdAt && (
                            <span className="text-xs text-muted-foreground flex-shrink-0">
                              {formatDistanceToNow(notif.createdAt, {
                                addSuffix: true,
                              })}
                            </span>
                          )}
                        </div>
                        <p className="text-sm font-medium truncate mb-1">
                          {notif.subject || "No subject"}
                        </p>
                        <p className="text-sm text-muted-foreground line-clamp-2">
                          {notif.content || "No content"}
                        </p>
                      </div>
                      <div className="flex gap-1 flex-shrink-0">
                        {notif.type === 'message' && !notif.read && (
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-primary hover:text-primary hover:bg-primary/10"
                            title="Mark as read"
                            onClick={() => markMessageReadMutation.mutate(notif.originalId)}
                          >
                            <CheckCircle className="w-4 h-4" />
                          </Button>
                        )}
                        {notif.type === 'comment' && !notif.read && (
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-primary hover:text-primary hover:bg-primary/10"
                            title="Mark as read"
                            onClick={() => markCommentReadMutation.mutate(notif.originalId)}
                          >
                            <CheckCircle className="w-4 h-4" />
                          </Button>
                        )}
                        {notif.type === 'review' && !notif.read && (
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-primary hover:text-primary hover:bg-primary/10"
                            title="Mark as read"
                            onClick={() => markReviewReadMutation.mutate(notif.originalId)}
                          >
                            <CheckCircle className="w-4 h-4" />
                          </Button>
                        )}
                        {notif.type === 'message' && (
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10"
                            title="Delete"
                            onClick={() => {
                              if (confirm("Delete this notification?")) {
                                deleteMessageMutation.mutate(notif.originalId);
                              }
                            }}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        )}
                        {notif.type === 'comment' && (
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10"
                            title="Delete"
                            onClick={() => {
                              if (confirm("Delete this comment?")) {
                                deleteCommentMutation.mutate(notif.originalId);
                              }
                            }}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        )}
                        {notif.type === 'review' && (
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10"
                            title="Delete"
                            onClick={() => {
                              if (confirm("Delete this review?")) {
                                deleteReviewMutation.mutate(notif.originalId);
                              }
                            }}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        )}
                      </div>
                    </div>
                  ))
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
                    <p className="text-xs text-muted-foreground">Unread Total</p>
                    <p className="text-2xl font-bold text-primary">{unreadCount}</p>
                  </div>
                  <Bell className="w-8 h-8 text-primary/50" />
                </div>
                <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50 border">
                  <div>
                    <p className="text-xs text-muted-foreground">Messages</p>
                    <p className="text-2xl font-bold">{messages.length}</p>
                  </div>
                  <Mail className="w-8 h-8 text-muted-foreground/50" />
                </div>
                <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50 border">
                  <div>
                    <p className="text-xs text-muted-foreground">Comments</p>
                    <p className="text-2xl font-bold">{comments.length}</p>
                  </div>
                  <MessageSquare className="w-8 h-8 text-muted-foreground/50" />
                </div>
                <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50 border">
                  <div>
                    <p className="text-xs text-muted-foreground">Reviews</p>
                    <p className="text-2xl font-bold">{reviews.length}</p>
                  </div>
                  <Star className="w-8 h-8 text-muted-foreground/50" />
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
