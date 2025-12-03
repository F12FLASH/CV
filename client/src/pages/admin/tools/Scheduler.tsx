import { AdminLayout } from "@/layouts/AdminLayout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Clock, Plus, Play, Pause, Trash2, RefreshCw, CheckCircle, XCircle, Loader2 } from "lucide-react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import type { ScheduledTask } from "@shared/schema";

function formatDate(date: string | Date | null | undefined): string {
  if (!date) return "Never";
  const d = new Date(date);
  return d.toLocaleString();
}

function parseCronExpression(cron: string): string {
  const parts = cron.split(' ');
  if (parts.length !== 5) return cron;
  
  const [minute, hour, dayOfMonth, month, dayOfWeek] = parts;
  
  if (minute === '0' && hour === '2' && dayOfMonth === '*' && month === '*' && dayOfWeek === '*') {
    return 'Daily at 2:00 AM';
  }
  if (minute === '0' && hour === '9' && dayOfMonth === '*' && month === '*' && dayOfWeek === '1') {
    return 'Every Monday at 9:00 AM';
  }
  if (minute === '0' && hour.startsWith('*/')) {
    return `Every ${hour.replace('*/', '')} hours`;
  }
  if (minute.startsWith('*/')) {
    return `Every ${minute.replace('*/', '')} minutes`;
  }
  
  return cron;
}

