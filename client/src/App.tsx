import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { MockProvider } from "@/context/MockContext";
import { SiteProvider } from "@/context/SiteContext";
import { LanguageProvider } from "@/context/LanguageContext";
import Home from "@/pages/Home";
import NotFound from "@/pages/not-found";
import AdminDashboard from "@/pages/admin/Dashboard";
import AdminProjects from "@/pages/admin/Projects";
import AdminInbox from "@/pages/admin/Inbox";
import AdminMedia from "@/pages/admin/Media";
import AdminSettings from "@/pages/admin/Settings";
import AdminLogin from "@/pages/admin/Login";
import AdminPosts from "@/pages/admin/Posts";
import AdminAnalytics from "@/pages/admin/Analytics";
import AdminEditor from "@/pages/admin/Editor";
import AdminSecurity from "@/pages/admin/Security";
import AdminServices from "@/pages/admin/Services";
import AdminComments from "@/pages/admin/Comments";
import AdminFAQs from "@/pages/admin/FAQs";
import AdminTools from "@/pages/admin/Tools";
import AdminSkills from "@/pages/admin/Skills";
import AdminNewsletter from "@/pages/admin/Newsletter";
import AdminTheme from "@/pages/admin/Theme";
import AdminSocial from "@/pages/admin/Social";
import AdminSystem from "@/pages/admin/System";
import AdminFileManager from "@/pages/admin/FileManager";
import AdminActivityLog from "@/pages/admin/ActivityLog";
import AdminAPIKeys from "@/pages/admin/APIKeys";
import AdminExportImport from "@/pages/admin/ExportImport";
import AdminPostsEnhanced from "@/pages/admin/PostsEnhanced";
import AdminProjectsEnhanced from "@/pages/admin/ProjectsEnhanced";
import AdminServicesEnhanced from "@/pages/admin/ServicesEnhanced";
import AdminSettingsEnhanced from "@/pages/admin/SettingsEnhanced";
import AdminSecurityEnhanced from "@/pages/admin/SecurityEnhanced";
import AdminThemeEnhanced from "@/pages/admin/ThemeEnhanced";
import AdminTestimonials from "@/pages/admin/Testimonials";
import AdminEmailTemplates from "@/pages/admin/EmailTemplates";
import AdminCache from "@/pages/admin/Cache";
import AdminLanguageManager from "@/pages/admin/LanguageManager";
import { ThemeProvider } from "next-themes";
import { lazy } from "react";


function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />

      {/* Admin Routes */}
      <Route path="/admin/login" component={AdminLogin} />
      <Route path="/admin" component={AdminDashboard} />
      <Route path="/admin/posts" component={AdminPostsEnhanced} />
      <Route path="/admin/projects" component={AdminProjectsEnhanced} />
      <Route path="/admin/services" component={AdminServicesEnhanced} />
      <Route path="/admin/comments" component={AdminComments} />
      <Route path="/admin/faqs" component={AdminFAQs} />
      <Route path="/admin/skills" component={AdminSkills} />
      <Route path="/admin/newsletter" component={AdminNewsletter} />
      <Route path="/admin/theme" component={AdminThemeEnhanced} />
      <Route path="/admin/social" component={AdminSocial} />
      <Route path="/admin/system" component={AdminSystem} />
      <Route path="/admin/media" component={lazy(() => import("@/pages/admin/Media"))} />
      <Route path="/admin/files" component={lazy(() => import("@/pages/admin/FileManager"))} />
      <Route path="/admin/activity" component={AdminActivityLog} />
      <Route path="/admin/api-keys" component={AdminAPIKeys} />
      <Route path="/admin/export-import" component={AdminExportImport} />
      <Route path="/admin/inbox" component={AdminInbox} />
      <Route path="/admin/analytics" component={AdminAnalytics} />
      <Route path="/admin/editor" component={AdminEditor} />
      <Route path="/admin/security" component={AdminSecurityEnhanced} />
      <Route path="/admin/settings" component={AdminSettingsEnhanced} />
      <Route path="/admin/tools" component={AdminTools} />
      <Route path="/admin/testimonials" component={AdminTestimonials} />
      <Route path="/admin/email-templates" component={AdminEmailTemplates} />
      <Route path="/admin/cache" component={AdminCache} />
      <Route path="/admin/languages" component={AdminLanguageManager} />
      <Route path="/admin/webhooks" component={lazy(() => import("@/pages/admin/Webhooks"))} />
      <Route path="/admin/image-optimizer" component={lazy(() => import("@/pages/admin/ImageOptimizer"))} />
      <Route path="/admin/page-builder" component={lazy(() => import("@/pages/admin/PageBuilder"))} />
      <Route path="/admin/api-docs" component={lazy(() => import("@/pages/admin/APIDocs"))} />
      <Route path="/admin/scheduler" component={lazy(() => import("@/pages/admin/Scheduler"))} />

      {/* Admin Fallback */}
      <Route path="/admin/:any*">
         {(params) => {
            return <AdminDashboard />;
         }}
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