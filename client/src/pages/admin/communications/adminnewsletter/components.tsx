import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { RichTextEditor } from "@/components/admin/RichTextEditor";
import { Mail, Users } from "lucide-react";
import type { NewsletterSettings } from "./types";

interface SettingsFormProps {
  settings: NewsletterSettings;
  onChange: (field: keyof NewsletterSettings, value: any) => void;
}

export function SubscribersCard() {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Users className="w-5 h-5" /> Subscribers
        </CardTitle>
        <CardDescription>Recent newsletter subscribers</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          <p className="text-sm text-muted-foreground">
            Subscriber list functionality will be available in the next update.
          </p>
          <p className="text-xs text-muted-foreground">
            Subscriptions are currently logged in Activity Log.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}

export function NewsletterSettingsForm({ settings, onChange }: SettingsFormProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Mail className="w-5 h-5" /> Newsletter Popup Settings
        </CardTitle>
        <CardDescription>Configure the popup that appears on the homepage</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="flex items-center justify-between p-4 border rounded-lg">
          <div>
            <p className="font-medium text-sm">Enable Newsletter Popup</p>
            <p className="text-xs text-muted-foreground">Show newsletter popup when users visit homepage</p>
          </div>
          <Switch
            checked={settings.enabled}
            onCheckedChange={(v) => onChange('enabled', v)}
            data-testid="switch-newsletter-enabled"
          />
        </div>

        {settings.enabled && (
          <>
            <div>
              <Label htmlFor="title">Popup Title</Label>
              <Input
                id="title"
                value={settings.title}
                onChange={(e) => onChange('title', e.target.value)}
                placeholder="Subscribe to Our Newsletter"
                className="mt-2"
                data-testid="input-newsletter-title"
              />
            </div>

            <div>
              <Label htmlFor="subtitle">Subtitle</Label>
              <Input
                id="subtitle"
                value={settings.subtitle}
                onChange={(e) => onChange('subtitle', e.target.value)}
                placeholder="Get the latest updates"
                className="mt-2"
                data-testid="input-newsletter-subtitle"
              />
            </div>

            <div>
              <Label htmlFor="description">Description</Label>
              <div className="mt-2" data-testid="editor-newsletter-description">
                <RichTextEditor
                  value={settings.description}
                  onChange={(value) => onChange('description', value)}
                  placeholder="Stay informed with our weekly newsletter"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="placeholder">Input Placeholder</Label>
              <Input
                id="placeholder"
                value={settings.placeholder}
                onChange={(e) => onChange('placeholder', e.target.value)}
                placeholder="Enter your email"
                className="mt-2"
                data-testid="input-newsletter-placeholder"
              />
            </div>

            <div>
              <Label htmlFor="buttonText">Button Text</Label>
              <Input
                id="buttonText"
                value={settings.buttonText}
                onChange={(e) => onChange('buttonText', e.target.value)}
                placeholder="Subscribe"
                className="mt-2"
                data-testid="input-newsletter-button"
              />
            </div>

            <div>
              <Label htmlFor="successMessage">Success Message</Label>
              <Input
                id="successMessage"
                value={settings.successMessage}
                onChange={(e) => onChange('successMessage', e.target.value)}
                placeholder="Thanks for subscribing!"
                className="mt-2"
                data-testid="input-newsletter-success"
              />
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}

interface PreviewProps {
  settings: NewsletterSettings;
}

export function NewsletterPreview({ settings }: PreviewProps) {
  if (!settings.enabled) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Preview</CardTitle>
          <CardDescription>Enable newsletter to see preview</CardDescription>
        </CardHeader>
        <CardContent className="flex items-center justify-center py-12">
          <p className="text-muted-foreground text-sm">Newsletter popup is disabled</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Preview</CardTitle>
        <CardDescription>How the popup will appear</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="border rounded-lg p-6 bg-background shadow-lg">
          <h2 className="text-xl font-bold mb-1">{settings.title || "Newsletter Title"}</h2>
          <p className="text-muted-foreground text-sm mb-3">{settings.subtitle || "Subtitle"}</p>
          <div 
            className="text-sm mb-4"
            dangerouslySetInnerHTML={{ __html: settings.description || "Description" }}
          />
          <div className="flex gap-2">
            <Input 
              placeholder={settings.placeholder || "Enter your email"} 
              className="flex-1"
              disabled
            />
            <button className="px-4 py-2 bg-primary text-primary-foreground rounded-md text-sm">
              {settings.buttonText || "Subscribe"}
            </button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
