
import { AdminLayout } from "@/layouts/AdminLayout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  FileText, 
  Database, 
  Mail, 
  TestTube, 
  Wrench,
  Code,
  Sparkles,
  Zap,
  Globe,
  Image,
  MessageSquare,
  Star,
  HelpCircle,
  FolderTree,
  Clock,
  FileCode,
  Webhook,
  Bell,
  Calculator,
  Palette,
  Monitor
} from "lucide-react";
import { Link } from "wouter";

export default function AdminTools() {
  const tools = [
    {
      category: "Content Management",
      items: [
        { 
          name: "Testimonials Manager", 
          description: "Manage customer reviews and testimonials",
          icon: Star,
          href: "/admin/testimonials",
          color: "text-yellow-500"
        },
        { 
          name: "FAQ Manager", 
          description: "Manage frequently asked questions",
          icon: HelpCircle,
          href: "/admin/faqs",
          color: "text-blue-500"
        },
        { 
          name: "Categories", 
          description: "Organize content with categories and tags",
          icon: FolderTree,
          href: "/admin/categories",
          color: "text-green-500"
        },
      ]
    },
    {
      category: "Communication",
      items: [
        { 
          name: "Email Templates", 
          description: "Create and manage email templates",
          icon: Mail,
          href: "/admin/email-templates",
          color: "text-purple-500"
        },
        { 
          name: "Notifications", 
          description: "Push notifications and alerts",
          icon: Bell,
          href: "/admin/notifications",
          color: "text-orange-500"
        },
        { 
          name: "Webhooks", 
          description: "Configure webhook integrations",
          icon: Webhook,
          href: "/admin/webhooks",
          color: "text-pink-500"
        },
      ]
    },
    {
      category: "System Tools",
      items: [
        { 
          name: "Backup Manager", 
          description: "Database backup and restore",
          icon: Database,
          href: "/admin/system",
          color: "text-cyan-500"
        },
        { 
          name: "Audit Trail", 
          description: "View complete system activity log",
          icon: Clock,
          href: "/admin/activity",
          color: "text-indigo-500"
        },
        { 
          name: "Cache Manager", 
          description: "Clear and manage application cache",
          icon: Zap,
          href: "/admin/cache",
          color: "text-yellow-500"
        },
      ]
    },
    {
      category: "Developer Tools",
      items: [
        { 
          name: "API Documentation", 
          description: "Test and explore API endpoints",
          icon: Code,
          href: "/admin/api-docs",
          color: "text-red-500"
        },
        { 
          name: "Scheduled Tasks", 
          description: "Manage cron jobs and automation",
          icon: Clock,
          href: "/admin/scheduler",
          color: "text-green-500"
        },
        { 
          name: "SEO Tools", 
          description: "SEO optimization and meta tags",
          icon: Globe,
          href: "/admin/seo",
          color: "text-blue-500"
        },
      ]
    },
    {
      category: "Design & Customization",
      items: [
        { 
          name: "Theme Customizer", 
          description: "Advanced theme customization",
          icon: Palette,
          href: "/admin/theme",
          color: "text-purple-500"
        },
        { 
          name: "Page Builder", 
          description: "Drag & drop page builder",
          icon: Monitor,
          href: "/admin/page-builder",
          color: "text-pink-500"
        },
        { 
          name: "Image Optimizer", 
          description: "Optimize and compress images",
          icon: Image,
          href: "/admin/image-optimizer",
          color: "text-orange-500"
        },
      ]
    },
  ];

  return (
    <AdminLayout>
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-heading font-bold">Admin Tools</h1>
          <p className="text-muted-foreground">Powerful tools to manage your portfolio</p>
        </div>

        {tools.map((category, idx) => (
          <div key={idx} className="space-y-4">
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-semibold">{category.category}</h2>
              <div className="h-px flex-1 bg-border" />
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {category.items.map((tool, i) => (
                <Link key={i} href={tool.href}>
                  <Card className="cursor-pointer hover:border-primary/50 transition-all hover:-translate-y-1 duration-300 group">
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div className={`p-3 rounded-lg bg-muted group-hover:bg-primary/10 transition-colors`}>
                          <tool.icon className={`w-6 h-6 ${tool.color}`} />
                        </div>
                      </div>
                      <CardTitle className="text-lg mt-3">{tool.name}</CardTitle>
                      <CardDescription>{tool.description}</CardDescription>
                    </CardHeader>
                  </Card>
                </Link>
              ))}
            </div>
          </div>
        ))}

        {/* Quick Actions */}
        <Card className="bg-gradient-to-br from-primary/5 to-secondary/5 border-primary/20">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-primary" />
              Quick Actions
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Button variant="outline" className="h-auto flex-col gap-2 py-4">
                <Database className="w-5 h-5" />
                <span className="text-xs">Backup Now</span>
              </Button>
              <Button variant="outline" className="h-auto flex-col gap-2 py-4">
                <Zap className="w-5 h-5" />
                <span className="text-xs">Clear Cache</span>
              </Button>
              <Button variant="outline" className="h-auto flex-col gap-2 py-4">
                <Code className="w-5 h-5" />
                <span className="text-xs">Export Data</span>
              </Button>
              <Button variant="outline" className="h-auto flex-col gap-2 py-4">
                <Wrench className="w-5 h-5" />
                <span className="text-xs">System Check</span>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
}
