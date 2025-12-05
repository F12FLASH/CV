import { useState, useEffect } from "react";
import { AdminLayout } from "@/layouts/AdminLayout";
import { Button } from "@/components/ui/button";
import { Save, Loader2 } from "lucide-react";
import { useNewsletterSettings, useUpdateNewsletterSettings } from "./hooks";
import { SubscribersCard, NewsletterSettingsForm, NewsletterPreview } from "./components";
import { getDefaultSettings } from "./types";
import type { NewsletterSettings } from "./types";

export default function AdminNewsletterPage() {
  const [localSettings, setLocalSettings] = useState<NewsletterSettings>(getDefaultSettings());
  
  const { data: settings, isLoading } = useNewsletterSettings();
  const updateMutation = useUpdateNewsletterSettings();

  useEffect(() => {
    if (settings && Object.keys(settings).length > 0) {
      setLocalSettings(settings);
    }
  }, [settings]);

  const handleInputChange = (field: keyof NewsletterSettings, value: any) => {
    setLocalSettings(prev => ({ ...prev, [field]: value }));
  };

  const handleSave = () => {
    updateMutation.mutate(localSettings);
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
          <Button 
            onClick={handleSave} 
            disabled={updateMutation.isPending}
            data-testid="button-save-newsletter"
          >
            {updateMutation.isPending ? (
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            ) : (
              <Save className="w-4 h-4 mr-2" />
            )}
            Save Settings
          </Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            <SubscribersCard />
            <NewsletterSettingsForm 
              settings={localSettings} 
              onChange={handleInputChange} 
            />
          </div>

          <div className="space-y-6">
            <NewsletterPreview settings={localSettings} />
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
