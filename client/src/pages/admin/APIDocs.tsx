
import { AdminLayout } from "@/layouts/AdminLayout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Code, Play, Copy, ChevronDown, ChevronRight } from "lucide-react";
import { useState } from "react";

const endpoints = [
  {
    method: "GET",
    path: "/api/posts",
    description: "Get all blog posts",
    params: [
      { name: "limit", type: "number", required: false },
      { name: "offset", type: "number", required: false },
      { name: "category", type: "string", required: false }
    ],
    response: `{
  "posts": [
    {
      "id": 1,
      "title": "Blog Post Title",
      "content": "...",
      "author": "Loi Developer",
      "createdAt": "2024-03-20T10:00:00Z"
    }
  ],
  "total": 10
}`
  },
  {
    method: "POST",
    path: "/api/posts",
    description: "Create a new blog post",
    body: `{
  "title": "New Post Title",
  "content": "Post content...",
  "category": "Development"
}`,
    response: `{
  "id": 11,
  "title": "New Post Title",
  "status": "draft"
}`
  },
  {
    method: "GET",
    path: "/api/projects",
    description: "Get all portfolio projects",
    params: [
      { name: "status", type: "string", required: false },
      { name: "category", type: "string", required: false }
    ],
    response: `{
  "projects": [...],
  "total": 15
}`
  }
];

export default function AdminAPIDocs() {
  const [expandedEndpoint, setExpandedEndpoint] = useState<number | null>(null);
  const [testResponse, setTestResponse] = useState<string>("");

  const toggleEndpoint = (index: number) => {
    setExpandedEndpoint(expandedEndpoint === index ? null : index);
  };

  const handleTest = (endpoint: typeof endpoints[0]) => {
    setTestResponse(`Testing ${endpoint.method} ${endpoint.path}...\n\nResponse:\n${endpoint.response}`);
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-heading font-bold">API Documentation</h1>
          <p className="text-muted-foreground">Test and explore available API endpoints</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Endpoints List */}
          <div className="lg:col-span-2 space-y-3">
            {endpoints.map((endpoint, index) => (
              <Card key={index} className="overflow-hidden">
                <div
                  className="p-4 cursor-pointer hover:bg-muted/50 transition-colors"
                  onClick={() => toggleEndpoint(index)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Badge
                        variant={endpoint.method === "GET" ? "default" : "secondary"}
                        className={
                          endpoint.method === "GET"
                            ? "bg-blue-500"
                            : endpoint.method === "POST"
                            ? "bg-green-500"
                            : "bg-yellow-500"
                        }
                      >
                        {endpoint.method}
                      </Badge>
                      <code className="font-mono text-sm">{endpoint.path}</code>
                    </div>
                    {expandedEndpoint === index ? (
                      <ChevronDown className="w-4 h-4" />
                    ) : (
                      <ChevronRight className="w-4 h-4" />
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground mt-2">
                    {endpoint.description}
                  </p>
                </div>

                {expandedEndpoint === index && (
                  <CardContent className="border-t bg-muted/20">
                    <Tabs defaultValue="params">
                      <TabsList>
                        <TabsTrigger value="params">Parameters</TabsTrigger>
                        {endpoint.body && <TabsTrigger value="body">Body</TabsTrigger>}
                        <TabsTrigger value="response">Response</TabsTrigger>
                      </TabsList>

                      <TabsContent value="params" className="space-y-2">
                        {endpoint.params && endpoint.params.length > 0 ? (
                          endpoint.params.map((param, i) => (
                            <div key={i} className="flex items-center gap-3 p-2 border rounded">
                              <code className="text-sm font-mono">{param.name}</code>
                              <Badge variant="outline" className="text-xs">
                                {param.type}
                              </Badge>
                              {param.required && (
                                <Badge variant="destructive" className="text-xs">
                                  required
                                </Badge>
                              )}
                            </div>
                          ))
                        ) : (
                          <p className="text-sm text-muted-foreground">No parameters</p>
                        )}
                      </TabsContent>

                      {endpoint.body && (
                        <TabsContent value="body">
                          <pre className="bg-background p-4 rounded border text-xs overflow-x-auto">
                            <code>{endpoint.body}</code>
                          </pre>
                        </TabsContent>
                      )}

                      <TabsContent value="response">
                        <pre className="bg-background p-4 rounded border text-xs overflow-x-auto">
                          <code>{endpoint.response}</code>
                        </pre>
                      </TabsContent>
                    </Tabs>

                    <div className="flex gap-2 mt-4">
                      <Button size="sm" onClick={() => handleTest(endpoint)}>
                        <Play className="w-3 h-3 mr-1" /> Test Endpoint
                      </Button>
                      <Button variant="outline" size="sm">
                        <Copy className="w-3 h-3 mr-1" /> Copy cURL
                      </Button>
                    </div>
                  </CardContent>
                )}
              </Card>
            ))}
          </div>

          {/* Test Panel */}
          <div>
            <Card className="sticky top-4">
              <CardHeader>
                <CardTitle className="text-sm">API Tester</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="text-xs font-medium mb-2 block">Base URL</label>
                  <Input
                    defaultValue="https://loideveloper.com/api"
                    className="text-xs font-mono"
                  />
                </div>
                <div>
                  <label className="text-xs font-medium mb-2 block">Auth Token</label>
                  <Input
                    type="password"
                    placeholder="Bearer token..."
                    className="text-xs font-mono"
                  />
                </div>
                {testResponse && (
                  <div>
                    <label className="text-xs font-medium mb-2 block">Response</label>
                    <pre className="bg-muted p-3 rounded text-xs overflow-x-auto max-h-96">
                      {testResponse}
                    </pre>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
