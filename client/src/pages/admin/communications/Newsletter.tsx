import { AdminLayout } from "@/layouts/AdminLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { RichTextEditor } from "@/components/admin/RichTextEditor";
import { useState, useEffect } from "react";
import {
  Mail,
  Save,
  Loader2
} from "lucide-react";

interface NewsletterSettings {
  enabled: boolean;
  title: string;
  subtitle: string;
  description: string;
  placeholder: string;
  buttonText: string;
  successMessage: string;
  backgroundImage?: string;
}

export default function AdminNewsletter() {
  const { toast } = useToast();
  const [localSettings, setLocalSettings] = useState<NewsletterSettings>({
    enabled: false,
    title: "Subscribe to Our Newsletter",
    subtitle: "Get the latest updates",
    description: "Stay informed with our weekly newsletter",
    placeholder: "Enter your email",
    buttonText: "Subscribe",
    successMessage: "Thanks for subscribing!",
  });

  const { data: settings, isLoading } = useQuery<NewsletterSettings>({
    queryKey: ['/api/newsletter/settings'],
  });

  useEffect(() => {
    if (settings && Object.keys(settings).length > 0) {
      setLocalSettings(settings as NewsletterSettings);
    }
  }, [settings]);

  const updateSettingsMutation = useMutation({
    mutationFn: async (newSettings: NewsletterSettings) => {
      const response = await apiRequest('POST', '/api/newsletter/settings', newSettings);
      return response as unknown as NewsletterSettings;
    },
    onSuccess: (data: NewsletterSettings) => {
      setLocalSettings(data);
      toast({ title: "Newsletter settings saved successfully" });
      queryClient.invalidateQueries({ queryKey: ['/api/newsletter/settings'] });
      queryClient.setQueryData(['/api/newsletter/settings'], data);
    },
    onError: () => {
      toast({ title: "Failed to save settings", variant: "destructive" });
    }
  });

  const handleSave = () => {
    updateSettingsMutation.mutate(localSettings);
  };

  const handleInputChange = (field: keyof NewsletterSettings, value: any) => {
    setLocalSettings(prev => ({ ...prev, [field]: value }));
  };

  if (isLoading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center h-64">
          <Loader2 className="w-8 h-8 animate-spin" />
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="space-y-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-heading font-bold">Newsletter Management</h1>
            <p className="text-muted-foreground">Configure and manage newsletter popup on homepage</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Settings Form */}
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Mail className="w-5 h-5" /> Newsletter Popup Settings
                </CardTitle>
                <CardDescription>Configure the popup that appears on the homepage</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Activation Toggle */}
                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div>
                    <p className="font-medium text-sm">Enable Newsletter Popup</p>
                    <p className="text-xs text-muted-foreground">Show newsletter popup when users visit homepage</p>
                  </div>
                  <Switch
                    checked={localSettings.enabled}
                    onCheckedChange={(v) => handleInputChange('enabled', v)}
                    data-testid="switch-newsletter-enabled"
                  />
                </div>

                {localSettings.enabled && (
                  <>
                    {/* Title */}
                    <div>
                      <Label htmlFor="title">Popup Title</Label>
                      <Input
                        id="title"
                        value={localSettings.title}
                        onChange={(e) => handleInputChange('title', e.target.value)}
                        placeholder="Subscribe to Our Newsletter"
                        className="mt-2"
                        data-testid="input-newsletter-title"
                      />
                    </div>

                    {/* Subtitle */}
                    <div>
                      <Label htmlFor="subtitle">Subtitle</Label>
                      <Input
                        id="subtitle"
                        value={localSettings.subtitle}
                        onChange={(e) => handleInputChange('subtitle', e.target.value)}
                        placeholder="Get the latest updates"
                        className="mt-2"
                        data-testid="input-newsletter-subtitle"
                      />
                    </div>

                    {/* Description */}
                    <div>
                      <Label htmlFor="description">Description</Label>
                      <div className="mt-2" data-testid="editor-newsletter-description">
                        <RichTextEditor
                          value={localSettings.description}
                          onChange={(value) => handleInputChange('description', value)}
                          placeholder="Stay informed with our weekly newsletter"
                        />
                      </div>
                    </div>

                    {/* Email Placeholder */}
                    <div>
                      <Label htmlFor="placeholder">Email Input Placeholder</Label>
                      <Input
                        id="placeholder"
                        value={localSettings.placeholder}
                        onChange={(e) => handleInputChange('placeholder', e.target.value)}
                        placeholder="Enter your email"
                        className="mt-2"
                        data-testid="input-newsletter-placeholder"
                      />
                    </div>

                    {/* Button Text */}
                    <div>
                      <Label htmlFor="buttonText">Subscribe Button Text</Label>
                      <Input
                        id="buttonText"
                        value={localSettings.buttonText}
                        onChange={(e) => handleInputChange('buttonText', e.target.value)}
                        placeholder="Subscribe"
                        className="mt-2"
                        data-testid="input-newsletter-button"
                      />
                    </div>

                    {/* Success Message */}
                    <div>
                      <Label htmlFor="successMessage">Success Message</Label>
                      <Input
                        id="successMessage"
                        value={localSettings.successMessage}
                        onChange={(e) => handleInputChange('successMessage', e.target.value)}
                        placeholder="Thanks for subscribing!"
                        className="mt-2"
                        data-testid="input-newsletter-success"
                      />
                    </div>

                    {/* Save Button */}
                    <Button 
                      onClick={handleSave} 
                      disabled={updateSettingsMutation.isPending}
                      className="w-full"
                      data-testid="button-save-newsletter"
                    >
                      {updateSettingsMutation.isPending && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                      <Save className="w-4 h-4 mr-2" /> Save Newsletter Settings
                    </Button>
                  </>
                )}

                {!localSettings.enabled && (
                  <div className="p-4 bg-muted rounded-lg text-center text-sm text-muted-foreground">
                    Enable the toggle above to configure newsletter popup settings
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
