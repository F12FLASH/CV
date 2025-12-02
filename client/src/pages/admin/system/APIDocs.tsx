import { AdminLayout } from "@/layouts/AdminLayout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Code, Server, Shield, Database, FileText, Users, Briefcase, MessageSquare, Settings, Activity } from "lucide-react";

interface APIEndpoint {
  method: "GET" | "POST" | "PUT" | "DELETE" | "PATCH";
  path: string;
  description: string;
  auth: boolean;
}

const apiEndpoints: Record<string, APIEndpoint[]> = {
  auth: [
    { method: "POST", path: "/api/auth/login", description: "User login with username and password", auth: false },
    { method: "POST", path: "/api/auth/logout", description: "User logout", auth: true },
    { method: "GET", path: "/api/auth/me", description: "Get current user info", auth: true },
    { method: "PUT", path: "/api/auth/profile", description: "Update user profile", auth: true },
    { method: "PUT", path: "/api/auth/password", description: "Change password", auth: true },
    { method: "POST", path: "/api/auth/register", description: "Register new user", auth: false },
  ],
  posts: [
    { method: "GET", path: "/api/posts", description: "Get all posts", auth: false },
    { method: "GET", path: "/api/posts/:id", description: "Get post by ID or slug", auth: false },
    { method: "POST", path: "/api/posts", description: "Create new post", auth: true },
    { method: "PUT", path: "/api/posts/:id", description: "Update post", auth: true },
    { method: "DELETE", path: "/api/posts/:id", description: "Delete post", auth: true },
    { method: "POST", path: "/api/posts/:id/view", description: "Increment post view count", auth: false },
  ],
  projects: [
    { method: "GET", path: "/api/projects", description: "Get all projects", auth: false },
    { method: "GET", path: "/api/projects/:id", description: "Get project by ID", auth: false },
    { method: "POST", path: "/api/projects", description: "Create new project", auth: true },
    { method: "PUT", path: "/api/projects/:id", description: "Update project", auth: true },
    { method: "DELETE", path: "/api/projects/:id", description: "Delete project", auth: true },
  ],
  users: [
    { method: "GET", path: "/api/users", description: "Get all users", auth: true },
    { method: "GET", path: "/api/users/:id", description: "Get user by ID", auth: true },
    { method: "PUT", path: "/api/users/:id", description: "Update user", auth: true },
    { method: "DELETE", path: "/api/users/:id", description: "Delete user", auth: true },
  ],
  settings: [
    { method: "GET", path: "/api/settings", description: "Get all settings", auth: false },
    { method: "PUT", path: "/api/settings", description: "Update settings", auth: true },
  ],
  messages: [
    { method: "GET", path: "/api/messages", description: "Get all messages", auth: true },
    { method: "POST", path: "/api/messages", description: "Send new message", auth: false },
    { method: "PUT", path: "/api/messages/:id/read", description: "Mark message as read", auth: true },
    { method: "DELETE", path: "/api/messages/:id", description: "Delete message", auth: true },
  ],
};

const methodColors: Record<string, string> = {
  GET: "bg-blue-500/10 text-blue-500 border-blue-500/20",
  POST: "bg-green-500/10 text-green-500 border-green-500/20",
  PUT: "bg-yellow-500/10 text-yellow-500 border-yellow-500/20",
  PATCH: "bg-orange-500/10 text-orange-500 border-orange-500/20",
  DELETE: "bg-red-500/10 text-red-500 border-red-500/20",
};

function EndpointList({ endpoints }: { endpoints: APIEndpoint[] }) {
  return (
    <div className="space-y-2">
      {endpoints.map((endpoint, index) => (
        <div
          key={index}
          className="flex items-center gap-3 p-3 rounded-lg border bg-card hover:bg-accent/50 transition-colors"
          data-testid={`api-endpoint-${endpoint.method.toLowerCase()}-${index}`}
        >
          <Badge className={`${methodColors[endpoint.method]} font-mono text-xs min-w-[60px] justify-center`}>
            {endpoint.method}
          </Badge>
          <code className="font-mono text-sm flex-1">{endpoint.path}</code>
          <span className="text-sm text-muted-foreground hidden md:block">{endpoint.description}</span>
          {endpoint.auth && (
            <Shield className="w-4 h-4 text-muted-foreground" />
          )}
        </div>
      ))}
    </div>
  );
}

export default function APIDocs() {
  const categories = [
    { id: "auth", label: "Authentication", icon: Shield },
    { id: "posts", label: "Posts", icon: FileText },
    { id: "projects", label: "Projects", icon: Briefcase },
    { id: "users", label: "Users", icon: Users },
    { id: "settings", label: "Settings", icon: Settings },
    { id: "messages", label: "Messages", icon: MessageSquare },
  ];

  return (
    <AdminLayout>
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Server className="w-5 h-5" />
              API Overview
            </CardTitle>
            <CardDescription>
              All API endpoints are prefixed with <code className="bg-muted px-1 rounded">/api</code>. 
              Endpoints marked with a shield icon require authentication.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="p-4 rounded-lg bg-muted/50 text-center">
                <div className="text-2xl font-bold text-primary">
                  {Object.values(apiEndpoints).flat().length}
                </div>
                <div className="text-sm text-muted-foreground">Total Endpoints</div>
              </div>
              <div className="p-4 rounded-lg bg-muted/50 text-center">
                <div className="text-2xl font-bold text-blue-500">
                  {Object.values(apiEndpoints).flat().filter(e => e.method === "GET").length}
                </div>
                <div className="text-sm text-muted-foreground">GET Requests</div>
              </div>
              <div className="p-4 rounded-lg bg-muted/50 text-center">
                <div className="text-2xl font-bold text-green-500">
                  {Object.values(apiEndpoints).flat().filter(e => e.method === "POST").length}
                </div>
                <div className="text-sm text-muted-foreground">POST Requests</div>
              </div>
              <div className="p-4 rounded-lg bg-muted/50 text-center">
                <div className="text-2xl font-bold text-yellow-500">
                  {Object.values(apiEndpoints).flat().filter(e => e.auth).length}
                </div>
                <div className="text-sm text-muted-foreground">Protected</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Tabs defaultValue="auth" className="w-full">
          <TabsList className="w-full justify-start flex-wrap h-auto gap-1 bg-transparent p-0">
            {categories.map((cat) => (
              <TabsTrigger
                key={cat.id}
                value={cat.id}
                className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
                data-testid={`tab-${cat.id}`}
              >
                <cat.icon className="w-4 h-4 mr-2" />
                {cat.label}
              </TabsTrigger>
            ))}
          </TabsList>

          {categories.map((cat) => (
            <TabsContent key={cat.id} value={cat.id} className="mt-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <cat.icon className="w-5 h-5" />
                    {cat.label} Endpoints
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ScrollArea className="h-[400px]">
                    <EndpointList endpoints={apiEndpoints[cat.id] || []} />
                  </ScrollArea>
                </CardContent>
              </Card>
            </TabsContent>
          ))}
        </Tabs>
      </div>
    </AdminLayout>
  );
}
