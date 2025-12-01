import { AdminLayout } from "@/layouts/AdminLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Plus, Copy, Eye, EyeOff, Trash, Calendar } from "lucide-react";
import { useState } from "react";

export default function AdminAPIKeys() {
  const [visibility, setVisibility] = useState<Record<number, boolean>>({});

  const keys = [
    { id: 1, name: "Production API Key", key: "sk_live_abcd1234efgh5678ijkl", created: "Mar 15, 2024", lastUsed: "Today at 2:30 PM", status: "Active" },
    { id: 2, name: "Development Key", key: "sk_test_xyz9876543210abcd", created: "Mar 10, 2024", lastUsed: "Mar 19 at 10:45 AM", status: "Active" },
    { id: 3, name: "Staging Environment", key: "sk_stage_abcdefg123456789", created: "Feb 28, 2024", lastUsed: "Never", status: "Inactive" },
  ];

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-heading font-bold">API Keys</h1>
            <p className="text-muted-foreground">Manage API authentication tokens</p>
          </div>
          <Button className="bg-primary gap-2">
            <Plus className="w-4 h-4" /> Create New Key
          </Button>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Active API Keys</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {keys.map((key) => (
              <div key={key.id} className="border border-border rounded-lg p-4 hover:bg-muted/50 transition-colors group">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-3">
                  <div>
                    <h3 className="font-bold">{key.name}</h3>
                    <Badge variant={key.status === "Active" ? "default" : "secondary"}>{key.status}</Badge>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" className="gap-2">
                      {visibility[key.id] ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      {visibility[key.id] ? "Hide" : "Show"}
                    </Button>
                    <Button variant="outline" size="sm" className="gap-2">
                      <Copy className="w-4 h-4" /> Copy
                    </Button>
                    <Button variant="outline" size="sm" className="gap-2 text-destructive">
                      <Trash className="w-4 h-4" /> Delete
                    </Button>
                  </div>
                </div>
                <div className="bg-muted/50 p-3 rounded font-mono text-sm break-all mb-3">
                  {visibility[key.id] ? key.key : "•".repeat(key.key.length)}
                </div>
                <div className="flex flex-col sm:flex-row gap-4 text-xs text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <Calendar className="w-3 h-3" /> Created: {key.created}
                  </div>
                  <div>Last Used: {key.lastUsed}</div>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>API Key Security</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            <div className="flex gap-3">
              <div className="w-2 h-2 bg-green-500 rounded-full mt-1 flex-shrink-0" />
              <p>API keys are stored securely and never displayed again after creation</p>
            </div>
            <div className="flex gap-3">
              <div className="w-2 h-2 bg-green-500 rounded-full mt-1 flex-shrink-0" />
              <p>Rotate keys regularly for enhanced security</p>
            </div>
            <div className="flex gap-3">
              <div className="w-2 h-2 bg-yellow-500 rounded-full mt-1 flex-shrink-0" />
              <p>Never commit API keys to version control</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
}
