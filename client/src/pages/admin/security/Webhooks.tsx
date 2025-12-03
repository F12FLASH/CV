import { AdminLayout } from "@/layouts/AdminLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Checkbox } from "@/components/ui/checkbox";
import { 
  Webhook as WebhookIcon, 
  Plus, 
  Trash2, 
  Edit,
  TestTube,
  Activity,
  CheckCircle,
  XCircle,
  Clock,
  Loader2,
  RefreshCw,
  Key
} from "lucide-react";
import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import type { Webhook, WebhookLog } from "@shared/schema";

function formatDate(date: string | Date | null | undefined): string {
  if (!date) return "Never";
  const d = new Date(date);
  const now = new Date();
  const diff = now.getTime() - d.getTime();
  
  if (diff < 60000) return "Just now";
  if (diff < 3600000) return `${Math.floor(diff / 60000)} min ago`;
  if (diff < 86400000) return `${Math.floor(diff / 3600000)} hours ago`;
  return d.toLocaleDateString();
}

export default function AdminWebhooks() {
  const { toast } = useToast();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedWebhook, setSelectedWebhook] = useState<number | null>(null);
  const [newWebhook, setNewWebhook] = useState({
    name: '',
    url: '',
    events: [] as string[],
    status: 'active'
  });

  const { data: webhooks = [], isLoading } = useQuery<Webhook[]>({
    queryKey: ['/api/webhooks'],
  });

  const { data: events = [] } = useQuery<{ id: string; name: string; description: string }[]>({
    queryKey: ['/api/webhooks/events'],
  });

  const { data: logs = [] } = useQuery<WebhookLog[]>({
    queryKey: ['/api/webhooks', selectedWebhook, 'logs'],
    enabled: !!selectedWebhook,
  });

  const createMutation = useMutation({
    mutationFn: (data: typeof newWebhook) => apiRequest('/api/webhooks', { method: 'POST', body: JSON.stringify(data) }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/webhooks'] });
      setDialogOpen(false);
      setNewWebhook({ name: '', url: '', events: [], status: 'active' });
      toast({ title: "Webhook created", description: "The webhook has been created successfully." });
    },
    onError: () => toast({ title: "Error", description: "Failed to create webhook", variant: "destructive" })
  });

  const testMutation = useMutation({
    mutationFn: (id: number) => apiRequest(`/api/webhooks/${id}/test`, { method: 'POST' }),
    onSuccess: (data: any) => {
      queryClient.invalidateQueries({ queryKey: ['/api/webhooks'] });
      toast({ 
        title: data.success ? "Test successful" : "Test failed",
        description: data.success ? `Response: ${data.status}` : data.body,
        variant: data.success ? "default" : "destructive"
      });
    }
  });

  const toggleMutation = useMutation({
    mutationFn: (id: number) => apiRequest(`/api/webhooks/${id}/toggle`, { method: 'POST' }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/webhooks'] });
      toast({ title: "Webhook updated", description: "The webhook status has been toggled." });
    }
  });

  const regenerateSecretMutation = useMutation({
    mutationFn: (id: number) => apiRequest(`/api/webhooks/${id}/regenerate-secret`, { method: 'POST' }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/webhooks'] });
      toast({ title: "Secret regenerated", description: "A new secret has been generated for this webhook." });
    }
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => apiRequest(`/api/webhooks/${id}`, { method: 'DELETE' }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/webhooks'] });
      toast({ title: "Webhook deleted", description: "The webhook has been deleted." });
    }
  });

  const handleEventToggle = (eventId: string) => {
    setNewWebhook(prev => ({
      ...prev,
      events: prev.events.includes(eventId)
        ? prev.events.filter(e => e !== eventId)
        : [...prev.events, eventId]
    }));
  };

  const handleCreate = () => {
    if (!newWebhook.name || !newWebhook.url) {
      toast({ title: "Error", description: "Name and URL are required", variant: "destructive" });
      return;
    }
    createMutation.mutate(newWebhook);
  };

  const activeCount = webhooks.filter(w => w.status === "active").length;
  const avgSuccessRate = webhooks.length > 0 
    ? webhooks.reduce((acc, w) => {
        const total = w.successCount + w.failureCount;
        return acc + (total > 0 ? (w.successCount / total) * 100 : 100);
      }, 0) / webhooks.length
    : 0;

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div>
            <h1 className="text-3xl font-heading font-bold" data-testid="text-page-title">Webhooks</h1>
            <p className="text-muted-foreground">Integrate external services with real-time events</p>
          </div>
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button className="bg-primary gap-2" data-testid="button-create-webhook">
                <Plus className="w-4 h-4" /> Create Webhook
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-lg">
              <DialogHeader>
                <DialogTitle>Create New Webhook</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 pt-4">
                <div>
                  <Label htmlFor="name">Webhook Name</Label>
                  <Input 
                    id="name"
                    data-testid="input-webhook-name"
                    value={newWebhook.name}
                    onChange={(e) => setNewWebhook({ ...newWebhook, name: e.target.value })}
                    placeholder="e.g., Slack Notifications"
                  />
                </div>
                <div>
                  <Label htmlFor="url">Endpoint URL</Label>
                  <Input 
                    id="url"
                    data-testid="input-webhook-url"
                    value={newWebhook.url}
                    onChange={(e) => setNewWebhook({ ...newWebhook, url: e.target.value })}
                    placeholder="https://your-service.com/webhook"
                  />
                </div>
                <div>
                  <Label className="mb-2 block">Events to Subscribe</Label>
                  <div className="grid grid-cols-1 gap-2 max-h-48 overflow-y-auto border rounded-md p-3">
                    {events.map(event => (
                      <div key={event.id} className="flex items-start gap-2">
                        <Checkbox 
                          id={event.id}
                          checked={newWebhook.events.includes(event.id)}
                          onCheckedChange={() => handleEventToggle(event.id)}
                          data-testid={`checkbox-event-${event.id}`}
                        />
                        <div className="flex-1">
                          <label htmlFor={event.id} className="text-sm font-medium cursor-pointer">{event.name}</label>
                          <p className="text-xs text-muted-foreground">{event.description}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <Label>Enable immediately</Label>
                  <Switch 
                    checked={newWebhook.status === 'active'}
                    onCheckedChange={(checked) => setNewWebhook({ ...newWebhook, status: checked ? 'active' : 'inactive' })}
                    data-testid="switch-webhook-enabled"
                  />
                </div>
                <Button 
                  onClick={handleCreate} 
                  disabled={createMutation.isPending}
                  className="w-full"
                  data-testid="button-submit-webhook"
                >
                  {createMutation.isPending && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                  Create Webhook
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <WebhookIcon className="w-5 h-5 text-primary" />
                <div>
                  <p className="text-xs text-muted-foreground">Total Webhooks</p>
                  <p className="font-bold text-xl" data-testid="text-total-webhooks">{webhooks.length}</p>
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
                  <p className="font-bold text-xl" data-testid="text-active-webhooks">{activeCount}</p>
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
                  <p className="font-bold text-xl" data-testid="text-success-rate">{avgSuccessRate.toFixed(1)}%</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <Clock className="w-5 h-5 text-yellow-500" />
                <div>
                  <p className="text-xs text-muted-foreground">Total Deliveries</p>
                  <p className="font-bold text-xl" data-testid="text-total-deliveries">
                    {webhooks.reduce((acc, w) => acc + w.successCount + w.failureCount, 0)}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
          </div>
        ) : webhooks.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <WebhookIcon className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="font-semibold text-lg mb-2">No webhooks configured</h3>
              <p className="text-muted-foreground mb-4">Create webhooks to integrate with external services</p>
              <Button onClick={() => setDialogOpen(true)} data-testid="button-create-first-webhook">
                <Plus className="w-4 h-4 mr-2" /> Create Webhook
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {webhooks.map((webhook) => (
              <Card key={webhook.id} data-testid={`card-webhook-${webhook.id}`}>
                <CardContent className="p-6">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2 flex-wrap">
                        <h3 className="font-bold text-lg" data-testid={`text-webhook-name-${webhook.id}`}>{webhook.name}</h3>
                        <Badge variant={webhook.status === "active" ? "default" : "secondary"} data-testid={`badge-webhook-status-${webhook.id}`}>
                          {webhook.status}
                        </Badge>
                      </div>
                      
                      <div className="text-sm text-muted-foreground mb-3">
                        <code className="bg-muted px-2 py-1 rounded text-xs">{webhook.url}</code>
                      </div>

                      <div className="flex flex-wrap gap-2 mb-3">
                        {webhook.events?.map(event => (
                          <Badge key={event} variant="outline" className="text-xs">
                            {event}
                          </Badge>
                        ))}
                      </div>

                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                        <div>
                          <span className="text-muted-foreground text-xs">Last triggered:</span>
                          <p className="font-medium">{formatDate(webhook.lastTriggered)}</p>
                        </div>
                        <div>
                          <span className="text-muted-foreground text-xs">Success:</span>
                          <p className="font-medium text-green-600">{webhook.successCount}</p>
                        </div>
                        <div>
                          <span className="text-muted-foreground text-xs">Failed:</span>
                          <p className="font-medium text-red-600">{webhook.failureCount}</p>
                        </div>
                        <div>
                          <span className="text-muted-foreground text-xs">Success Rate:</span>
                          <p className="font-medium">
                            {webhook.successCount + webhook.failureCount > 0
                              ? ((webhook.successCount / (webhook.successCount + webhook.failureCount)) * 100).toFixed(1)
                              : 100}%
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-col gap-2">
                      <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={() => testMutation.mutate(webhook.id)}
                        disabled={testMutation.isPending}
                        data-testid={`button-test-webhook-${webhook.id}`}
                      >
                        {testMutation.isPending ? <Loader2 className="w-3 h-3 mr-1 animate-spin" /> : <TestTube className="w-3 h-3 mr-1" />}
                        Test
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => toggleMutation.mutate(webhook.id)}
                        data-testid={`button-toggle-webhook-${webhook.id}`}
                      >
                        {webhook.status === 'active' ? 'Disable' : 'Enable'}
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => regenerateSecretMutation.mutate(webhook.id)}
                        data-testid={`button-regenerate-secret-${webhook.id}`}
                      >
                        <Key className="w-3 h-3 mr-1" /> New Secret
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="text-destructive"
                        onClick={() => {
                          if (confirm("Are you sure you want to delete this webhook?")) {
                            deleteMutation.mutate(webhook.id);
                          }
                        }}
                        data-testid={`button-delete-webhook-${webhook.id}`}
                      >
                        <Trash2 className="w-3 h-3 mr-1" /> Delete
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
