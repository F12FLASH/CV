import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { MockProvider } from "@/context/MockContext";
import Home from "@/pages/Home";
import NotFound from "@/pages/not-found";
import AdminDashboard from "@/pages/admin/Dashboard";
import AdminProjects from "@/pages/admin/Projects";
import AdminInbox from "@/pages/admin/Inbox";
import AdminMedia from "@/pages/admin/Media";
import AdminSettings from "@/pages/admin/Settings";
import AdminLogin from "@/pages/admin/Login";
import AdminPosts from "@/pages/admin/Posts";
import AdminUsers from "@/pages/admin/Users";
import AdminAnalytics from "@/pages/admin/Analytics";
import AdminEditor from "@/pages/admin/Editor";
import AdminSecurity from "@/pages/admin/Security";
import AdminServices from "@/pages/admin/Services";
import AdminComments from "@/pages/admin/Comments";
import AdminFAQs from "@/pages/admin/FAQs";
import AdminTools from "@/pages/admin/Tools";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />

      {/* Admin Routes */}
      <Route path="/admin/login" component={AdminLogin} />
      <Route path="/admin" component={AdminDashboard} />
      <Route path="/admin/posts" component={AdminPosts} />
      <Route path="/admin/projects" component={AdminProjects} />
      <Route path="/admin/services" component={AdminServices} />
      <Route path="/admin/comments" component={AdminComments} />
      <Route path="/admin/faqs" component={AdminFAQs} />
      <Route path="/admin/inbox" component={AdminInbox} />
      <Route path="/admin/media" component={AdminMedia} />
      <Route path="/admin/users" component={AdminUsers} />
      <Route path="/admin/analytics" component={AdminAnalytics} />
      <Route path="/admin/editor" component={AdminEditor} />
      <Route path="/admin/security" component={AdminSecurity} />
      <Route path="/admin/settings" component={AdminSettings} />
      <Route path="/admin/tools" component={AdminTools} />

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
      <MockProvider>
        <TooltipProvider>
          <Toaster />
          <Router />
        </TooltipProvider>
      </MockProvider>
    </QueryClientProvider>
  );
}

export default App;