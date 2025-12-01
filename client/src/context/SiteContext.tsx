import { createContext, useContext, useState, useEffect, ReactNode, useCallback } from "react";
import { api } from "@/lib/api";

export interface SiteSettings {
  siteTitle: string;
  tagline: string;
  maintenanceMode: boolean;
  maintenanceTitle?: string;
  maintenanceMessage?: string;
  maintenanceEstimate?: string;
  heroTitle: string;
  heroSubtitle: string;
  heroCTA: string;
  cvFileUrl: string;
  aboutTitle: string;
  aboutSubtitle: string;
  aboutDescription: string;
  aboutDescription2: string;
  aboutImage: string;
  aboutName: string;
  aboutLocation: string;
  aboutFreelance: string;
  contactEmail: string;
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
  logoUrl: string;
  faviconUrl: string;
  // SEO Settings
  metaDescription?: string;
  metaKeywords?: string;
  googleAnalyticsId?: string;
  ogImageUrl?: string;
  twitterCardType?: string;
  // Email/SMTP Settings
  smtpHost?: string;
  smtpPort?: string;
  smtpUser?: string;
  smtpPassword?: string;
  smtpSecure?: boolean;
  emailFromName?: string;
  emailFromAddress?: string;
  // Localization Settings
  timezone?: string;
  language?: string;
  dateFormat?: string;
  timeFormat?: string;
  currency?: string;
  currencySymbol?: string;
  // Developer Settings
  debugMode?: boolean;
  apiRateLimit?: number;
  corsEnabled?: boolean;
  corsOrigins?: string;
  customHeaders?: string;
  // Logging Settings
  logLevel?: string;
  logRetentionDays?: number;
  logToConsole?: boolean;
  logToFile?: boolean;
  // Notification Settings
  emailNotifyNewContact?: boolean;
  emailNotifyNewComment?: boolean;
  emailNotifySecurityAlert?: boolean;
  emailNotifyNewsletter?: boolean;
  emailNotifyWeeklySummary?: boolean;
  pushNotifyBrowser?: boolean;
  pushNotifyMobile?: boolean;
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
  maintenanceMode: false,
  heroTitle: "Hello, I'm Loi Developer",
  heroSubtitle: "Full-stack Developer | UI/UX Enthusiast | Creative Thinker",
  heroCTA: "View My Work",
  cvFileUrl: "",
  aboutTitle: "About Me",
  aboutSubtitle: "Full-stack Developer based in Vietnam",
  aboutDescription: "I'm a passionate full-stack developer with expertise in building modern web applications. With years of experience in React, Node.js, and cloud technologies, I create digital experiences that combine beautiful design with robust functionality.",
  aboutDescription2: "My philosophy is simple: Code with passion, build with purpose. Whether it's a complex backend system or a pixel-perfect frontend interface, I strive for excellence in every line of code.",
  aboutImage: "",
  aboutName: "Nguyen Thanh Loi",
  aboutLocation: "Ho Chi Minh City",
  aboutFreelance: "Available",
  contactEmail: "loideveloper@example.com",
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
  logoUrl: "",
  faviconUrl: "",
  // SEO Settings
  metaDescription: "Full-stack Developer & Creative Coder",
  metaKeywords: "web development, full-stack, react, node.js",
  googleAnalyticsId: "",
  ogImageUrl: "",
  twitterCardType: "summary_large_image",
  // Email/SMTP Settings
  smtpHost: "",
  smtpPort: "587",
  smtpUser: "",
  smtpPassword: "",
  smtpSecure: true,
  emailFromName: "",
  emailFromAddress: "",
  // Localization Settings
  timezone: "Asia/Ho_Chi_Minh",
  language: "en",
  dateFormat: "MM/DD/YYYY",
  timeFormat: "12h",
  currency: "USD",
  currencySymbol: "$",
  // Developer Settings
  debugMode: false,
  apiRateLimit: 100,
  corsEnabled: true,
  corsOrigins: "*",
  customHeaders: "",
  // Logging Settings
  logLevel: "info",
  logRetentionDays: 30,
  logToConsole: true,
  logToFile: false,
  // Notification Settings
  emailNotifyNewContact: true,
  emailNotifyNewComment: true,
  emailNotifySecurityAlert: true,
  emailNotifyNewsletter: false,
  emailNotifyWeeklySummary: true,
  pushNotifyBrowser: false,
  pushNotifyMobile: false,
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
          maintenanceMode: data.maintenanceMode ?? defaultSettings.maintenanceMode,
          maintenanceTitle: data.maintenanceTitle || defaultSettings.maintenanceTitle,
          maintenanceMessage: data.maintenanceMessage || defaultSettings.maintenanceMessage,
          maintenanceEstimate: data.maintenanceEstimate || defaultSettings.maintenanceEstimate,
          heroTitle: data.heroTitle || defaultSettings.heroTitle,
          heroSubtitle: data.heroSubtitle || defaultSettings.heroSubtitle,
          heroCTA: data.heroCTA || defaultSettings.heroCTA,
          cvFileUrl: data.cvFileUrl || defaultSettings.cvFileUrl,
          aboutTitle: data.aboutTitle || defaultSettings.aboutTitle,
          aboutSubtitle: data.aboutSubtitle || defaultSettings.aboutSubtitle,
          aboutDescription: data.aboutDescription || defaultSettings.aboutDescription,
          aboutDescription2: data.aboutDescription2 || defaultSettings.aboutDescription2,
          aboutImage: data.aboutImage || defaultSettings.aboutImage,
          aboutName: data.aboutName || defaultSettings.aboutName,
          aboutLocation: data.aboutLocation || defaultSettings.aboutLocation,
          aboutFreelance: data.aboutFreelance || defaultSettings.aboutFreelance,
          contactEmail: data.contactEmail || defaultSettings.contactEmail,
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
          logoUrl: data.logoUrl || defaultSettings.logoUrl,
          faviconUrl: data.faviconUrl || defaultSettings.faviconUrl,
          // SEO Settings
          metaDescription: data.metaDescription || defaultSettings.metaDescription,
          metaKeywords: data.metaKeywords || defaultSettings.metaKeywords,
          googleAnalyticsId: data.googleAnalyticsId || defaultSettings.googleAnalyticsId,
          ogImageUrl: data.ogImageUrl || defaultSettings.ogImageUrl,
          twitterCardType: data.twitterCardType || defaultSettings.twitterCardType,
          // Email/SMTP Settings
          smtpHost: data.smtpHost || defaultSettings.smtpHost,
          smtpPort: data.smtpPort || defaultSettings.smtpPort,
          smtpUser: data.smtpUser || defaultSettings.smtpUser,
          smtpPassword: data.smtpPassword || defaultSettings.smtpPassword,
          smtpSecure: data.smtpSecure ?? defaultSettings.smtpSecure,
          emailFromName: data.emailFromName || defaultSettings.emailFromName,
          emailFromAddress: data.emailFromAddress || defaultSettings.emailFromAddress,
          // Localization Settings
          timezone: data.timezone || defaultSettings.timezone,
          language: data.language || defaultSettings.language,
          dateFormat: data.dateFormat || defaultSettings.dateFormat,
          timeFormat: data.timeFormat || defaultSettings.timeFormat,
          currency: data.currency || defaultSettings.currency,
          currencySymbol: data.currencySymbol || defaultSettings.currencySymbol,
          // Developer Settings
          debugMode: data.debugMode ?? defaultSettings.debugMode,
          apiRateLimit: data.apiRateLimit ?? defaultSettings.apiRateLimit,
          corsEnabled: data.corsEnabled ?? defaultSettings.corsEnabled,
          corsOrigins: data.corsOrigins || defaultSettings.corsOrigins,
          customHeaders: data.customHeaders || defaultSettings.customHeaders,
          // Logging Settings
          logLevel: data.logLevel || defaultSettings.logLevel,
          logRetentionDays: data.logRetentionDays ?? defaultSettings.logRetentionDays,
          logToConsole: data.logToConsole ?? defaultSettings.logToConsole,
          logToFile: data.logToFile ?? defaultSettings.logToFile,
          // Notification Settings
          emailNotifyNewContact: data.emailNotifyNewContact ?? defaultSettings.emailNotifyNewContact,
          emailNotifyNewComment: data.emailNotifyNewComment ?? defaultSettings.emailNotifyNewComment,
          emailNotifySecurityAlert: data.emailNotifySecurityAlert ?? defaultSettings.emailNotifySecurityAlert,
          emailNotifyNewsletter: data.emailNotifyNewsletter ?? defaultSettings.emailNotifyNewsletter,
          emailNotifyWeeklySummary: data.emailNotifyWeeklySummary ?? defaultSettings.emailNotifyWeeklySummary,
          pushNotifyBrowser: data.pushNotifyBrowser ?? defaultSettings.pushNotifyBrowser,
          pushNotifyMobile: data.pushNotifyMobile ?? defaultSettings.pushNotifyMobile,
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
    // Suppress categories loading errors - not critical for site functionality
    const loadCategories = async () => {
      try {
        await fetch("/api/categories", { credentials: "include" });
      } catch (error) {
        // Categories are optional, don't show error to user
      }
    };
    loadCategories();
  }, [loadSettings]);

  // Update favicon when faviconUrl changes
  useEffect(() => {
    if (settings.faviconUrl) {
      const link = document.querySelector("link[rel='icon']") as HTMLLinkElement;
      if (link) {
        link.href = settings.faviconUrl;
        link.type = "image/png";
      } else {
        const newLink = document.createElement('link');
        newLink.rel = 'icon';
        newLink.href = settings.faviconUrl;
        newLink.type = "image/png";
        document.head.appendChild(newLink);
      }
    }
  }, [settings.faviconUrl]);

  // Update document title when siteTitle changes
  useEffect(() => {
    if (settings.siteTitle) {
      document.title = settings.siteTitle;
    }
  }, [settings.siteTitle]);

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
