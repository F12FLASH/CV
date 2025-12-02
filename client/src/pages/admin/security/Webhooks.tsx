
import { AdminLayout } from "@/layouts/AdminLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { 
  Webhook, 
  Plus, 
  Trash2, 
  Edit,
  TestTube,
  Activity,
  CheckCircle,
  XCircle,
  Clock
} from "lucide-react";
import { useState } from "react";

interface WebhookItem {
  id: number;
  name: string;
  url: string;
  events: string[];
  status: "active" | "inactive";
  lastTriggered: string;
  successRate: number;
}

export default function AdminWebhooks() {
  const [webhooks, setWebhooks] = useState<WebhookItem[]>([
    {
      id: 1,
      name: "Slack Notifications",
      url: "https://hooks.slack.com/services/xxx",
      events: ["post.published", "comment.new"],
      status: "active",
      lastTriggered: "2 hours ago",
      successRate: 98.5
    },
    {
      id: 2,
      name: "Discord Updates",
      url: "https://discord.com/api/webhooks/xxx",
      events: ["project.created", "message.received"],
      status: "active",
      lastTriggered: "1 day ago",
      successRate: 100
    },
  ]);

  const availableEvents = [
    "post.published",
    "post.updated",
    "post.deleted",
    "comment.new",
    "project.created",
    "message.received",
    "user.registered",
    "newsletter.subscribed"
  ];

  const handleTest = (id: number) => {
    alert(`Testing webhook #${id}...`);
  };

  const handleDelete = (id: number) => {
    if (confirm("Delete this webhook?")) {
      setWebhooks(webhooks.filter(w => w.id !== id));
    }
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-heading font-bold">Webhooks</h1>
            <p className="text-muted-foreground">Integrate external services with real-time events</p>
          </div>
          <Button className="bg-primary gap-2">
            <Plus className="w-4 h-4" /> Create Webhook
          </Button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <Webhook className="w-5 h-5 text-primary" />
                <div>
                  <p className="text-xs text-muted-foreground">Total Webhooks</p>
                  <p className="font-bold text-xl">{webhooks.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <Activity className="w-5 h-5 text-green-500" />
                <div>
                  <p className="text-xs text-muted-foreground">Active</p>
                  <p className="font-bold text-xl">{webhooks.filter(w => w.status === "active").length}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <CheckCircle className="w-5 h-5 text-blue-500" />
                <div>
                  <p className="text-xs text-muted-foreground">Avg Success Rate</p>
                  <p className="font-bold text-xl">99.2%</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <Clock className="w-5 h-5 text-yellow-500" />
                <div>
                  <p className="text-xs text-muted-foreground">Events Today</p>
                  <p className="font-bold text-xl">127</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Webhooks List */}
        <div className="space-y-4">
          {webhooks.map((webhook) => (
            <Card key={webhook.id}>
              <CardContent className="p-6">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="font-bold text-lg">{webhook.name}</h3>
                      <Badge variant={webhook.status === "active" ? "default" : "secondary"}>
                        {webhook.status}
                      </Badge>
                    </div>
                    
                    <div className="text-sm text-muted-foreground mb-3">
                      <code className="bg-muted px-2 py-1 rounded">{webhook.url}</code>
                    </div>

                    <div className="flex flex-wrap gap-2 mb-3">
                      {webhook.events.map(event => (
                        <Badge key={event} variant="outline" className="text-xs">
                          {event}
                        </Badge>
                      ))}
                    </div>

                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="text-muted-foreground">Last triggered:</span>
                        <span className="ml-2 font-medium">{webhook.lastTriggered}</span>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Success rate:</span>
                        <span className="ml-2 font-medium text-green-600">{webhook.successRate}%</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-col gap-2">
                    <Button variant="outline" size="sm" onClick={() => handleTest(webhook.id)}>
                      <TestTube className="w-3 h-3 mr-1" /> Test
                    </Button>
                    <Button variant="outline" size="sm">
                      <Edit className="w-3 h-3 mr-1" /> Edit
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="text-destructive"
                      onClick={() => handleDelete(webhook.id)}
                    >
                      <Trash2 className="w-3 h-3 mr-1" /> Delete
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Create Form */}
        <Card className="border-primary/20 bg-primary/5">
          <CardHeader>
            <CardTitle>Create New Webhook</CardTitle>
            <CardDescription>Configure a webhook to receive events</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm font-medium mb-2 block">Webhook Name</label>
              <Input placeholder="e.g., Slack Notifications" />
            </div>
            <div>
              <label className="text-sm font-medium mb-2 block">Endpoint URL</label>
              <Input placeholder="https://your-service.com/webhook" />
            </div>
            <div>
              <label className="text-sm font-medium mb-2 block">Events to Subscribe</label>
              <div className="grid grid-cols-2 gap-2 mt-2">
                {availableEvents.map(event => (
                  <div key={event} className="flex items-center gap-2">
                    <input type="checkbox" id={event} className="rounded" />
                    <label htmlFor={event} className="text-sm">{event}</label>
                  </div>
                ))}
              </div>
            </div>
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium">Enable immediately</label>
              <Switch defaultChecked />
            </div>
            <Button className="w-full">Create Webhook</Button>
          </CardContent>
        </Card>

        {/* Recent Activity */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Webhook Activity</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {[
                { event: "post.published", webhook: "Slack Notifications", status: "success", time: "2 min ago" },
                { event: "comment.new", webhook: "Discord Updates", status: "success", time: "15 min ago" },
                { event: "project.created", webhook: "Discord Updates", status: "failed", time: "1 hour ago" },
              ].map((log, i) => (
                <div key={i} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center gap-3">
                    {log.status === "success" ? (
                      <CheckCircle className="w-4 h-4 text-green-500" />
                    ) : (
                      <XCircle className="w-4 h-4 text-red-500" />
                    )}
                    <div>
                      <p className="font-medium text-sm">{log.event}</p>
                      <p className="text-xs text-muted-foreground">{log.webhook}</p>
                    </div>
                  </div>
                  <span className="text-xs text-muted-foreground">{log.time}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
}
