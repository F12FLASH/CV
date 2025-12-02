import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Plug, Plus, Settings, ExternalLink, Check, X, Github, Mail, BarChart3, CreditCard, MessageSquare } from "lucide-react";
import { useSiteSettings } from "@/context/SiteContext";
import { useToast } from "@/hooks/use-toast";

const integrations = [
  { 
    id: "google_analytics",
    name: "Google Analytics", 
    description: "Track website traffic and user behavior", 
    icon: BarChart3,
    configKey: "googleAnalyticsId" as const,
    placeholder: "G-XXXXXXXXXX"
  },
  { 
    id: "github",
    name: "GitHub", 
    description: "Display repositories and contribution stats", 
    icon: Github,
    configKey: "socialGithub" as const,
    placeholder: "https://github.com/username"
  },
  { 
    id: "smtp",
    name: "Email (SMTP)", 
    description: "Send contact form notifications", 
    icon: Mail,
    configKey: "smtpHost" as const,
    placeholder: "smtp.gmail.com",
    linkTo: "email"
  },
  { 
    id: "disqus",
    name: "Disqus Comments", 
    description: "Third-party commenting system", 
    icon: MessageSquare,
    configKey: "disqusShortname" as const,
    placeholder: "your-site-shortname"
  },
];

export function SettingsIntegrations() {
  const { toast } = useToast();
  const { settings, updateSettings, saveSettings, isSaving } = useSiteSettings();
  
  const isConfigured = (configKey: keyof typeof settings) => {
    return !!(settings[configKey]);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div>
          <h3 className="font-medium">Third-Party Integrations</h3>
          <p className="text-sm text-muted-foreground">Connect external services to enhance your portfolio</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {integrations.map((integration) => {
          const configured = isConfigured(integration.configKey);
          const Icon = integration.icon;
          
          return (
            <Card key={integration.id} data-testid={`card-integration-${integration.id}`}>
              <CardContent className="pt-6">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex gap-3">
                    <div className="p-2 bg-muted rounded-lg">
                      <Icon className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="font-medium">{integration.name}</p>
                      <p className="text-xs text-muted-foreground">{integration.description}</p>
                    </div>
                  </div>
                  <Badge variant={configured ? "default" : "outline"}>
                    {configured ? (
                      <><Check className="w-3 h-3 mr-1" /> Connected</>
                    ) : (
                      <><X className="w-3 h-3 mr-1" /> Not configured</>
                    )}
                  </Badge>
                </div>
                <div className="mt-4 space-y-3">
                  <div className="space-y-1">
                    <Label className="text-xs">{integration.name} {integration.configKey.includes("Id") ? "ID" : "Config"}</Label>
                    <Input 
                      placeholder={integration.placeholder}
                      value={String(settings[integration.configKey] || "")}
                      onChange={(e) => updateSettings({ [integration.configKey]: e.target.value })}
                      data-testid={`input-${integration.id}`}
                    />
                  </div>
                  {integration.linkTo && (
                    <p className="text-xs text-muted-foreground">
                      Configure additional settings in the {integration.linkTo.charAt(0).toUpperCase() + integration.linkTo.slice(1)} tab
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Plug className="w-5 h-5" /> Social Media Links
          </CardTitle>
          <CardDescription>Connect your social media profiles</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>GitHub URL</Label>
              <Input 
                placeholder="https://github.com/username"
                value={settings.socialGithub || ""}
                onChange={(e) => updateSettings({ socialGithub: e.target.value })}
                data-testid="input-github-url"
              />
            </div>
            <div className="space-y-2">
              <Label>LinkedIn URL</Label>
              <Input 
                placeholder="https://linkedin.com/in/username"
                value={settings.socialLinkedin || ""}
                onChange={(e) => updateSettings({ socialLinkedin: e.target.value })}
                data-testid="input-linkedin-url"
              />
            </div>
            <div className="space-y-2">
              <Label>Twitter/X URL</Label>
              <Input 
                placeholder="https://twitter.com/username"
                value={settings.socialTwitter || ""}
                onChange={(e) => updateSettings({ socialTwitter: e.target.value })}
                data-testid="input-twitter-url"
              />
            </div>
            <div className="space-y-2">
              <Label>YouTube URL</Label>
              <Input 
                placeholder="https://youtube.com/@channel"
                value={settings.socialYoutube || ""}
                onChange={(e) => updateSettings({ socialYoutube: e.target.value })}
                data-testid="input-youtube-url"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Webhook Notifications</CardTitle>
          <CardDescription>Send notifications to external services when events occur</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>Webhook URL</Label>
            <Input 
              placeholder="https://hooks.slack.com/services/..."
              value={settings.webhookUrl || ""}
              onChange={(e) => updateSettings({ webhookUrl: e.target.value })}
              data-testid="input-webhook-url"
            />
            <p className="text-xs text-muted-foreground">Receive notifications for new messages and comments</p>
          </div>
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Enable Webhook Notifications</Label>
              <p className="text-xs text-muted-foreground">Send POST requests when events occur</p>
            </div>
            <Switch 
              checked={settings.enableWebhook === true}
              onCheckedChange={(checked) => updateSettings({ enableWebhook: checked })}
              data-testid="switch-enable-webhook"
            />
          </div>
        </CardContent>
      </Card>

      <div className="p-3 bg-blue-500/10 border border-blue-500/30 rounded-lg">
        <p className="text-xs text-blue-700 dark:text-blue-400">
          All changes are automatically tracked and saved using the "Save Changes" button in the header.
        </p>
      </div>
    </div>
  );
}
