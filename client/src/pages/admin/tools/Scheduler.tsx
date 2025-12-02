
import { AdminLayout } from "@/layouts/AdminLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Clock, Plus, Play, Pause, Trash2, Calendar } from "lucide-react";

export default function AdminScheduler() {
  const tasks = [
    {
      id: 1,
      name: "Daily Database Backup",
      schedule: "0 2 * * *",
      nextRun: "Tomorrow at 2:00 AM",
      lastRun: "Today at 2:00 AM",
      status: "active",
      type: "backup"
    },
    {
      id: 2,
      name: "Weekly Newsletter",
      schedule: "0 9 * * 1",
      nextRun: "Monday at 9:00 AM",
      lastRun: "Last Monday at 9:00 AM",
      status: "active",
      type: "email"
    },
    {
      id: 3,
      name: "Clear Cache",
      schedule: "0 */6 * * *",
      nextRun: "In 3 hours",
      lastRun: "3 hours ago",
      status: "paused",
      type: "maintenance"
    }
  ];

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-heading font-bold">Scheduled Tasks</h1>
            <p className="text-muted-foreground">Manage automated tasks and cron jobs</p>
          </div>
          <Button className="bg-primary gap-2">
            <Plus className="w-4 h-4" /> New Task
          </Button>
        </div>

        <div className="space-y-4">
          {tasks.map((task) => (
            <Card key={task.id}>
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <Clock className="w-5 h-5 text-primary" />
                      <h3 className="font-bold">{task.name}</h3>
                      <Badge variant={task.status === "active" ? "default" : "secondary"}>
                        {task.status}
                      </Badge>
                      <Badge variant="outline">{task.type}</Badge>
                    </div>
                    
                    <div className="grid grid-cols-3 gap-4 mt-4 text-sm">
                      <div>
                        <p className="text-muted-foreground text-xs">Schedule</p>
                        <code className="font-mono">{task.schedule}</code>
                      </div>
                      <div>
                        <p className="text-muted-foreground text-xs">Next Run</p>
                        <p className="font-medium">{task.nextRun}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground text-xs">Last Run</p>
                        <p className="font-medium">{task.lastRun}</p>
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <Button variant="outline" size="sm">
                      {task.status === "active" ? (
                        <Pause className="w-4 h-4" />
                      ) : (
                        <Play className="w-4 h-4" />
                      )}
                    </Button>
                    <Button variant="outline" size="sm" className="text-destructive">
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </AdminLayout>
  );
}
