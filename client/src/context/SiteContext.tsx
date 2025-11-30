import { createContext, useContext, useState, useEffect, ReactNode, useCallback } from "react";
import { api } from "@/lib/api";

export interface SiteSettings {
  siteTitle: string;
  tagline: string;
  contactEmail: string;
  maintenanceMode: boolean;
}

interface SiteContextType {
  settings: SiteSettings;
  updateSettings: (newSettings: Partial<SiteSettings>) => void;
  saveSettings: () => Promise<void>;
  isLoading: boolean;
  isSaving: boolean;
}

const defaultSettings: SiteSettings = {
  siteTitle: "Loi Developer - Full-stack Creative",
  tagline: "Building digital experiences with code.",
  contactEmail: "loideveloper@example.com",
  maintenanceMode: false,
};

const SiteContext = createContext<SiteContextType | undefined>(undefined);

export function SiteProvider({ children }: { children: ReactNode }) {
  const [settings, setSettings] = useState<SiteSettings>(defaultSettings);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  const loadSettings = useCallback(async () => {
    try {
      const data = await api.getSettings();
      if (data && Object.keys(data).length > 0) {
        setSettings({
          siteTitle: data.siteTitle || defaultSettings.siteTitle,
          tagline: data.tagline || defaultSettings.tagline,
          contactEmail: data.contactEmail || defaultSettings.contactEmail,
          maintenanceMode: data.maintenanceMode ?? defaultSettings.maintenanceMode,
        });
      }
    } catch (error) {
      console.error("Failed to load settings from API, using defaults");
      const stored = localStorage.getItem("siteSettings");
      if (stored) {
        try {
          setSettings(JSON.parse(stored));
        } catch (e) {
          console.error("Failed to parse site settings:", e);
        }
      }
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadSettings();
  }, [loadSettings]);

  const updateSettings = (newSettings: Partial<SiteSettings>) => {
    setSettings((prev) => ({ ...prev, ...newSettings }));
  };

  const saveSettings = async () => {
    setIsSaving(true);
    try {
      await api.updateSettings(settings);
      localStorage.setItem("siteSettings", JSON.stringify(settings));
    } catch (error) {
      console.error("Failed to save settings to API, saving to localStorage");
      localStorage.setItem("siteSettings", JSON.stringify(settings));
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <SiteContext.Provider value={{ settings, updateSettings, saveSettings, isLoading, isSaving }}>
      {children}
    </SiteContext.Provider>
  );
}

export function useSiteSettings() {
  const context = useContext(SiteContext);
  if (context === undefined) {
    throw new Error("useSiteSettings must be used within a SiteProvider");
  }
  return context;
}