export default function AdminScheduler() {
  const { toast } = useToast();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [newTask, setNewTask] = useState({
    name: '',
    description: '',
    schedule: '0 2 * * *',
    type: 'custom',
    command: ''
  });

  const { data: tasks = [], isLoading } = useQuery<ScheduledTask[]>({
    queryKey: ['/api/scheduled-tasks'],
  });

  const createTaskMutation = useMutation({
    mutationFn: (data: typeof newTask) => apiRequest('/api/scheduled-tasks', { method: 'POST', body: JSON.stringify(data) }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/scheduled-tasks'] });
      setDialogOpen(false);
      setNewTask({ name: '', description: '', schedule: '0 2 * * *', type: 'custom', command: '' });
      toast({ title: "Task created", description: "Scheduled task has been created successfully." });
    },
    onError: () => toast({ title: "Error", description: "Failed to create task", variant: "destructive" })
  });

  const pauseMutation = useMutation({
    mutationFn: (id: number) => apiRequest(`/api/scheduled-tasks/${id}/pause`, { method: 'POST' }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/scheduled-tasks'] });
      toast({ title: "Task paused", description: "The scheduled task has been paused." });
    }
  });

  const resumeMutation = useMutation({
    mutationFn: (id: number) => apiRequest(`/api/scheduled-tasks/${id}/resume`, { method: 'POST' }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/scheduled-tasks'] });
      toast({ title: "Task resumed", description: "The scheduled task has been resumed." });
    }
  });

  const runMutation = useMutation({
    mutationFn: (id: number) => apiRequest(`/api/scheduled-tasks/${id}/run`, { method: 'POST' }),
    onSuccess: (data: any) => {
      queryClient.invalidateQueries({ queryKey: ['/api/scheduled-tasks'] });
      toast({ 
        title: data.result === 'success' ? "Task completed" : "Task failed",
        description: data.result === 'success' ? "The task ran successfully." : data.error,
        variant: data.result === 'success' ? "default" : "destructive"
      });
    }
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => apiRequest(`/api/scheduled-tasks/${id}`, { method: 'DELETE' }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/scheduled-tasks'] });
      toast({ title: "Task deleted", description: "The scheduled task has been deleted." });
    }
  });

  const handleCreateTask = () => {
    if (!newTask.name || !newTask.schedule) {
      toast({ title: "Error", description: "Name and schedule are required", variant: "destructive" });
      return;
    }
    createTaskMutation.mutate(newTask);
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div>
            <h1 className="text-3xl font-heading font-bold" data-testid="text-page-title">Scheduled Tasks</h1>
            <p className="text-muted-foreground">Manage automated tasks and cron jobs</p>
          </div>
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button className="bg-primary gap-2" data-testid="button-new-task">
                <Plus className="w-4 h-4" /> New Task
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create Scheduled Task</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 pt-4">
                <div>
                  <Label htmlFor="name">Task Name</Label>
                  <Input 
                    id="name"
                    data-testid="input-task-name"
                    value={newTask.name}
                    onChange={(e) => setNewTask({ ...newTask, name: e.target.value })}
                    placeholder="e.g., Daily Database Backup"
                  />
                </div>
                <div>
                  <Label htmlFor="description">Description</Label>
                  <Textarea 
                    id="description"
                    data-testid="input-task-description"
                    value={newTask.description}
                    onChange={(e) => setNewTask({ ...newTask, description: e.target.value })}
                    placeholder="What does this task do?"
                  />
                </div>
                <div>
                  <Label htmlFor="schedule">Schedule (Cron Expression)</Label>
                  <Input 
                    id="schedule"
                    data-testid="input-task-schedule"
                    value={newTask.schedule}
                    onChange={(e) => setNewTask({ ...newTask, schedule: e.target.value })}
                    placeholder="0 2 * * *"
                  />
                  <p className="text-xs text-muted-foreground mt-1">Format: minute hour day month weekday</p>
                </div>
                <div>
                  <Label htmlFor="type">Type</Label>
                  <Select value={newTask.type} onValueChange={(value) => setNewTask({ ...newTask, type: value })}>
                    <SelectTrigger data-testid="select-task-type">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="backup">Backup</SelectItem>
                      <SelectItem value="email">Email</SelectItem>
                      <SelectItem value="maintenance">Maintenance</SelectItem>
                      <SelectItem value="custom">Custom</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <Button 
                  onClick={handleCreateTask} 
                  disabled={createTaskMutation.isPending}
                  className="w-full"
                  data-testid="button-create-task"
                >
                  {createTaskMutation.isPending && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                  Create Task
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
          </div>
        ) : tasks.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <Clock className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="font-semibold text-lg mb-2">No scheduled tasks</h3>
              <p className="text-muted-foreground mb-4">Create your first scheduled task to automate recurring jobs</p>
              <Button onClick={() => setDialogOpen(true)} data-testid="button-create-first-task">
                <Plus className="w-4 h-4 mr-2" /> Create Task
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {tasks.map((task) => (
              <Card key={task.id} data-testid={`card-task-${task.id}`}>
                <CardContent className="p-6">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2 flex-wrap">
                        <Clock className="w-5 h-5 text-primary" />
                        <h3 className="font-bold" data-testid={`text-task-name-${task.id}`}>{task.name}</h3>
                        <Badge variant={task.status === "active" ? "default" : "secondary"} data-testid={`badge-task-status-${task.id}`}>
                          {task.status}
                        </Badge>
                        <Badge variant="outline">{task.type}</Badge>
                        {task.lastResult && (
                          <Badge variant={task.lastResult === 'success' ? 'default' : 'destructive'} className="gap-1">
                            {task.lastResult === 'success' ? <CheckCircle className="w-3 h-3" /> : <XCircle className="w-3 h-3" />}
                            {task.lastResult}
                          </Badge>
                        )}
                      </div>
                      
                      {task.description && (
                        <p className="text-sm text-muted-foreground mb-3">{task.description}</p>
                      )}
                      
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4 text-sm">
                        <div>
                          <p className="text-muted-foreground text-xs">Schedule</p>
                          <code className="font-mono text-xs">{task.schedule}</code>
                          <p className="text-xs text-muted-foreground">{parseCronExpression(task.schedule)}</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground text-xs">Last Run</p>
                          <p className="font-medium text-sm">{formatDate(task.lastRun)}</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground text-xs">Next Run</p>
                          <p className="font-medium text-sm">{formatDate(task.nextRun)}</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground text-xs">Run Count</p>
                          <p className="font-medium text-sm">{task.runCount || 0}</p>
                        </div>
                      </div>
                    </div>

                    <div className="flex gap-2">
                      <Button 
                        variant="outline" 
                        size="icon"
                        onClick={() => runMutation.mutate(task.id)}
                        disabled={runMutation.isPending}
                        title="Run now"
                        data-testid={`button-run-task-${task.id}`}
                      >
                        <RefreshCw className={`w-4 h-4 ${runMutation.isPending ? 'animate-spin' : ''}`} />
                      </Button>
                      <Button 
                        variant="outline" 
                        size="icon"
                        onClick={() => task.status === "active" ? pauseMutation.mutate(task.id) : resumeMutation.mutate(task.id)}
                        title={task.status === "active" ? "Pause" : "Resume"}
                        data-testid={`button-toggle-task-${task.id}`}
                      >
                        {task.status === "active" ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                      </Button>
                      <Button 
                        variant="outline" 
                        size="icon" 
                        className="text-destructive"
                        onClick={() => {
                          if (confirm("Are you sure you want to delete this task?")) {
                            deleteMutation.mutate(task.id);
                          }
                        }}
                        data-testid={`button-delete-task-${task.id}`}
                      >
                        <Trash2 className="w-4 h-4" />
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
