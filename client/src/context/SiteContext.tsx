import { createContext, useContext, useState, useEffect, ReactNode, useCallback } from "react";
import { api } from "@/lib/api";

export interface SiteSettings {
  siteTitle: string;
  tagline: string;
  contactEmail: string;
  maintenanceMode: boolean;
  heroTitle: string;
  heroSubtitle: string;
  heroCTA: string;
  aboutTitle: string;
  aboutDescription: string;
  aboutImage: string;
  contactTitle: string;
  contactSubtitle: string;
  contactPhone: string;
  contactAddress: string;
  socialFacebook: string;
  socialTwitter: string;
  socialInstagram: string;
  socialLinkedin: string;
  socialGithub: string;
  socialYoutube: string;
  footerText: string;
  footerCopyright: string;
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
  heroTitle: "Hello, I'm Loi Developer",
  heroSubtitle: "Full-stack Developer | UI/UX Enthusiast | Creative Thinker",
  heroCTA: "View My Work",
  aboutTitle: "About Me",
  aboutDescription: "I'm a passionate full-stack developer with expertise in building modern web applications.",
  aboutImage: "",
  contactTitle: "Let's Talk",
  contactSubtitle: "Have a project in mind? Contact me!",
  contactPhone: "+84 123 456 789",
  contactAddress: "Ho Chi Minh City, Vietnam",
  socialFacebook: "",
  socialTwitter: "",
  socialInstagram: "",
  socialLinkedin: "",
  socialGithub: "",
  socialYoutube: "",
  footerText: "Crafted with love & countless cups of coffee",
  footerCopyright: "2024 Loi Developer. All rights reserved.",
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
          heroTitle: data.heroTitle || defaultSettings.heroTitle,
          heroSubtitle: data.heroSubtitle || defaultSettings.heroSubtitle,
          heroCTA: data.heroCTA || defaultSettings.heroCTA,
          aboutTitle: data.aboutTitle || defaultSettings.aboutTitle,
          aboutDescription: data.aboutDescription || defaultSettings.aboutDescription,
          aboutImage: data.aboutImage || defaultSettings.aboutImage,
          contactTitle: data.contactTitle || defaultSettings.contactTitle,
          contactSubtitle: data.contactSubtitle || defaultSettings.contactSubtitle,
          contactPhone: data.contactPhone || defaultSettings.contactPhone,
          contactAddress: data.contactAddress || defaultSettings.contactAddress,
          socialFacebook: data.socialFacebook || defaultSettings.socialFacebook,
          socialTwitter: data.socialTwitter || defaultSettings.socialTwitter,
          socialInstagram: data.socialInstagram || defaultSettings.socialInstagram,
          socialLinkedin: data.socialLinkedin || defaultSettings.socialLinkedin,
          socialGithub: data.socialGithub || defaultSettings.socialGithub,
          socialYoutube: data.socialYoutube || defaultSettings.socialYoutube,
          footerText: data.footerText || defaultSettings.footerText,
          footerCopyright: data.footerCopyright || defaultSettings.footerCopyright,
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
