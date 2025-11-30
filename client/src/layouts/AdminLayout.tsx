import { useState, useEffect } from "react";
import { Link, useLocation } from "wouter";
import { useMockData } from "@/context/MockContext";
import { useTheme } from "next-themes";
import { 
  LayoutDashboard, 
  FileText, 
  Briefcase, 
  Mail, 
  Settings, 
  Users, 
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
  GitBranch,
  Clock,
  Download,
  Moon,
  Sun,
  Inbox,
  Brackets
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

export function AdminLayout({ children }: { children: React.ReactNode }) {
  const [location, setLocation] = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const { isAuthenticated, logout } = useMockData();
  const { theme, setTheme } = useTheme();

  // Protect route
  useEffect(() => {
    if (!isAuthenticated) {
      setLocation("/admin/login");
    }
  }, [isAuthenticated, setLocation]);

  const handleLogout = () => {
    logout();
    setLocation("/admin/login");
  };

  if (!isAuthenticated) return null;

  const navItems = [
    { icon: LayoutDashboard, label: "Dashboard", href: "/admin" },
    { icon: FileText, label: "Posts", href: "/admin/posts" },
    { icon: Briefcase, label: "Projects", href: "/admin/projects" },
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
    { icon: GitBranch, label: "Roles", href: "/admin/roles" },
    { icon: Key, label: "API Keys", href: "/admin/api-keys" },
    { icon: Download, label: "Export/Import", href: "/admin/export-import" },
    { icon: Brackets, label: "Code Editor", href: "/admin/editor" },
    { icon: Users, label: "Users", href: "/admin/users" },
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
              <Link key={item.href} href={item.href}>
                <div 
                  className={`flex items-center gap-3 px-3 py-2 rounded-md transition-colors cursor-pointer ${
                    location === item.href 
                      ? "bg-primary/10 text-primary" 
                      : "text-muted-foreground hover:bg-muted hover:text-foreground"
                  }`}
                >
                  <item.icon size={20} />
                  {sidebarOpen && <span>{item.label}</span>}
                </div>
              </Link>
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
            <Button variant="ghost" size="icon" className="relative">
              <Bell size={20} />
              <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full" />
            </Button>
            
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src="/avatars/01.png" alt="@loi" />
                    <AvatarFallback>L</AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56" align="end" forceMount>
                <DropdownMenuLabel className="font-normal">
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium leading-none">Loi Developer</p>
                    <p className="text-xs leading-none text-muted-foreground">
                      admin@loideveloper.com
                    </p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem>Profile</DropdownMenuItem>
                <DropdownMenuItem>Settings</DropdownMenuItem>
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
