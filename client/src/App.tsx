import { Switch, Route, Redirect } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { MockProvider } from "@/context/MockContext";
import { SiteProvider, useSiteSettings } from "@/context/SiteContext";
import { LanguageProvider } from "@/context/LanguageContext";
import { ThemeProvider } from "next-themes";
import { lazy, Suspense } from "react";
import { useThemeSettings } from "@/hooks/useThemeSettings";
import { useAuth } from "@/hooks/use-auth";
import { useLocation } from "wouter";
import { Loader2 } from "lucide-react";

// Public pages - loaded directly for best UX (from home folder)
import Home from "@/pages/home/Home";
import Maintenance from "@/pages/home/Maintenance";
import BlogPost from "@/pages/home/BlogPost";
import Blog from "@/pages/home/Blog";
import Projects from "@/pages/home/Projects";
import Pages from "@/pages/home/Pages";
import PageDetail from "@/pages/home/PageDetail";
import NotFound from "@/pages/home/not-found";

// Admin Login - loaded directly for fast access
import AdminLogin from "@/pages/admin/auth/Login";

// Admin Dashboard
const AdminDashboard = lazy(() => import("@/pages/admin/dashboard/Dashboard"));
const AdminAnalytics = lazy(() => import("@/pages/admin/dashboard/Analytics"));

// Admin Content - Posts
const AdminPostsEnhanced = lazy(() => import("@/pages/admin/content/posts/PostsEnhanced"));
const AdminPostCategories = lazy(() => import("@/pages/admin/content/posts/PostCategories"));

// Admin Content - Projects
const AdminProjectsEnhanced = lazy(() => import("@/pages/admin/content/projects/ProjectsEnhanced"));
const AdminProjectCategories = lazy(() => import("@/pages/admin/content/projects/ProjectCategories"));

// Admin Content - Services
const AdminServicesEnhanced = lazy(() => import("@/pages/admin/content/services/ServicesEnhanced"));

// Admin Content - Skills
const AdminSkills = lazy(() => import("@/pages/admin/content/skills/Skills"));

// Admin Content - Testimonials
const AdminTestimonials = lazy(() => import("@/pages/admin/content/testimonials/Testimonials"));

// Admin Communications
const AdminComments = lazy(() => import("@/pages/admin/communications/Comments"));
const AdminInbox = lazy(() => import("@/pages/admin/communications/Inbox"));
const AdminNotifications = lazy(() => import("@/pages/admin/communications/Notifications"));
const AdminNewsletter = lazy(() => import("@/pages/admin/communications/Newsletter"));
const AdminEmailTemplates = lazy(() => import("@/pages/admin/communications/EmailTemplates"));

// Admin Settings
const AdminSettingsEnhanced = lazy(() => import("@/pages/admin/settings/SettingsEnhanced"));
const AdminThemeEnhanced = lazy(() => import("@/pages/admin/settings/ThemeEnhanced"));
const AdminLanguageManager = lazy(() => import("@/pages/admin/settings/LanguageManager"));

// Admin Security
const AdminSecurityEnhanced = lazy(() => import("@/pages/admin/security/SecurityEnhanced"));
const AdminWebhooks = lazy(() => import("@/pages/admin/security/Webhooks"));

// Admin System
const AdminSystem = lazy(() => import("@/pages/admin/system/System"));
const AdminActivityLog = lazy(() => import("@/pages/admin/system/ActivityLog"));
const AdminExportImport = lazy(() => import("@/pages/admin/system/ExportImport"));
const AdminCache = lazy(() => import("@/pages/admin/system/Cache"));
const AdminAPIDocs = lazy(() => import("@/pages/admin/system/APIDocs"));
const AdminLogs = lazy(() => import("@/pages/admin/system/Logs"));

// Admin Tools
const AdminTools = lazy(() => import("@/pages/admin/tools/Tools"));
const AdminMedia = lazy(() => import("@/pages/admin/tools/Media"));
const AdminImageOptimizer = lazy(() => import("@/pages/admin/tools/ImageOptimizer"));
const AdminScheduler = lazy(() => import("@/pages/admin/tools/Scheduler"));
const AdminFileManager = lazy(() => import("@/pages/admin/tools/FileManager"));

