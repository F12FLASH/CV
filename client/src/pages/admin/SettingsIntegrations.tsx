import { AdminLayout } from "@/layouts/AdminLayout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Plug, Plus, Trash2 } from "lucide-react";

const integrations = [
  { name: "Stripe", description: "Payment processing", status: "connected", icon: "💳" },
  { name: "SendGrid", description: "Email delivery", status: "configured", icon: "📧" },
  { name: "Slack", description: "Team notifications", status: "disconnected", icon: "💬" },
  { name: "Google Analytics", description: "Traffic analytics", status: "connected", icon: "📊" },
  { name: "GitHub", description: "Code repository", status: "disconnected", icon: "🔗" },
];

export function SettingsIntegrations() {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="font-medium">Third-Party Services</h3>
          <p className="text-xs text-muted-foreground">Connect external tools and services</p>
        </div>
        <Button className="gap-2">
          <Plus className="w-4 h-4" /> Add Integration
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {integrations.map((integration) => (
          <Card key={integration.name}>
            <CardContent className="pt-6">
              <div className="flex items-start justify-between">
                <div className="flex gap-3">
                  <span className="text-2xl">{integration.icon}</span>
                  <div>
                    <p className="font-medium">{integration.name}</p>
                    <p className="text-xs text-muted-foreground">{integration.description}</p>
                  </div>
                </div>
                <Badge variant={integration.status === "connected" ? "default" : "secondary"}>
                  {integration.status}
                </Badge>
              </div>
              <div className="flex gap-2 mt-3">
                {integration.status === "disconnected" ? (
                  <Button size="sm" variant="outline" className="flex-1">Connect</Button>
                ) : (
                  <>
                    <Button size="sm" variant="outline" className="flex-1">Settings</Button>
                    <Button size="sm" variant="outline" className="text-destructive">
                      <Trash2 className="w-3 h-3" />
                    </Button>
                  </>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>API Documentation</CardTitle>
        </CardHeader>
        <CardContent>
          <Button variant="outline" className="w-full">View API Docs</Button>
        </CardContent>
      </Card>
    </div>
  );
}
