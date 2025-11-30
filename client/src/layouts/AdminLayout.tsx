import { useState, useEffect } from "react";
import { Link, useLocation } from "wouter";
import { useMockData } from "@/context/MockContext";
import { useTheme } from "next-themes";
import { useWebSocket } from "@/hooks/use-websocket";
import { useQuery, useMutation } from "@tanstack/react-query";
import { api } from "@/lib/api";
import type { Comment, Review } from "@shared/schema";
import { 
  LayoutDashboard, 
  FileText, 
  Briefcase, 
  Mail, 
  Settings, 
  Image as ImageIcon, 
  BarChart, 
  Menu, 
  LogOut, 
  Bell,
  Search,
  Code,
  Shield,
  MessageSquare,
  HelpCircle,
  ShoppingBag,
  Wrench,
  Palette,
  Share2,
  Database,
  Layers,
  Key,
  Clock,
  Download,
  Moon,
  Sun,
  Inbox,
  Code2,
  Check,
  X,
  ChevronDown,
  Folder
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuLabel, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { formatDistanceToNow } from "date-fns";

// Define AdminLayoutProps type
interface AdminLayoutProps {
  children: React.ReactNode;
}

export function AdminLayout({ children }: AdminLayoutProps) {
  const [location, setLocation] = useLocation();
  const [isChecking, setIsChecking] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [expandedMenus, setExpandedMenus] = useState<string[]>([]);
  const { messages, markAsRead, logout } = useMockData();
  const { theme, setTheme } = useTheme();

  const { isConnected } = useWebSocket();

  const { data: comments = [], refetch: refetchComments } = useQuery<Comment[]>({
    queryKey: ['/api/comments'],
    enabled: isAuthenticated,
  });

  const { data: reviews = [], refetch: refetchReviews } = useQuery<Review[]>({
    queryKey: ['/api/reviews'],
    enabled: isAuthenticated,
  });

  const { data: apiMessages = [], refetch: refetchMessages } = useQuery<any[]>({
    queryKey: ['/api/messages'],
    enabled: isAuthenticated,
  });

  const markMessageAsReadMutation = useMutation({
    mutationFn: async (id: number) => {
      const res = await fetch(`/api/messages/${id}/read`, {
        method: 'PUT',
        credentials: 'include'
      });
      if (!res.ok) throw new Error('Failed to mark as read');
      return res.json();
    },
    onSuccess: () => refetchMessages(),
  });

  const markCommentAsReadMutation = useMutation({
    mutationFn: async (id: number) => {
      const res = await fetch(`/api/comments/${id}/read`, {
        method: 'PUT',
        credentials: 'include'
      });
      if (!res.ok) throw new Error('Failed to mark as read');
      return res.json();
    },
    onSuccess: () => refetchComments(),
  });

  const markReviewAsReadMutation = useMutation({
    mutationFn: async (id: number) => {
      const res = await fetch(`/api/reviews/${id}/read`, {
        method: 'PUT',
        credentials: 'include'
      });
      if (!res.ok) throw new Error('Failed to mark as read');
      return res.json();
    },
    onSuccess: () => refetchReviews(),
  });

  // Auto-refetch all items when WebSocket connects to get real-time updates
  useEffect(() => {
    if (isConnected && isAuthenticated) {
      refetchMessages();
      refetchComments();
      refetchReviews();
    }
  }, [isConnected, isAuthenticated, refetchMessages, refetchComments, refetchReviews]);

  const unreadMessages = (apiMessages || []).filter(m => !m.read).length;
  const unreadComments = comments.filter(c => !c.read).length;
  const unreadReviews = reviews.filter(r => !r.read).length;
  const unreadCount = unreadMessages + unreadComments + unreadReviews;

  type NotificationItem = {
    id: string;
    type: 'message' | 'comment' | 'review';
    sender: string;
    content: string;
    label: string;
    read: boolean;
    createdAt: Date | null;
    originalId: number;
    extra?: string;
  };

  const allNotifications: NotificationItem[] = [
    ...(apiMessages || []).map(m => ({
      id: `msg-${m.id}`,
      type: 'message' as const,
      sender: m.sender || 'Unknown',
      content: m.message || 'No content',
      label: 'Message',
      read: m.read,
      createdAt: m.createdAt ? new Date(m.createdAt) : null,
      originalId: m.id,
    })),
    ...comments.map(c => ({
      id: `comment-${c.id}`,
      type: 'comment' as const,
      sender: c.authorName,
      content: c.content,
      label: 'New comment',
      read: c.read,
      createdAt: c.createdAt ? new Date(c.createdAt) : null,
      originalId: c.id,
    })),
    ...reviews.map(r => ({
      id: `review-${r.id}`,
      type: 'review' as const,
      sender: r.authorName,
      content: r.content,
      label: `${r.rating}-star review`,
      read: r.read,
      createdAt: r.createdAt ? new Date(r.createdAt) : null,
      originalId: r.id,
    })),
  ].sort((a, b) => {
    const dateA = a.createdAt ? a.createdAt.getTime() : 0;
    const dateB = b.createdAt ? b.createdAt.getTime() : 0;
    return dateB - dateA;
  });

  const unreadNotifications = allNotifications.filter(n => !n.read);

  const { data: currentUser } = useQuery({
    queryKey: ["currentUser"],
    queryFn: api.getCurrentUser,
    staleTime: Infinity,
    enabled: isAuthenticated, // Only fetch when authenticated
  });

  // Check authentication on mount
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const res = await fetch("/api/auth/me", {
          credentials: "include"
        });
        
        if (res.ok) {
          setIsAuthenticated(true);
        } else {
          // Redirect to login on any auth failure
          setLocation("/admin/login");
          return;
        }
      } catch (error) {
        // On network errors, redirect to login
        console.error("Auth check network error:", error);
        setLocation("/admin/login");
        return;
      } finally {
        setIsChecking(false);
      }
    };
    
    checkAuth();
  }, [setLocation]);

  const handleLogout = async () => {
    try {
      await fetch("/api/auth/logout", {
        method: "POST",
        credentials: "include"
      });
    } catch (error) {
      console.error("Logout error:", error);
    }
    logout();
    setLocation("/admin/login");
  };

  if (isChecking) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  const toggleMenu = (id: string) => {
    setExpandedMenus(prev => 
      prev.includes(id) ? prev.filter(m => m !== id) : [...prev, id]
    );
  };

  const navItems: any[] = [
    { id: "dashboard", icon: LayoutDashboard, label: "Dashboard", href: "/admin" },
    { 
      id: "posts",
      icon: FileText, 
      label: "Posts", 
      children: [
        { icon: FileText, label: "Posts", href: "/admin/posts" },
        { icon: Folder, label: "Categories", href: "/admin/posts/categories" },
      ]
    },
    { 
      id: "projects",
      icon: Briefcase, 
      label: "Projects", 
      children: [
        { icon: Briefcase, label: "Projects", href: "/admin/projects" },
        { icon: Folder, label: "Categories", href: "/admin/projects/categories" },
      ]
    },
    { icon: ShoppingBag, label: "Services", href: "/admin/services" },
    { icon: MessageSquare, label: "Comments", href: "/admin/comments" },
    { icon: Code, label: "Skills", href: "/admin/skills" },
    { icon: Mail, label: "Newsletter", href: "/admin/newsletter" },
    { icon: Inbox, label: "Inbox", href: "/admin/inbox" },
    { icon: Palette, label: "Theme", href: "/admin/theme" },
    { icon: Share2, label: "Social", href: "/admin/social" },
    { icon: Database, label: "System", href: "/admin/system" },
    { icon: ImageIcon, label: "Media", href: "/admin/media" },
    { icon: Layers, label: "File Manager", href: "/admin/files" },
    { icon: Clock, label: "Activity", href: "/admin/activity" },
    { icon: Key, label: "API Keys", href: "/admin/api-keys" },
    { icon: Download, label: "Export/Import", href: "/admin/export-import" },
    { icon: Code2, label: "Code Editor", href: "/admin/editor" },
    { icon: BarChart, label: "Analytics", href: "/admin/analytics" },
    { icon: Shield, label: "Security", href: "/admin/security" },
    { icon: Settings, label: "Settings", href: "/admin/settings" },
  ];

  return (
    <div className="min-h-screen bg-background flex">
      {/* Sidebar */}
      <aside 
        className={`fixed inset-y-0 left-0 z-50 bg-card border-r border-border transition-all duration-300 ${
          sidebarOpen ? "w-64" : "w-20"
        } lg:relative hidden md:flex flex-col`}
      >
        <div className="h-16 flex items-center justify-center border-b border-border">
          <Link href="/" className="flex items-center gap-2 font-heading font-bold text-xl text-primary cursor-pointer">
            {sidebarOpen ? "LoiAdmin" : "LA"}
          </Link>
        </div>

        <div className="flex-1 overflow-y-auto py-4">
          <nav className="px-2 space-y-1">
            {navItems.map((item) => (
              <div key={item.id || item.href}>
                {item.children ? (
                  <div>
                    <button
                      onClick={() => toggleMenu(item.id)}
                      className={`w-full flex items-center gap-3 px-3 py-2 rounded-md transition-colors ${
                        expandedMenus.includes(item.id)
                          ? "bg-primary/10 text-primary"
                          : "text-muted-foreground hover:bg-muted hover:text-foreground"
                      }`}
                      data-testid={`button-menu-${item.id}`}
                    >
                      <item.icon size={20} />
                      {sidebarOpen && (
                        <>
                          <span className="flex-1">{item.label}</span>
                          <ChevronDown 
                            size={16} 
                            className={`transition-transform ${expandedMenus.includes(item.id) ? "rotate-180" : ""}`}
                          />
                        </>
                      )}
                    </button>
                    {expandedMenus.includes(item.id) && sidebarOpen && (
                      <div className="ml-2 mt-1 space-y-1">
                        {item.children.map((child: any) => (
                          <Link key={child.href} href={child.href}>
                            <div
                              className={`flex items-center gap-3 px-3 py-2 rounded-md transition-colors cursor-pointer text-sm ${
                                location === child.href
                                  ? "bg-primary/10 text-primary"
                                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
                              }`}
                              data-testid={`menu-item-${child.href}`}
                            >
                              <child.icon size={16} />
                              <span>{child.label}</span>
                            </div>
                          </Link>
                        ))}
                      </div>
                    )}
                  </div>
                ) : (
                  <Link href={item.href}>
                    <div 
                      className={`flex items-center gap-3 px-3 py-2 rounded-md transition-colors cursor-pointer ${
                        location === item.href 
                          ? "bg-primary/10 text-primary" 
                          : "text-muted-foreground hover:bg-muted hover:text-foreground"
                      }`}
                      data-testid={`menu-item-${item.href}`}
                    >
                      <item.icon size={20} />
                      {sidebarOpen && <span>{item.label}</span>}
                    </div>
                  </Link>
                )}
              </div>
            ))}
          </nav>
        </div>

        <div className="p-4 border-t border-border">
          <Button variant="ghost" className="w-full justify-start text-red-500 hover:text-red-600 hover:bg-red-500/10" onClick={handleLogout}>
            <LogOut size={20} className="mr-2" />
            {sidebarOpen && "Logout"}
          </Button>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Header */}
        <header className="h-16 bg-card border-b border-border flex items-center justify-between px-4 lg:px-8">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={() => setSidebarOpen(!sidebarOpen)} className="hidden md:flex">
              <Menu size={20} />
            </Button>
            <div className="relative hidden sm:block w-64">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input 
                type="search" 
                placeholder="Search..." 
                className="pl-9 bg-background/50 border-border focus:border-primary"
              />
            </div>
          </div>

          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={() => setTheme(theme === "dark" ? "light" : "dark")}>
              {theme === "dark" ? <Sun size={20} /> : <Moon size={20} />}
            </Button>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="relative"
                >
                  <Bell size={20} />
                  {unreadCount > 0 && (
                    <span className="absolute -top-1 -right-1 min-w-5 h-5 px-1 bg-red-500 rounded-full text-xs text-white flex items-center justify-center font-medium animate-pulse">
                      {unreadCount > 99 ? "99+" : unreadCount}
                    </span>
                  )}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-80" align="end" forceMount>
                <DropdownMenuLabel className="font-normal flex items-center justify-between">
                  <span className="font-semibold">Notifications</span>
                  {unreadCount > 0 && (
                    <span className="text-xs text-muted-foreground">{unreadCount} unread</span>
                  )}
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <ScrollArea className="h-[300px]">
                  {unreadNotifications.length === 0 ? (
                    <div className="p-4 text-center text-muted-foreground">
                      <Bell className="mx-auto h-8 w-8 mb-2 opacity-50" />
                      <p className="text-sm">No new notifications</p>
                    </div>
                  ) : (
                    <>
                      {unreadNotifications.slice(0, 10).map((notif) => (
                        <DropdownMenuItem 
                          key={notif.id} 
                          className={`flex flex-col items-start p-3 cursor-pointer ${!notif.read ? 'bg-primary/5' : ''}`}
                          onClick={() => {
                            if (notif.type === 'message') {
                              markMessageAsReadMutation.mutate(notif.originalId);
                              setLocation("/admin/inbox");
                            } else if (notif.type === 'comment') {
                              markCommentAsReadMutation.mutate(notif.originalId);
                              setLocation("/admin/comments");
                            } else {
                              markReviewAsReadMutation.mutate(notif.originalId);
                              setLocation("/admin/comments");
                            }
                          }}
                        >
                          <div className="flex items-start gap-3 w-full">
                            <div className={`mt-1 h-2 w-2 rounded-full flex-shrink-0 ${!notif.read ? 'bg-primary' : 'bg-transparent'}`} />
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center justify-between gap-2">
                                <p className="font-medium text-sm truncate">{notif.sender}</p>
                                {notif.createdAt && (
                                  <span className="text-xs text-muted-foreground flex-shrink-0">
                                    {formatDistanceToNow(notif.createdAt, { addSuffix: true })}
                                  </span>
                                )}
                              </div>
                              <p className="text-xs text-muted-foreground truncate mt-0.5">
                                {notif.label}
                              </p>
                              <p className="text-xs text-muted-foreground/70 truncate mt-0.5">
                                {notif.content.length > 50 ? `${notif.content.substring(0, 50)}...` : notif.content}
                              </p>
                            </div>
                          </div>
                        </DropdownMenuItem>
                      ))}
                    </>
                  )}
                </ScrollArea>
                <DropdownMenuSeparator />
                <DropdownMenuItem 
                  className="text-center justify-center text-primary cursor-pointer"
                  onClick={() => setLocation("/admin/notifications")}
                >
                  View all notifications
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={currentUser?.avatar ? String(currentUser.avatar) : "/avatars/01.png"} alt={currentUser?.name ? String(currentUser.name) : "User"} />
                    <AvatarFallback>{currentUser?.name ? String(currentUser.name).charAt(0).toUpperCase() : "L"}</AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56" align="end" forceMount>
                <DropdownMenuLabel className="font-normal">
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium leading-none">{currentUser?.name || "Loi Developer"}</p>
                    <p className="text-xs leading-none text-muted-foreground">
                      {currentUser?.email || "admin@loideveloper.com"}
                    </p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => setLocation("/admin/profile")}>Profile</DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem className="text-red-500" onClick={handleLogout}>Log out</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto p-4 lg:p-8">
          {children}
        </main>
      </div>
    </div>
  );
}