// Admin Pages
const AdminPages = lazy(() => import("@/pages/admin/pages/Pages"));
const AdminPageBuilder = lazy(() => import("@/pages/admin/pages/PageBuilder"));
const AdminFAQs = lazy(() => import("@/pages/admin/pages/FAQs"));
const AdminEditor = lazy(() => import("@/pages/admin/pages/Editor"));

// Admin Users
const AdminProfile = lazy(() => import("@/pages/admin/users/Profile"));
const AdminUsers = lazy(() => import("@/pages/admin/users/Users"));
const AdminRoles = lazy(() => import("@/pages/admin/users/Roles"));

// Loading fallback component
function PageLoader() {
  return (
    <div className="flex items-center justify-center min-h-screen bg-background">
      <div className="text-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary mx-auto mb-4" />
        <p className="text-muted-foreground text-sm">Loading...</p>
      </div>
    </div>
  );
}

function ThemeLoader() {
  useThemeSettings();
  return null;
}

function Router() {
  const { settings } = useSiteSettings();
  const { isAuthenticated } = useAuth();
  const [location] = useLocation();
  
  const isAdminPath = location.startsWith('/admin');
  
  if (settings?.maintenanceMode && !isAuthenticated && !isAdminPath) {
    return <Maintenance />;
  }

  return (
    <Switch>
      {/* Public Routes */}
      <Route path="/" component={Home} />
      <Route path="/blog" component={Blog} />
      <Route path="/blog/:slug" component={BlogPost} />
      <Route path="/projects" component={Projects} />
      <Route path="/pages" component={Pages} />
      <Route path="/page/:slug" component={PageDetail} />

      {/* Admin Login - not lazy loaded for fast access */}
      <Route path="/admin/login" component={AdminLogin} />
      
      {/* Admin Routes - wrapped in Suspense for lazy loading */}
      <Route path="/admin">
        {() => (
          <Suspense fallback={<PageLoader />}>
            <AdminDashboard />
          </Suspense>
        )}
      </Route>
      <Route path="/admin/posts">
        {() => (
          <Suspense fallback={<PageLoader />}>
            <AdminPostsEnhanced />
          </Suspense>
        )}
      </Route>
      <Route path="/admin/posts/categories">
        {() => (
          <Suspense fallback={<PageLoader />}>
            <AdminPostCategories />
          </Suspense>
        )}
      </Route>
      <Route path="/admin/pages">
        {() => (
          <Suspense fallback={<PageLoader />}>
            <AdminPages />
          </Suspense>
        )}
      </Route>
      <Route path="/admin/projects">
        {() => (
          <Suspense fallback={<PageLoader />}>
            <AdminProjectsEnhanced />
          </Suspense>
        )}
      </Route>
      <Route path="/admin/projects/categories">
        {() => (
          <Suspense fallback={<PageLoader />}>
            <AdminProjectCategories />
          </Suspense>
        )}
      </Route>
      <Route path="/admin/services">
        {() => (
          <Suspense fallback={<PageLoader />}>
            <AdminServicesEnhanced />
          </Suspense>
        )}
      </Route>
      <Route path="/admin/comments">
        {() => (
          <Suspense fallback={<PageLoader />}>
            <AdminComments />
          </Suspense>
        )}
      </Route>
      <Route path="/admin/faqs">
        {() => (
          <Suspense fallback={<PageLoader />}>
            <AdminFAQs />
          </Suspense>
        )}
      </Route>
      <Route path="/admin/skills">
        {() => (
          <Suspense fallback={<PageLoader />}>
            <AdminSkills />
          </Suspense>
        )}
      </Route>
      <Route path="/admin/newsletter">
        {() => (
          <Suspense fallback={<PageLoader />}>
            <AdminNewsletter />
          </Suspense>
        )}
      </Route>
      <Route path="/admin/notifications">
        {() => (
          <Suspense fallback={<PageLoader />}>
            <AdminNotifications />
          </Suspense>
        )}
      </Route>
      <Route path="/admin/profile">
        {() => (
          <Suspense fallback={<PageLoader />}>
            <AdminProfile />
          </Suspense>
        )}
      </Route>
      <Route path="/admin/theme">
        {() => (
          <Suspense fallback={<PageLoader />}>
            <AdminThemeEnhanced />
          </Suspense>
        )}
      </Route>
      <Route path="/admin/system">
        {() => (
          <Suspense fallback={<PageLoader />}>
            <AdminSystem />
          </Suspense>
        )}
      </Route>
      <Route path="/admin/media">
        {() => (
          <Suspense fallback={<PageLoader />}>
            <AdminMedia />
          </Suspense>
        )}
      </Route>
      <Route path="/admin/files">
        {() => <Redirect to="/admin/media" />}
      </Route>
      <Route path="/admin/activity">
        {() => (
          <Suspense fallback={<PageLoader />}>
            <AdminActivityLog />
          </Suspense>
        )}
      </Route>
      <Route path="/admin/export-import">
        {() => (
          <Suspense fallback={<PageLoader />}>
            <AdminExportImport />
          </Suspense>
        )}
      </Route>
      <Route path="/admin/inbox">
        {() => (
          <Suspense fallback={<PageLoader />}>
            <AdminInbox />
          </Suspense>
        )}
      </Route>
      <Route path="/admin/analytics">
        {() => (
          <Suspense fallback={<PageLoader />}>
            <AdminAnalytics />
          </Suspense>
        )}
      </Route>
      <Route path="/admin/editor">
        {() => (
          <Suspense fallback={<PageLoader />}>
            <AdminEditor />
          </Suspense>
        )}
      </Route>
      <Route path="/admin/security">
        {() => (
          <Suspense fallback={<PageLoader />}>
            <AdminSecurityEnhanced />
          </Suspense>
        )}
      </Route>
      <Route path="/admin/settings">
        {() => (
          <Suspense fallback={<PageLoader />}>
            <AdminSettingsEnhanced />
          </Suspense>
        )}
      </Route>
      <Route path="/admin/tools">
        {() => (
          <Suspense fallback={<PageLoader />}>
            <AdminTools />
          </Suspense>
        )}
      </Route>
      <Route path="/admin/testimonials">
        {() => (
          <Suspense fallback={<PageLoader />}>
            <AdminTestimonials />
          </Suspense>
        )}
      </Route>
      <Route path="/admin/email-templates">
        {() => (
          <Suspense fallback={<PageLoader />}>
            <AdminEmailTemplates />
          </Suspense>
        )}
      </Route>
      <Route path="/admin/cache">
        {() => (
          <Suspense fallback={<PageLoader />}>
            <AdminCache />
          </Suspense>
        )}
      </Route>
      <Route path="/admin/languages">
        {() => (
          <Suspense fallback={<PageLoader />}>
            <AdminLanguageManager />
          </Suspense>
        )}
      </Route>
      <Route path="/admin/webhooks">
        {() => (
          <Suspense fallback={<PageLoader />}>
            <AdminWebhooks />
          </Suspense>
        )}
      </Route>
      <Route path="/admin/image-optimizer">
        {() => (
          <Suspense fallback={<PageLoader />}>
            <AdminImageOptimizer />
          </Suspense>
        )}
      </Route>
      <Route path="/admin/page-builder">
        {() => (
          <Suspense fallback={<PageLoader />}>
            <AdminPageBuilder />
          </Suspense>
        )}
      </Route>
      <Route path="/admin/api-docs">
        {() => (
          <Suspense fallback={<PageLoader />}>
            <AdminAPIDocs />
          </Suspense>
        )}
      </Route>
      <Route path="/admin/scheduler">
        {() => (
          <Suspense fallback={<PageLoader />}>
            <AdminScheduler />
          </Suspense>
        )}
      </Route>

      {/* Admin Fallback */}
      <Route path="/admin/:any*">
        {() => (
          <Suspense fallback={<PageLoader />}>
            <AdminDashboard />
          </Suspense>
        )}
      </Route>

      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider attribute="class" defaultTheme="dark" enableSystem>
        <LanguageProvider>
          <SiteProvider>
            <MockProvider>
              <TooltipProvider>
                <Toaster />
                <ThemeLoader />
                <Router />
              </TooltipProvider>
            </MockProvider>
          </SiteProvider>
        </LanguageProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;