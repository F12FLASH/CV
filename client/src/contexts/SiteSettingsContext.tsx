import { createContext, useContext, useEffect, useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";

export interface SiteSettings {
  siteTitle: string;
  tagline: string;
  contactEmail: string;
  heroTitle: string;
  heroSubtitle: string;
  heroDescription: string;
  heroStatus: string;
  aboutTitle: string;
  aboutSubtitle: string;
  aboutDescription: string;
  aboutDescription2: string;
  aboutName: string;
  aboutEmail: string;
  aboutLocation: string;
  aboutFreelance: string;
  contactTitle: string;
  contactSubtitle: string;
  contactPhone: string;
  contactAddress: string;
  socialFacebook: string;
  socialTwitter: string;
  socialInstagram: string;
  socialLinkedin: string;
  socialGithub: string;
  footerText: string;
  footerCopyright: string;
  metaDescription: string;
  googleAnalyticsId: string;
  maintenanceMode: boolean;
}

const defaultSettings: SiteSettings = {
  siteTitle: "Loi Developer - Full-stack Creative",
  tagline: "Building digital experiences with code.",
  contactEmail: "loideveloper@example.com",
  heroTitle: "NGUYEN THANH LOI",
  heroSubtitle: "Full-stack Developer & Security Enthusiast",
  heroDescription: "Crafting secure & performant digital experiences with code",
  heroStatus: "SYSTEM ONLINE",
  aboutTitle: "About Me",
  aboutSubtitle: "Full-stack Developer based in Vietnam",
  aboutDescription: "I started my coding journey with a curiosity for how things work on the web. Now, I specialize in building modern, scalable, and user-friendly applications using the latest technologies.",
  aboutDescription2: "My philosophy is simple: Code with passion, build with purpose. Whether it's a complex backend system or a pixel-perfect frontend interface, I strive for excellence in every line of code.",
  aboutName: "Nguyen Thanh Loi",
  aboutEmail: "loideveloper@example.com",
  aboutLocation: "Ho Chi Minh City",
  aboutFreelance: "Available",
  contactTitle: "Let's Talk",
  contactSubtitle: "Have a project in mind or just want to say hi? I'm always open to discussing new projects, creative ideas or opportunities to be part of your visions.",
  contactPhone: "+84 123 456 789",
  contactAddress: "Ho Chi Minh City, Vietnam",
  socialFacebook: "",
  socialTwitter: "",
  socialInstagram: "",
  socialLinkedin: "",
  socialGithub: "",
  footerText: "Crafted with love & countless cups of coffee",
  footerCopyright: "2024 Loi Developer. All rights reserved.",
  metaDescription: "Portfolio of Nguyen Thanh Loi - Full-stack Developer & Creative Coder",
  googleAnalyticsId: "",
  maintenanceMode: false,
};

interface SiteSettingsContextType {
  settings: SiteSettings;
  isLoading: boolean;
  updateSettings: (newSettings: Partial<SiteSettings>) => Promise<void>;
  isUpdating: boolean;
}

const SiteSettingsContext = createContext<SiteSettingsContextType | undefined>(undefined);

export function SiteSettingsProvider({ children }: { children: React.ReactNode }) {
  const queryClient = useQueryClient();
  const [localSettings, setLocalSettings] = useState<SiteSettings>(defaultSettings);

  const { data: serverSettings, isLoading } = useQuery<Record<string, any>>({
    queryKey: ["/api/settings"],
    staleTime: 1000 * 60 * 5,
  });

  useEffect(() => {
    if (serverSettings) {
      setLocalSettings({
        ...defaultSettings,
        ...serverSettings,
      });
    }
  }, [serverSettings]);

  const updateMutation = useMutation({
    mutationFn: (settings: Partial<SiteSettings>) => api.updateSettings(settings),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/settings"] });
    },
  });

  const updateSettings = async (newSettings: Partial<SiteSettings>) => {
    await updateMutation.mutateAsync(newSettings);
    setLocalSettings(prev => ({ ...prev, ...newSettings }));
  };

  return (
    <SiteSettingsContext.Provider
      value={{
        settings: localSettings,
        isLoading,
        updateSettings,
        isUpdating: updateMutation.isPending,
      }}
    >
      {children}
    </SiteSettingsContext.Provider>
  );
}

export function useSiteSettings() {
  const context = useContext(SiteSettingsContext);
  if (!context) {
    throw new Error("useSiteSettings must be used within a SiteSettingsProvider");
  }
  return context;
}
