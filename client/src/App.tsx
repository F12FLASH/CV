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

// Public pages - loaded directly for best UX
import Home from "@/pages/Home";
import Maintenance from "@/pages/Maintenance";
import BlogPost from "@/pages/BlogPost";
import Blog from "@/pages/Blog";
import Projects from "@/pages/Projects";
import Pages from "@/pages/Pages";
import PageDetail from "@/pages/PageDetail";
import NotFound from "@/pages/not-found";

// Admin Login - loaded directly for fast access
import AdminLogin from "@/pages/admin/Login";

// Admin pages - lazy loaded for better initial bundle size
const AdminDashboard = lazy(() => import("@/pages/admin/Dashboard"));
const AdminPostsEnhanced = lazy(() => import("@/pages/admin/PostsEnhanced"));
const AdminPostCategories = lazy(() => import("@/pages/admin/PostCategories"));
const AdminPages = lazy(() => import("@/pages/admin/Pages"));
const AdminProjectsEnhanced = lazy(() => import("@/pages/admin/ProjectsEnhanced"));
const AdminProjectCategories = lazy(() => import("@/pages/admin/ProjectCategories"));
const AdminServicesEnhanced = lazy(() => import("@/pages/admin/ServicesEnhanced"));
const AdminComments = lazy(() => import("@/pages/admin/Comments"));
const AdminFAQs = lazy(() => import("@/pages/admin/FAQs"));
const AdminSkills = lazy(() => import("@/pages/admin/Skills"));
const AdminNewsletter = lazy(() => import("@/pages/admin/Newsletter"));
const AdminNotifications = lazy(() => import("@/pages/admin/Notifications"));
const AdminProfile = lazy(() => import("@/pages/admin/Profile"));
const AdminThemeEnhanced = lazy(() => import("@/pages/admin/ThemeEnhanced"));
const AdminSystem = lazy(() => import("@/pages/admin/System"));
const AdminMedia = lazy(() => import("@/pages/admin/Media"));
const AdminActivityLog = lazy(() => import("@/pages/admin/ActivityLog"));
const AdminExportImport = lazy(() => import("@/pages/admin/ExportImport"));
const AdminInbox = lazy(() => import("@/pages/admin/Inbox"));
const AdminAnalytics = lazy(() => import("@/pages/admin/Analytics"));
const AdminEditor = lazy(() => import("@/pages/admin/Editor"));
const AdminSecurityEnhanced = lazy(() => import("@/pages/admin/SecurityEnhanced"));
const AdminSettingsEnhanced = lazy(() => import("@/pages/admin/SettingsEnhanced"));
const AdminTools = lazy(() => import("@/pages/admin/Tools"));
const AdminTestimonials = lazy(() => import("@/pages/admin/Testimonials"));
const AdminEmailTemplates = lazy(() => import("@/pages/admin/EmailTemplates"));
const AdminCache = lazy(() => import("@/pages/admin/Cache"));
const AdminLanguageManager = lazy(() => import("@/pages/admin/LanguageManager"));
const AdminWebhooks = lazy(() => import("@/pages/admin/Webhooks"));
const AdminImageOptimizer = lazy(() => import("@/pages/admin/ImageOptimizer"));
const AdminPageBuilder = lazy(() => import("@/pages/admin/PageBuilder"));
const AdminAPIDocs = lazy(() => import("@/pages/admin/APIDocs"));
const AdminScheduler = lazy(() => import("@/pages/admin/Scheduler"));

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